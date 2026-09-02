import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { callFunction } from "../../lib/functions";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/StatusBadge";

const FIELD_DEFS = [
  { key: "title", label: "Event title", placeholder: "Baby Wilder's Story Shower" },
  { key: "honoree_name", label: "Honoree's name", placeholder: "Wilder" },
  { key: "theme", label: "Story theme", placeholder: "underwater adventure" },
  { key: "art_style", label: "Art style", placeholder: "soft watercolor, Studio Ghibli-inspired" },
  {
    key: "character_prompt",
    label: "Main characters",
    placeholder: "baby as a little fox, a friendly moon",
    textarea: true,
  },
  { key: "tone", label: "Tone", placeholder: "gentle, whimsical" },
];

export default function EventSetup({ navigate, params }) {
  const { eventId } = params;
  const [event, setEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from("cys_events")
      .select("*")
      .eq("id", eventId)
      .single()
      .then(({ data, error: fetchError }) => {
        if (fetchError) setError(fetchError.message);
        else setEvent(data);
      });
  }, [eventId]);

  const updateField = (key, value) => {
    setEvent((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error: saveError } = await supabase
      .from("cys_events")
      .update({
        title: event.title,
        honoree_name: event.honoree_name,
        theme: event.theme,
        art_style: event.art_style,
        character_prompt: event.character_prompt,
        tone: event.tone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);
    setSaving(false);
    if (saveError) setError(saveError.message);
    else setSaved(true);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await handleSave();
      await callFunction("generate-skeleton", { eventId });
      navigate(`/host/events/${eventId}/skeleton`);
    } catch (err) {
      setError(err.message);
      const { data } = await supabase.from("cys_events").select("*").eq("id", eventId).single();
      setEvent(data);
    } finally {
      setGenerating(false);
    }
  };

  if (!event) return <LoadingSpinner />;

  const canGenerate = event.theme && event.art_style && event.character_prompt;
  const isRetry = event.status === "skeleton_failed";

  return (
    <div className="min-h-screen bg-[#FAF6ED] px-4 py-8">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-800">Event Setup</h1>
          <StatusBadge status={event.status} />
        </div>

        <p className="mb-4 text-xs text-stone-400">
          Guest code: <span className="font-mono">{event.event_code}</span>
        </p>

        <div className="space-y-4">
          {FIELD_DEFS.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-sm font-medium text-stone-700">{field.label}</label>
              {field.textarea ? (
                <textarea
                  value={event[field.key] ?? ""}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={2}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                />
              ) : (
                <input
                  type="text"
                  value={event[field.key] ?? ""}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || generating}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved" : "Save"}
          </button>
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || generating}
            className="flex-1 rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
          >
            {generating ? "Generating story skeleton..." : isRetry ? "Retry Generation" : "Generate Story Skeleton"}
          </button>
        </div>
      </div>
    </div>
  );
}
