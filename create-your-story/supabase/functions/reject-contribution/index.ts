import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { AuthError, getServiceClient, requireEventOwner } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { contributionId, reason } = await req.json();
    if (!contributionId) return jsonResponse({ error: "contributionId is required" }, 400);

    const service = getServiceClient();
    const { data: contribution, error: contribError } = await service
      .from("cys_guest_contributions")
      .select("event_id")
      .eq("id", contributionId)
      .single();
    if (contribError || !contribution) return jsonResponse({ error: "Contribution not found" }, 404);

    const { user } = await requireEventOwner(req, contribution.event_id);

    const { error: rpcError } = await service.rpc("reject_contribution", {
      p_contribution_id: contributionId,
      p_reason: reason ?? "rejected",
      p_moderated_by: user.id,
    });
    if (rpcError) throw rpcError;

    return jsonResponse({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return jsonResponse({ error: err.message }, err.status);
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, 500);
  }
});
