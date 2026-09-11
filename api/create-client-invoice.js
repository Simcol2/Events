import Stripe from "stripe";
import { handleApiError, requireClient } from "./_clientAuth.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.stripe_secret);

const PAYMENT_LABELS = {
  booking_deposit: "Booking deposit",
  security_deposit: "Refundable security deposit",
  balance: "Remaining rental balance",
};

function paidForKind(transactions, kind) {
  return transactions
    .filter((row) => row.kind === kind && row.status === "paid")
    .reduce((sum, row) => sum + Number(row.amount_cents || 0), 0);
}

async function ensureStripeCustomer({ supabase, customer, reservation }) {
  if (reservation.stripe_customer_id) return reservation.stripe_customer_id;

  const existing = await stripe.customers.list({ email: customer.email, limit: 1 });
  let stripeCustomer = existing.data[0];

  if (!stripeCustomer) {
    stripeCustomer = await stripe.customers.create({
      email: customer.email,
      name: customer.name || undefined,
      metadata: { customer_id: String(customer.id) },
    });
  }

  await supabase
    .from("reservations")
    .update({ stripe_customer_id: stripeCustomer.id })
    .eq("id", reservation.id);

  return stripeCustomer.id;
}

function amountForKind(reservation, transactions, kind) {
  if (kind === "booking_deposit") {
    return Math.max(0, Number(reservation.booking_deposit_cents || 0) - paidForKind(transactions, kind));
  }

  if (kind === "security_deposit") {
    return Math.max(0, Number(reservation.security_deposit_cents || 0) - paidForKind(transactions, kind));
  }

  if (kind === "balance") {
    const configuredBalance = Number(reservation.balance_due_cents || 0);
    const fallbackBalance = Math.max(
      0,
      Number(reservation.rental_total_cents || 0) - Number(reservation.booking_deposit_cents || 0)
    );
    return Math.max(0, (configuredBalance || fallbackBalance) - paidForKind(transactions, kind));
  }

  return 0;
}

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
    const reservationId = Number(req.body?.reservationId);
    const kind = String(req.body?.kind || "");

    if (!Number.isFinite(reservationId) || !PAYMENT_LABELS[kind]) {
      const error = new Error("Invalid invoice request.");
      error.statusCode = 400;
      throw error;
    }

    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", reservationId)
      .eq("customer_id", customer.id)
      .single();

    if (reservationError || !reservation) {
      const error = new Error("Booking not found.");
      error.statusCode = 404;
      throw error;
    }

    const { data: transactions, error: transactionError } = await supabase
      .from("stripe_transactions")
      .select("*")
      .eq("reservation_id", reservation.id);

    if (transactionError) throw transactionError;

    const existingOpen = (transactions || []).find(
      (row) => row.kind === kind && ["draft", "open"].includes(row.status) && row.stripe_invoice_id
    );

    if (existingOpen) {
      const existingInvoice = await stripe.invoices.retrieve(existingOpen.stripe_invoice_id);
      if (existingInvoice.status === "draft") {
        const finalized = await stripe.invoices.finalizeInvoice(existingInvoice.id);
        return res.status(200).json({ url: finalized.hosted_invoice_url });
      }
      if (existingInvoice.hosted_invoice_url && existingInvoice.status === "open") {
        return res.status(200).json({ url: existingInvoice.hosted_invoice_url });
      }
    }

    const amountCents = amountForKind(reservation, transactions || [], kind);
    if (amountCents <= 0) {
      const error = new Error("This payment is already complete or has no amount due.");
      error.statusCode = 409;
      throw error;
    }

    const stripeCustomerId = await ensureStripeCustomer({ supabase, customer, reservation });
    const currency = String(reservation.currency || "cad").toLowerCase();
    const bookingNumber = reservation.booking_number || `Rental ${reservation.id}`;
    const metadata = {
      source: "rental_portal",
      reservation_id: String(reservation.id),
      customer_id: String(customer.id),
      payment_kind: kind,
    };

    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: "send_invoice",
      days_until_due: 1,
      auto_advance: false,
      description: `${bookingNumber} - ${PAYMENT_LABELS[kind]}`,
      metadata,
    });

    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      invoice: invoice.id,
      amount: amountCents,
      currency,
      description: `${bookingNumber} - ${PAYMENT_LABELS[kind]}`,
      metadata,
    });

    const finalized = await stripe.invoices.finalizeInvoice(invoice.id);

    const { error: ledgerError } = await supabase.from("stripe_transactions").upsert(
      {
        customer_id: customer.id,
        reservation_id: reservation.id,
        kind,
        stripe_customer_id: stripeCustomerId,
        stripe_invoice_id: finalized.id,
        amount_cents: amountCents,
        currency,
        status: finalized.status || "open",
        hosted_invoice_url: finalized.hosted_invoice_url,
        invoice_pdf: finalized.invoice_pdf,
        metadata,
      },
      { onConflict: "stripe_invoice_id" }
    );

    if (ledgerError) throw ledgerError;

    return res.status(200).json({ url: finalized.hosted_invoice_url });
  } catch (error) {
    return handleApiError(res, error);
  }
}
