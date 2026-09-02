-- Create Your Story: Row Level Security.
--
-- Three access patterns repeat across these tables:
--   A. host-owned      — authenticated, scoped to owner_id = auth.uid()
--   B. public-when-appropriate — anon reads only, gated by event/skeleton/book status
--   C. service-role-only writes — no anon/authenticated write policy exists at all,
--      so only the service_role key (used exclusively inside Edge Functions) can
--      write. This is the enforcement mechanism for "consequential writes happen
--      server-side," not an app-level convention.

alter table cys_events enable row level security;
alter table cys_story_skeletons enable row level security;
alter table cys_skeleton_pages enable row level security;
alter table cys_guest_contributions enable row level security;
alter table cys_submission_log enable row level security;
alter table cys_live_book_pages enable row level security;
alter table cys_final_books enable row level security;
alter table cys_final_book_pages enable row level security;

-- cys_events ----------------------------------------------------------------

create policy "host reads own events" on cys_events
  for select to authenticated
  using (owner_id = auth.uid());

create policy "host creates own events" on cys_events
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy "host updates own events" on cys_events
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "public reads non-draft events" on cys_events
  for select to anon, authenticated
  using (status <> 'draft' and deleted_at is null);

-- cys_story_skeletons ---------------------------------------------------------
-- No anon policy: nothing anon-facing reads this table directly (guests and the
-- live screen only ever need cys_skeleton_pages / cys_live_book_pages). Writes
-- are service-role only (Pattern C) — no insert/update policy for any role here.

create policy "host reads own skeleton" on cys_story_skeletons
  for select to authenticated
  using (exists (select 1 from cys_events e where e.id = event_id and e.owner_id = auth.uid()));

-- cys_skeleton_pages ----------------------------------------------------------

create policy "host reads own skeleton pages" on cys_skeleton_pages
  for select to authenticated
  using (exists (select 1 from cys_events e where e.id = event_id and e.owner_id = auth.uid()));

create policy "anon reads locked skeleton pages" on cys_skeleton_pages
  for select to anon
  using (exists (
    select 1 from cys_story_skeletons s
    where s.id = skeleton_id and s.locked = true
  ));

-- cys_guest_contributions -----------------------------------------------------
-- Guests get insert-only (no read at all — the moderation queue is never
-- anon-readable). The real submission path runs through the submit-contribution
-- Edge Function (rate limiting, doodle validation) using service_role, so this
-- policy is defense-in-depth, not the only gate.

create policy "anon submits contribution to open event" on cys_guest_contributions
  for insert to anon
  with check (
    status = 'pending'
    and exists (
      select 1 from cys_events e
      where e.id = event_id and e.status in ('locked','live') and e.deleted_at is null
    )
    and exists (
      select 1 from cys_skeleton_pages sp
      where sp.id = skeleton_page_id and sp.event_id = cys_guest_contributions.event_id
    )
  );

create policy "host reads own contributions" on cys_guest_contributions
  for select to authenticated
  using (exists (select 1 from cys_events e where e.id = event_id and e.owner_id = auth.uid()));

-- No update/delete policy for anon or authenticated: moderation (approve/
-- reject/reset) happens only via the service-role-executed plpgsql functions
-- in 0005_approve_contribution_fn.sql.

-- cys_submission_log ------------------------------------------------------
-- No anon/authenticated policy at all — purely an internal rate-limit ledger
-- read and written by the submit-contribution Edge Function via service_role.

-- cys_live_book_pages -----------------------------------------------------
-- Already-approved, public content — no reason to gate reads beyond the event
-- existing and not being soft-deleted. Writes are service-role only (Pattern C).

create policy "anyone reads live book pages" on cys_live_book_pages
  for select to anon, authenticated
  using (exists (select 1 from cys_events e where e.id = event_id and e.deleted_at is null));

-- cys_final_books -----------------------------------------------------------
-- Anon can see status (including "generating") once the event itself is
-- public, so /book/:code can show live progress; writes are service-role only.

create policy "host reads own final book" on cys_final_books
  for select to authenticated
  using (exists (select 1 from cys_events e where e.id = event_id and e.owner_id = auth.uid()));

create policy "public reads final book status" on cys_final_books
  for select to anon, authenticated
  using (exists (
    select 1 from cys_events e where e.id = event_id and e.status <> 'draft' and e.deleted_at is null
  ));

-- cys_final_book_pages --------------------------------------------------------

create policy "host reads own final pages" on cys_final_book_pages
  for select to authenticated
  using (exists (select 1 from cys_events e where e.id = event_id and e.owner_id = auth.uid()));

create policy "anon reads final pages once ready" on cys_final_book_pages
  for select to anon
  using (exists (
    select 1 from cys_final_books fb where fb.event_id = cys_final_book_pages.event_id and fb.status = 'ready'
  ));
