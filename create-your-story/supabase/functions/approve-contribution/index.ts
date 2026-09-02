import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { AuthError, getServiceClient, requireEventOwner } from "../_shared/auth.ts";
import { getLlmProvider } from "../_shared/ai/index.ts";

// Thin wrapper: check host ownership, compute the (fast, low-latency) woven
// text via the AI stub, then hand the atomic supersede/approve/materialize
// transition to the approve_contribution() Postgres function — this Edge
// Function holds no multi-step business logic of its own.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { contributionId, hostEditedText } = await req.json();
    if (!contributionId) return jsonResponse({ error: "contributionId is required" }, 400);

    const service = getServiceClient();

    const { data: contribution, error: contribError } = await service
      .from("cys_guest_contributions")
      .select("*")
      .eq("id", contributionId)
      .single();
    if (contribError || !contribution) return jsonResponse({ error: "Contribution not found" }, 404);

    const { user, event } = await requireEventOwner(req, contribution.event_id);

    const { data: page, error: pageError } = await service
      .from("cys_skeleton_pages")
      .select("text_template")
      .eq("id", contribution.skeleton_page_id)
      .single();
    if (pageError || !page) return jsonResponse({ error: "Skeleton page not found" }, 404);

    const finalText = (hostEditedText ?? contribution.text_content ?? "").trim();
    const guestText = finalText || "a heartfelt doodle they drew just for this moment";

    const llm = getLlmProvider();
    const { renderedText } = await llm.weaveTransition({
      pageTextTemplate: page.text_template,
      guestText,
      guestName: contribution.guest_name,
      tone: event.tone,
    });

    const { error: rpcError } = await service.rpc("approve_contribution", {
      p_contribution_id: contributionId,
      p_host_edited_text: hostEditedText ?? null,
      p_woven_text: renderedText,
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
