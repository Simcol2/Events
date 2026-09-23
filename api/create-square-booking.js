// PHASE 1-5: Square foundation for Events.
//
// This endpoint deliberately stops BEFORE invoicing/payment. It proves the
// migration foundation safely:
//   1. preserve existing rental/availability logic
//   2. connect Events to the existing Square seller account
//   3. store Square IDs in Supabase
//   4. reuse/create the Square customer
//   5. create the Square order
//
// Stripe remains untouched until the Square invoice + contract flow has been
// tested end-to-end.

import { createClient } from "@supabase/supabase-js";
import { ensureSquareCustomer } from "./_squareCustomer.js";
import { createSquareRentalOrder } from "./_squareOrder.js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MIN_RENTAL_CENTS = 5000;
const HOLD_MINUTES = 30;

function cents(value) {
  return Math.round(Number(value || 0) * 100);
}

function cleanQuantity(value) {
  return Math.max(1, Math.floor(Number(value) || 1));
}

async function findOrCreateCustomer(customerInput) {
  const email = String(customerInput?.email || "").trim().toLowerCase();
  const name = String(customerInput?.name || "").trim();

  if (!email || !name) throw new Error("Name and email are required.");

  const { data: existing, error: lookupError } = await supabase
    .from("customers")
    .select("*")
    .ilike("email", email)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("customers")
    .insert({ name, email })
    .select("*")
    .single();

  if (createError) throw createError;
  return created;
}

async function resolveRentalLines(items) {
  const requested = items.filter((line) => line?.kind === "rental");
  if (!requested.length) throw new Error("This Square phase currently requires at least one rental item.");

  const lines = [];

  for (const line of requested) {
    const quantity = cleanQuantity(line.quantity);

    const { data: item, error } = await supabase
      .from("items")
      .select("id,name,rental_price,quantity_owned,quantity_out_of_service,active")
      .eq("id", line.id)
      .eq("active", true)
      .single();

    if (error || !item) {
      throw new Error("One of the rental items is no longer available.");
    }

    const unitCents = cents(item.rental_price);
    if (unitCents <= 0) {
      throw new Error(`${item.name} is not available to rent.`);
    }

    lines.push({
      id: item.id,
      quantity,
      name: item.name,
      unitCents,
    });
  }

  return lines;
}

async function assertRentalAvailability(lines, pickup, dropoff) {
  for (const line of lines) {
    const { data, error } = await supabase.rpc(
      "get_reservation_item_availability",
      {
        p_item_id: Number(line.id),
        p_pickup: pickup,
        p_dropoff: dropoff,
      }
    );

    if (error) throw error;

    if (Number(data || 0) < line.quantity) {
      throw new Error(
        `${line.name} does not have enough quantity available for those dates.`
      );
    }
  }
}

function securityDepositFor(rentalSubtotalCents) {
  // Frozen from the current Events checkout. Do not change payment policy
  // during the provider migration. Timing of collection changes later.
  if (rentalSubtotalCents >= 100000) return 30000;
  if (rentalSubtotalCents >= 75000) return 25000;
  if (rentalSubtotalCents >= 50000) return 20000;
  if (rentalSubtotalCents >= 30000) return 15000;
  if (rentalSubtotalCents >= 15000) return 10000;
  if (rentalSubtotalCents >= 5000) return 5000;
  return 0;
}

async function createReservation({
  customer,
  rentalLines,
  rentalDates,
  rentalSubtotalCents,
}) {
  const { data: bookingNumber, error: numberError } = await supabase.rpc(
    "next_rental_reservation_number"
  );
  if (numberError) throw numberError;

  const bookingDepositCents = Math.ceil(rentalSubtotalCents * 0.5);
  const securityDepositCents = securityDepositFor(rentalSubtotalCents);
  const expires = new Date(
    Date.now() + HOLD_MINUTES * 60 * 1000
  ).toISOString();

  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .insert({
      customer_id: customer.id,
      source: "a_la_carte",
      booking_number: bookingNumber,
      status: "checkout_pending",
      pickup_date: rentalDates.pickup,
      drop_off_date: rentalDates.dropoff,
      event_date: rentalDates.event || rentalDates.pickup,
      rental_subtotal_cents: rentalSubtotalCents,
      rental_total_cents: rentalSubtotalCents,
      total_price: rentalSubtotalCents / 100,
      booking_deposit_cents: bookingDepositCents,
      security_deposit_cents: securityDepositCents,
      balance_due_cents: Math.max(
        0,
        rentalSubtotalCents - bookingDepositCents
      ),
      currency: "cad",
      checkout_expires_at: expires,
    })
    .select("*")
    .single();

  if (reservationError) throw reservationError;

  const rows = rentalLines.map((line) => ({
    reservation_id: reservation.id,
    item_id: Number(line.id),
    quantity: line.quantity,
    description: line.name,
    unit_price_cents: line.unitCents,
    line_total_cents: line.unitCents * line.quantity,
  }));

  const { error: itemError } = await supabase
    .from("reservation_items")
    .insert(rows);

  if (itemError) {
    await supabase.from("reservations").delete().eq("id", reservation.id);
    throw itemError;
  }

  return reservation;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let reservation = null;

  try {
    const {
      items,
      customer: customerInput,
      rentalDates = {},
    } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    if (
      !rentalDates.pickup ||
      !rentalDates.dropoff ||
      rentalDates.dropoff < rentalDates.pickup
    ) {
      return res
        .status(400)
        .json({ error: "Choose valid rental pickup and return dates." });
    }

    const customer = await findOrCreateCustomer(customerInput);
    const rentalLines = await resolveRentalLines(items);

    const rentalSubtotalCents = rentalLines.reduce(
      (sum, line) => sum + line.unitCents * line.quantity,
      0
    );

    if (rentalSubtotalCents < MIN_RENTAL_CENTS) {
      return res
        .status(400)
        .json({ error: "Rental orders require a $50 minimum." });
    }

    await assertRentalAvailability(
      rentalLines,
      rentalDates.pickup,
      rentalDates.dropoff
    );

    reservation = await createReservation({
      customer,
      rentalLines,
      rentalDates,
      rentalSubtotalCents,
    });

    const squareCustomerId = await ensureSquareCustomer({
      supabase,
      customer,
    });

    const squareOrder = await createSquareRentalOrder({
      reservation,
      rentalLines,
      squareCustomerId,
    });

    const { error: linkError } = await supabase
      .from("reservations")
      .update({
        square_customer_id: squareCustomerId,
        square_order_id: squareOrder.id,
        square_order_version: squareOrder.version,
        square_order_state: squareOrder.state,
      })
      .eq("id", reservation.id);

    if (linkError) throw linkError;

    return res.status(200).json({
      ok: true,
      phase: "square-foundation-1-5",
      bookingNumber: reservation.booking_number,
      reservationId: reservation.id,
      rentalSubtotalCents,
      bookingDepositCents: reservation.booking_deposit_cents,
      securityDepositCents: reservation.security_deposit_cents,
      balanceDueCents: reservation.balance_due_cents,
      squareCustomerId,
      squareOrderId: squareOrder.id,
      squareOrderState: squareOrder.state,
      next: "Create Square invoice + contract before routing customers here.",
    });
  } catch (error) {
    console.error("Square booking foundation error:", error);

    // A failed provider setup must not continue holding inventory.
    if (reservation?.id) {
      await supabase
        .from("reservations")
        .update({ status: "cancelled" })
        .eq("id", reservation.id);
    }

    return res.status(500).json({
      error: error?.message || "Could not create the Square booking foundation.",
    });
  }
}
