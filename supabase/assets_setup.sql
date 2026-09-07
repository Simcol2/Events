-- Physical asset registry: the things that actually get handed to a
-- customer and scanned back in, as opposed to the catalogue rows that
-- describe what can be rented.
--
-- Two kinds, because the catalogue counts and the physical world do not
-- line up:
--   unit - one object, one code. Arch stands, covers, centerpiece sets,
--          each marquee letter, grid wall panels, the easel.
--   box  - a reusable container with a permanent code whose contents
--          change per rental. Scanning it out asks how many of what went
--          in, so a 40 glass rental is recorded as 40 rather than as a
--          fixed set.
--
-- Run this once in the Supabase SQL editor.

-- Human readable and sequential, so a rubbed-off label can still be typed
-- in by hand. A sequence rather than a count query keeps two people
-- adding assets at once from colliding on the same number.
create sequence if not exists public.asset_code_seq;

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('ASG-' || lpad(nextval('public.asset_code_seq')::text, 4, '0')),
  kind text not null check (kind in ('unit', 'box')),
  -- Which catalogue row this object is. Units point at one; boxes hold
  -- whatever they are loaded with on the day, so they stay null.
  item_id bigint references public.items (id) on delete set null,
  label text not null,
  -- Set per asset, not per rental. Drives the padding prompt at checkout.
  delicate boolean not null default false,
  status text not null default 'in_stock' check (status in ('in_stock', 'out', 'held', 'retired')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assets_item_idx on public.assets (item_id);
create index if not exists assets_status_idx on public.assets (status);

alter table public.assets enable row level security;

-- No anon policies at all. This is internal inventory: the QR code in the
-- label is public by nature (anyone can point a camera at a box), so the
-- data behind it sits behind the admin passcode instead, reached only by
-- the service role from /api/admin-assets.
