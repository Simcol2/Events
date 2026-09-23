-- EVENTS -> SQUARE MIGRATION, PHASE 1-5
--
-- Additive only. Stripe fields are intentionally retained until the complete
-- Square invoice/contract/payment/refund flow has passed production testing.
--
-- Safe to re-run.

alter table public.customers
  add column if not exists square_customer_id text;

create unique index if not exists customers_square_customer_unique
  on public.customers (square_customer_id)
  where square_customer_id is not null;

alter table public.reservations
  add column if not exists square_customer_id text,
  add column if not exists square_order_id text,
  add column if not exists square_order_version bigint,
  add column if not exists square_order_state text;

create unique index if not exists reservations_square_order_unique
  on public.reservations (square_order_id)
  where square_order_id is not null;

create index if not exists reservations_square_customer_idx
  on public.reservations (square_customer_id)
  where square_customer_id is not null;

comment on column public.customers.square_customer_id is
  'Customer Directory ID in the same Square seller account used by asliceofg.com.';

comment on column public.reservations.square_order_id is
  'Square Order containing the full rental charges. Payment scheduling is added in the next migration phase.';
