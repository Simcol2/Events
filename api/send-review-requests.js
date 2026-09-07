// Vercel serverless function (Node runtime). Sends any review invitation
// that has come due. Wired to a daily cron in vercel.json, and also
// callable from the admin with the passcode so a batch can be pushed out
// by hand without waiting for the schedule.
//
// Requires RESEND_API_KEY, REVIEW_FROM_EMAIL (on a domain verified in
// Resend), and CRON_SECRET. Without them this returns a plain explanation
// instead of failing silently, because a review cycle that quietly stops
// sending is worse than one that says why.
import { adminSupabase } from "./_adminAuth.js";

const BATCH_LIMIT = 50;
const SITE_URL = process.env.SITE_URL || "https://asliceofg.com";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmail({ firstName, reviewUrl }) {
  const name = escapeHtml(firstName) || "there";
  return `
<div style="margin:0;padding:32px 16px;background:#FAF6ED;font-family:Jost,Helvetica,Arial,sans-serif;color:#3A342A;">
  <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #E4DCC8;">
    <div style="padding:28px 32px;border-bottom:1px solid #E4DCC8;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.42em;color:#B8935A;">A SLICE OF G</div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#4E5A44;">EVENTS</div>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${name},</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
        Thank you for letting us be part of your celebration. Now that everything is back,
        we would love to hear how it went.
      </p>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">
        It takes about a minute, and you can add photos from the day if you have some you love.
      </p>
      <a href="${reviewUrl}" style="display:inline-block;background:#4E5A44;color:#FFFFFF;text-decoration:none;padding:14px 28px;font-size:14px;font-weight:600;letter-spacing:0.1em;">
        LEAVE A REVIEW
      </a>
      <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#6A6353;">
        If the button does not work, paste this into your browser:<br />
        <span style="color:#4E5A44;word-break:break-all;">${reviewUrl}</span>
      </p>
    </div>
  </div>
</div>`.trim();
}

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  const isCron = cronSecret && req.headers.authorization === `Bearer ${cronSecret}`;
  const isAdmin = process.env.ADMIN_PASSCODE && req.headers["x-admin-passcode"] === process.env.ADMIN_PASSCODE;
  if (!isCron && !isAdmin) return res.status(401).json({ error: "Not authorized" });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REVIEW_FROM_EMAIL;
  if (!apiKey || !from) {
    return res.status(503).json({
      error: "Email is not configured yet. Set RESEND_API_KEY and REVIEW_FROM_EMAIL, then try again.",
      sent: 0,
    });
  }

  const supabase = adminSupabase();
  const { data: due, error } = await supabase
    .from("review_requests")
    .select("id, token, customer_name, customer_email")
    .eq("status", "scheduled")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(BATCH_LIMIT);

  if (error) return res.status(500).json({ error: error.message });
  if (!due?.length) return res.status(200).json({ sent: 0, failed: 0 });

  let sent = 0;
  const failures = [];

  for (const invite of due) {
    const reviewUrl = `${SITE_URL}/review?token=${invite.token}`;
    const firstName = String(invite.customer_name || "").trim().split(/\s+/)[0];
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: invite.customer_email,
          subject: "How was your celebration?",
          html: buildEmail({ firstName, reviewUrl }),
        }),
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(detail.slice(0, 200) || `Resend returned ${response.status}`);
      }
      // Only marked sent after Resend accepts it, so a failure stays in the
      // queue and goes out on the next run rather than being lost.
      await supabase
        .from("review_requests")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", invite.id);
      sent += 1;
    } catch (err) {
      failures.push({ id: invite.id, error: err.message });
    }
  }

  return res.status(200).json({ sent, failed: failures.length, failures });
}
