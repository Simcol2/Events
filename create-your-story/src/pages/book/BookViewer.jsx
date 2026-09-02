import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useRealtimeChannel } from "../../hooks/useRealtimeChannel";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function BookViewer({ params }) {
  const { eventCode } = params;
  const [event, setEvent] = useState(undefined);
  const [finalBook, setFinalBook] = useState(null);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    async function load() {
      const { data: eventData } = await supabase
        .from("cys_events")
        .select("id, title, honoree_name")
        .eq("event_code", eventCode)
        .single();

      if (!eventData) {
        setEvent(null);
        return;
      }
      setEvent(eventData);

      const { data: fb } = await supabase.from("cys_final_books").select("*").eq("event_id", eventData.id).maybeSingle();
      setFinalBook(fb);

      if (fb?.status === "ready") {
        const { data: pageData } = await supabase
          .from("cys_final_book_pages")
          .select("*")
          .eq("event_id", eventData.id)
          .order("page_number");
        setPages(pageData ?? []);
      }
    }
    load();
  }, [eventCode]);

  useRealtimeChannel("cys-book", event?.id, [
    {
      table: "cys_final_books",
      event: "*",
      onChange: async (payload) => {
        setFinalBook(payload.new);
        if (payload.new.status === "ready") {
          const { data: pageData } = await supabase
            .from("cys_final_book_pages")
            .select("*")
            .eq("event_id", payload.new.event_id)
            .order("page_number");
          setPages(pageData ?? []);
        }
      },
    },
  ]);

  if (event === undefined) return <LoadingSpinner />;
  if (event === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6ED] text-stone-600">
        We couldn't find that book.
      </div>
    );
  }

  if (!finalBook || finalBook.status !== "ready") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6ED] px-6 text-center">
        <LoadingSpinner label="The keepsake book is still being made..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6ED] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-stone-800">{event.title}</h1>
          <a
            href={finalBook.pdf_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white"
          >
            <Download size={14} /> Download PDF
          </a>
        </div>

        <div className="space-y-8">
          {pages.map((page) => (
            <div key={page.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {page.illustration_url && <img src={page.illustration_url} alt={`Page ${page.page_number}`} className="w-full" />}
              <p className="p-6 text-center text-lg text-stone-700">{page.polished_text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
