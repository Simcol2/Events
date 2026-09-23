-- EVENTS -> SQUARE MIGRATION, STEPS 11-15
-- Run after square_phase_1_5.sql and square_phase_5_10.sql.
-- Additive and safe to re-run.

create extension if not exists pgcrypto;

alter table public.reservations
  add column if not exists square_balance_autopay boolean not null default false,
  add column if not exists square_balance_card_id text,
  add column if not exists square_payment_failed boolean not null default false,
  add column if not exists square_security_payment_id text,
  add column if not exists square_security_status text,
  add column if not exists square_security_collected_at timestamptz,
  add column if not exists square_security_refund_id text,
  add column if not exists square_security_refund_status text,
  add column if not exists square_security_refund_cents integer not null default 0,
  add column if not exists square_security_refund_requested_at timestamptz,
  add column if not exists square_security_refunded_at timestamptz;

create unique index if not exists reservations_square_security_payment_unique
  on public.reservations (square_security_payment_id)
  where square_security_payment_id is not null;

create table if not exists public.square_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id bigint references public.customers(id) on delete set null,
  reservation_id bigint references public.reservations(id) on delete set null,
  kind text not null check (
    kind in ('booking_deposit','balance','security_deposit','purchase')
  ),
  square_invoice_id text,
  square_payment_request_uid text,
  square_payment_id text,
  square_refund_id text,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'cad',
  status text not null default 'open',
  paid_at timestamptz,
  refunded_at timestamptz,
  refund_amount_cents integer not null default 0 check (refund_amount_cents >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists square_transactions_payment_unique
  on public.square_transactions(square_payment_id)
  where square_payment_id is not null;

create unique index if not exists square_transactions_invoice_request_unique
  on public.square_transactions(square_invoice_id, square_payment_request_uid)
  where square_invoice_id is not null and square_payment_request_uid is not null;

create index if not exists square_transactions_reservation_idx
  on public.square_transactions(reservation_id);

create index if not exists square_transactions_customer_idx
  on public.square_transactions(customer_id);

drop trigger if exists square_transactions_touch_updated_at
  on public.square_transactions;
create trigger square_transactions_touch_updated_at
  before update on public.square_transactions
  for each row execute function public.touch_updated_at();

alter table public.square_transactions enable row level security;

drop policy if exists square_transactions_select_own
  on public.square_transactions;
create policy square_transactions_select_own
  on public.square_transactions
  for select to authenticated
  using (customer_id = (select private.current_customer_id()));

create table if not exists public.square_webhook_events (
  event_id text primary key,
  event_type text not null,
  created_at_square timestamptz,
  payload jsonb not null,
  processing_status text not null default 'received'
    check (processing_status in ('received','processed','failed')),
  processed_at timestamptz,
  processing_error text,
  received_at timestamptz not null default now()
);

-- Internal only. Service role bypasses RLS.
alter table public.square_webhook_events enable row level security;

-- Existing contracts table is expected to have one logical contract per
-- reservation. This index makes the manual Square contract bridge upsert safe.
create unique index if not exists contracts_reservation_unique
  on public.contracts(reservation_id);

comment on table public.square_webhook_events is
  'Idempotency and audit log for Square webhook notifications. Never delete duplicate evidence casually.';
