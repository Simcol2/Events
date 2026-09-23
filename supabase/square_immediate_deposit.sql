-- Immediate Square rental deposit + future payment preference.
-- Balance due 7 days before pickup.
-- Security deposit due 48 hours before pickup.
-- Additive migration. Safe to re-run. Applied via Supabase MCP; kept here
-- as a reference copy alongside the other square_phase_*.sql files.

alter table public.reservations
  add column if not exists square_booking_deposit_payment_id text,
  add column if not exists square_booking_deposit_status text,
  add column if not exists square_booking_deposit_paid_at timestamptz,
  add column if not exists future_payment_method text
    check (future_payment_method in ('card_on_file', 'manual')),
  add column if not exists manual_payment_acknowledged boolean not null default false,
  add column if not exists security_deposit_due_at timestamptz,
  add column if not exists balance_due_at timestamptz,
  add column if not exists manual_security_payment_due boolean not null default false,
  add column if not exists manual_balance_payment_due boolean not null default false;

create unique index if not exists reservations_square_booking_deposit_payment_unique
  on public.reservations(square_booking_deposit_payment_id)
  where square_booking_deposit_payment_id is not null;
