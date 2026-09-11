import Stripe from "stripe";
import { handleApiError, requireClient } from "./_clientAuth.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.stripe_secret);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY && !process.env.stripe_secret) {
      throw new Error("Stripe is not configured on the server.");
    }

    const { supabase, customer } = await requireClient(req);

    const [{ data: reservation }, { data: purchase }] = await Promise.all([
      supabase
        .from("reservations")
        .select("stripe_customer_id")
        .eq("customer_id", customer.id)
        .not("stripe_customer_id", "is", null)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("purchase_orders")
        .select("stripe_customer_id")
        .eq("customer_id", customer.id)
        .not("stripe_customer_id", "is", null)
        .limit(1)
        .maybeSingle(),
    ]);

    let stripeCustomerId = reservation?.stripe_customer_id || purchase?.stripe_customer_id || null;

    if (!stripeCustomerId) {
      const existing = await stripe.customers.list({ email: customer.email, limit: 1 });
      stripeCustomerId = existing.data[0]?.id || null;
    }

    if (!stripeCustomerId) {
      const error = new Error("No Stripe billing history exists for this account yet.");
      error.statusCode = 404;
      throw error;
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/client`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return handleApiError(res, error);
  }
}
