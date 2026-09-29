-- Product detail enrichment fields for the editorial product page.
-- Safe to run more than once.

alter table public.items
  add column if not exists brand text,
  add column if not exists material text,
  add column if not exists care_instructions text,
  add column if not exists feature_highlights text[] not null default '{}',
  add column if not exists details text,
  add column if not exists ideas text,
  add column if not exists pair_with text[] not null default '{}';

comment on column public.items.feature_highlights is
  'Up to four short factual product highlights for the icon row, e.g. Oven safe, Durable glazed finish, Oven-to-table.';

comment on column public.items.details is
  'Longer product-detail bullets or paragraphs shown under the Details tab.';

comment on column public.items.ideas is
  'Styling, serving, or use ideas shown under the Ideas tab.';

comment on column public.items.pair_with is
  'Exact public.items.name values for related products shown in the Pair With tab.';