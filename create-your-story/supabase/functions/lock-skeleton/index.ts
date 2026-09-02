import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { AuthError, getServiceClient, requireEventOwner } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { eventId } = await req.json();
    if (!eventId) return jsonResponse({ error: "eventId is required" }, 400);

    const { event } = await requireEventOwner(req, eventId);
    if (event.status !== "skeleton_ready") {
      return jsonResponse({ error: `Cannot lock an event with status ${event.status}` }, 409);
    }

    const service = getServiceClient();

    const { data: skeleton, error: skeletonError } = await service
      .from("cys_story_skeletons")
      .select("id")
      .eq("event_id", eventId)
      .single();
    if (skeletonError || !skeleton) return jsonResponse({ error: "No skeleton found for this event" }, 404);

    await service
      .from("cys_story_skeletons")
      .update({ locked: true, locked_at: new Date().toISOString() })
      .eq("id", skeleton.id);

    // Materialize the initial live book: narration pages verbatim, guest
    // slots as gentle placeholders — so the story reads as complete even
    // before a single guest has submitted anything.
    const { error: recomputeError } = await service.rpc("recompute_all_live_pages", { p_event_id: eventId });
    if (recomputeError) throw recomputeError;

    await service
      .from("cys_events")
      .update({ status: "locked", updated_at: new Date().toISOString() })
      .eq("id", eventId);

    return jsonResponse({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return jsonResponse({ error: err.message }, err.status);
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, 500);
  }
});
