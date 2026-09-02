-- Create Your Story: Storage.
--
-- One public bucket, three folders:
--   doodles/<event_id>/<uuid>.<ext>   — anon insert-only, direct client upload
--   illustrations/<event_id>/...      — service-role only (generate-final-book)
--   pdfs/<event_id>/...               — service-role only (generate-final-book)
--
-- The bucket-level file_size_limit/allowed_mime_types are the real backstop for
-- doodle uploads; any client-side size/type check is UX only, not security.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cys-story-assets', 'cys-story-assets', true, 2097152, array['image/png','image/jpeg'])
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Doodles are scoped per event folder so one event's guests can never collide
-- with or overwrite another event's files, and cleanup-by-event is a simple
-- folder delete. Only open (locked/live) events accept new doodles.
create policy "anon uploads doodles for open events" on storage.objects
  for insert to anon
  with check (
    bucket_id = 'cys-story-assets'
    and (storage.foldername(name))[1] = 'doodles'
    and exists (
      select 1 from cys_events e
      where e.id::text = (storage.foldername(name))[2]
        and e.status in ('locked', 'live')
        and e.deleted_at is null
    )
  );

-- Belt-and-braces read policy (public buckets already serve objects via the
-- public URL without going through this, but this keeps signed-URL reads
-- working the same way if that's ever preferred over getPublicUrl()).
create policy "anyone reads story assets" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'cys-story-assets');

-- No update/delete policy for anon or authenticated on this bucket at all:
-- a doodle can never be overwritten once uploaded, and illustrations/pdfs are
-- written exclusively by Edge Functions via the service-role client.
