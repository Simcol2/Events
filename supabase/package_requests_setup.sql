-- Package Builder requests: the final "Request This Package" step submits
-- here. This just captures contact info and the running total, not a
-- structured breakdown of every pick, since there's no per-piece pricing
-- to reconcile against elsewhere the way item_requests does. Run this once
-- in the Supabase SQL editor.

create table if not exists public.package_requests (
  id uuid primary key default gen_random_uuid(),
  event_date date,
  total numeric not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.package_requests enable row level security;

create policy "Anyone can submit a package request"
  on public.package_requests
  for insert
  to anon
  with check (true);
