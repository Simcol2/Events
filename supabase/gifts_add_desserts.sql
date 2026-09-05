-- Adds the two Grown Folks Loot Bags dessert gifts (previously hardcoded in
-- cateringContent.js and only purchasable from the Catering page) into the
-- shared gifts catalog, so they show up alongside every other one-off gift
-- on the Gifts page through the same cart/checkout flow. Run once in the
-- Supabase SQL editor, after supabase/gifts_setup.sql.
--
-- Catering.jsx keeps its own copy of this same data in cateringContent.js
-- and is untouched by this - its "Grown Folks Loot Bags" section there
-- still uses the "dessert" cart kind, unrelated to these new "gift" kind
-- rows. Keeping both is intentional: Catering's version is styled and
-- ordered differently (arched photo frames, no separate line item here).

insert into public.gifts (name, description, tagline, price, customizable, allow_custom_text)
values
  (
    'Rum Cupcake Gift Box',
    'Three full size Rum Cupcakes, individually gift boxed and vacuum sealed to lock in every bit of freshness. Hand someone this box and watch their whole day improve.',
    'The gift that says you actually like someone.',
    15.00,
    false,
    false
  ),
  (
    'G Ring Gift',
    'One G Ring, individually wrapped and ready to gift. This version comes without the cream cheese center, but it still shows up big.',
    'One cookie, zero disappointment.',
    10.00,
    false,
    false
  )
on conflict (name) do nothing;
