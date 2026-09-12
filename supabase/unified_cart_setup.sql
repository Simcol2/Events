-- A Slice of G unified purchase + rental cart.
-- Run after portal_inventory_foundation.sql and client_portal_billing_setup.sql.

alter table public.reservations
  add column if not exists checkout_expires_at timestamptz,
  add column if not exists stripe_checkout_session_id text;

alter table public.reservation_items
  add column if not exists unit_price_cents integer not null default 0,
  add column if not exists line_total_cents integer not null default 0;

create unique index if not exists reservations_checkout_session_unique
  on public.reservations (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

-- The checkout needs a short-lived state while Stripe is open.
alter table public.reservations drop constraint if exists reservations_status_check;
alter table public.reservations add constraint reservations_status_check
  check (status in (
    'checkout_pending', 'pending', 'confirmed', 'preparing', 'ready_for_pickup',
    'out_for_delivery', 'with_you', 'returned', 'completed', 'cancelled'
  ));

create sequence if not exists public.rental_reservation_number_seq start 1001;

create or replace function public.next_rental_reservation_number()
returns text
language sql
security definer
set search_path = public
as $$
  select 'ASG-R-' || to_char(current_date, 'YYYY') || '-' ||
         lpad(nextval('public.rental_reservation_number_seq')::text, 5, '0');
$$;

revoke execute on function public.next_rental_reservation_number() from public, anon, authenticated;

-- Reservation-backed availability. This replaces the old item_requests-only
-- availability maths for the cart. Unexpired checkout holds count, as do
-- active confirmed reservations.
create or replace function public.get_reservation_item_availability(
  p_item_id bigint,
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
    coalesce((select quantity_owned - quantity_out_of_service from public.items where id = p_item_id), 0)
    -
    coalesce((
      select sum(ri.quantity)
      from public.reservation_items ri
      join public.reservations r on r.id = ri.reservation_id
      where ri.item_id = p_item_id
        and r.pickup_date <= p_dropoff
        and r.drop_off_date >= p_pickup
        and (
          r.status in ('pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'with_you')
          or (r.status = 'checkout_pending' and r.checkout_expires_at > now())
        )
    ), 0),
    0
  );
$$;

grant execute on function public.get_reservation_item_availability(bigint, date, date)
  to anon, authenticated;

-- Allow several ledger rows to point at the same mixed checkout session,
-- one for purchase, one for booking deposit, and one for security deposit.
drop index if exists public.stripe_transactions_checkout_unique;
create unique index if not exists stripe_transactions_checkout_kind_unique
  on public.stripe_transactions (stripe_checkout_session_id, kind)
  where stripe_checkout_session_id is not null;
