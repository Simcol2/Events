import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.stripe_secret);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const sessionId = String(req.query?.session_id || "");
    if (!sessionId.startsWith("cs_")) {
      return res.status(400).json({ error: "Invalid checkout session." });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const reservationId = Number(session.metadata?.reservation_id || 0);

    let bookingNumber = session.metadata?.booking_number || null;
    if (reservationId && !bookingNumber) {
      const { data } = await supabase
        .from("reservations")
        .select("booking_number")
        .eq("id", reservationId)
        .maybeSingle();
      bookingNumber = data?.booking_number || null;
    }

    return res.status(200).json({
      bookingNumber,
      paymentStatus: session.payment_status,
      email: session.customer_details?.email || session.customer_email || null,
    });
  } catch (error) {
    console.error("Checkout summary error:", error);
    return res.status(500).json({ error: "Could not load checkout confirmation." });
  }
}
