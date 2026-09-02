import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { AuthError, getServiceClient, requireEventOwner } from "../_shared/auth.ts";

// Live pages are always a pure function of skeleton + approved contributions,
// so "Reset" is just "recompute" — no history/undo table needed. Omit
// pageNumber to recompute the whole book at once.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { eventId, pageNumber } = await req.json();
    if (!eventId) return jsonResponse({ error: "eventId is required" }, 400);

    await requireEventOwner(req, eventId);
    const service = getServiceClient();

    if (pageNumber != null) {
      const { error } = await service.rpc("recompute_live_page", { p_event_id: eventId, p_page_number: pageNumber });
      if (error) throw error;
    } else {
      const { error } = await service.rpc("recompute_all_live_pages", { p_event_id: eventId });
      if (error) throw error;
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return jsonResponse({ error: err.message }, err.status);
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, 500);
  }
});
