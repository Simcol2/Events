import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { callFunction } from "../../lib/functions";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/StatusBadge";
import QrCode from "../../components/QrCode";

export default function SkeletonReview({ navigate, params }) {
  const { eventId } = params;
  const [event, setEvent] = useState(null);
  const [pages, setPages] = useState(null);
  const [locking, setLocking] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    const [{ data: eventData }, { data: pageData }] = await Promise.all([
      supabase.from("cys_events").select("*").eq("id", eventId).single(),
      supabase.from("cys_skeleton_pages").select("*").eq("event_id", eventId).order("page_number"),
    ]);
    setEvent(eventData);
    setPages(pageData ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleLock = async () => {
    setLocking(true);
    setError(null);
    try {
      await callFunction("lock-skeleton", { eventId });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLocking(false);
    }
  };

  if (!event || !pages) return <LoadingSpinner />;

  if (event.status === "skeleton_generating") {
    return <LoadingSpinner label="Still generating the story..." />;
  }

  if (event.status === "draft" || event.status === "skeleton_failed") {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-stone-600">This event doesn't have a ready skeleton yet.</p>
        <button
          onClick={() => navigate(`/host/events/${eventId}/setup`)}
          className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white"
        >
          Back to Setup
        </button>
      </div>
    );
  }

  const guestUrl = `${window.location.origin}/g/${event.event_code}`;
  const isLocked = event.status !== "skeleton_ready";

  return (
    <div className="min-h-screen bg-[#FAF6ED] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-800">{event.title}</h1>
          <StatusBadge status={event.status} />
        </div>

        {isLocked ? (
          <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center shadow-sm sm:flex-row sm:text-left">
            <QrCode url={guestUrl} size={160} />
            <div className="flex-1">
              <p className="mb-1 text-sm text-stone-500">Guests scan this to join:</p>
              <p className="mb-4 break-all font-mono text-sm text-stone-700">{guestUrl}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/host/events/${eventId}/moderation`)}
                  className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white"
                >
                  Open Moderation Panel
                </button>
                <button
                  onClick={() => navigate(`/live/${event.event_code}`)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
                >
                  View Live Screen
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm text-stone-600">
              Review the story below. Once it looks right, lock it in to start collecting guest answers.
            </p>
            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
            <button
              onClick={handleLock}
              disabled={locking}
              className="w-full rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {locking ? "Locking..." : "Lock Story & Open for Guests"}
            </button>
          </div>
        )}

        <div className="space-y-2">
          {pages.map((page) => (
            <div key={page.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-stone-400">Page {page.page_number}</span>
                {page.slot_type === "guest_slot" && (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">Guest Slot</span>
                )}
              </div>
              <p className="text-sm text-stone-700">{page.text_template}</p>
              {page.slot_label && <p className="mt-1 text-xs italic text-stone-500">Prompt: {page.slot_label}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
