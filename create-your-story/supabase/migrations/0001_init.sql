-- Create Your Story: core schema.
-- All tables are prefixed cys_ to avoid colliding with the marketing site's
-- existing tables (e.g. `items`) in the same shared Supabase project.

create extension if not exists pgcrypto; -- gen_random_uuid()

create table cys_events (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references auth.users(id) on delete cascade,
  event_code        text not null unique,
  title             text not null,
  honoree_name      text,
  theme             text not null,
  art_style         text not null,
  character_prompt  text not null,
  tone              text not null default 'warm and whimsical',
  total_pages       int not null default 12,
  status            text not null default 'draft'
                       check (status in (
                         'draft','skeleton_generating','skeleton_ready','skeleton_failed',
                         'locked','live','completed',
                         'final_generating','final_ready','final_failed','archived'
                       )),
  completed_at      timestamptz,
  deleted_at        timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index cys_events_owner_id_idx on cys_events(owner_id) where deleted_at is null;
create index cys_events_event_code_idx on cys_events(event_code) where deleted_at is null;

create table cys_story_skeletons (
  id                uuid primary key default gen_random_uuid(),
  event_id          uuid not null unique references cys_events(id) on delete cascade,
  locked            boolean not null default false,
  locked_at         timestamptz,
  style_reference   jsonb,
  generated_by      text not null default 'stub',
  raw_model_output  jsonb,
  error_message     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table cys_skeleton_pages (
  id              uuid primary key default gen_random_uuid(),
  skeleton_id     uuid not null references cys_story_skeletons(id) on delete cascade,
  event_id        uuid not null references cys_events(id) on delete cascade,
  page_number     int not null,
  slot_type       text not null check (slot_type in ('narration','guest_slot')),
  text_template   text not null,
  slot_label      text,
  slot_order      int,
  accepts_image   boolean not null default false,
  unique (skeleton_id, page_number)
);

create index cys_skeleton_pages_event_id_idx on cys_skeleton_pages(event_id);

create table cys_guest_contributions (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references cys_events(id) on delete cascade,
  skeleton_page_id    uuid not null references cys_skeleton_pages(id) on delete cascade,
  guest_name          text,
  text_content        text,
  doodle_url          text,
  status              text not null default 'pending'
                         check (status in ('pending','approved','rejected')),
  reject_reason       text,
  host_edited_text    text,
  woven_text          text, -- rendered_text produced by LlmProvider.weaveTransition at approval time;
                             -- cached here so a later Reset can recompute the live page without
                             -- re-calling the AI provider.
  submitted_at        timestamptz not null default now(),
  moderated_at        timestamptz,
  moderated_by        uuid references auth.users(id)
);

create index cys_guest_contributions_event_id_idx on cys_guest_contributions(event_id);
create index cys_guest_contributions_slot_pending_idx
  on cys_guest_contributions(skeleton_page_id)
  where status = 'pending';
-- Only one row may be 'approved' per slot at a time; approve_contribution()
-- (0005) enforces this transactionally, this index just makes that lookup fast.
create unique index cys_guest_contributions_one_approved_per_slot_idx
  on cys_guest_contributions(skeleton_page_id)
  where status = 'approved';

create table cys_submission_log (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references cys_events(id) on delete cascade,
  ip_hash       text not null,
  submitted_at  timestamptz not null default now()
);

create index cys_submission_log_lookup_idx on cys_submission_log(event_id, ip_hash, submitted_at);

create table cys_live_book_pages (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references cys_events(id) on delete cascade,
  page_number         int not null,
  rendered_text       text not null,
  is_filled           boolean not null default false,
  guest_attribution   text,
  contribution_id     uuid references cys_guest_contributions(id),
  last_updated_at     timestamptz not null default now(),
  unique (event_id, page_number)
);

create table cys_final_books (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null unique references cys_events(id) on delete cascade,
  status         text not null default 'not_started'
                    check (status in ('not_started','generating','ready','failed')),
  pdf_url        text,
  error_message  text,
  requested_at   timestamptz,
  completed_at   timestamptz
);

create table cys_final_book_pages (
  id                   uuid primary key default gen_random_uuid(),
  event_id             uuid not null references cys_events(id) on delete cascade,
  page_number          int not null,
  polished_text        text,
  illustration_url     text,
  illustration_status  text not null default 'pending'
                          check (illustration_status in ('pending','generating','ready','failed')),
  generated_by         text not null default 'stub',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (event_id, page_number)
);
