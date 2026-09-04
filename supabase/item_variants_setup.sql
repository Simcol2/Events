-- Lets multiple catalog rows (different sizes, colors, or package types of
-- the same product) show up as one card on the Decor page with a dropdown
-- to pick between them, instead of each size/color being its own separate
-- card. Run this once in the Supabase SQL editor.
--
-- How to use it in the sheet: add two new columns.
--   variant_group  - the same text on every row that belongs together,
--                     e.g. "Flameless Candle Holders" on both the Large
--                     and Small rows. Leave blank for anything that should
--                     keep showing as its own separate card.
--   variant_label  - what shows in the dropdown for that specific row,
--                     e.g. "Large", "Small", "Individual Bag", "Set of 6",
--                     "Blush", "Ivory".
-- Everything else (price, photos, description, quantity) stays per row,
-- so each variant can have its own price and photo.

alter table public.items add column if not exists variant_group text;
alter table public.items add column if not exists variant_label text;

create index if not exists items_variant_group_idx
  on public.items (variant_group)
  where variant_group is not null;
