-- Decor rental/purchase request system, plus the fixed category taxonomy.
--
-- Run this once in the Supabase SQL editor, in this order. Steps 1 and 2 are
-- independent of the catalog data and safe to run any time. Steps 3 and 4
-- depend on the "Decor Items" Google Sheet having already been updated and
-- re-synced (see the plan for the exact row renames and category values) -
-- running them earlier will either delete rows you still want, or fail on
-- the first row still holding an old free-text category.

-- ── 1. Unified placeholder request table ────────────────────────────────
-- Covers both a rental request and a purchase inquiry with one table.
-- request_type = 'purchase' rows never use pickup_date/dropoff_date. This
-- is the seam a real Square or Stripe checkout attaches to later - nothing
-- else in this schema needs to change for that.
create table if not exists public.item_requests (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id),
  request_type text not null check (request_type in ('rental', 'purchase')),
  pickup_date date,
  dropoff_date date,
  quantity integer not null default 1 check (quantity > 0),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  event_date date,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint item_requests_rental_dates check (
    request_type <> 'rental' or (pickup_date is not null and dropoff_date is not null)
  ),
  constraint item_requests_date_order check (
    dropoff_date is null or pickup_date is null or dropoff_date >= pickup_date
  )
);

-- Availability lookups only ever care about non-cancelled rows, so a
-- partial index keeps it small as request volume grows.
create index if not exists item_requests_availability_idx
  on public.item_requests (item_id, pickup_date, dropoff_date)
  where status <> 'cancelled';

alter table public.item_requests enable row level security;

-- Customers can submit a request but can never read anyone's requests,
-- including their own. The business owner reads this table directly
-- (service role, or a future authenticated admin view) - there is no
-- select policy for anon on purpose.
create policy item_requests_insert on public.item_requests
  for insert
  to anon
  with check (true);

-- ── 2. Live rental availability ──────────────────────────────────────────
-- Callable by anon without exposing raw request rows or customer data.
-- quantity_owned on items is the shared physical stock; purchase
-- availability reads it directly elsewhere and is not date-scoped, only
-- rentals are.
create or replace function public.get_item_availability(
  p_item_id uuid,
  p_pickup date,
  p_dropoff date
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select greatest(
    (select quantity_owned from public.items where id = p_item_id) - coalesce((
      select sum(quantity)
      from public.item_requests
      where item_id = p_item_id
        and status <> 'cancelled'
        and pickup_date <= p_dropoff
        and dropoff_date >= p_pickup
    ), 0),
    0
  );
$$;

grant execute on function public.get_item_availability(uuid, date, date) to anon, authenticated;

-- ── 3. Centerpiece consolidation cleanup ─────────────────────────────────
-- Run only AFTER the "Decor Items" sheet rows have been renamed/merged and
-- re-synced successfully. The sync matches Supabase rows by name, so
-- renaming a row creates a new one rather than updating the old one -
-- these five names become orphans once the renamed rows exist. Safe to
-- hard-delete, no real customer reservations exist against them yet.
delete from public.items
where name in (
  'Hey Baby Single Centerpiece',
  'Hey Baby Centerpiece Serving Tray (Small)',
  'Hey Baby Centerpiece Serving Tray (Large)',
  'Centerpiece Serving Dish (Small)',
  'Centerpiece Serving Dish (Large)'
);

-- ── 4. Fixed category taxonomy ───────────────────────────────────────────
-- Run only AFTER every row in items has been updated to one of these six
-- values (via the sheet + sync) - otherwise this fails on the first row
-- still holding an old free-text category. Values are plain, readable
-- words on purpose (matches what the site's category filter uses and what
-- someone would naturally type into the sheet) - case-insensitive so a
-- capitalized "Wall/Floor" typed by hand still passes.
alter table public.items
  add constraint items_category_check
  check (lower(category) in ('table', 'wall/floor', 'keepsakes & gifts', 'disposables', 'stationery', 'gift wrap'));
