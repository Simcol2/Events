// Vercel serverless function (Node runtime). Backs the /review page.
//
// The emailed token is the only credential here, so this deliberately
// returns the bare minimum needed to render a greeting: a first name, the
// event date, and whether this invitation was already used. It never
// returns the customer's email or anything about other bookings, so a
// leaked or guessed link exposes nothing worth having.
import { adminSupabase } from "./_adminAuth.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = String(req.query.token || "").trim();
  // Shape-check before touching the database so malformed links fail fast
  // and never reach Postgres as a bad uuid cast.
  if (!UUID_RE.test(token)) return res.status(400).json({ error: "That review link isn't valid." });

  const supabase = adminSupabase();
  const { data, error } = await supabase
    .from("review_requests")
    .select("customer_name, event_date, status")
    .eq("token", token)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "That review link isn't valid." });
  if (data.status === "cancelled") return res.status(410).json({ error: "This review link is no longer active." });

  return res.status(200).json({
    firstName: String(data.customer_name || "").trim().split(/\s+/)[0] || "",
    eventDate: data.event_date,
    alreadySubmitted: data.status === "completed",
    googleReviewUrl: process.env.GOOGLE_REVIEW_URL || "",
  });
}
