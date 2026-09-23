// Step 10 helper.
//
// The invoice itself asks the buyer whether they want to save their card.
// This endpoint lets the Events backend confirm later whether Square now has
// an enabled card for that customer. It never returns full card data.

import { createClient } from "@supabase/supabase-js";
import { listSquareCardsForCustomer } from "./_squareInvoice.js";

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
      .select("id,square_customer_id")
      .eq("id", reservationId)
      .single();

    if (error || !reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    if (!reservation.square_customer_id) {
      return res.status(409).json({ error: "No Square customer is linked." });
    }

    const cards = await listSquareCardsForCustomer(
      reservation.square_customer_id
    );

    const enabledCards = cards.filter((card) => card.enabled !== false);
    const preferred = enabledCards[0] || null;

    if (preferred?.id) {
      await supabase
        .from("customers")
        .update({
          square_primary_card_id: preferred.id,
          square_card_on_file: true,
        })
        .eq("square_customer_id", reservation.square_customer_id);
    }

    return res.status(200).json({
      ok: true,
      hasCardOnFile: Boolean(preferred),
      card: preferred
        ? {
            id: preferred.id,
            brand: preferred.card_brand || null,
            last4: preferred.last_4 || null,
            expMonth: preferred.exp_month || null,
            expYear: preferred.exp_year || null,
          }
        : null,
    });
  } catch (error) {
    console.error("Square card status error:", error);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Could not check Square card status.",
      square: error.square || undefined,
    });
  }
}
