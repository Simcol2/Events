import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { AuthError, getServiceClient, requireEventOwner } from "../_shared/auth.ts";
import { getLlmProvider } from "../_shared/ai/index.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { eventId } = await req.json();
    if (!eventId) return jsonResponse({ error: "eventId is required" }, 400);

    const { event } = await requireEventOwner(req, eventId);
    const service = getServiceClient();

    await service
      .from("cys_events")
      .update({ status: "skeleton_generating", updated_at: new Date().toISOString() })
      .eq("id", eventId);

    try {
      const llm = getLlmProvider();
      const result = await llm.generateSkeleton({
        theme: event.theme,
        artStyle: event.art_style,
        characterPrompt: event.character_prompt,
        tone: event.tone,
        honoreeName: event.honoree_name,
        totalPages: event.total_pages,
      });

      const { data: skeleton, error: skeletonError } = await service
        .from("cys_story_skeletons")
        .upsert(
          {
            event_id: eventId,
            style_reference: result.styleReference,
            generated_by: Deno.env.get("LLM_PROVIDER") ?? "stub",
            raw_model_output: result.raw,
            error_message: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "event_id" }
        )
        .select()
        .single();

      if (skeletonError || !skeleton) throw skeletonError ?? new Error("Failed to save skeleton");

      // Clear any pages from a previous failed/partial attempt before inserting fresh ones.
      await service.from("cys_skeleton_pages").delete().eq("skeleton_id", skeleton.id);

      const pageRows = result.pages.map((p) => ({
        skeleton_id: skeleton.id,
        event_id: eventId,
        page_number: p.pageNumber,
        slot_type: p.slotType,
        text_template: p.textTemplate,
        slot_label: p.slotLabel ?? null,
        slot_order: p.slotOrder ?? null,
        accepts_image: p.acceptsImage ?? false,
      }));

      const { error: pagesError } = await service.from("cys_skeleton_pages").insert(pageRows);
      if (pagesError) throw pagesError;

      await service
        .from("cys_events")
        .update({ status: "skeleton_ready", updated_at: new Date().toISOString() })
        .eq("id", eventId);

      return jsonResponse({ skeletonId: skeleton.id, pageCount: pageRows.length });
    } catch (genError) {
      const message = genError instanceof Error ? genError.message : String(genError);
      await service.from("cys_story_skeletons").upsert(
        { event_id: eventId, error_message: message, updated_at: new Date().toISOString() },
        { onConflict: "event_id" }
      );
      await service
        .from("cys_events")
        .update({ status: "skeleton_failed", updated_at: new Date().toISOString() })
        .eq("id", eventId);
      return jsonResponse({ error: message }, 502);
    }
  } catch (err) {
    if (err instanceof AuthError) return jsonResponse({ error: err.message }, err.status);
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, 500);
  }
});
