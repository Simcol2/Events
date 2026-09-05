-- Gifts catalog: a standalone table for shoppable gifts that aren't part
-- of the decor rental/purchase catalog (public.items) and aren't sized in
-- sets like the catering line items (public.catering_requests). Some gifts
-- are customizable - the customer picks from a preset list of designs, or
-- types in their own request - so `options`/`allow_custom_text` model that
-- directly instead of needing a separate variants table for one column of
-- choices. Run this once in the Supabase SQL editor.

create table if not exists public.gifts (
  id bigint generated always as identity primary key,
  name text not null unique,
  description text,
  tagline text,
  -- Base price for a preset option (or the only price, when not
  -- customizable). custom_price is charged instead when the customer types
  -- their own request via allow_custom_text - null when there's no custom
  -- upcharge to apply.
  price numeric(10, 2) not null check (price >= 0),
  custom_price numeric(10, 2) check (custom_price is null or custom_price >= 0),
  customizable boolean not null default false,
  allow_custom_text boolean not null default false,
  -- Preset choices shown in the customization dropdown, e.g.
  -- [{"label": "Magic School Bus", "photo_url": "https://..."}, ...].
  -- Empty when the gift isn't customizable.
  options jsonb not null default '[]'::jsonb,
  -- General display photos for the gift tile itself (not the per-option
  -- photos inside `options`).
  photos text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.gifts enable row level security;

-- Anyone can browse the gift catalog; the app itself filters to active
-- rows (matching how public.items is queried), so this stays a broad
-- select policy rather than baking `active = true` into the policy.
create policy gifts_select on public.gifts
  for select
  to anon
  using (true);

-- Pop Up Nostalgia Cards: a preset pick from four existing designs, or a
-- custom request (customer types in a TV show or character) at the higher
-- custom_price. backofcard.png shows the card's reverse side and isn't a
-- selectable design, so it lives in `photos` rather than `options`.
insert into public.gifts (name, description, tagline, price, custom_price, customizable, allow_custom_text, options, photos)
values (
  'Pop Up Nostalgia Cards',
  'A pop up greeting card featuring a favourite childhood show or character. Choose one of our ready made designs, or tell us the show or character you want featured and we''ll create it for you.',
  'A little nostalgia, popped right out of the card.',
  10.00,
  15.00,
  true,
  true,
  '[
    {"label": "Magic School Bus", "photo_url": "https://rsexseihtkaqoxccrylk.supabase.co/storage/v1/object/public/Photos%20from/magicschoolbus.jpg"},
    {"label": "Orly", "photo_url": "https://rsexseihtkaqoxccrylk.supabase.co/storage/v1/object/public/Photos%20from/orly.jpg"},
    {"label": "Proud Family", "photo_url": "https://rsexseihtkaqoxccrylk.supabase.co/storage/v1/object/public/Photos%20from/proud%20family.jpg"},
    {"label": "Berenstain Bears", "photo_url": "https://rsexseihtkaqoxccrylk.supabase.co/storage/v1/object/public/Photos%20from/bersteinbears.jpg"}
  ]'::jsonb,
  array['https://rsexseihtkaqoxccrylk.supabase.co/storage/v1/object/public/Photos%20from/backofcard.png']
)
on conflict (name) do nothing;
