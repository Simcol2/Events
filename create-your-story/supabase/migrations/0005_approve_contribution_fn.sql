-- Create Your Story: atomic moderation transitions.
--
-- These functions are the fix for the approve/supersede race condition: two
-- guests answering the same slot, a host double-tapping Approve, or two
-- moderation panels open at once must never leave a slot with more than one
-- approved contribution or a live page out of sync with it. Everything that
-- touches more than one row for a single moderation action happens inside one
-- of these functions so it commits as a single transaction.
--
-- Callers: only the service_role key (used exclusively inside Edge Functions)
-- may execute these — see the revoke/grant at the bottom. Edge Functions
-- validate host ownership against the caller's JWT *before* invoking these,
-- and pass the validated user id in as p_moderated_by; the functions
-- themselves do not re-check ownership.

create or replace function cys_placeholder_text(p_text_template text)
returns text
language sql
immutable
as $$
  -- Gentle placeholder for a guest slot nobody has filled yet, per the
  -- product spec's guidance that the story should still read as complete
  -- even with partial participation.
  select replace(p_text_template, '{{GUEST}}', 'a secret wish, kept for now');
$$;

create or replace function recompute_live_page(p_event_id uuid, p_page_number int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_page          cys_skeleton_pages%rowtype;
  v_contribution  cys_guest_contributions%rowtype;
  v_rendered_text text;
  v_is_filled     boolean;
  v_attribution   text;
  v_contrib_id    uuid;
begin
  select sp.* into v_page
  from cys_skeleton_pages sp
  join cys_story_skeletons s on s.id = sp.skeleton_id
  where s.event_id = p_event_id and sp.page_number = p_page_number;

  if not found then
    raise exception 'no skeleton page % for event %', p_page_number, p_event_id;
  end if;

  if v_page.slot_type = 'narration' then
    v_rendered_text := v_page.text_template;
    v_is_filled := true;
    v_attribution := null;
    v_contrib_id := null;
  else
    select * into v_contribution
    from cys_guest_contributions
    where skeleton_page_id = v_page.id and status = 'approved'
    limit 1;

    if found then
      v_rendered_text := coalesce(v_contribution.woven_text, v_page.text_template);
      v_is_filled := true;
      v_attribution := v_contribution.guest_name;
      v_contrib_id := v_contribution.id;
    else
      v_rendered_text := cys_placeholder_text(v_page.text_template);
      v_is_filled := false;
      v_attribution := null;
      v_contrib_id := null;
    end if;
  end if;

  insert into cys_live_book_pages (event_id, page_number, rendered_text, is_filled, guest_attribution, contribution_id, last_updated_at)
  values (p_event_id, p_page_number, v_rendered_text, v_is_filled, v_attribution, v_contrib_id, now())
  on conflict (event_id, page_number) do update
    set rendered_text = excluded.rendered_text,
        is_filled = excluded.is_filled,
        guest_attribution = excluded.guest_attribution,
        contribution_id = excluded.contribution_id,
        last_updated_at = now();
end;
$$;

create or replace function recompute_all_live_pages(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_page_number int;
begin
  for v_page_number in
    select sp.page_number
    from cys_skeleton_pages sp
    join cys_story_skeletons s on s.id = sp.skeleton_id
    where s.event_id = p_event_id
    order by sp.page_number
  loop
    perform recompute_live_page(p_event_id, v_page_number);
  end loop;
end;
$$;

create or replace function approve_contribution(
  p_contribution_id uuid,
  p_host_edited_text text,
  p_woven_text text,
  p_moderated_by uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contribution   cys_guest_contributions%rowtype;
  v_page           cys_skeleton_pages%rowtype;
  v_total_slots    int;
  v_filled_slots   int;
begin
  -- Lock the target contribution row first so two concurrent approvals of the
  -- *same* contribution serialize instead of racing.
  select * into v_contribution
  from cys_guest_contributions
  where id = p_contribution_id
  for update;

  if not found then
    raise exception 'contribution % not found', p_contribution_id;
  end if;

  -- Lock the *slot* itself (its skeleton_pages row), not just this one
  -- contribution: without this, two different contributions competing for
  -- the same slot could each pass "no approved row yet" and both end up
  -- approved before either transaction commits, since row-locking the
  -- contribution being approved does nothing to block a sibling contribution
  -- for the same slot. Locking the shared skeleton_pages row serializes every
  -- approval attempt for this slot through one mutex.
  select * into v_page from cys_skeleton_pages where id = v_contribution.skeleton_page_id for update;

  -- Now that the slot is locked, supersede any existing approved contribution
  -- before approving the new one, so the two writes are atomic and no
  -- interleaved transaction can ever see two approved rows for one slot.
  update cys_guest_contributions
  set status = 'rejected', reject_reason = 'superseded', moderated_at = now(), moderated_by = p_moderated_by
  where skeleton_page_id = v_contribution.skeleton_page_id
    and status = 'approved'
    and id <> p_contribution_id;

  update cys_guest_contributions
  set status = 'approved',
      host_edited_text = p_host_edited_text,
      woven_text = p_woven_text,
      moderated_at = now(),
      moderated_by = p_moderated_by
  where id = p_contribution_id;

  perform recompute_live_page(v_contribution.event_id, v_page.page_number);

  -- If every guest slot in the book now has an approved answer, mark the
  -- event completed (drives the "Book Complete" confetti moment client-side).
  select count(*) into v_total_slots
  from cys_skeleton_pages sp
  join cys_story_skeletons s on s.id = sp.skeleton_id
  where s.event_id = v_contribution.event_id and sp.slot_type = 'guest_slot';

  select count(*) into v_filled_slots
  from cys_live_book_pages lbp
  join cys_skeleton_pages sp on sp.event_id = lbp.event_id and sp.page_number = lbp.page_number
  join cys_story_skeletons s on s.id = sp.skeleton_id
  where s.event_id = v_contribution.event_id and sp.slot_type = 'guest_slot' and lbp.is_filled = true;

  if v_total_slots > 0 and v_filled_slots = v_total_slots then
    update cys_events
    set status = 'completed', completed_at = now(), updated_at = now()
    where id = v_contribution.event_id and status <> 'completed';
  end if;
end;
$$;

create or replace function reject_contribution(
  p_contribution_id uuid,
  p_reason text,
  p_moderated_by uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update cys_guest_contributions
  set status = 'rejected',
      reject_reason = coalesce(p_reason, 'rejected'),
      moderated_at = now(),
      moderated_by = p_moderated_by
  where id = p_contribution_id and status = 'pending';

  if not found then
    raise exception 'contribution % not found or not pending', p_contribution_id;
  end if;
end;
$$;

revoke execute on function cys_placeholder_text(text) from public;
revoke execute on function recompute_live_page(uuid, int) from public;
revoke execute on function recompute_all_live_pages(uuid) from public;
revoke execute on function approve_contribution(uuid, text, text, uuid) from public;
revoke execute on function reject_contribution(uuid, text, uuid) from public;

grant execute on function recompute_live_page(uuid, int) to service_role;
grant execute on function recompute_all_live_pages(uuid) to service_role;
grant execute on function approve_contribution(uuid, text, text, uuid) to service_role;
grant execute on function reject_contribution(uuid, text, uuid) to service_role;
