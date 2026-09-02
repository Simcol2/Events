import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { callFunction } from "../../lib/functions";
import LoadingSpinner from "../../components/LoadingSpinner";

const MAX_DOODLE_BYTES = 2 * 1024 * 1024;
const ALLOWED_DOODLE_TYPES = ["image/png", "image/jpeg"];

async function uploadDoodle(eventId, file) {
  if (file.size > MAX_DOODLE_BYTES) throw new Error("That image is a bit too big — please pick one under 2MB.");
  if (!ALLOWED_DOODLE_TYPES.includes(file.type)) throw new Error("Please upload a PNG or JPEG image.");

  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `doodles/${eventId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("cys-story-assets").upload(path, file, { contentType: file.type });
  if (error) throw error;

  return supabase.storage.from("cys-story-assets").getPublicUrl(path).data.publicUrl;
}

export default function GuestSubmit({ params }) {
  const { eventCode } = params;
  const [event, setEvent] = useState(undefined);
  const [pages, setPages] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [answers, setAnswers] = useState({});
  const [doodleFile, setDoodleFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: eventData } = await supabase
        .from("cys_events")
        .select("id, title, honoree_name, status")
        .eq("event_code", eventCode)
        .single();

      if (!eventData) {
        setEvent(null);
        return;
      }
      setEvent(eventData);

      const { data: pageData } = await supabase
        .from("cys_skeleton_pages")
        .select("id, slot_label, slot_order, accepts_image")
        .eq("event_id", eventData.id)
        .eq("slot_type", "guest_slot")
        .order("slot_order");

      setPages(pageData ?? []);
    }
    load();
  }, [eventCode]);

  if (event === undefined || (event && pages === null)) return <LoadingSpinner />;

  if (event === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6ED] px-6 text-center text-stone-600">
        We couldn't find that event. Double-check the link or ask your host for a new one.
      </div>
    );
  }

  if (!["locked", "live"].includes(event.status)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6ED] px-6 text-center text-stone-600">
        This story isn't open for answers right now.
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#FAF6ED] px-6 text-center">
        <p className="text-2xl">🎉</p>
        <p className="text-lg font-medium text-stone-800">Thank you!</p>
        <p className="text-sm text-stone-600">Your answer is on its way into {event.honoree_name || "the"}'s story.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const filled = pages.filter((p) => answers[p.id]?.trim() || (p.accepts_image && doodleFile));
    if (filled.length === 0) {
      setError("Please answer at least one question before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      let doodleUrl = null;
      const doodlePage = pages.find((p) => p.accepts_image);
      if (doodlePage && doodleFile) {
        doodleUrl = await uploadDoodle(event.id, doodleFile);
      }

      for (const page of filled) {
        await callFunction("submit-contribution", {
          eventCode,
          skeletonPageId: page.id,
          guestName,
          textContent: answers[page.id] ?? "",
          doodleUrl: page.id === doodlePage?.id ? doodleUrl : null,
        });
      }

      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6ED] px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-1 text-xl font-semibold text-stone-800">
          Help write {event.honoree_name || "our"}'s story
        </h1>
        <p className="mb-6 text-sm text-stone-500">Answer any of the questions below.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Your name (optional)</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base focus:border-stone-500 focus:outline-none"
            />
          </div>

          {pages.map((page) => (
            <div key={page.id}>
              <label className="mb-1 block text-sm font-medium text-stone-700">{page.slot_label}</label>
              <textarea
                value={answers[page.id] ?? ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [page.id]: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base focus:border-stone-500 focus:outline-none"
              />
              {page.accepts_image && (
                <div className="mt-2">
                  <label className="mb-1 block text-xs text-stone-500">Or add a doodle (PNG/JPEG, under 2MB)</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => setDoodleFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-stone-600"
                  />
                </div>
              )}
            </div>
          ))}

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-stone-800 px-4 py-4 text-base font-medium text-white hover:bg-stone-700 disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
