-- Catering requests: bulk/set orders for Rum Cupcakes, Mini Rum Cupcakes,
-- and G Rings. These items live in cateringContent.js, not the items
-- table, since they're sized in sets rather than rented or purchased as
-- single units, so this is a standalone table rather than reusing
-- item_requests. Run this once in the Supabase SQL editor.

create table if not exists public.catering_requests (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  size_label text not null,
  quantity int not null default 1 check (quantity > 0),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.catering_requests enable row level security;

create policy "Anyone can submit a catering request"
  on public.catering_requests
  for insert
  to anon
  with check (true);
