-- Review platform: the post-rental review cycle.
--
-- Flow: a booking is confirmed or marked complete in the admin, which
-- schedules a review_request. A daily cron sends that request as an email
-- carrying a one-time token. The customer opens /review?token=..., leaves
-- a rating, some words, and optional photos, and is then pointed at the
-- Google review link. Nothing they submit appears on the site until it is
-- approved in the admin.
--
-- Run this once in the Supabase SQL editor.

-- The scheduled invitation. One row per booking we intend to ask about.
create table if not exists public.review_requests (
  id uuid primary key default gen_random_uuid(),
  -- Goes in the emailed link. Unguessable, single booking, and the only
  -- credential the review form needs, so no customer login is required.
  token uuid not null unique default gen_random_uuid(),
  source_type text not null check (source_type in ('item_request', 'package_request', 'manual')),
  source_id uuid,
  customer_name text not null,
  customer_email text not null,
  event_date date,
  -- When the email should go out. Set from the drop-off date on confirm,
  -- or to roughly now when a booking is marked complete by hand.
  scheduled_for timestamptz not null,
  -- scheduled -> sent -> completed. cancelled covers the "hold this one
  -- back" case where a rental went badly and an ask would be tone deaf.
  status text not null default 'scheduled' check (status in ('scheduled', 'sent', 'completed', 'cancelled')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- The cron scans for due, unsent invitations on every run.
create index if not exists review_requests_due_idx
  on public.review_requests (status, scheduled_for);

-- The submitted review itself.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  -- Null once an invitation is deleted, and null for anything added by
  -- hand in the admin, so a review outlives the invite that prompted it.
  review_request_id uuid references public.review_requests (id) on delete set null,
  rating int not null check (rating between 1 and 5),
  body text,
  customer_name text not null,
  customer_email text,
  -- Public URLs of customer uploaded photos, same shape as items.photos.
  photos jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists reviews_moderation_idx
  on public.reviews (status, created_at desc);

alter table public.review_requests enable row level security;
alter table public.reviews enable row level security;

-- The public site reads approved reviews and nothing else. Pending and
-- rejected rows stay invisible to the anon key even though the table is
-- readable, so an unmoderated review can never surface by accident.
drop policy if exists reviews_public_select on public.reviews;
create policy reviews_public_select
  on public.reviews
  for select
  to anon
  using (status = 'approved');

-- No anon insert on purpose. Submissions go through /api/review-submit,
-- which checks the emailed token first, so reviews can only come from
-- someone who actually had a booking. That also keeps the photo upload
-- endpoint from being an open door.
--
-- review_requests gets no anon policy at all: it holds customer emails and
-- is only ever touched by the service role from the API routes.
