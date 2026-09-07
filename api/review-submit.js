// Vercel serverless function (Node runtime). Accepts a customer's review.
//
// This is the one unauthenticated write path in the app, so the emailed
// token does all the gatekeeping: it must exist, it must not be cancelled,
// and it can only be spent once. That is also what makes the photo upload
// safe to expose. Without it, an open image endpoint on a service role key
// would be an obvious target.
//
// Everything lands as `pending`. Nothing a customer submits reaches the
// site until it is approved in the admin.
import { adminSupabase } from "./_adminAuth.js";

const BUCKET = "Photos from";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BODY_CHARS = 4000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, rating, body, customerName, photos } = req.body || {};

  if (!UUID_RE.test(String(token || "").trim())) {
    return res.status(400).json({ error: "That review link isn't valid." });
  }
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: "Please choose a rating from 1 to 5 stars." });
  }
  const name = String(customerName || "").trim();
  if (!name) return res.status(400).json({ error: "Please add your name." });

  const photoList = Array.isArray(photos) ? photos : [];
  if (photoList.length > MAX_PHOTOS) {
    return res.status(400).json({ error: `Please attach at most ${MAX_PHOTOS} photos.` });
  }

  const supabase = adminSupabase();

  const { data: invite, error: inviteError } = await supabase
    .from("review_requests")
    .select("id, customer_email, status")
    .eq("token", String(token).trim())
    .maybeSingle();

  if (inviteError) return res.status(500).json({ error: inviteError.message });
  if (!invite) return res.status(404).json({ error: "That review link isn't valid." });
  if (invite.status === "cancelled") {
    return res.status(410).json({ error: "This review link is no longer active." });
  }
  if (invite.status === "completed") {
    return res.status(409).json({ error: "This review has already been submitted. Thank you." });
  }

  // Upload photos first. If one fails the review is not written at all,
  // so the customer can fix the photo and resubmit against a token that
  // has not been spent yet.
  const uploadedUrls = [];
  for (const photo of photoList) {
    const contentType = String(photo?.contentType || "");
    const base64 = String(photo?.base64 || "");
    if (!ALLOWED_TYPES.includes(contentType) || !base64) {
      return res.status(400).json({ error: "Photos need to be JPG, PNG, or WEBP." });
    }
    const buffer = Buffer.from(base64, "base64");
    if (!buffer.length || buffer.length > MAX_PHOTO_BYTES) {
      return res.status(400).json({ error: "One of those photos is too large." });
    }
    const extension = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
    const path = `reviews/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType, upsert: false });
    if (uploadError) return res.status(400).json({ error: uploadError.message });
    uploadedUrls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  }

  const { error: insertError } = await supabase.from("reviews").insert({
    review_request_id: invite.id,
    rating: numericRating,
    body: String(body || "").trim().slice(0, MAX_BODY_CHARS) || null,
    customer_name: name.slice(0, 120),
    customer_email: invite.customer_email,
    photos: uploadedUrls,
  });
  if (insertError) return res.status(400).json({ error: insertError.message });

  // Spend the token. A failure here would only mean the link still works,
  // so it is not worth failing the customer's submission over.
  await supabase.from("review_requests").update({ status: "completed" }).eq("id", invite.id);

  return res.status(200).json({
    ok: true,
    googleReviewUrl: process.env.GOOGLE_REVIEW_URL || "",
  });
}
