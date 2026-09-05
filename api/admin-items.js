// Vercel serverless function (Node runtime). CRUD for the decor catalog
// (public.items), used only by the internal admin page (pages/Admin.jsx).
// Every request must carry the X-Admin-Passcode header - see
// _adminAuth.js. Uses the service role key so it can see and change every
// row regardless of RLS, unlike the public site's anon-key reads.
import { requireAdmin, adminSupabase } from "./_adminAuth.js";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const supabase = adminSupabase();

  if (req.method === "GET") {
    const { data, error } = await supabase.from("items").select("*").order("name", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ items: data });
  }

  if (req.method === "POST") {
    const { id, ...fields } = req.body || {};
    const { data, error } = await supabase.from("items").insert(fields).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ item: data });
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
