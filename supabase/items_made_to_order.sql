-- Some catalog pieces (e.g. the Time Capsule) are customized per order
-- rather than drawn from a fixed number of physical units, so the numeric
-- quantity_owned field doesn't fit them. This flag lets the storefront and
-- admin form treat an item as always available and show "Made to Order"
-- instead of a stock count, without touching quantity_owned at all.
alter table public.items
  add column if not exists made_to_order boolean not null default false;
