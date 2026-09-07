// Vercel serverless function (Node runtime). Moderation queue for
// customer reviews, and control over the invitations waiting to be sent.
//
// Reviews arrive as `pending` and only become visible on the site once
// approved here, which is also why the public RLS policy on the table is
// limited to approved rows. Nothing in this file is reachable without the
// admin passcode.
import { requireAdmin, adminSupabase } from "./_adminAuth.js";

const REVIEW_STATUSES = ["pending", "approved", "rejected"];
const INVITE_STATUSES = ["scheduled", "cancelled"];

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const supabase = adminSupabase();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ reviews: data || [] });
  }

  if (req.method === "PUT") {
    const { id, status, adminNote, inviteId, inviteStatus, scheduledFor } = req.body || {};

    // Hold, release, or reschedule an invitation that has not gone out.
    if (inviteId) {
      const fields = {};
      if (inviteStatus) {
        if (!INVITE_STATUSES.includes(inviteStatus)) {
          return res.status(400).json({ error: "Unknown invitation status" });
        }
        fields.status = inviteStatus;
      }
      if (scheduledFor) fields.scheduled_for = scheduledFor;
      if (!Object.keys(fields).length) {
        return res.status(400).json({ error: "Nothing to update" });
      }
      const { data, error } = await supabase
        .from("review_requests")
        .update(fields)
        .eq("id", inviteId)
        .select()
        .single();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ invite: data });
    }

    if (!id) return res.status(400).json({ error: "id is required" });
    if (status && !REVIEW_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Unknown review status" });
    }

    const fields = {};
    if (status) {
      fields.status = status;
      // published_at records when it went live, and clears if it is later
      // pulled back down, so the public list can order by it safely.
      fields.published_at = status === "approved" ? new Date().toISOString() : null;
    }
    if (adminNote !== undefined) fields.admin_note = adminNote || null;

    const { data, error } = await supabase.from("reviews").update(fields).eq("id", id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ review: data });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id is required" });
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
