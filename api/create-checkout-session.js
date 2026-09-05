// Vercel serverless function (Node runtime). Creates a Stripe Checkout
// Session for the Gifts page cart and redirects the customer to Stripe's
// hosted checkout page - no Stripe.js/publishable key needed on the
// client for this flow, just a redirect to the URL this returns.
//
// Every price is looked up here from Supabase (or the fixed dessert list
// below), never trusted from the request body - a customer's browser
// could send anything, only the server's own data decides what gets
// charged.
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Accepts either name so this works whether the Vercel env var is named
// the conventional STRIPE_SECRET_KEY or left as stripe_secret - either
// way, never VITE_-prefixed, or Vite would bundle it into the client.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.stripe_secret);
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Mirrors cateringContent.js's GROWN_FOLKS_LOOT_BAGS (name + price only).
// Duplicated rather than imported - that module pulls in Vite asset
// imports for photos that this plain Node function can't resolve. Keep
// this in sync if those prices or names ever change.
const DESSERT_GIFTS = {
  rumCupcakeGiftBox: { name: "Rum Cupcake Gift Box", price: 15 },
  gRingGift: { name: "G Ring Gift", price: 10 },
};

async function resolveLineItem(line) {
  const quantity = Math.max(1, Math.floor(Number(line?.quantity) || 1));

  if (line.kind === "catalog") {
    const { data: item, error } = await supabase
      .from("items")
      .select("name, purchase_price")
      .eq("id", line.id)
      .single();
    if (error || !item || item.purchase_price == null) return null;
    return {
      quantity,
      price_data: {
        currency: "cad",
        unit_amount: Math.round(Number(item.purchase_price) * 100),
        product_data: { name: item.name },
      },
    };
  }

  if (line.kind === "dessert") {
    const dessert = DESSERT_GIFTS[line.id];
    if (!dessert) return null;
    return {
      quantity,
      price_data: {
        currency: "cad",
        unit_amount: Math.round(dessert.price * 100),
        product_data: { name: dessert.name },
      },
    };
  }

  if (line.kind === "gift") {
    const { data: gift, error } = await supabase
      .from("gifts")
      .select("name, price, custom_price")
      .eq("id", line.id)
      .single();
    if (error || !gift) return null;
    const isCustom = Boolean(line.meta?.custom);
    const unitPrice = isCustom ? gift.custom_price ?? gift.price : gift.price;
    const description = line.meta?.selection
      ? `Design: ${line.meta.selection}`
      : line.meta?.custom
        ? `Custom request: ${line.meta.custom}`
        : undefined;
    return {
      quantity,
      price_data: {
        currency: "cad",
        unit_amount: Math.round(Number(unitPrice) * 100),
        product_data: { name: gift.name, ...(description ? { description } : {}) },
      },
    };
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  try {
    const lineItems = (await Promise.all(items.map(resolveLineItem))).filter(Boolean);

    if (lineItems.length === 0) {
      return res.status(400).json({ error: "Nothing in the cart could be priced" });
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/gifts?checkout=success`,
      cancel_url: `${origin}/gifts?checkout=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session error:", err);
    return res.status(500).json({ error: "Could not start checkout" });
  }
}
