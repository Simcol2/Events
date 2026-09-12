// Vercel serverless function (Node runtime). Creates one Stripe Checkout
// Session covering purchase items and rental deposits together. Every
// price is resolved here from Supabase or a fixed dictionary, never from
// the request body - a customer's browser could send anything, only the
// server's own data decides what gets charged.
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.stripe_secret);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MIN_RENTAL_CENTS = 5000;
const HOLD_MINUTES = 30;

// Mirrors cateringContent.js's GROWN_FOLKS_LOOT_BAGS (name + price only) and
// packageContent.js's KEEPSAKES (id, name, standalonePrice only) - the same
// dictionaries api/create-checkout-session.js already prices these from.
// Duplicated rather than imported for the same reason as there: those
// modules pull in Vite asset imports for photos that this plain Node
// function can't resolve. Keep in sync if those prices or names ever change.
const DESSERT_GIFTS = {
  rumCupcakeGiftBox: { name: "Rum Cupcake Gift Box", price: 15 },
  gRingGift: { name: "G Ring Gift", price: 10 },
};

const KEEPSAKE_GIFTS = {
  readyToPop: { name: "Ready to Pop", price: 5 },
  lilRoots: { name: "Lil Roots", price: 15 },
  grownFolksLootBags: { name: "Grown Folks Loot Bags", price: 15 },
};

function cents(value) {
  return Math.round(Number(value || 0) * 100);
}

function cleanQuantity(value) {
  return Math.max(1, Math.floor(Number(value) || 1));
}

async function findOrCreateCustomer(customer) {
  const email = String(customer?.email || "").trim().toLowerCase();
  const name = String(customer?.name || "").trim();

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

async function resolveLines(items) {
  const lines = [];

  for (const line of items) {
    const quantity = cleanQuantity(line.quantity);

    if (line.kind === "rental" || line.kind === "catalog") {
      const { data: item, error } = await supabase
        .from("items")
        .select("id,name,rental_price,purchase_price,quantity_owned,quantity_out_of_service,active")
        .eq("id", line.id)
        .eq("active", true)
        .single();

      if (error || !item) throw new Error("One of the cart items is no longer available.");

      const unitCents =
        line.kind === "rental" ? cents(item.rental_price) : cents(item.purchase_price);

      if (unitCents <= 0) throw new Error(`${item.name} is not available for this order type.`);

      lines.push({
        id: item.id,
        kind: line.kind,
        quantity,
        name: item.name,
        unitCents,
        meta: line.meta || null,
      });
      continue;
    }

    if (line.kind === "gift") {
      const { data: gift, error } = await supabase
        .from("gifts")
        .select("id,name,price,custom_price,active")
        .eq("id", line.id)
        .eq("active", true)
        .single();

      if (error || !gift) throw new Error("One of the gifts is no longer available.");
      const isCustom = Boolean(line.meta?.custom);
      const unitCents = cents(isCustom ? gift.custom_price ?? gift.price : gift.price);
      lines.push({
        id: gift.id,
        kind: "gift",
        quantity,
        name: gift.name,
        unitCents,
        meta: line.meta || null,
      });
      continue;
    }

    if (line.kind === "dessert") {
      const dessert = DESSERT_GIFTS[line.id];
      if (!dessert) throw new Error("One of the dessert gifts is no longer available.");
      lines.push({
        id: line.id,
        kind: "dessert",
        quantity,
        name: dessert.name,
        unitCents: cents(dessert.price),
        meta: line.meta || null,
      });
      continue;
    }

    if (line.kind === "keepsake") {
      const keepsake = KEEPSAKE_GIFTS[line.id];
      if (!keepsake) throw new Error("One of the keepsake gifts is no longer available.");
      lines.push({
        id: line.id,
        kind: "keepsake",
        quantity,
        name: keepsake.name,
        unitCents: cents(keepsake.price),
        meta: line.meta || null,
      });
      continue;
    }

    // Every priceable kind is handled explicitly above. Anything else is
    // rejected rather than priced from the request body - a browser cannot
    // be trusted to say what something costs.
    throw new Error("One of the cart items could not be recognized.");
  }

  return lines;
}

async function assertRentalAvailability(lines, pickup, dropoff) {
  for (const line of lines.filter((item) => item.kind === "rental")) {
    const { data, error } = await supabase.rpc("get_reservation_item_availability", {
      p_item_id: Number(line.id),
      p_pickup: pickup,
      p_dropoff: dropoff,
    });

    if (error) throw error;
    if (Number(data || 0) < line.quantity) {
      throw new Error(`${line.name} does not have enough quantity available for those dates.`);
    }
  }
}

async function createReservation({ customer, lines, rentalDates, rentalSubtotalCents }) {
  const { data: bookingNumber, error: numberError } = await supabase.rpc(
    "next_rental_reservation_number"
  );
  if (numberError) throw numberError;

  // Default launch rule: 50% booking deposit. The security deposit can be
  // replaced with your final tier calculator later without changing the cart.
  const bookingDepositCents = Math.ceil(rentalSubtotalCents * 0.5);

  // Current tier schedule:
  // $50-149 -> $50
  // $150-299 -> $100
  // $300-499 -> $150
  // $500-749 -> $200
  // $750-999 -> $250
  // $1000+ -> $300
  let securityDepositCents = 0;
  if (rentalSubtotalCents >= 100000) securityDepositCents = 30000;
  else if (rentalSubtotalCents >= 75000) securityDepositCents = 25000;
  else if (rentalSubtotalCents >= 50000) securityDepositCents = 20000;
  else if (rentalSubtotalCents >= 30000) securityDepositCents = 15000;
  else if (rentalSubtotalCents >= 15000) securityDepositCents = 10000;
  else if (rentalSubtotalCents >= 5000) securityDepositCents = 5000;

  const expires = new Date(Date.now() + HOLD_MINUTES * 60 * 1000).toISOString();

  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .insert({
      customer_id: customer.id,
      // The cart never builds off a curated package, so this is always a
      // standalone (a_la_carte) reservation - package_id stays null to
      // satisfy the table's source/package_id pairing check.
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
      balance_due_cents: Math.max(0, rentalSubtotalCents - bookingDepositCents),
      currency: "cad",
      checkout_expires_at: expires,
    })
    .select("*")
    .single();

  if (reservationError) throw reservationError;

  const rentalRows = lines
    .filter((line) => line.kind === "rental")
    .map((line) => ({
      reservation_id: reservation.id,
      item_id: Number(line.id),
      quantity: line.quantity,
      description: line.name,
      unit_price_cents: line.unitCents,
      line_total_cents: line.unitCents * line.quantity,
    }));

  if (rentalRows.length) {
    const { error: itemError } = await supabase.from("reservation_items").insert(rentalRows);
    if (itemError) {
      await supabase.from("reservations").delete().eq("id", reservation.id);
      throw itemError;
    }
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
    const { items, customer: customerInput, rentalDates = {} } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    const customer = await findOrCreateCustomer(customerInput);
    const lines = await resolveLines(items);

    const rentalLines = lines.filter((line) => line.kind === "rental");
    const purchaseLines = lines.filter((line) => line.kind !== "rental");
    const rentalSubtotalCents = rentalLines.reduce(
      (sum, line) => sum + line.unitCents * line.quantity,
      0
    );
    const purchaseSubtotalCents = purchaseLines.reduce(
      (sum, line) => sum + line.unitCents * line.quantity,
      0
    );

    if (rentalLines.length) {
      if (rentalSubtotalCents < MIN_RENTAL_CENTS) {
        return res.status(400).json({ error: "Rental orders require a $50 minimum." });
      }
      if (!rentalDates.pickup || !rentalDates.dropoff || rentalDates.dropoff < rentalDates.pickup) {
        return res.status(400).json({ error: "Choose valid rental pickup and return dates." });
      }

      await assertRentalAvailability(lines, rentalDates.pickup, rentalDates.dropoff);
      reservation = await createReservation({
        customer,
        lines,
        rentalDates,
        rentalSubtotalCents,
      });
    }

    let stripeCustomerId = reservation?.stripe_customer_id || null;
    if (!stripeCustomerId) {
      const existing = await stripe.customers.list({ email: customer.email, limit: 1 });
      const stripeCustomer =
        existing.data[0] ||
        (await stripe.customers.create({
          email: customer.email,
          name: customer.name || undefined,
          metadata: { customer_id: String(customer.id) },
        }));
      stripeCustomerId = stripeCustomer.id;
    }

    if (reservation) {
      await supabase
        .from("reservations")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", reservation.id);
    }

    const stripeLineItems = [];

    for (const line of purchaseLines) {
      stripeLineItems.push({
        quantity: line.quantity,
        price_data: {
          currency: "cad",
          unit_amount: line.unitCents,
          product_data: {
            name: line.name,
            metadata: {
              source_kind: line.kind,
              source_id: String(line.id),
            },
          },
        },
      });
    }

    if (reservation?.booking_deposit_cents > 0) {
      stripeLineItems.push({
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: reservation.booking_deposit_cents,
          product_data: { name: `${reservation.booking_number} - Booking deposit` },
        },
      });
    }

    if (reservation?.security_deposit_cents > 0) {
      stripeLineItems.push({
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: reservation.security_deposit_cents,
          product_data: { name: `${reservation.booking_number} - Refundable security deposit` },
        },
      });
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const metadata = {
      source: "mixed_checkout",
      customer_id: String(customer.id),
      reservation_id: reservation ? String(reservation.id) : "",
      booking_number: reservation?.booking_number || "",
      purchase_subtotal_cents: String(purchaseSubtotalCents),
      booking_deposit_cents: String(reservation?.booking_deposit_cents || 0),
      security_deposit_cents: String(reservation?.security_deposit_cents || 0),
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomerId,
      line_items: stripeLineItems,
      invoice_creation: { enabled: true },
      metadata,
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/decor?checkout=cancelled`,
    });

    if (reservation) {
      await supabase
        .from("reservations")
        .update({ stripe_checkout_session_id: session.id })
        .eq("id", reservation.id);
    }

    return res.status(200).json({
      url: session.url,
      bookingNumber: reservation?.booking_number || null,
    });
  } catch (error) {
    console.error("Unified checkout error:", error);

    if (reservation?.id) {
      await supabase
        .from("reservations")
        .update({ status: "cancelled" })
        .eq("id", reservation.id);
    }

    return res.status(500).json({ error: error.message || "Could not start checkout." });
  }
}
