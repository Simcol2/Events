-- A Slice of G client portal and Stripe billing extension.
-- Run AFTER supabase/portal_inventory_foundation.sql.
-- It extends the existing customers/reservations structure rather than
-- creating a competing booking model.

create extension if not exists pgcrypto;

-- Financial fields on the existing reservation record.
alter table public.reservations
  add column if not exists booking_number text,
  add column if not exists currency text not null default 'cad',
  add column if not exists rental_subtotal_cents integer not null default 0,
  add column if not exists tax_cents integer not null default 0,
  add column if not exists rental_total_cents integer not null default 0,
  add column if not exists booking_deposit_cents integer not null default 0,
  add column if not exists security_deposit_cents integer not null default 0,
  add column if not exists balance_due_cents integer not null default 0,
  add column if not exists stripe_customer_id text,
  add column if not exists contract_status text not null default 'not_sent';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'reservations_financial_amounts_nonnegative'
      and conrelid = 'public.reservations'::regclass
  ) then
    alter table public.reservations add constraint reservations_financial_amounts_nonnegative
      check (
        rental_subtotal_cents >= 0 and tax_cents >= 0 and rental_total_cents >= 0 and
        booking_deposit_cents >= 0 and security_deposit_cents >= 0 and balance_due_cents >= 0
      );
  end if;
end $$;

create unique index if not exists reservations_booking_number_unique
  on public.reservations (booking_number) where booking_number is not null;
create index if not exists reservations_stripe_customer_idx on public.reservations (stripe_customer_id);

-- Stripe processor ledger. This does not replace reservations. It records
-- the external Stripe object and its state so webhooks are idempotent.
create table if not exists public.stripe_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id bigint references public.customers (id) on delete set null,
  reservation_id bigint references public.reservations (id) on delete set null,
  purchase_order_id uuid,
  kind text not null check (kind in ('booking_deposit', 'security_deposit', 'balance', 'purchase')),
  stripe_customer_id text,
  stripe_invoice_id text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'cad',
  status text not null default 'open',
  hosted_invoice_url text,
  invoice_pdf text,
  paid_at timestamptz,
  refunded_at timestamptz,
  refund_amount_cents integer not null default 0 check (refund_amount_cents >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists stripe_transactions_invoice_unique
  on public.stripe_transactions (stripe_invoice_id) where stripe_invoice_id is not null;
create unique index if not exists stripe_transactions_checkout_unique
  on public.stripe_transactions (stripe_checkout_session_id) where stripe_checkout_session_id is not null;
create index if not exists stripe_transactions_reservation_idx on public.stripe_transactions (reservation_id);
create index if not exists stripe_transactions_customer_idx on public.stripe_transactions (customer_id);

drop trigger if exists stripe_transactions_touch_updated_at on public.stripe_transactions;
create trigger stripe_transactions_touch_updated_at before update on public.stripe_transactions
  for each row execute function public.touch_updated_at();

-- Purchase history from the existing Gifts/Decor checkout.
create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id bigint references public.customers (id) on delete set null,
  customer_email text,
  order_number text,
  stripe_checkout_session_id text not null,
  stripe_customer_id text,
  stripe_invoice_id text,
  currency text not null default 'cad',
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  status text not null default 'pending',
  purchased_at timestamptz not null default now(),
  hosted_invoice_url text,
  invoice_pdf text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists purchase_orders_checkout_unique on public.purchase_orders (stripe_checkout_session_id);
create unique index if not exists purchase_orders_order_number_unique
  on public.purchase_orders (order_number) where order_number is not null;
create index if not exists purchase_orders_customer_idx on public.purchase_orders (customer_id);
create index if not exists purchase_orders_email_idx on public.purchase_orders (lower(customer_email));
create index if not exists purchase_orders_purchased_idx on public.purchase_orders (purchased_at desc);

drop trigger if exists purchase_orders_touch_updated_at on public.purchase_orders;
create trigger purchase_orders_touch_updated_at before update on public.purchase_orders
  for each row execute function public.touch_updated_at();

create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders (id) on delete cascade,
  name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_amount_cents integer not null default 0 check (unit_amount_cents >= 0),
  total_amount_cents integer not null default 0 check (total_amount_cents >= 0),
  currency text not null default 'cad',
  created_at timestamptz not null default now()
);

create index if not exists purchase_order_items_order_idx on public.purchase_order_items (purchase_order_id);

alter table public.stripe_transactions
  drop constraint if exists stripe_transactions_purchase_order_id_fkey;
alter table public.stripe_transactions
  add constraint stripe_transactions_purchase_order_id_fkey
  foreign key (purchase_order_id) references public.purchase_orders (id) on delete set null;

-- Clients can read their own purchase and billing history directly if a
-- future UI chooses to. Current portal API reads through the service role.
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.stripe_transactions enable row level security;

drop policy if exists purchase_orders_select_own on public.purchase_orders;
create policy purchase_orders_select_own on public.purchase_orders for select to authenticated
  using (customer_id = (select private.current_customer_id()));

drop policy if exists purchase_order_items_select_own on public.purchase_order_items;
create policy purchase_order_items_select_own on public.purchase_order_items for select to authenticated
  using (exists (
    select 1 from public.purchase_orders po
    where po.id = purchase_order_items.purchase_order_id
      and po.customer_id = (select private.current_customer_id())
  ));

drop policy if exists stripe_transactions_select_own on public.stripe_transactions;
create policy stripe_transactions_select_own on public.stripe_transactions for select to authenticated
  using (customer_id = (select private.current_customer_id()));

-- A verified magic-link account can claim older purchases made with the
-- same email address. No email argument is accepted from the browser.
create or replace function public.claim_my_purchases()
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_email text := lower((select auth.email()));
  v_customer_id bigint;
  v_count integer := 0;
begin
  if v_uid is null or v_email is null or v_email = '' then return 0; end if;

  select id into v_customer_id from public.customers where user_id = v_uid limit 1;
  if v_customer_id is null then return 0; end if;

  update public.purchase_orders
    set customer_id = v_customer_id
    where customer_id is null and lower(customer_email) = v_email;
  get diagnostics v_count = row_count;

  update public.stripe_transactions st
    set customer_id = v_customer_id
    from public.purchase_orders po
    where st.purchase_order_id = po.id
      and po.customer_id = v_customer_id
      and st.customer_id is null;

  return v_count;
end;
$$;

revoke execute on function public.claim_my_purchases() from public, anon;
grant execute on function public.claim_my_purchases() to authenticated;
