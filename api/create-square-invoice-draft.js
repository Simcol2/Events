// Steps 6, 9 and 10 of the Square migration.
//
// Creates the Square invoice/payment schedule as a DRAFT. The live customer
// should not receive it until the rental contract has been attached in Square
// Dashboard and, if using Invoices Plus, signature-before-payment is enabled.

import { createClient } from "@supabase/supabase-js";
import { createSquareInvoiceDraft } from "./_squareInvoice.js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const reservationId = Number(req.body?.reservationId);
    if (!Number.isFinite(reservationId)) {
      return res.status(400).json({ error: "reservationId is required." });
    }

    const { data: reservation, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", reservationId)
      .single();

    if (error || !reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    if (!reservation.square_order_id || !reservation.square_customer_id) {
      return res.status(409).json({
        error:
          "Run Square Phase 1-5 for this reservation first. " +
          "Square customer and order IDs are required.",
      });
    }

    // Idempotent UX: do not create another invoice if this reservation
    // already has one.
    if (reservation.square_invoice_id) {
      return res.status(200).json({
        ok: true,
        alreadyExists: true,
        invoiceId: reservation.square_invoice_id,
        status: reservation.square_invoice_status,
        next:
          "Attach the Square Contract in Dashboard, enable signature-before-payment if available, then publish.",
      });
    }

    const invoice = await createSquareInvoiceDraft({
      reservation,
      squareCustomerId: reservation.square_customer_id,
    });

    const { error: updateError } = await supabase
      .from("reservations")
      .update({
        square_invoice_id: invoice.id,
        square_invoice_version: invoice.version ?? null,
        square_invoice_status: invoice.status || "DRAFT",
        square_invoice_url: invoice.public_url || null,
      })
      .eq("id", reservation.id);

    if (updateError) throw updateError;

    return res.status(200).json({
      ok: true,
      invoiceId: invoice.id,
      invoiceVersion: invoice.version,
      status: invoice.status,
      paymentRequests: invoice.payment_requests || [],
      storePaymentMethodEnabled:
        invoice.store_payment_method_enabled === true,
      next:
        "Open this draft invoice in Square Dashboard, attach the rental contract, enable signature-before-payment if using Invoices Plus, then publish.",
    });
  } catch (error) {
    console.error("Create Square invoice draft error:", error);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Could not create Square invoice draft.",
      square: error.square || undefined,
    });
  }
}
