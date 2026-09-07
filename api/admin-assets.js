// Vercel serverless function (Node runtime). The physical asset registry
// behind the QR labels: the objects that get handed over and scanned back,
// as opposed to the catalogue rows that describe what can be rented.
//
// Codes are assigned by the database (see supabase/assets_setup.sql), not
// here, so two people adding assets at the same time can never land on the
// same number.
import { requireAdmin, adminSupabase } from "./_adminAuth.js";

const KINDS = ["unit", "box"];
const STATUSES = ["in_stock", "out", "held", "retired"];
const MAX_BULK = 50;

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const supabase = adminSupabase();

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
    if (!KINDS.includes(kind)) return res.status(400).json({ error: "kind must be unit or box" });
    const name = String(label || "").trim();
    if (!name) return res.status(400).json({ error: "A label is required" });
    if (kind === "box" && itemId) {
      return res.status(400).json({ error: "A box holds whatever it is loaded with, so it isn't tied to one item." });
    }

    const count = Math.min(Math.max(Number(quantity) || 1, 1), MAX_BULK);
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
    if (fields.kind && !KINDS.includes(fields.kind)) {
      return res.status(400).json({ error: "kind must be unit or box" });
    }
    if (fields.status && !STATUSES.includes(fields.status)) {
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
