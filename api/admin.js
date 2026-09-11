// Vercel serverless function (Node runtime). Every internal admin tool in
// one function, routed by ?resource= plus the HTTP method, so the admin
// panel (pages/Admin.jsx) doesn't burn a separate serverless function slot
// per tab - Vercel's free plan caps a deployment at 12 functions total.
// Every request must carry the X-Admin-Passcode header - see _adminAuth.js.
import { requireAdmin, adminSupabase } from "./_adminAuth.js";
import { upsertReviewRequest } from "./_reviewScheduling.js";

const ASSET_KINDS = ["unit", "box"];
const ASSET_STATUSES = ["in_stock", "out", "held", "retired"];
const ASSET_MAX_BULK = 50;
const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];
const REVIEW_STATUSES = ["pending", "approved", "rejected"];
const INVITE_STATUSES = ["scheduled", "cancelled"];
const UPLOAD_BUCKET = "Photos from";

async function handleItems(req, res, supabase) {
  if (req.method === "GET") {
    const { data, error } = await supabase.from("items").select("*").order("name", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ items: data });
  }

  if (req.method === "POST") {
    const { id, ...fields } = req.body || {};
    const { data, error } = await supabase.from("items").insert(fields).select().single();
    if (error) return res.status(400).json({ error: error.message });

    // Every new catalogue row gets one physical asset with its own QR code
    // straight away, so nothing can be added and then quietly go unlabelled.
    // One, not one per quantity_owned: 94 wine glasses are not 94 labels.
    // Anything she owns several of gets extra units added in the Assets tab,
    // and counted things get a box instead.
    const { data: asset } = await supabase
      .from("assets")
      .insert({ kind: "unit", item_id: data.id, label: data.name })
      .select()
      .single();

    return res.status(200).json({ item: data, asset: asset || null });
  }

  if (req.method === "PUT") {
    const { id, ...fields } = req.body || {};
    if (!id) return res.status(400).json({ error: "id is required" });
    const { data, error } = await supabase.from("items").update(fields).eq("id", id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ item: data });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id is required" });
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleAssets(req, res, supabase) {
  if (req.method === "GET") {
    const [assets, items] = await Promise.all([
      supabase.from("assets").select("*").order("code", { ascending: true }),
      supabase.from("items").select("id, name, quantity_owned").eq("active", true).order("name"),
    ]);
    if (assets.error) return res.status(500).json({ error: assets.error.message });
    if (items.error) return res.status(500).json({ error: items.error.message });

    const namesById = Object.fromEntries((items.data || []).map((i) => [i.id, i.name]));
    const withNames = (assets.data || []).map((a) => ({ ...a, item_name: namesById[a.item_id] || null }));

    // Which catalogue rows have nothing physical registered yet. This is
    // what drives the "needs a label" prompt in the admin, rather than
    // guessing how many units each catalogue row should have.
    const covered = new Set((assets.data || []).map((a) => a.item_id).filter(Boolean));
    const unlabelled = (items.data || []).filter((i) => !covered.has(i.id));

    return res.status(200).json({ assets: withNames, unlabelled });
  }

  if (req.method === "POST") {
    const { kind, itemId, label, delicate, notes, quantity } = req.body || {};
    if (!ASSET_KINDS.includes(kind)) return res.status(400).json({ error: "kind must be unit or box" });
    const name = String(label || "").trim();
    if (!name) return res.status(400).json({ error: "A label is required" });
    if (kind === "box" && itemId) {
      return res.status(400).json({ error: "A box holds whatever it is loaded with, so it isn't tied to one item." });
    }

    const count = Math.min(Math.max(Number(quantity) || 1, 1), ASSET_MAX_BULK);
    // More than one at a time for things she owns several of, like the two
    // grid wall panels, so each still gets its own code.
    const rows = Array.from({ length: count }, (_, i) => ({
      kind,
      item_id: kind === "unit" ? itemId ?? null : null,
      label: count > 1 ? `${name} ${i + 1}` : name,
      delicate: Boolean(delicate),
      notes: notes || null,
    }));

    const { data, error } = await supabase.from("assets").insert(rows).select();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ assets: data });
  }

  if (req.method === "PUT") {
    const { id, ...fields } = req.body || {};
    if (!id) return res.status(400).json({ error: "id is required" });
    if (fields.kind && !ASSET_KINDS.includes(fields.kind)) {
      return res.status(400).json({ error: "kind must be unit or box" });
    }
    if (fields.status && !ASSET_STATUSES.includes(fields.status)) {
      return res.status(400).json({ error: "Unknown status" });
    }
    const { data, error } = await supabase
      .from("assets")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ asset: data });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id is required" });
    const { error } = await supabase.from("assets").delete().eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleBookings(req, res, supabase) {
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
    if (!BOOKING_STATUSES.includes(status)) return res.status(400).json({ error: "Unknown status" });
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

async function handleReviews(req, res, supabase) {
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

async function handleGifts(req, res, supabase) {
  if (req.method === "GET") {
    const { data, error } = await supabase.from("gifts").select("*").order("name", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ gifts: data });
  }

  if (req.method === "POST") {
    const { id, ...fields } = req.body || {};
    const { data, error } = await supabase.from("gifts").insert(fields).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ gift: data });
  }

  if (req.method === "PUT") {
    const { id, ...fields } = req.body || {};
    if (!id) return res.status(400).json({ error: "id is required" });
    const { data, error } = await supabase.from("gifts").update(fields).eq("id", id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ gift: data });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id is required" });
    const { error } = await supabase.from("gifts").delete().eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleUpload(req, res, supabase) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { filename, contentType, base64 } = req.body || {};
  if (!filename || !contentType || !base64) {
    return res.status(400).json({ error: "filename, contentType and base64 are required" });
  }

  const path = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
  const buffer = Buffer.from(base64, "base64");

  const { error } = await supabase.storage.from(UPLOAD_BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  });
  if (error) return res.status(400).json({ error: error.message });

  const { data } = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(path);
  return res.status(200).json({ url: data.publicUrl });
}

const RESOURCE_HANDLERS = {
  items: handleItems,
  assets: handleAssets,
  bookings: handleBookings,
  reviews: handleReviews,
  gifts: handleGifts,
  upload: handleUpload,
};

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  const resource = String(req.query?.resource || "");
  const resourceHandler = RESOURCE_HANDLERS[resource];
  if (!resourceHandler) return res.status(400).json({ error: "Unknown admin resource" });

  const supabase = adminSupabase();
  return resourceHandler(req, res, supabase);
}
