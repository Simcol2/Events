import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/auth.ts";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MINUTES = 10;

async function hashIp(ip: string): Promise<string> {
  const pepper = Deno.env.get("IP_HASH_PEPPER") ?? "cys-default-pepper";
  const bytes = new TextEncoder().encode(`${ip}:${pepper}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function callerIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { eventCode, skeletonPageId, guestName, textContent, doodleUrl } = await req.json();
    if (!eventCode || !skeletonPageId) {
      return jsonResponse({ error: "eventCode and skeletonPageId are required" }, 400);
    }
    if (!textContent?.trim() && !doodleUrl) {
      return jsonResponse({ error: "Please write something or add a doodle." }, 400);
    }

    const service = getServiceClient();

    const { data: event, error: eventError } = await service
      .from("cys_events")
      .select("id, status")
      .eq("event_code", eventCode)
      .is("deleted_at", null)
      .single();

    if (eventError || !event) return jsonResponse({ error: "Event not found." }, 404);
    if (!["locked", "live"].includes(event.status)) {
      return jsonResponse({ error: "This event isn't accepting submissions right now." }, 409);
    }

    const { data: page, error: pageError } = await service
      .from("cys_skeleton_pages")
      .select("id, event_id, slot_type")
      .eq("id", skeletonPageId)
      .single();

    if (pageError || !page || page.event_id !== event.id || page.slot_type !== "guest_slot") {
      return jsonResponse({ error: "Invalid prompt for this event." }, 400);
    }

    const ipHash = await hashIp(callerIp(req));
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();

    const { count, error: rateError } = await service
      .from("cys_submission_log")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("ip_hash", ipHash)
      .gte("submitted_at", windowStart);

    if (rateError) throw rateError;
    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return jsonResponse({ error: "You've submitted a lot just now — take a breath and try again shortly!" }, 429);
    }

    const { data: contribution, error: insertError } = await service
      .from("cys_guest_contributions")
      .insert({
        event_id: event.id,
        skeleton_page_id: skeletonPageId,
        guest_name: guestName?.trim() || null,
        text_content: textContent?.trim() || null,
        doodle_url: doodleUrl || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await service.from("cys_submission_log").insert({ event_id: event.id, ip_hash: ipHash });

    if (event.status === "locked") {
      await service.from("cys_events").update({ status: "live", updated_at: new Date().toISOString() }).eq("id", event.id).eq("status", "locked");
    }

    return jsonResponse({ ok: true, contributionId: contribution.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, 500);
  }
});
