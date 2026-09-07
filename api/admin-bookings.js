// Vercel serverless function (Node runtime). The bookings view in the
// admin: every rental request and package request that has come in, plus
// the status control that drives the review cycle.
//
// Moving a booking to confirmed or completed queues its review invitation
// (see _reviewScheduling.js). Cancelling one cancels any invitation that
// has not gone out yet, so a cancelled booking never asks for a review.
import { requireAdmin, adminSupabase } from "./_adminAuth.js";
import { upsertReviewRequest } from "./_reviewScheduling.js";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const supabase = adminSupabase();

  if (req.method === "GET") {
    const [items, packages, invites] = await Promise.all([
      supabase
        .from("item_requests")
        .select("id, item_id, request_type, pickup_date, dropoff_date, quantity, customer_name, customer_email, customer_phone, event_date, status, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("package_requests")
        .select("id, event_date, total, customer_name, customer_email, customer_phone, status, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("review_requests")
        .select("id, source_type, source_id, status, scheduled_for, sent_at")
        .order("scheduled_for", { ascending: false }),
    ]);

    const firstError = items.error || packages.error || invites.error;
    if (firstError) return res.status(500).json({ error: firstError.message });

    // Item names make the list readable without a second lookup per row.
    const itemIds = [...new Set((items.data || []).map((r) => r.item_id).filter(Boolean))];
    let namesById = {};
    if (itemIds.length) {
      const { data: itemRows } = await supabase.from("items").select("id, name").in("id", itemIds);
      namesById = Object.fromEntries((itemRows || []).map((r) => [r.id, r.name]));
    }

    const bookings = [
      ...(items.data || []).map((r) => ({
        ...r,
        kind: "item_request",
        item_name: namesById[r.item_id] || null,
      })),
      ...(packages.data || []).map((r) => ({ ...r, kind: "package_request" })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({ bookings, invites: invites.data || [] });
  }

  if (req.method === "PUT") {
    const { id, kind, status } = req.body || {};
    if (!id || !kind) return res.status(400).json({ error: "id and kind are required" });
    if (!STATUSES.includes(status)) return res.status(400).json({ error: "Unknown status" });
    const table = kind === "package_request" ? "package_requests" : "item_requests";

    const { data: booking, error: updateError } = await supabase
      .from(table)
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (updateError) return res.status(400).json({ error: updateError.message });

    let invite = null;
    if (status === "confirmed" || status === "completed") {
      invite = await upsertReviewRequest(supabase, {
        sourceType: kind,
        sourceId: id,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        eventDate: booking.event_date,
        dropoffDate: booking.dropoff_date || null,
        mode: status === "completed" ? "complete" : "confirm",
      });
    } else if (status === "cancelled") {
      await supabase
        .from("review_requests")
        .update({ status: "cancelled" })
        .eq("source_type", kind)
        .eq("source_id", id)
        .eq("status", "scheduled");
    }

    return res.status(200).json({ booking, invite });
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "Method not allowed" });
}
