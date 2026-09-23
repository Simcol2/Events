// STEPS 13-14
// Square webhook receiver for invoices, payments and refunds.
//
// Required Vercel variables:
//   SQUARE_WEBHOOK_SIGNATURE_KEY
//   SQUARE_WEBHOOK_NOTIFICATION_URL
//
// The notification URL must match the exact URL configured in Square's
// Developer Console because Square includes it in the signature.

import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function rawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function validSquareSignature(raw, signature) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const url = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;

  if (!key || !url || !signature) return false;

  const digest = crypto
    .createHmac("sha256", key)
    .update(url + raw)
    .digest("base64");

  const expected = Buffer.from(digest);
  const received = Buffer.from(String(signature));

  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
}

function eventObject(event) {
  const object = event?.data?.object || {};
  return object.invoice || object.payment || object.refund || object;
}

async function reservationByInvoice(invoiceId) {
  if (!invoiceId) return null;
  const { data } = await supabase
    .from("reservations")
    .select("*")
    .eq("square_invoice_id", invoiceId)
    .maybeSingle();
  return data || null;
}

async function reservationBySecurityPayment(paymentId) {
  if (!paymentId) return null;
  const { data } = await supabase
    .from("reservations")
    .select("*")
    .eq("square_security_payment_id", paymentId)
    .maybeSingle();
  return data || null;
}

async function recordInvoicePayment(event, invoice) {
  const reservation = await reservationByInvoice(invoice?.id);
  if (!reservation) return;

  await supabase
    .from("reservations")
    .update({
      square_invoice_status: invoice.status || null,
      square_invoice_version: invoice.version ?? null,
      square_invoice_url: invoice.public_url || null,
    })
    .eq("id", reservation.id);

  // Square's invoice object gives cumulative completed amounts per request.
  // Mirror each request into the ledger so the portal does not have to guess.
  for (const request of invoice.payment_requests || []) {
    const completed = Number(
      request.total_completed_amount_money?.amount || 0
    );
    if (completed <= 0) continue;

    const kind =
      request.request_type === "DEPOSIT" ? "booking_deposit" : "balance";

    await supabase.from("square_transactions").upsert(
      {
        customer_id: reservation.customer_id,
        reservation_id: reservation.id,
        kind,
        square_invoice_id: invoice.id,
        square_payment_request_uid: request.uid || null,
        amount_cents: completed,
        currency: String(
          request.total_completed_amount_money?.currency ||
            reservation.currency ||
            "cad"
        ).toLowerCase(),
        status: "paid",
        paid_at: event.created_at || new Date().toISOString(),
        metadata: {
          source: "square_invoice_webhook",
          invoice_status: invoice.status || null,
        },
      },
      {
        onConflict:
          "square_invoice_id,square_payment_request_uid",
      }
    );
  }

  const depositPaid = Number(
    (invoice.payment_requests || []).find(
      (r) => r.request_type === "DEPOSIT"
    )?.total_completed_amount_money?.amount || 0
  );

  if (
    depositPaid >= Number(reservation.booking_deposit_cents || 0) &&
    reservation.status === "checkout_pending"
  ) {
    await supabase
      .from("reservations")
      .update({ status: "pending" })
      .eq("id", reservation.id);
  }
}

async function handleInvoiceEvent(event, invoice) {
  const reservation = await reservationByInvoice(invoice?.id);
  if (!reservation) return;

  await supabase
    .from("reservations")
    .update({
      square_invoice_status: invoice.status || null,
      square_invoice_version: invoice.version ?? null,
      square_invoice_url: invoice.public_url || null,
      square_payment_failed:
        event.type === "invoice.scheduled_charge_failed",
    })
    .eq("id", reservation.id);

  if (
    event.type === "invoice.payment_made" ||
    event.type === "invoice.refunded" ||
    event.type === "invoice.updated"
  ) {
    await recordInvoicePayment(event, invoice);
  }
}

async function handlePaymentEvent(event, payment) {
  const reservation = await reservationBySecurityPayment(payment?.id);
  if (!reservation) return;

  const status = String(payment.status || "").toLowerCase();

  await supabase
    .from("reservations")
    .update({
      square_security_status: payment.status || null,
    })
    .eq("id", reservation.id);

  await supabase.from("square_transactions").upsert(
    {
      customer_id: reservation.customer_id,
      reservation_id: reservation.id,
      kind: "security_deposit",
      square_payment_id: payment.id,
      amount_cents: Number(payment.amount_money?.amount || 0),
      currency: String(
        payment.amount_money?.currency || reservation.currency || "cad"
      ).toLowerCase(),
      status: payment.status === "COMPLETED" ? "paid" : status,
      paid_at:
        payment.status === "COMPLETED"
          ? payment.created_at || event.created_at
          : null,
      metadata: {
        source: "square_payment_webhook",
        receipt_url: payment.receipt_url || null,
      },
    },
    { onConflict: "square_payment_id" }
  );
}

async function handleRefundEvent(event, refund) {
  const paymentId = refund?.payment_id;
  if (!paymentId) return;

  const reservation = await reservationBySecurityPayment(paymentId);
  if (!reservation) return;

  await supabase
    .from("reservations")
    .update({
      square_security_refund_id:
        refund.id || reservation.square_security_refund_id,
      square_security_refund_status: refund.status || null,
      square_security_refund_cents: Number(
        refund.amount_money?.amount ||
          reservation.square_security_refund_cents ||
          0
      ),
      square_security_refunded_at:
        refund.status === "COMPLETED"
          ? refund.updated_at || event.created_at
          : null,
    })
    .eq("id", reservation.id);

  await supabase
    .from("square_transactions")
    .update({
      refunded_at:
        refund.status === "COMPLETED"
          ? refund.updated_at || event.created_at
          : null,
      refund_amount_cents: Number(refund.amount_money?.amount || 0),
      square_refund_id: refund.id || null,
    })
    .eq("square_payment_id", paymentId);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const raw = await rawBody(req);
  const signature = req.headers["x-square-hmacsha256-signature"];

  if (!validSquareSignature(raw, signature)) {
    return res.status(403).json({ error: "Invalid Square signature." });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return res.status(400).json({ error: "Invalid JSON." });
  }

  const eventId = event?.event_id;
  if (!eventId) return res.status(400).json({ error: "Missing event_id." });

  // Square may deliver the same event more than once.
  const { data: inserted, error: insertError } = await supabase
    .from("square_webhook_events")
    .insert({
      event_id: eventId,
      event_type: event.type || "unknown",
      created_at_square: event.created_at || null,
      payload: event,
    })
    .select("event_id")
    .maybeSingle();

  if (insertError?.code === "23505") {
    return res.status(200).json({ ok: true, duplicate: true });
  }
  if (insertError) throw insertError;

  try {
    const object = eventObject(event);

    if (String(event.type || "").startsWith("invoice.")) {
      await handleInvoiceEvent(event, object);
    } else if (
      event.type === "payment.created" ||
      event.type === "payment.updated"
    ) {
      await handlePaymentEvent(event, object);
    } else if (
      event.type === "refund.created" ||
      event.type === "refund.updated"
    ) {
      await handleRefundEvent(event, object);
    }

    await supabase
      .from("square_webhook_events")
      .update({
        processed_at: new Date().toISOString(),
        processing_status: "processed",
      })
      .eq("event_id", eventId);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Square webhook processing error:", error);

    await supabase
      .from("square_webhook_events")
      .update({
        processed_at: new Date().toISOString(),
        processing_status: "failed",
        processing_error: String(error?.message || error),
      })
      .eq("event_id", eventId);

    // Return 500 so Square retries transient failures.
    return res.status(500).json({ error: "Webhook processing failed." });
  }
}
