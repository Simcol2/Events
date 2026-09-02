import { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useRealtimeChannel } from "../../hooks/useRealtimeChannel";
import PageCard from "../../components/PageCard";
import ConfettiBurst from "../../components/ConfettiBurst";
import QrCode from "../../components/QrCode";
import LoadingSpinner from "../../components/LoadingSpinner";

const AUTO_FLIP_MS = 12000;
const GLOW_MS = 3500;

export default function LiveScreen({ params }) {
  const { eventCode } = params;
  const [event, setEvent] = useState(undefined);
  const [guestSlotPageNumbers, setGuestSlotPageNumbers] = useState(new Set());
  const [pagesByNumber, setPagesByNumber] = useState({});
  const [currentPageNumber, setCurrentPageNumber] = useState(null);
  const [glowPageNumber, setGlowPageNumber] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiFired = useRef(false);
  const glowTimeout = useRef(null);

  useEffect(() => {
    async function load() {
      const { data: eventData } = await supabase
        .from("cys_events")
        .select("id, title, honoree_name, event_code, status")
        .eq("event_code", eventCode)
        .single();

      if (!eventData) {
        setEvent(null);
        return;
      }
      setEvent(eventData);

      const { data: skeletonPages } = await supabase
        .from("cys_skeleton_pages")
        .select("page_number, slot_type")
        .eq("event_id", eventData.id);
      setGuestSlotPageNumbers(
        new Set((skeletonPages ?? []).filter((p) => p.slot_type === "guest_slot").map((p) => p.page_number))
      );

      const { data: liveRows } = await supabase
        .from("cys_live_book_pages")
        .select("*")
        .eq("event_id", eventData.id)
        .order("page_number");

      const byNumber = {};
      for (const row of liveRows ?? []) byNumber[row.page_number] = row;
      setPagesByNumber(byNumber);
      setCurrentPageNumber(liveRows?.[0]?.page_number ?? null);
    }
    load();
  }, [eventCode]);

  useRealtimeChannel("cys-live", event?.id, [
    {
      table: "cys_live_book_pages",
      event: "*",
      onChange: (payload) => {
        const row = payload.new;
        setPagesByNumber((prev) => ({ ...prev, [row.page_number]: row }));
        setCurrentPageNumber(row.page_number);
        setGlowPageNumber(row.page_number);
        clearTimeout(glowTimeout.current);
        glowTimeout.current = setTimeout(() => setGlowPageNumber(null), GLOW_MS);
      },
    },
  ]);

  // Auto-flip through pages; restarts its countdown whenever the current
  // page changes (including a realtime jump), so a fresh approval doesn't
  // get immediately flipped away from.
  useEffect(() => {
    const pageNumbers = Object.keys(pagesByNumber)
      .map(Number)
      .sort((a, b) => a - b);
    if (pageNumbers.length === 0) return;

    const timer = setTimeout(() => {
      const idx = pageNumbers.indexOf(currentPageNumber);
      const next = pageNumbers[(idx + 1) % pageNumbers.length];
      setCurrentPageNumber(next);
    }, AUTO_FLIP_MS);

    return () => clearTimeout(timer);
  }, [currentPageNumber, pagesByNumber]);

  // Book Complete: fire confetti once every guest slot has an approved answer.
  useEffect(() => {
    if (confettiFired.current || guestSlotPageNumbers.size === 0) return;
    const allFilled = [...guestSlotPageNumbers].every((pn) => pagesByNumber[pn]?.is_filled);
    if (allFilled) {
      confettiFired.current = true;
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000);
    }
  }, [pagesByNumber, guestSlotPageNumbers]);

  if (event === undefined) return <LoadingSpinner />;
  if (event === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 text-stone-300">
        Event not found.
      </div>
    );
  }

  const guestUrl = `${window.location.origin}/g/${event.event_code}`;
  const currentPage = currentPageNumber != null ? pagesByNumber[currentPageNumber] : null;

  return (
    <div className="flex min-h-screen flex-col justify-center bg-stone-950 px-8 py-12">
      <ConfettiBurst show={showConfetti} />
      {showConfetti && (
        <p className="mb-6 text-center text-3xl font-semibold text-amber-200">The story is complete! 🎉</p>
      )}
      <PageCard page={currentPage} isGlowing={glowPageNumber === currentPageNumber} />
      <div className="fixed bottom-6 right-6 opacity-70">
        <QrCode url={guestUrl} size={96} />
      </div>
    </div>
  );
}
