-- Decor rental/purchase request system, plus the tags column that replaces
-- the old single category.
--
-- Run this once in the Supabase SQL editor, in this order. Steps 1, 2, and 4
-- are independent of the catalog data and safe to run any time. Step 3
-- depends on the "Decor Items" Google Sheet having already been updated and
-- re-synced with the renamed/merged centerpiece rows - running it earlier
-- deletes rows you still want.

-- ── 1. Unified placeholder request table ────────────────────────────────
-- Covers both a rental request and a purchase inquiry with one table.
-- request_type = 'purchase' rows never use pickup_date/dropoff_date. This
-- is the seam a real Square or Stripe checkout attaches to later - nothing
-- else in this schema needs to change for that.
create table if not exists public.item_requests (
  id uuid primary key default gen_random_uuid(),
  item_id bigint not null references public.items (id),
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

grant execute on function public.get_item_availability(bigint, date, date) to anon, authenticated;

-- Per-day availability across a range, for rendering a calendar grid (which
-- days are bookable vs fully booked) without exposing raw item_requests
-- rows. Same overlap logic as get_item_availability, evaluated once per day
-- in the range instead of once for the whole range.
create or replace function public.get_item_availability_calendar(
  p_item_id bigint,
  p_start date,
  p_end date
)
returns table (day date, available integer)
language sql
stable
security definer
set search_path = public
as $$
  select
    d::date as day,
    greatest(
      (select quantity_owned from public.items where id = p_item_id) - coalesce((
        select sum(quantity)
        from public.item_requests
        where item_id = p_item_id
          and status <> 'cancelled'
          and pickup_date <= d::date
          and dropoff_date >= d::date
      ), 0),
      0
    ) as available
  from generate_series(p_start, p_end, interval '1 day') as d;
$$;

grant execute on function public.get_item_availability_calendar(bigint, date, date) to anon, authenticated;

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

-- ── 4. Tags replace category/category_2 ──────────────────────────────────
-- An item can belong to more than one tag at once (a centerpiece can be
-- Table, Baby Shower, and Holidays/Events together), which a single
-- category column can't express. category and category_2 are left in
-- place (unread by the app from here on) rather than dropped, in case
-- there's ever a reason to look back at the old data.
--
-- Drop the old single-category constraint - it no longer reflects how
-- items are classified.
alter table public.items drop constraint if exists items_category_check;

alter table public.items add column if not exists tags text[] not null default '{}';

-- Tag filtering is an array-containment check (does this item have any of
-- the selected tags), which a GIN index is built for.
create index if not exists items_tags_idx on public.items using gin (tags);

-- ── 5. Bug fix: missing unique constraint on name ────────────────────────
-- Code.gs's sync has always assumed items.name is unique (it upserts with
-- on_conflict=name), but that constraint was never actually created here.
-- Without it, Supabase silently falls back to a plain insert on every sync
-- run instead of updating the existing row - every sync has been creating
-- a fresh duplicate of every item. Dedup first (keeping the highest id per
-- name, since duplicates are just repeated inserts of the same sheet row
-- and the newest one reflects the most recent sheet state, including
-- columns like tags that didn't exist yet on earlier inserts), then add
-- the constraint so this can't happen again.
delete from public.items a
using public.items b
where a.name = b.name
  and a.id < b.id;

alter table public.items
  add constraint items_name_unique unique (name);

-- The "Experiences" sheet syncs through the same upsert_() function in
-- Code.gs, so it likely has the exact same duplicate problem. Check
-- public.experiences for duplicate names before deciding how to dedup it -
-- confirm what its id column actually is (sequential vs uuid) first, since
-- "keep the highest id" only reliably means "most recent" for a
-- sequential id.
