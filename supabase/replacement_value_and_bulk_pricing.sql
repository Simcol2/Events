-- replacement_value: what a customer is charged if a rental piece is lost or
-- broken. Text rather than numeric because several pieces are quoted as a
-- range ("$8-$10 each"). Shown at the bottom of every product view.
--
-- bulk_min_quantity / bulk_rental_price: an optional per-item quantity
-- break (e.g. $2.50 each once 12 or more are rented). Checkout recomputes
-- this server-side in api/_pricing.js, so the client can't claim it.
alter table public.items
  add column if not exists replacement_value text,
  add column if not exists bulk_min_quantity integer,
  add column if not exists bulk_rental_price numeric(10, 2);

alter table public.items
  add constraint items_bulk_min_quantity_check
    check (bulk_min_quantity is null or bulk_min_quantity >= 2),
  add constraint items_bulk_rental_price_check
    check (bulk_rental_price is null or bulk_rental_price >= 0),
  add constraint items_bulk_pricing_pair_check
    check ((bulk_min_quantity is null) = (bulk_rental_price is null));
