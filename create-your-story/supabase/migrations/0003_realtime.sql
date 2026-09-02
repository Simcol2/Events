-- Create Your Story: Realtime.
--
-- cys_guest_contributions: new submissions need to reach the moderation panel
--   without polling.
-- cys_live_book_pages: approvals need to reach both the moderation panel's
--   fill counter and the projector live screen.
-- cys_final_books: lets /book/:code and the host Final page show live
--   "generating..." progress instead of polling.
--
-- Everything else (cys_events, cys_story_skeletons, cys_skeleton_pages,
-- cys_final_book_pages) is read once or infrequently and does not need it.
--
-- Note: postgres_changes still enforces RLS per-subscriber — these publication
-- entries make the tables eligible for streaming, they are not themselves a
-- security boundary (0002_rls.sql is).

alter publication supabase_realtime add table cys_guest_contributions;
alter publication supabase_realtime add table cys_live_book_pages;
alter publication supabase_realtime add table cys_final_books;
