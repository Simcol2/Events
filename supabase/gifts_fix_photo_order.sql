-- The Pop Up Nostalgia Cards row's `photos` column originally held only
-- backofcard.png, so the gift tile's very first (and, before the photo
-- carousel existed, only) image was the back of the card instead of one of
-- the actual designs. Reorders it to lead with all four card fronts (the
-- same photos already used in `options` for the customization dropdown),
-- with the back of the card last. Run once in the Supabase SQL editor.

update public.gifts
set photos = array[
  'https://rsexseihtkaqoxccrylk.supabase.co/storage/v1/object/public/Photos%20from/magicschoolbus.jpg',
  'https://rsexseihtkaqoxccrylk.supabase.co/storage/v1/object/public/Photos%20from/orly.jpg',
  'https://rsexseihtkaqoxccrylk.supabase.co/storage/v1/object/public/Photos%20from/proud%20family.jpg',
  'https://rsexseihtkaqoxccrylk.supabase.co/storage/v1/object/public/Photos%20from/bersteinbears.jpg',
  'https://rsexseihtkaqoxccrylk.supabase.co/storage/v1/object/public/Photos%20from/backofcard.png'
]
where name = 'Pop Up Nostalgia Cards';
