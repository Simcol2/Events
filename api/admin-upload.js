// Vercel serverless function (Node runtime). Uploads one photo to the
// "Photos from" Supabase Storage bucket (the same bucket every existing
// photo URL in this app already points to) and returns its public URL.
// The client sends the file as base64 rather than multipart/form-data -
// this Node runtime has no multipart parser available without adding a
// dependency, and a single photo comfortably fits Vercel's default 4.5MB
// body limit once the client has already downsized it (see
// components/AdminPhotoManager.jsx's resizeImageFile).
import { requireAdmin, adminSupabase } from "./_adminAuth.js";

const BUCKET = "Photos from";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { filename, contentType, base64 } = req.body || {};
  if (!filename || !contentType || !base64) {
    return res.status(400).json({ error: "filename, contentType and base64 are required" });
  }

  const supabase = adminSupabase();
  const path = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
  const buffer = Buffer.from(base64, "base64");

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  });
  if (error) return res.status(400).json({ error: error.message });

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return res.status(200).json({ url: data.publicUrl });
}
