import { useEffect, useState } from "react";
import { Download, ExternalLink, Sparkles } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { callFunction } from "../../lib/functions";
import { useRealtimeChannel } from "../../hooks/useRealtimeChannel";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/StatusBadge";

export default function FinalBook({ navigate, params }) {
  const { eventId } = params;
  const [event, setEvent] = useState(null);
  const [finalBook, setFinalBook] = useState(null);
  const [pages, setPages] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const loadFinalBook = async () => {
    const { data } = await supabase.from("cys_final_books").select("*").eq("event_id", eventId).maybeSingle();
    setFinalBook(data);
  };

  const loadPages = async () => {
    const { data } = await supabase.from("cys_final_book_pages").select("*").eq("event_id", eventId).order("page_number");
    setPages(data ?? []);
  };

  useEffect(() => {
    async function init() {
      const { data: eventData } = await supabase.from("cys_events").select("*").eq("id", eventId).single();
      setEvent(eventData);
      await Promise.all([loadFinalBook(), loadPages()]);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useRealtimeChannel("cys-final", eventId, [
    {
      table: "cys_final_books",
      event: "*",
      onChange: (payload) => {
        setFinalBook(payload.new);
        if (payload.new.status === "ready") loadPages();
      },
    },
  ]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await callFunction("generate-final-book", { eventId });
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
      await loadFinalBook();
    }
  };

  if (!event) return <LoadingSpinner />;

  const status = finalBook?.status ?? "not_started";
  const isGenerating = status === "generating" || generating;

  return (
    <div className="min-h-screen bg-[#FAF6ED] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-800">{event.title} — Final Book</h1>
          <StatusBadge status={event.status} />
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          {status === "not_started" && (
            <p className="mb-4 text-sm text-stone-600">
              Ready to turn the live draft into the print-ready keepsake? This runs the full narrative polish and
              illustrations for every page.
            </p>
          )}
          {status === "failed" && finalBook?.error_message && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{finalBook.error_message}</p>
          )}
          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          {isGenerating && <LoadingSpinner label="Generating your final book — this can take a minute..." />}

          {!isGenerating && (
            <button
              onClick={handleGenerate}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-800 px-4 py-3 text-sm font-medium text-white hover:bg-stone-700"
            >
              <Sparkles size={16} />
              {status === "ready" ? "Regenerate Final Book" : status === "failed" ? "Retry Generation" : "Generate Final Book"}
            </button>
          )}

          {status === "ready" && finalBook?.pdf_url && (
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={finalBook.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
              >
                <Download size={14} /> Download PDF
              </a>
              <button
                onClick={() => navigate(`/book/${event.event_code}`)}
                className="flex items-center gap-1 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
              >
                <ExternalLink size={14} /> View Book Page
              </button>
            </div>
          )}
        </div>

        {pages.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pages.map((page) => (
              <div key={page.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                {page.illustration_url && (
                  <img src={page.illustration_url} alt={`Page ${page.page_number}`} className="h-32 w-full object-cover" />
                )}
                <p className="p-2 text-xs text-stone-600">{page.polished_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
