import { useEffect, useState } from "react";
import { Check, X, RotateCcw, ExternalLink } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { callFunction } from "../../lib/functions";
import { useRealtimeChannel } from "../../hooks/useRealtimeChannel";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/StatusBadge";

export default function ModerationPanel({ navigate, params }) {
  const { eventId } = params;
  const [event, setEvent] = useState(null);
  const [guestSlotPageNumbers, setGuestSlotPageNumbers] = useState(new Set());
  const [pending, setPending] = useState([]);
  const [livePages, setLivePages] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const loadPending = async () => {
    const { data } = await supabase
      .from("cys_guest_contributions")
      .select("*, page:cys_skeleton_pages(slot_label, page_number)")
      .eq("event_id", eventId)
      .eq("status", "pending")
      .order("submitted_at");
    setPending(data ?? []);
  };

  const loadLivePages = async () => {
    const { data } = await supabase.from("cys_live_book_pages").select("*").eq("event_id", eventId);
    setLivePages(data ?? []);
  };

  useEffect(() => {
    async function init() {
      const { data: eventData } = await supabase.from("cys_events").select("*").eq("id", eventId).single();
      setEvent(eventData);

      const { data: pageData } = await supabase
        .from("cys_skeleton_pages")
        .select("page_number, slot_type")
        .eq("event_id", eventId);
      setGuestSlotPageNumbers(new Set((pageData ?? []).filter((p) => p.slot_type === "guest_slot").map((p) => p.page_number)));

      await Promise.all([loadPending(), loadLivePages()]);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useRealtimeChannel("cys-mod", eventId, [
    { table: "cys_guest_contributions", event: "*", onChange: loadPending },
    {
      table: "cys_live_book_pages",
      event: "*",
      onChange: (payload) => {
        setLivePages((prev) => {
          const next = prev.filter((p) => p.page_number !== payload.new.page_number);
          return [...next, payload.new];
        });
      },
    },
  ]);

  const handleApprove = async (contribution) => {
    setBusyId(contribution.id);
    setError(null);
    try {
      await callFunction("approve-contribution", {
        contributionId: contribution.id,
        hostEditedText: drafts[contribution.id] ?? contribution.text_content,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (contribution) => {
    setBusyId(contribution.id);
    setError(null);
    try {
      await callFunction("reject-contribution", { contributionId: contribution.id, reason: "rejected" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleResetAll = async () => {
    setError(null);
    try {
      await callFunction("reset-live-page", { eventId });
      await loadLivePages();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!event) return <LoadingSpinner />;

  const filledCount = livePages.filter((p) => guestSlotPageNumbers.has(p.page_number) && p.is_filled).length;
  const totalGuestSlots = guestSlotPageNumbers.size;

  return (
    <div className="min-h-screen bg-[#FAF6ED] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-800">{event.title}</h1>
          <StatusBadge status={event.status} />
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-stone-700">
            Live Book Status: {filledCount} of {totalGuestSlots} pages filled
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/live/${event.event_code}`)}
              className="flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700"
            >
              <ExternalLink size={14} /> Live Screen
            </button>
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {pending.length === 0 && (
          <p className="py-8 text-center text-sm text-stone-500">No pending submissions right now.</p>
        )}

        <div className="space-y-3">
          {pending.map((contribution) => (
            <div key={contribution.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between text-xs text-stone-400">
                <span>
                  Page {contribution.page?.page_number} · {contribution.guest_name || "Anonymous guest"}
                </span>
              </div>
              <p className="mb-2 text-xs italic text-stone-500">{contribution.page?.slot_label}</p>

              {contribution.doodle_url && (
                <img
                  src={contribution.doodle_url}
                  alt="Guest doodle"
                  className="mb-2 h-32 w-32 rounded-lg border border-stone-200 object-cover"
                />
              )}

              <textarea
                value={drafts[contribution.id] ?? contribution.text_content ?? ""}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [contribution.id]: e.target.value }))}
                rows={2}
                className="mb-3 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(contribution)}
                  disabled={busyId === contribution.id}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  <Check size={14} /> Approve
                </button>
                <button
                  onClick={() => handleReject(contribution)}
                  disabled={busyId === contribution.id}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 disabled:opacity-50"
                >
                  <X size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
