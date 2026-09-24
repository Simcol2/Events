-- "Request the Thing" on the Table Box page: a customer describes
-- something they can't find in the catalog (a photo, a link, or a
-- description) and asks the business owner to try sourcing it. Unlike
-- item_requests, there's no existing catalog item to reference, so this
-- is its own table. Run this once in the Supabase SQL editor.

create table if not exists public.sourcing_requests (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  reference text,
  event_date date,
  customer_email text not null,
  status text not null default 'pending' check (status in ('pending', 'sourced', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.sourcing_requests enable row level security;

create policy "Anyone can submit a sourcing request"
  on public.sourcing_requests
  for insert
  to anon
  with check (true);
