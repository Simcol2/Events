// Publish only AFTER the seller has attached the rental agreement in Square
// Dashboard. This endpoint cannot verify the Square Contract attachment because
// Square does not expose Contracts through the public API.
//
// To prevent accidental publication, the request must explicitly confirm that
// the contract step has been completed.

import { createClient } from "@supabase/supabase-js";
import {
  getSquareInvoice,
  publishSquareInvoice,
} from "./_squareInvoice.js";

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
    const contractAttachedConfirmed =
      req.body?.contractAttachedConfirmed === true;

    if (!Number.isFinite(reservationId)) {
      return res.status(400).json({ error: "reservationId is required." });
    }

    if (!contractAttachedConfirmed) {
      return res.status(409).json({
        error:
          "Confirm that the Square rental contract has been attached before publishing.",
      });
    }

    const { data: reservation, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", reservationId)
      .single();

    if (error || !reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    if (!reservation.square_invoice_id) {
      return res.status(409).json({
        error: "Create the Square invoice draft first.",
      });
    }

    const current = await getSquareInvoice(reservation.square_invoice_id);

    if (!current) {
      return res.status(404).json({ error: "Square invoice not found." });
    }

    if (current.status !== "DRAFT") {
      await supabase
        .from("reservations")
        .update({
          square_invoice_version: current.version ?? null,
          square_invoice_status: current.status || null,
          square_invoice_url: current.public_url || null,
          square_contract_attached: true,
          square_signature_required:
            req.body?.signatureRequiredConfirmed === true,
        })
        .eq("id", reservation.id);

      return res.status(200).json({
        ok: true,
        alreadyPublished: true,
        invoiceId: current.id,
        status: current.status,
        publicUrl: current.public_url || null,
      });
    }

    const published = await publishSquareInvoice(
      current.id,
      current.version
    );

    const { error: updateError } = await supabase
      .from("reservations")
      .update({
        square_invoice_version: published.version ?? null,
        square_invoice_status: published.status || null,
        square_invoice_url: published.public_url || null,
        square_contract_attached: true,
        square_signature_required:
          req.body?.signatureRequiredConfirmed === true,
        contract_status: "sent",
      })
      .eq("id", reservation.id);

    if (updateError) throw updateError;

    return res.status(200).json({
      ok: true,
      invoiceId: published.id,
      status: published.status,
      publicUrl: published.public_url || null,
    });
  } catch (error) {
    console.error("Publish Square invoice error:", error);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Could not publish Square invoice.",
      square: error.square || undefined,
    });
  }
}
