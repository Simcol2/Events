import Stripe from "stripe";
import { getServiceClient } from "./_clientAuth.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.stripe_secret);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function findOrCreateCustomer(supabase, email, name) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();

  const { data: existing, error: lookupError } = await supabase
    .from("customers")
    .select("*")
    .ilike("email", normalized)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("customers")
    .insert({ name: name || normalized.split("@")[0], email: normalized })
    .select("*")
    .single();

  if (createError) throw createError;
  return created;
}

async function syncPurchaseCheckout(supabase, session) {
  const email = session.customer_details?.email || session.customer_email;
  const name = session.customer_details?.name || null;
  const customer = await findOrCreateCustomer(supabase, email, name);
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
  const invoice = session.invoice ? await stripe.invoices.retrieve(session.invoice) : null;

  const orderPayload = {
    customer_id: customer?.id || null,
    customer_email: email || null,
    order_number: `WEB-${String(session.id).slice(-10).toUpperCase()}`,
    stripe_checkout_session_id: session.id,
    stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id || null,
    stripe_invoice_id: typeof session.invoice === "string" ? session.invoice : session.invoice?.id || null,
    currency: session.currency || "cad",
    subtotal_cents: session.amount_subtotal || 0,
    total_cents: session.amount_total || 0,
    status: session.payment_status === "paid" ? "paid" : session.payment_status || "pending",
    purchased_at: new Date((session.created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    hosted_invoice_url: invoice?.hosted_invoice_url || null,
    invoice_pdf: invoice?.invoice_pdf || null,
  };

  const { data: order, error: orderError } = await supabase
    .from("purchase_orders")
    .upsert(orderPayload, { onConflict: "stripe_checkout_session_id" })
    .select("*")
    .single();

  if (orderError) throw orderError;

  await supabase.from("purchase_order_items").delete().eq("purchase_order_id", order.id);

  if (lineItems.data.length) {
    const rows = lineItems.data.map((line) => ({
      purchase_order_id: order.id,
      name: line.description || "Purchase",
      quantity: line.quantity || 1,
      unit_amount_cents: line.price?.unit_amount || 0,
      total_amount_cents: line.amount_total || 0,
      currency: line.currency || session.currency || "cad",
    }));
    const { error: itemError } = await supabase.from("purchase_order_items").insert(rows);
    if (itemError) throw itemError;
  }

  const { error: ledgerError } = await supabase.from("stripe_transactions").upsert(
    {
      customer_id: customer?.id || null,
      purchase_order_id: order.id,
      kind: "purchase",
      stripe_customer_id: orderPayload.stripe_customer_id,
      stripe_invoice_id: orderPayload.stripe_invoice_id,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null,
      amount_cents: session.amount_total || 0,
      currency: session.currency || "cad",
      status: session.payment_status === "paid" ? "paid" : session.payment_status || "pending",
      hosted_invoice_url: invoice?.hosted_invoice_url || null,
      invoice_pdf: invoice?.invoice_pdf || null,
      paid_at: session.payment_status === "paid" ? new Date().toISOString() : null,
      metadata: { source: "purchase_checkout" },
    },
    { onConflict: "stripe_checkout_session_id" }
  );

  if (ledgerError) throw ledgerError;
}

async function syncRentalInvoice(supabase, invoice, status) {
  const metadata = invoice.metadata || {};
  if (metadata.source !== "rental_portal" || !metadata.reservation_id) return;

  const reservationId = Number(metadata.reservation_id);
  const customerId = metadata.customer_id ? Number(metadata.customer_id) : null;
  const paymentKind = metadata.payment_kind || "balance";
  const amount = status === "paid" ? invoice.amount_paid || invoice.total || 0 : invoice.amount_due || invoice.total || 0;

  const payload = {
    customer_id: customerId,
    reservation_id: reservationId,
    kind: paymentKind,
    stripe_customer_id: typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id:
      typeof invoice.payment_intent === "string" ? invoice.payment_intent : invoice.payment_intent?.id || null,
    amount_cents: amount,
    currency: invoice.currency || "cad",
    status,
    hosted_invoice_url: invoice.hosted_invoice_url,
    invoice_pdf: invoice.invoice_pdf,
    paid_at: status === "paid" ? new Date().toISOString() : null,
    metadata,
  };

  const { error } = await supabase
    .from("stripe_transactions")
    .upsert(payload, { onConflict: "stripe_invoice_id" });
  if (error) throw error;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method not allowed");
  }

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");

    const signature = req.headers["stripe-signature"];
    const rawBody = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    const supabase = getServiceClient();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.metadata?.source === "purchase") {
        await syncPurchaseCheckout(supabase, session);
      }
    }

    if (event.type === "invoice.paid") {
      await syncRentalInvoice(supabase, event.data.object, "paid");
    }

    if (event.type === "invoice.payment_failed") {
      await syncRentalInvoice(supabase, event.data.object, "failed");
    }

    if (event.type === "invoice.voided") {
      await syncRentalInvoice(supabase, event.data.object, "void");
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
