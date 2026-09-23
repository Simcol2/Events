-- EVENTS -> SQUARE MIGRATION, STEPS 16-20
-- Run after the prior Square migrations.
-- Safe to re-run.

alter table public.reservations
  add column if not exists payment_provider text,
  add column if not exists pickup_at timestamptz,
  add column if not exists balance_due_at timestamptz,
  add column if not exists auto_cancel_at timestamptz;

-- The exact timing automation uses this new state instead of immediately
-- deleting/cancelling a booking. It preserves cash/manual-payment exceptions.
alter table public.reservations
  drop constraint if exists reservations_status_check;

alter table public.reservations
  add constraint reservations_status_check
  check (status in (
    'checkout_pending',
    'pending',
    'payment_overdue',
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'with_you',
    'returned',
    'completed',
    'cancelled'
  ));

create table if not exists public.rental_return_inspections (
  id uuid primary key default gen_random_uuid(),
  reservation_id bigint not null
    references public.reservations(id) on delete cascade,
  condition text not null check (
    condition in (
      'excellent',
      'normal_wear',
      'needs_cleaning',
      'minor_damage',
      'major_damage',
      'missing'
    )
  ),
  notes text,
  photos jsonb not null default '[]'::jsonb,
  security_deposit_cents integer not null default 0,
  refund_amount_cents integer not null default 0,
  retained_amount_cents integer not null default 0,
  square_refund_id text,
  square_refund_status text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists rental_return_inspections_reservation_idx
  on public.rental_return_inspections(reservation_id);

alter table public.rental_return_inspections enable row level security;

comment on column public.reservations.pickup_at is
  'Exact pickup timestamp required for exact 24-hour balance and 12-hour overdue rules. pickup_date alone is not sufficient.';
