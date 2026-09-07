-- PHASE 1 OF THE CLIENT PORTAL AND RENTAL INVENTORY SYSTEM
-- The data foundation. Nothing in the portal, the packing lists, or the
-- scanning flows can be built until these relationships exist:
--
--   Client -> Request -> Reservation -> Reservation Items -> Inventory
--                                                         -> Physical Assets
--                                                         -> Transactions
--
-- IMPORTANT: this project already had customers, reservations,
-- reservation_items, contracts and payments tables (all empty, from an
-- earlier schema pass). This migration EXTENDS those rather than adding a
-- parallel bookings/booking_items structure beside them, because two
-- competing names for the same idea is exactly the mess that makes an
-- inventory system untrustworthy later. "Reservation" is the booking.
--
-- Already applied to the live database in two migrations:
--   portal_client_identity_and_bookings
--   inventory_tracking_and_transactions
-- Kept here as the readable record of what the schema is and why.
-- Safe to re-run: every statement is guarded.

-- =====================================================================
-- PART A: CLIENT IDENTITY AND THE BOOKING CHAIN
-- =====================================================================

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

-- ---------------------------------------------------------------------
-- Client identity.
--
-- customers is the business record and exists with or without a login.
-- user_id links it to a Supabase auth account once the client signs in,
-- so there is one client record whether they ever make an account or not.
-- No separate profiles table: that would be a second place to look for
-- the same person.
-- ---------------------------------------------------------------------
alter table public.customers
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create unique index if not exists customers_email_unique on public.customers (lower(email));
create unique index if not exists customers_user_id_unique on public.customers (user_id) where user_id is not null;

drop trigger if exists customers_touch_updated_at on public.customers;
create trigger customers_touch_updated_at before update on public.customers
  for each row execute function public.touch_updated_at();

-- On signup, link to the existing client record for that email if there
-- is one, otherwise start a new one. Both sign-in methods (Google, and
-- the emailed link) prove the person controls the address, so matching
-- on it is safe.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_email text := lower(new.email);
  v_customer_id bigint;
  v_existing_uid uuid;
begin
  if v_email is null or v_email = '' then return new; end if;

  select id, user_id into v_customer_id, v_existing_uid
  from public.customers where lower(email) = v_email limit 1;

  if v_customer_id is null then
    insert into public.customers (name, email, user_id)
    values (
      coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(v_email, '@', 1)),
      new.email,
      new.id
    );
  elsif v_existing_uid is null then
    update public.customers set user_id = new.id where id = v_customer_id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Helper used by every client-facing policy.
--
-- Security definer so it can read customers, but it only ever resolves
-- the calling user's own row, and anon cannot execute it at all.
-- Wrapping it in a subselect at the call site means Postgres evaluates
-- it once per query instead of once per row.
-- ---------------------------------------------------------------------
create schema if not exists private;

create or replace function private.current_customer_id()
returns bigint language sql stable security definer set search_path = '' as $$
  select id from public.customers where user_id = (select auth.uid()) limit 1;
$$;

revoke execute on function private.current_customer_id() from public, anon;
grant execute on function private.current_customer_id() to authenticated;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------
-- Reservations gain the logistics and client-facing detail the portal
-- and the packing flow need. pickup_date/drop_off_date already drive
-- availability maths; the window columns are the human readable time
-- ("4-6 PM") that a date alone cannot express.
-- ---------------------------------------------------------------------
alter table public.reservations
  add column if not exists venue_name text,
  add column if not exists venue_address text,
  add column if not exists service_style text,
  add column if not exists pickup_window text,
  add column if not exists return_window text,
  add column if not exists notes text;

do $$
begin
  if not exists (select 1 from pg_constraint
    where conname = 'reservations_service_style_check' and conrelid = 'public.reservations'::regclass) then
    alter table public.reservations add constraint reservations_service_style_check
      check (service_style is null or service_style in ('self', 'full'));
  end if;
end $$;

-- Wider status vocabulary. 'preparing' through 'returned' are the states
-- a client sees while their rental is physically moving. Deliberately
-- reassuring language: the detailed operational state lives on the assets
-- and the transaction log, so a client never reads "repair" about their
-- own event.
alter table public.reservations drop constraint if exists reservations_status_check;
alter table public.reservations add constraint reservations_status_check
  check (status in (
    'pending', 'confirmed', 'preparing', 'ready_for_pickup',
    'out_for_delivery', 'with_you', 'returned', 'completed', 'cancelled'
  ));

create index if not exists reservations_customer_idx on public.reservations (customer_id);
create index if not exists reservations_package_idx on public.reservations (package_id);
create index if not exists reservations_event_date_idx on public.reservations (event_date);
create index if not exists reservations_status_idx on public.reservations (status);

-- ---------------------------------------------------------------------
-- Reservation items become the packing list. `quantity` is Required; the
-- three new columns are Packed, Checked Out and Returned, exactly the
-- columns on a paper packing list. Any gap between them is a discrepancy
-- the operations screens surface.
-- ---------------------------------------------------------------------
alter table public.reservation_items
  add column if not exists description text,
  add column if not exists quantity_packed integer not null default 0,
  add column if not exists quantity_out integer not null default 0,
  add column if not exists quantity_returned integer not null default 0,
  add column if not exists notes text;

do $$
begin
  if not exists (select 1 from pg_constraint
    where conname = 'reservation_items_packed_check' and conrelid = 'public.reservation_items'::regclass) then
    alter table public.reservation_items add constraint reservation_items_packed_check
      check (quantity_packed >= 0 and quantity_out >= 0 and quantity_returned >= 0);
  end if;
end $$;

create index if not exists reservation_items_reservation_idx on public.reservation_items (reservation_id);
create index if not exists reservation_items_item_idx on public.reservation_items (item_id);
create index if not exists contracts_reservation_idx on public.contracts (reservation_id);
create index if not exists payments_reservation_idx on public.payments (reservation_id);

-- ---------------------------------------------------------------------
-- The catering request table. pages/Catering.jsx has been writing to
-- this all along, but supabase/catering_requests_setup.sql was never
-- actually run, so every catering enquiry was silently failing.
-- ---------------------------------------------------------------------
create table if not exists public.catering_requests (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  size_label text not null,
  quantity int not null default 1 check (quantity > 0),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.catering_requests enable row level security;

drop policy if exists catering_requests_insert on public.catering_requests;
create policy catering_requests_insert on public.catering_requests
  for insert to anon with check (true);

-- ---------------------------------------------------------------------
-- Connect enquiries to clients and to the reservation they become.
-- Many requests can point at one reservation: three enquiries for one
-- wedding collapse into a single booking.
-- ---------------------------------------------------------------------
alter table public.item_requests
  add column if not exists customer_id bigint references public.customers (id) on delete set null,
  add column if not exists reservation_id bigint references public.reservations (id) on delete set null;

alter table public.package_requests
  add column if not exists customer_id bigint references public.customers (id) on delete set null,
  add column if not exists reservation_id bigint references public.reservations (id) on delete set null;

alter table public.catering_requests
  add column if not exists customer_id bigint references public.customers (id) on delete set null,
  add column if not exists reservation_id bigint references public.reservations (id) on delete set null;

-- Postgres does not index foreign keys automatically, and every one of
-- these is on the portal's hot path ("show me my requests").
create index if not exists item_requests_customer_idx on public.item_requests (customer_id);
create index if not exists item_requests_reservation_idx on public.item_requests (reservation_id);
create index if not exists item_requests_email_idx on public.item_requests (lower(customer_email));
create index if not exists package_requests_customer_idx on public.package_requests (customer_id);
create index if not exists package_requests_reservation_idx on public.package_requests (reservation_id);
create index if not exists package_requests_email_idx on public.package_requests (lower(customer_email));
create index if not exists catering_requests_customer_idx on public.catering_requests (customer_id);
create index if not exists catering_requests_reservation_idx on public.catering_requests (reservation_id);
create index if not exists catering_requests_email_idx on public.catering_requests (lower(customer_email));

-- ---------------------------------------------------------------------
-- Row level security: a signed-in client sees their own records and
-- nothing else. The existing anon insert policies stay untouched, so
-- guests can still submit an enquiry without an account.
-- ---------------------------------------------------------------------
alter table public.customers enable row level security;
alter table public.reservations enable row level security;
alter table public.reservation_items enable row level security;
alter table public.contracts enable row level security;
alter table public.payments enable row level security;

drop policy if exists customers_select_own on public.customers;
create policy customers_select_own on public.customers for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists customers_update_own on public.customers;
create policy customers_update_own on public.customers for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists reservations_select_own on public.reservations;
create policy reservations_select_own on public.reservations for select to authenticated
  using (customer_id = (select private.current_customer_id()));

drop policy if exists reservation_items_select_own on public.reservation_items;
create policy reservation_items_select_own on public.reservation_items for select to authenticated
  using (exists (
    select 1 from public.reservations r
    where r.id = reservation_items.reservation_id
      and r.customer_id = (select private.current_customer_id())
  ));

drop policy if exists contracts_select_own on public.contracts;
create policy contracts_select_own on public.contracts for select to authenticated
  using (exists (
    select 1 from public.reservations r
    where r.id = contracts.reservation_id
      and r.customer_id = (select private.current_customer_id())
  ));

drop policy if exists payments_select_own on public.payments;
create policy payments_select_own on public.payments for select to authenticated
  using (exists (
    select 1 from public.reservations r
    where r.id = payments.reservation_id
      and r.customer_id = (select private.current_customer_id())
  ));

drop policy if exists item_requests_select_own on public.item_requests;
create policy item_requests_select_own on public.item_requests for select to authenticated
  using (customer_id = (select private.current_customer_id()));

drop policy if exists package_requests_select_own on public.package_requests;
create policy package_requests_select_own on public.package_requests for select to authenticated
  using (customer_id = (select private.current_customer_id()));

drop policy if exists catering_requests_select_own on public.catering_requests;
create policy catering_requests_select_own on public.catering_requests for select to authenticated
  using (customer_id = (select private.current_customer_id()));

-- ---------------------------------------------------------------------
-- Claiming guest history on sign in.
--
-- Reads the email from the verified session rather than taking it as an
-- argument, so there is no version of this that lets one client claim
-- another's records. Matching is exact, case insensitive only.
-- ---------------------------------------------------------------------
create or replace function public.claim_my_records()
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_email text := lower((select auth.email()));
  v_customer_id bigint;
  v_claimed integer := 0;
  v_count integer;
begin
  if v_uid is null or v_email is null or v_email = '' then return 0; end if;

  select id into v_customer_id from public.customers where user_id = v_uid limit 1;
  if v_customer_id is null then return 0; end if;

  update public.item_requests set customer_id = v_customer_id
    where customer_id is null and lower(customer_email) = v_email;
  get diagnostics v_count = row_count; v_claimed := v_claimed + v_count;

  update public.package_requests set customer_id = v_customer_id
    where customer_id is null and lower(customer_email) = v_email;
  get diagnostics v_count = row_count; v_claimed := v_claimed + v_count;

  update public.catering_requests set customer_id = v_customer_id
    where customer_id is null and lower(customer_email) = v_email;
  get diagnostics v_count = row_count; v_claimed := v_claimed + v_count;

  return v_claimed;
end;
$$;

revoke execute on function public.claim_my_records() from public, anon;
grant execute on function public.claim_my_records() to authenticated;

-- =====================================================================
-- PART B: INVENTORY TRACKING AND THE MOVEMENT LOG
-- =====================================================================

-- ---------------------------------------------------------------------
-- Serialized vs quantity tracking.
--
-- 'serialized' means every physical copy has its own asset row and QR
-- label, because knowing which one came back matters: arch stands,
-- plinths, marquee letters, the speaker.
-- 'quantity' means we count instead, because individually labelling 120
-- charger plates is a full time job that tells you nothing useful.
--
-- Default is 'quantity' since most of the catalogue is exactly that.
-- ---------------------------------------------------------------------
alter table public.items
  add column if not exists tracking_mode text not null default 'quantity',
  -- Quantity-tracked inventory only: how much of the owned count is
  -- currently unusable (broken, in the wash, unaccounted for).
  -- Serialized items derive the same fact from their asset rows instead.
  add column if not exists quantity_out_of_service integer not null default 0;

do $$
begin
  if not exists (select 1 from pg_constraint
    where conname = 'items_tracking_mode_check' and conrelid = 'public.items'::regclass) then
    alter table public.items add constraint items_tracking_mode_check
      check (tracking_mode in ('serialized', 'quantity'));
  end if;
  if not exists (select 1 from pg_constraint
    where conname = 'items_quantity_out_of_service_check' and conrelid = 'public.items'::regclass) then
    alter table public.items add constraint items_quantity_out_of_service_check
      check (quantity_out_of_service >= 0);
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Physical asset statuses.
--
-- The old vocabulary treated anything not out as ready to go again.
-- Returned is not the same as available: a piece can come back needing a
-- wipe down or a repair, and it must not be offered to the next client
-- until someone says it is fine.
-- ---------------------------------------------------------------------
alter table public.assets drop constraint if exists assets_status_check;

update public.assets set status = 'available' where status = 'in_stock';
update public.assets set status = 'repair' where status = 'held';

alter table public.assets alter column status set default 'available';

alter table public.assets add constraint assets_status_check
  check (status in ('available', 'out', 'cleaning', 'repair', 'missing', 'retired'));

-- Which reservation an asset is currently out with, so a scan answers
-- "where is this?" without walking the whole transaction log.
alter table public.assets
  add column if not exists current_reservation_id bigint references public.reservations (id) on delete set null;

create index if not exists assets_current_reservation_idx on public.assets (current_reservation_id);

-- ---------------------------------------------------------------------
-- Immutable movement history.
--
-- Every checkout, return and status change appends a row. Nothing here
-- is ever edited or deleted, which is what makes it trustworthy when the
-- question is "what actually happened to this piece in September".
-- ---------------------------------------------------------------------
create table if not exists public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  kind text not null check (kind in ('checkout', 'return', 'status_change', 'adjustment')),

  -- Serialized movements name an asset. Quantity movements name an item
  -- and a count. Both name the reservation they belong to, when there is one.
  asset_id uuid references public.assets (id) on delete set null,
  item_id bigint references public.items (id) on delete set null,
  reservation_id bigint references public.reservations (id) on delete set null,
  reservation_item_id bigint references public.reservation_items (id) on delete set null,
  quantity integer,

  status_before text,
  status_after text,
  condition text check (condition is null or condition in (
    'excellent', 'normal_wear', 'needs_cleaning', 'minor_damage', 'major_damage', 'missing'
  )),
  components_complete boolean,
  padding_included boolean,
  notes text,
  photos jsonb not null default '[]'::jsonb,
  performed_by text,
  created_at timestamptz not null default now()
);

create index if not exists inventory_transactions_asset_idx on public.inventory_transactions (asset_id);
create index if not exists inventory_transactions_item_idx on public.inventory_transactions (item_id);
create index if not exists inventory_transactions_reservation_idx on public.inventory_transactions (reservation_id);
create index if not exists inventory_transactions_reservation_item_idx on public.inventory_transactions (reservation_item_id);
create index if not exists inventory_transactions_occurred_idx on public.inventory_transactions (occurred_at desc);

-- Immutability enforced by the database rather than by good intentions.
-- A correction is a new row, the way an accounting ledger works. Verified
-- against the live database: both UPDATE and DELETE raise.
create or replace function public.block_transaction_rewrite()
returns trigger language plpgsql as $$
begin
  raise exception 'inventory_transactions is append only. Record a correcting entry instead of editing history.';
end;
$$;

drop trigger if exists inventory_transactions_no_update on public.inventory_transactions;
create trigger inventory_transactions_no_update
  before update or delete on public.inventory_transactions
  for each row execute function public.block_transaction_rewrite();

-- RLS on with no policies at all: inventory movement is internal and is
-- reachable only by the service role behind the admin passcode, exactly
-- like the rest of the operations tooling.
alter table public.inventory_transactions enable row level security;
alter table public.assets enable row level security;
