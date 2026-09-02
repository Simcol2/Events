import { useEffect, useState } from "react";
import { Plus, LogOut } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { generateEventCode } from "../../lib/eventCode";
import { nextRouteForEvent } from "../../lib/eventRouting";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";

async function createDraftEvent(ownerId) {
  // Unique constraint on event_code is the real guard; retry a few times on
  // the rare collision rather than trusting an unsynchronized pre-check.
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from("cys_events")
      .insert({
        owner_id: ownerId,
        event_code: generateEventCode(),
        title: "Untitled Event",
        theme: "",
        art_style: "",
        character_prompt: "",
      })
      .select()
      .single();

    if (!error) return data;
    if (error.code !== "23505") throw error; // not a unique-violation, don't retry
  }
  throw new Error("Could not generate a unique event code, please try again.");
}

export default function Dashboard({ navigate }) {
  const { user, signOut } = useAuth();
  const [events, setEvents] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("cys_events")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) setError(fetchError.message);
        else setEvents(data);
      });
  }, [user]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const event = await createDraftEvent(user.id);
      navigate(`/host/events/${event.id}/setup`);
    } catch (err) {
      setError(err.message);
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6ED] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-stone-800">Your Events</h1>
          <button
            onClick={() => signOut().then(() => navigate("/"))}
            className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>

        <button
          onClick={handleCreate}
          disabled={creating}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 py-4 text-sm font-medium text-stone-600 hover:border-stone-400 hover:bg-white disabled:opacity-50"
        >
          <Plus size={16} /> {creating ? "Creating..." : "New Event"}
        </button>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {events === null && <LoadingSpinner />}

        {events?.length === 0 && (
          <p className="py-8 text-center text-sm text-stone-500">No events yet — create your first one above.</p>
        )}

        <div className="space-y-3">
          {events?.map((event) => (
            <button
              key={event.id}
              onClick={() => navigate(nextRouteForEvent(event))}
              className="flex w-full items-center justify-between rounded-xl bg-white p-4 text-left shadow-sm hover:shadow"
            >
              <div>
                <p className="font-medium text-stone-800">{event.title}</p>
                <p className="text-xs text-stone-500">Code: {event.event_code}</p>
              </div>
              <StatusBadge status={event.status} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
