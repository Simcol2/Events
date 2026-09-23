// All Square foundation endpoints in one Vercel function, routed by
// ?resource= plus the HTTP method - the same pattern admin.js already uses,
// and for the same reason: Vercel's Hobby plan caps a deployment at 12
// serverless functions, and each of these started life as its own route
// file across the Phase 1-5 / 5-10 / 11-15 migration packages. Consolidating
// them here is what keeps the deployment under that cap.
//
// api/square-webhook.js is deliberately NOT folded in here - Square includes
// the exact notification URL in its signature, and the endpoint needs raw
// (unparsed) request body access, which Vercel only supports by disabling
// body parsing for an entire function. Mixing that into a shared dispatcher
// would break every other resource's normal JSON req.body.
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { getSquareClient, getSquareLocationId, squareEnvironmentName } from "./_square.js";
import { ensureSquareCustomer } from "./_squareCustomer.js";
import { createSquareRentalOrder } from "./_squareOrder.js";
import {
  createSquareInvoiceDraft,
  getSquareInvoice,
  listSquareCardsForCustomer,
  publishSquareInvoice,
} from "./_squareInvoice.js";
import { squareLocationId, squareRequest } from "./_squareRest.js";
import { handleApiError, requireClient } from "./_clientAuth.js";
import { adminSupabase, requireAdmin } from "./_adminAuth.js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ---------------------------------------------------------------------
// resource=health (GET) - Phase 1-5 connection smoke test.
// ---------------------------------------------------------------------
async function handleHealth(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const square = getSquareClient();
    const locationId = getSquareLocationId();
    const response = await square.locations.get({ locationId });

    return res.status(200).json({
      ok: true,
      environment: squareEnvironmentName(),
      locationId,
      locationName: response.location?.name || null,
    });
  } catch (error) {
    console.error("Square health check failed:", error);
    return res.status(500).json({ ok: false, error: error?.message || "Square connection failed" });
  }
}

// ---------------------------------------------------------------------
// resource=booking (POST) - Phase 1-5 foundation: Supabase reservation,
// availability check, Square customer, Square order.
// ---------------------------------------------------------------------
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

    lines.push({ id: item.id, quantity, name: item.name, unitCents });
  }

  return lines;
}

async function assertRentalAvailability(lines, pickup, dropoff) {
  for (const line of lines) {
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

async function createReservation({ customer, rentalLines, rentalDates, rentalSubtotalCents }) {
  const { data: bookingNumber, error: numberError } = await supabase.rpc("next_rental_reservation_number");
  if (numberError) throw numberError;

  const bookingDepositCents = Math.ceil(rentalSubtotalCents * 0.5);
  const securityDepositCents = securityDepositFor(rentalSubtotalCents);
  const expires = new Date(Date.now() + HOLD_MINUTES * 60 * 1000).toISOString();

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
      balance_due_cents: Math.max(0, rentalSubtotalCents - bookingDepositCents),
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

  const { error: itemError } = await supabase.from("reservation_items").insert(rows);

  if (itemError) {
    await supabase.from("reservations").delete().eq("id", reservation.id);
    throw itemError;
  }

  return reservation;
}

async function handleBooking(req, res) {
  if (!requireAdmin(req, res)) return;

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

    if (!rentalDates.pickup || !rentalDates.dropoff || rentalDates.dropoff < rentalDates.pickup) {
      return res.status(400).json({ error: "Choose valid rental pickup and return dates." });
    }

    const customer = await findOrCreateCustomer(customerInput);
    const rentalLines = await resolveRentalLines(items);

    const rentalSubtotalCents = rentalLines.reduce((sum, line) => sum + line.unitCents * line.quantity, 0);

    if (rentalSubtotalCents < MIN_RENTAL_CENTS) {
      return res.status(400).json({ error: "Rental orders require a $50 minimum." });
    }

    await assertRentalAvailability(rentalLines, rentalDates.pickup, rentalDates.dropoff);

    reservation = await createReservation({ customer, rentalLines, rentalDates, rentalSubtotalCents });

    const squareCustomerId = await ensureSquareCustomer({ supabase, customer });
    const squareOrder = await createSquareRentalOrder({ reservation, rentalLines, squareCustomerId });

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

    if (reservation?.id) {
      await supabase.from("reservations").update({ status: "cancelled" }).eq("id", reservation.id);
    }

    return res.status(500).json({ error: error?.message || "Could not create the Square booking foundation." });
  }
}

// ---------------------------------------------------------------------
// resource=invoice-draft (POST) - Phase 5-10 Step 6.
// ---------------------------------------------------------------------
async function handleInvoiceDraft(req, res) {
  if (!requireAdmin(req, res)) return;

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
        error: "Run Square Phase 1-5 for this reservation first. Square customer and order IDs are required.",
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
        next: "Attach the Square Contract in Dashboard, enable signature-before-payment if available, then publish.",
      });
    }

    const invoice = await createSquareInvoiceDraft({ reservation, squareCustomerId: reservation.square_customer_id });

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
      storePaymentMethodEnabled: invoice.store_payment_method_enabled === true,
      next: "Open this draft invoice in Square Dashboard, attach the rental contract, enable signature-before-payment if using Invoices Plus, then publish.",
    });
  } catch (error) {
    console.error("Create Square invoice draft error:", error);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Could not create Square invoice draft.",
      square: error.square || undefined,
    });
  }
}

// ---------------------------------------------------------------------
// resource=publish-invoice (POST) - Phase 5-10 Steps 7-9.
// ---------------------------------------------------------------------
async function handlePublishInvoice(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const reservationId = Number(req.body?.reservationId);
    const contractAttachedConfirmed = req.body?.contractAttachedConfirmed === true;

    if (!Number.isFinite(reservationId)) {
      return res.status(400).json({ error: "reservationId is required." });
    }

    if (!contractAttachedConfirmed) {
      return res.status(409).json({
        error: "Confirm that the Square rental contract has been attached before publishing.",
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
      return res.status(409).json({ error: "Create the Square invoice draft first." });
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
          square_signature_required: req.body?.signatureRequiredConfirmed === true,
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

    const published = await publishSquareInvoice(current.id, current.version);

    const { error: updateError } = await supabase
      .from("reservations")
      .update({
        square_invoice_version: published.version ?? null,
        square_invoice_status: published.status || null,
        square_invoice_url: published.public_url || null,
        square_contract_attached: true,
        square_signature_required: req.body?.signatureRequiredConfirmed === true,
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

// ---------------------------------------------------------------------
// resource=card-status (POST) - Phase 5-10 Step 10.
// ---------------------------------------------------------------------
async function handleCardStatus(req, res) {
  if (!requireAdmin(req, res)) return;

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

    const cards = await listSquareCardsForCustomer(reservation.square_customer_id);

    const enabledCards = cards.filter((card) => card.enabled !== false);
    const preferred = enabledCards[0] || null;

    if (preferred?.id) {
      await supabase
        .from("customers")
        .update({ square_primary_card_id: preferred.id, square_card_on_file: true })
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

// ---------------------------------------------------------------------
// resource=balance-autopay (POST) - Phase 11-15 Step 11.
// ---------------------------------------------------------------------
async function handleBalanceAutopay(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const reservationId = Number(req.body?.reservationId);
    if (!Number.isFinite(reservationId)) {
      return res.status(400).json({ error: "reservationId is required." });
    }

    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", reservationId)
      .single();

    if (reservationError || !reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id,square_customer_id,square_primary_card_id,square_card_on_file")
      .eq("id", reservation.customer_id)
      .single();

    if (customerError || !customer) {
      return res.status(404).json({ error: "Customer not found." });
    }

    if (!reservation.square_invoice_id) {
      return res.status(409).json({ error: "Square invoice is not linked." });
    }

    if (!customer.square_card_on_file || !customer.square_primary_card_id) {
      return res.status(409).json({ error: "The customer does not have an opted-in Square card on file yet." });
    }

    const invoiceData = await squareRequest(`/v2/invoices/${encodeURIComponent(reservation.square_invoice_id)}`);
    const invoice = invoiceData.invoice;

    if (!invoice) throw new Error("Square invoice not found.");

    const balanceRequest = (invoice.payment_requests || []).find((row) => row.request_type === "BALANCE");

    if (!balanceRequest?.uid) {
      return res.status(409).json({ error: "The Square invoice has no BALANCE payment request." });
    }

    const update = await squareRequest(`/v2/invoices/${encodeURIComponent(invoice.id)}`, {
      method: "PUT",
      body: {
        idempotency_key: `asg-autopay-${reservation.id}-${invoice.version}`,
        invoice: {
          version: invoice.version,
          payment_requests: [
            { uid: balanceRequest.uid, automatic_payment_source: "CARD_ON_FILE", card_id: customer.square_primary_card_id },
          ],
        },
      },
    });

    const updated = update.invoice;
    const updatedBalance = (updated?.payment_requests || []).find((row) => row.request_type === "BALANCE");

    await supabase
      .from("reservations")
      .update({
        square_invoice_version: updated?.version ?? invoice.version,
        square_invoice_status: updated?.status || invoice.status,
        square_balance_autopay: true,
        square_balance_card_id: customer.square_primary_card_id,
      })
      .eq("id", reservation.id);

    return res.status(200).json({
      ok: true,
      invoiceId: updated?.id || invoice.id,
      invoiceStatus: updated?.status || invoice.status,
      balanceDueDate: updatedBalance?.due_date || null,
      automaticPaymentSource: updatedBalance?.automatic_payment_source || null,
    });
  } catch (error) {
    console.error("Square balance autopay error:", error);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Could not configure Square balance autopay.",
      square: error.square || undefined,
    });
  }
}

// ---------------------------------------------------------------------
// resource=security-deposit (POST) - Phase 11-15 Step 12.
// Its own body.action ("charge" / "refund") selects the operation - a
// separate concern from this file's own ?resource= routing.
// ---------------------------------------------------------------------
async function getReservationWithCustomer(reservationId) {
  const { data: reservation, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", reservationId)
    .single();

  if (error || !reservation) throw new Error("Reservation not found.");

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", reservation.customer_id)
    .single();

  if (customerError || !customer) throw new Error("Customer not found.");

  return { reservation, customer };
}

async function chargeSecurityDeposit(reservation, customer) {
  const amount = Number(reservation.security_deposit_cents || 0);
  if (amount <= 0) throw new Error("This reservation has no security deposit.");

  if (reservation.square_security_payment_id) {
    return {
      alreadyExists: true,
      paymentId: reservation.square_security_payment_id,
      status: reservation.square_security_status,
    };
  }

  if (!customer.square_primary_card_id || !customer.square_card_on_file) {
    throw new Error("Customer does not have an opted-in Square card on file.");
  }

  const result = await squareRequest("/v2/payments", {
    method: "POST",
    body: {
      source_id: customer.square_primary_card_id,
      idempotency_key: `asg-security-${reservation.id}`,
      amount_money: { amount, currency: String(reservation.currency || "cad").toUpperCase() },
      customer_id: customer.square_customer_id,
      location_id: squareLocationId(),
      reference_id: reservation.booking_number,
      note: `${reservation.booking_number} refundable security deposit`,
      autocomplete: true,
    },
  });

  const payment = result.payment;
  if (!payment?.id) throw new Error("Square did not return a payment ID.");

  await supabase
    .from("reservations")
    .update({
      square_security_payment_id: payment.id,
      square_security_status: payment.status || "COMPLETED",
      square_security_collected_at: payment.created_at || new Date().toISOString(),
    })
    .eq("id", reservation.id);

  await supabase.from("square_transactions").upsert(
    {
      customer_id: reservation.customer_id,
      reservation_id: reservation.id,
      kind: "security_deposit",
      square_payment_id: payment.id,
      amount_cents: amount,
      currency: String(reservation.currency || "cad").toLowerCase(),
      status: payment.status === "COMPLETED" ? "paid" : String(payment.status || "").toLowerCase(),
      paid_at: payment.status === "COMPLETED" ? payment.created_at || new Date().toISOString() : null,
      metadata: { source: "security_deposit_api" },
    },
    { onConflict: "square_payment_id" }
  );

  return { paymentId: payment.id, status: payment.status, receiptUrl: payment.receipt_url || null };
}

async function refundSecurityDeposit(reservation, refundAmountCents, reason) {
  const paymentId = reservation.square_security_payment_id;
  if (!paymentId) throw new Error("Security deposit has not been charged.");

  const original = Number(reservation.security_deposit_cents || 0);
  const amount = refundAmountCents == null ? original : Number(refundAmountCents);

  if (!Number.isFinite(amount) || amount <= 0 || amount > original) {
    throw new Error("Refund amount must be greater than 0 and no more than the security deposit.");
  }

  const result = await squareRequest("/v2/refunds", {
    method: "POST",
    body: {
      idempotency_key: crypto.randomUUID().slice(0, 45),
      payment_id: paymentId,
      amount_money: { amount, currency: String(reservation.currency || "cad").toUpperCase() },
      reason: String(reason || "Rental security deposit release").slice(0, 192),
    },
  });

  const refund = result.refund;
  if (!refund?.id) throw new Error("Square did not return a refund ID.");

  await supabase
    .from("reservations")
    .update({
      square_security_refund_id: refund.id,
      square_security_refund_status: refund.status || "PENDING",
      square_security_refund_cents: amount,
      square_security_refund_requested_at: refund.created_at || new Date().toISOString(),
    })
    .eq("id", reservation.id);

  return { refundId: refund.id, status: refund.status, amountCents: amount };
}

async function handleSecurityDeposit(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const reservationId = Number(req.body?.reservationId);
    const action = String(req.body?.action || "");

    if (!Number.isFinite(reservationId)) {
      return res.status(400).json({ error: "reservationId is required." });
    }

    const { reservation, customer } = await getReservationWithCustomer(reservationId);

    if (action === "charge") {
      const result = await chargeSecurityDeposit(reservation, customer);
      return res.status(200).json({ ok: true, ...result });
    }

    if (action === "refund") {
      const result = await refundSecurityDeposit(reservation, req.body?.refundAmountCents, req.body?.reason);
      return res.status(200).json({ ok: true, ...result });
    }

    return res.status(400).json({ error: 'action must be "charge" or "refund".' });
  } catch (error) {
    console.error("Square security deposit error:", error);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Could not process the security deposit.",
      square: error.square || undefined,
    });
  }
}

// ---------------------------------------------------------------------
// resource=contract (POST) - Phase 11-15 Step 15 contract bridge.
// Square exposes no public Contracts API, so this is a seller/admin-driven
// status update, not something Events can verify independently.
// ---------------------------------------------------------------------
async function handleContract(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const reservationId = Number(req.body?.reservationId);
    const status = String(req.body?.status || "").toLowerCase();

    if (!Number.isFinite(reservationId)) {
      return res.status(400).json({ error: "reservationId is required." });
    }

    if (!["not_sent", "sent", "signed"].includes(status)) {
      return res.status(400).json({ error: 'status must be "not_sent", "sent", or "signed".' });
    }

    const { data: existing, error: reservationError } = await supabase
      .from("reservations")
      .select("id")
      .eq("id", reservationId)
      .single();

    if (reservationError || !existing) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    const signedAt = status === "signed" ? req.body?.signedAt || new Date().toISOString() : null;

    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .upsert(
        { reservation_id: reservationId, status, signed_at: signedAt, document_url: req.body?.documentUrl || null },
        { onConflict: "reservation_id" }
      )
      .select("*")
      .single();

    if (contractError) throw contractError;

    await supabase
      .from("reservations")
      .update({ contract_status: status, square_contract_attached: status !== "not_sent" })
      .eq("id", reservationId);

    return res.status(200).json({ ok: true, contract });
  } catch (error) {
    console.error("Square contract bridge error:", error);
    return res.status(500).json({ error: error.message || "Could not update contract status." });
  }
}

// ---------------------------------------------------------------------
// resource=portal (GET) - Phase 11-15 Step 15 authenticated status feed
// for the customer portal. Uses the client's own Supabase session token
// (requireClient), not the admin passcode the other resources above rely
// on implicitly by only ever being called from trusted server-side tools.
// ---------------------------------------------------------------------
async function handlePortal(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { supabase: clientSupabase, customer } = await requireClient(req);

    const { data: reservations, error: reservationsError } = await clientSupabase
      .from("reservations")
      .select(
        "id,booking_number,status,contract_status,currency,booking_deposit_cents,security_deposit_cents,balance_due_cents,square_invoice_id,square_invoice_status,square_invoice_url,square_balance_autopay,square_payment_failed,square_security_status,square_security_refund_status,square_security_refund_cents,square_security_refunded_at"
      )
      .eq("customer_id", customer.id);

    if (reservationsError) throw reservationsError;

    const ids = (reservations || []).map((r) => r.id);

    const { data: transactions, error: transactionError } = ids.length
      ? await clientSupabase.from("square_transactions").select("*").in("reservation_id", ids).order("created_at", { ascending: false })
      : { data: [], error: null };

    if (transactionError) throw transactionError;

    return res.status(200).json({ reservations: reservations || [], transactions: transactions || [] });
  } catch (error) {
    return handleApiError(res, error);
  }
}

// ---------------------------------------------------------------------
// resource=portal-actions (POST) - Phase 16-20 Step 16. Square-native
// replacement for the Stripe portal's "open invoice" / "refresh status"
// actions, for reservations that have moved to Square.
// ---------------------------------------------------------------------
async function handlePortalActions(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { supabase: clientSupabase, customer } = await requireClient(req);
    const reservationId = Number(req.body?.reservationId);
    const action = String(req.body?.action || "");

    if (!Number.isFinite(reservationId)) {
      return res.status(400).json({ error: "reservationId is required." });
    }

    const { data: reservation, error } = await clientSupabase
      .from("reservations")
      .select("*")
      .eq("id", reservationId)
      .eq("customer_id", customer.id)
      .single();

    if (error || !reservation) {
      return res.status(404).json({ error: "Booking not found." });
    }

    if (!reservation.square_invoice_id) {
      return res.status(409).json({ error: "This booking does not have a Square invoice yet." });
    }

    if (action === "open-invoice") {
      if (reservation.square_invoice_url) {
        return res.status(200).json({ url: reservation.square_invoice_url });
      }

      const data = await squareRequest(`/v2/invoices/${encodeURIComponent(reservation.square_invoice_id)}`);
      const invoice = data.invoice;

      if (!invoice?.public_url) {
        return res.status(409).json({ error: "The Square invoice is not published yet." });
      }

      await clientSupabase
        .from("reservations")
        .update({
          square_invoice_status: invoice.status || null,
          square_invoice_version: invoice.version ?? null,
          square_invoice_url: invoice.public_url,
        })
        .eq("id", reservation.id);

      return res.status(200).json({ url: invoice.public_url });
    }

    if (action === "refresh") {
      const data = await squareRequest(`/v2/invoices/${encodeURIComponent(reservation.square_invoice_id)}`);
      const invoice = data.invoice;

      await clientSupabase
        .from("reservations")
        .update({
          square_invoice_status: invoice?.status || null,
          square_invoice_version: invoice?.version ?? null,
          square_invoice_url: invoice?.public_url || null,
        })
        .eq("id", reservation.id);

      return res.status(200).json({
        ok: true,
        invoiceStatus: invoice?.status || null,
        invoiceUrl: invoice?.public_url || null,
      });
    }

    return res.status(400).json({ error: 'action must be "open-invoice" or "refresh".' });
  } catch (error) {
    return handleApiError(res, error);
  }
}

// ---------------------------------------------------------------------
// resource=admin-return (POST) - Phase 16-20 Step 17. Admin-only return
// inspection + security-deposit release. Supersedes using the public
// security-deposit resource for refunds - never expose refund actions
// without admin authentication.
// ---------------------------------------------------------------------
const ALLOWED_RETURN_CONDITIONS = new Set([
  "excellent",
  "normal_wear",
  "needs_cleaning",
  "minor_damage",
  "major_damage",
  "missing",
]);

async function handleAdminReturn(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const adminDb = adminSupabase();

  try {
    const reservationId = Number(req.body?.reservationId);
    const condition = String(req.body?.condition || "");
    const refundAmountCents = Number(req.body?.refundAmountCents);
    const notes = String(req.body?.notes || "").trim();
    const photos = Array.isArray(req.body?.photos) ? req.body.photos : [];

    if (!Number.isFinite(reservationId)) {
      return res.status(400).json({ error: "reservationId is required." });
    }

    if (!ALLOWED_RETURN_CONDITIONS.has(condition)) {
      return res.status(400).json({ error: "Unknown return condition." });
    }

    const { data: reservation, error } = await adminDb
      .from("reservations")
      .select("*")
      .eq("id", reservationId)
      .single();

    if (error || !reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    const deposit = Number(reservation.security_deposit_cents || 0);

    if (!Number.isFinite(refundAmountCents) || refundAmountCents < 0 || refundAmountCents > deposit) {
      return res.status(400).json({ error: "Refund amount must be between $0 and the collected security deposit." });
    }

    const { data: inspection, error: inspectionError } = await adminDb
      .from("rental_return_inspections")
      .insert({
        reservation_id: reservation.id,
        condition,
        notes: notes || null,
        photos,
        security_deposit_cents: deposit,
        refund_amount_cents: refundAmountCents,
        retained_amount_cents: Math.max(0, deposit - refundAmountCents),
      })
      .select("*")
      .single();

    if (inspectionError) throw inspectionError;

    let refund = null;

    if (refundAmountCents > 0) {
      if (!reservation.square_security_payment_id) {
        throw new Error("No Square security-deposit payment is linked.");
      }

      const data = await squareRequest("/v2/refunds", {
        method: "POST",
        body: {
          idempotency_key: `asg-return-${reservation.id}-${inspection.id}`.slice(0, 45),
          payment_id: reservation.square_security_payment_id,
          amount_money: { amount: refundAmountCents, currency: String(reservation.currency || "cad").toUpperCase() },
          reason: (
            condition === "excellent" || condition === "normal_wear"
              ? "Rental security deposit release"
              : `Rental deposit release after inspection: ${condition}`
          ).slice(0, 192),
        },
      });

      refund = data.refund;
    }

    await adminDb
      .from("rental_return_inspections")
      .update({
        square_refund_id: refund?.id || null,
        square_refund_status: refund?.status || (refundAmountCents === 0 ? "NO_REFUND" : null),
        completed_at: new Date().toISOString(),
      })
      .eq("id", inspection.id);

    await adminDb
      .from("reservations")
      .update({
        status: "returned",
        square_security_refund_id: refund?.id || reservation.square_security_refund_id || null,
        square_security_refund_status:
          refund?.status || (refundAmountCents === 0 ? "NO_REFUND" : reservation.square_security_refund_status),
        square_security_refund_cents: refundAmountCents,
        square_security_refund_requested_at: refundAmountCents > 0 ? new Date().toISOString() : null,
      })
      .eq("id", reservation.id);

    return res.status(200).json({
      ok: true,
      inspectionId: inspection.id,
      refundId: refund?.id || null,
      refundStatus: refund?.status || (refundAmountCents === 0 ? "NO_REFUND" : null),
      refundAmountCents,
      retainedAmountCents: Math.max(0, deposit - refundAmountCents),
    });
  } catch (error) {
    console.error("Admin Square return inspection error:", error);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Could not complete return inspection.",
      square: error.square || undefined,
    });
  }
}

// ---------------------------------------------------------------------
// resource=admin-reservations (GET/PUT) - Admin dashboard listing of every
// Square-provider reservation, and the one place staff can assign an exact
// pickup_at once a pickup time is actually scheduled with the customer.
// pickup_at drives the 24-hour balance/12-hour auto-cancel timing rules
// (see resource=timing below) - without it those rules silently skip the
// reservation.
// ---------------------------------------------------------------------
async function handleAdminReservations(req, res) {
  if (!requireAdmin(req, res)) return;

  const adminDb = adminSupabase();

  if (req.method === "GET") {
    try {
      const { data, error } = await adminDb
        .from("reservations")
        .select(
          "id,booking_number,status,contract_status,currency,pickup_date,drop_off_date,event_date,pickup_at,rental_total_cents,booking_deposit_cents,security_deposit_cents,balance_due_cents,square_invoice_status,square_invoice_url,square_balance_autopay,square_payment_failed,square_security_status,square_security_refund_status,square_security_refund_cents,square_security_payment_id,customers(name,email)"
        )
        .eq("payment_provider", "square")
        .order("pickup_date", { ascending: true, nullsFirst: false });

      if (error) throw error;

      return res.status(200).json({ reservations: data || [] });
    } catch (error) {
      console.error("Admin Square reservations list error:", error);
      return res.status(500).json({ error: error.message || "Could not load reservations." });
    }
  }

  if (req.method === "PUT") {
    try {
      const reservationId = Number(req.body?.reservationId);
      const pickupAtInput = req.body?.pickupAt;

      if (!Number.isFinite(reservationId)) {
        return res.status(400).json({ error: "reservationId is required." });
      }

      let pickupAt = null;
      if (pickupAtInput) {
        const parsed = new Date(pickupAtInput);
        if (Number.isNaN(parsed.getTime())) {
          return res.status(400).json({ error: "pickupAt is not a valid date/time." });
        }
        pickupAt = parsed.toISOString();
      }

      const { data, error } = await adminDb
        .from("reservations")
        .update({ pickup_at: pickupAt })
        .eq("id", reservationId)
        .eq("payment_provider", "square")
        .select("id,pickup_at")
        .single();

      if (error || !data) {
        return res.status(404).json({ error: "Reservation not found." });
      }

      return res.status(200).json({ ok: true, id: data.id, pickupAt: data.pickup_at });
    } catch (error) {
      console.error("Admin Square reservation pickup_at update error:", error);
      return res.status(500).json({ error: error.message || "Could not update pickup time." });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "Method not allowed" });
}

// ---------------------------------------------------------------------
// resource=timing (any method) - Phase 16-20 Step 18. Called every two
// hours by Supabase Cron (pg_cron + pg_net job "events-square-rental-timing"
// in the project database, not Vercel's own cron - Hobby plan only allows
// a daily schedule there), gated on CRON_SECRET rather than the admin
// passcode or a client session. Exact 24-hour/12-hour rules require
// reservations.pickup_at - a booking with only pickup_date is skipped
// rather than guessing a time.
// ---------------------------------------------------------------------
function cronAuthorized(req) {
  const auth = req.headers.authorization || "";
  return Boolean(process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`);
}

async function chargeAutoSecurityDeposit(reservation, customer) {
  if (reservation.square_security_payment_id) return;

  const amount = Number(reservation.security_deposit_cents || 0);
  if (amount <= 0) return;
  if (!customer?.square_card_on_file || !customer?.square_primary_card_id) return;

  const data = await squareRequest("/v2/payments", {
    method: "POST",
    body: {
      source_id: customer.square_primary_card_id,
      idempotency_key: `asg-auto-security-${reservation.id}`,
      amount_money: { amount, currency: String(reservation.currency || "cad").toUpperCase() },
      customer_id: customer.square_customer_id,
      location_id: squareLocationId(),
      reference_id: reservation.booking_number,
      note: `${reservation.booking_number} refundable security deposit`,
      autocomplete: true,
    },
  });

  const payment = data.payment;
  if (!payment?.id) return;

  await supabase
    .from("reservations")
    .update({
      square_security_payment_id: payment.id,
      square_security_status: payment.status || null,
      square_security_collected_at: payment.created_at || new Date().toISOString(),
    })
    .eq("id", reservation.id);
}

async function handleTiming(req, res) {
  if (!cronAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const now = new Date();

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select("*")
    .not("square_invoice_id", "is", null)
    .in("status", ["checkout_pending", "pending", "confirmed"]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const results = [];

  for (const reservation of reservations || []) {
    if (!reservation.pickup_at) {
      results.push({
        reservationId: reservation.id,
        skipped: true,
        reason: "pickup_at is not set; exact timing rules cannot be calculated.",
      });
      continue;
    }

    const pickupAt = new Date(reservation.pickup_at);
    const balanceDueAt = new Date(pickupAt.getTime() - 24 * 60 * 60 * 1000);
    const cancelAt = new Date(pickupAt.getTime() - 12 * 60 * 60 * 1000);

    await supabase
      .from("reservations")
      .update({ balance_due_at: balanceDueAt.toISOString(), auto_cancel_at: cancelAt.toISOString() })
      .eq("id", reservation.id);

    const { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("id", reservation.customer_id)
      .maybeSingle();

    const { data: tx } = await supabase
      .from("square_transactions")
      .select("kind,status,amount_cents")
      .eq("reservation_id", reservation.id);

    const paid = (kind) =>
      (tx || []).filter((row) => row.kind === kind && row.status === "paid").reduce((sum, row) => sum + Number(row.amount_cents || 0), 0);

    const balancePaid = paid("balance") >= Number(reservation.balance_due_cents || 0);

    // At the 24-hour mark, collect the separate refundable security deposit
    // if the customer explicitly saved a card.
    if (now >= balanceDueAt && !reservation.square_security_payment_id) {
      await chargeAutoSecurityDeposit(reservation, customer);
    }

    // At the 12-hour mark, do not hard-delete anything. Mark the reservation
    // payment_overdue so an exception/cash payment can still be handled.
    if (now >= cancelAt && !balancePaid && !["cancelled", "completed", "returned"].includes(reservation.status)) {
      await supabase.from("reservations").update({ status: "payment_overdue" }).eq("id", reservation.id);
    }

    results.push({
      reservationId: reservation.id,
      balanceDueAt: balanceDueAt.toISOString(),
      autoCancelAt: cancelAt.toISOString(),
      balancePaid,
    });
  }

  return res.status(200).json({ ok: true, checked: results.length, results });
}

// ---------------------------------------------------------------------
// resource=production-booking (POST) - Phase 16-20 Step 19. The live
// rental-checkout orchestrator UnifiedCartModal would call once patched
// per components/UnifiedCartSquarePatch.md. Not yet wired into the live
// Cart - see that same-named .md file (kept as reference, not copied into
// the app) for why that patch is being held for a deliberate go-ahead
// rather than applied automatically.
// ---------------------------------------------------------------------
function productionCents(value) {
  return Math.round(Number(value || 0) * 100);
}

function productionSecurityDepositFor(total) {
  if (total >= 100000) return 30000;
  if (total >= 75000) return 25000;
  if (total >= 50000) return 20000;
  if (total >= 30000) return 15000;
  if (total >= 15000) return 10000;
  if (total >= 5000) return 5000;
  return 0;
}

async function findOrCreateProductionCustomer(input) {
  const email = String(input?.email || "").trim().toLowerCase();
  const name = String(input?.name || "").trim();
  if (!email || !name) throw new Error("Name and email are required.");

  const { data: existing, error } = await supabase.from("customers").select("*").ilike("email", email).maybeSingle();

  if (error) throw error;
  if (existing) return existing;

  const { data, error: insertError } = await supabase.from("customers").insert({ name, email }).select("*").single();

  if (insertError) throw insertError;
  return data;
}

async function resolveProductionRentals(items) {
  const rentals = items.filter((row) => row?.kind === "rental");
  if (!rentals.length) throw new Error("No rental items were supplied.");

  const resolved = [];
  for (const line of rentals) {
    const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1));
    const { data: item, error } = await supabase
      .from("items")
      .select("id,name,rental_price,active")
      .eq("id", line.id)
      .eq("active", true)
      .single();

    if (error || !item) throw new Error("A rental item is no longer available.");

    resolved.push({ id: item.id, name: item.name, quantity, unitCents: productionCents(item.rental_price) });
  }
  return resolved;
}

async function productionAvailability(lines, pickup, dropoff) {
  for (const line of lines) {
    const { data, error } = await supabase.rpc("get_reservation_item_availability", {
      p_item_id: Number(line.id),
      p_pickup: pickup,
      p_dropoff: dropoff,
    });
    if (error) throw error;
    if (Number(data || 0) < line.quantity) {
      throw new Error(`${line.name} is no longer available for those dates.`);
    }
  }
}

const PRODUCTION_MIN_RENTAL_CENTS = 5000;

// Square rental bookings require a manual contract-attachment/publish step.
// Hold the requested rental inventory for six hours while the customer
// completes the contract and booking-deposit workflow.
const PRODUCTION_HOLD_HOURS = 6;

// The checkout UI only ever collects a pickup date, never a time of day, so
// rentalDates.pickupAt is never actually sent by a real customer. Falling
// back to null left every real booking silently skipped by the 24-hour
// balance/12-hour auto-cancel timing rules (see resource=timing), rather
// than running against a guessed time. Default to a placeholder pickup
// hour instead so the automation always has something to work with, and
// let staff correct it to the exact scheduled time via
// resource=admin-reservations once that's actually known.
const DEFAULT_PICKUP_HOUR = 9;

function defaultPickupAt(pickupDate) {
  if (!pickupDate) return null;

  const date = new Date(
    `${pickupDate}T${String(DEFAULT_PICKUP_HOUR).padStart(2, "0")}:00:00`
  );

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
}

async function handleProductionBooking(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let reservation = null;

  try {
    const { customer: input, rentalDates = {}, items = [] } = req.body || {};

    const purchaseItems = items.filter((row) => row?.kind !== "rental");
    if (purchaseItems.length) {
      return res.status(409).json({
        error: "During the Square rental cutover, rental bookings must be checked out separately from purchase items.",
        code: "SPLIT_CART_REQUIRED",
      });
    }

    if (!rentalDates.pickup || !rentalDates.dropoff || rentalDates.dropoff < rentalDates.pickup) {
      return res.status(400).json({ error: "Choose valid rental dates." });
    }

    const customer = await findOrCreateProductionCustomer(input);
    const lines = await resolveProductionRentals(items);
    const rentalSubtotalCents = lines.reduce((sum, line) => sum + line.unitCents * line.quantity, 0);

    if (rentalSubtotalCents < PRODUCTION_MIN_RENTAL_CENTS) {
      return res.status(400).json({ error: "Rental orders require a $50 minimum." });
    }

    await productionAvailability(lines, rentalDates.pickup, rentalDates.dropoff);

    const { data: bookingNumber, error: numberError } = await supabase.rpc("next_rental_reservation_number");
    if (numberError) throw numberError;

    const bookingDepositCents = Math.ceil(rentalSubtotalCents * 0.5);

    const { data: created, error: reservationError } = await supabase
      .from("reservations")
      .insert({
        customer_id: customer.id,
        source: "a_la_carte",
        booking_number: bookingNumber,
        status: "checkout_pending",
        pickup_date: rentalDates.pickup,
        drop_off_date: rentalDates.dropoff,
        event_date: rentalDates.event || rentalDates.pickup,
        pickup_at: rentalDates.pickupAt || defaultPickupAt(rentalDates.pickup),
        rental_subtotal_cents: rentalSubtotalCents,
        rental_total_cents: rentalSubtotalCents,
        total_price: rentalSubtotalCents / 100,
        booking_deposit_cents: bookingDepositCents,
        security_deposit_cents: productionSecurityDepositFor(rentalSubtotalCents),
        balance_due_cents: Math.max(0, rentalSubtotalCents - bookingDepositCents),
        currency: "cad",
        checkout_expires_at: new Date(Date.now() + PRODUCTION_HOLD_HOURS * 60 * 60 * 1000).toISOString(),
        payment_provider: "square",
      })
      .select("*")
      .single();

    if (reservationError) throw reservationError;
    reservation = created;

    const { error: itemsError } = await supabase.from("reservation_items").insert(
      lines.map((line) => ({
        reservation_id: reservation.id,
        item_id: Number(line.id),
        quantity: line.quantity,
        description: line.name,
        unit_price_cents: line.unitCents,
        line_total_cents: line.unitCents * line.quantity,
      }))
    );

    if (itemsError) throw itemsError;

    const squareCustomerId = await ensureSquareCustomer({ supabase, customer });
    const squareOrder = await createSquareRentalOrder({ reservation, rentalLines: lines, squareCustomerId });

    await supabase
      .from("reservations")
      .update({
        square_customer_id: squareCustomerId,
        square_order_id: squareOrder.id,
        square_order_version: squareOrder.version,
        square_order_state: squareOrder.state,
      })
      .eq("id", reservation.id);

    const invoice = await createSquareInvoiceDraft({
      reservation: { ...reservation, square_order_id: squareOrder.id, square_customer_id: squareCustomerId },
      squareCustomerId,
    });

    await supabase
      .from("reservations")
      .update({
        square_invoice_id: invoice.id,
        square_invoice_version: invoice.version ?? null,
        square_invoice_status: invoice.status || "DRAFT",
        square_invoice_url: invoice.public_url || null,
      })
      .eq("id", reservation.id);

    return res.status(200).json({
      ok: true,
      bookingNumber: reservation.booking_number,
      reservationId: reservation.id,
      contractPending: true,
      redirectUrl: `/checkout-success?square_pending=1&booking=${encodeURIComponent(reservation.booking_number)}`,
    });
  } catch (error) {
    console.error("Square production booking error:", error);

    if (reservation?.id) {
      await supabase.from("reservations").update({ status: "cancelled" }).eq("id", reservation.id);
    }

    return res.status(500).json({ error: error.message || "Could not create the Square booking." });
  }
}

const RESOURCE_HANDLERS = {
  health: handleHealth,
  booking: handleBooking,
  "invoice-draft": handleInvoiceDraft,
  "publish-invoice": handlePublishInvoice,
  "card-status": handleCardStatus,
  "balance-autopay": handleBalanceAutopay,
  "security-deposit": handleSecurityDeposit,
  contract: handleContract,
  portal: handlePortal,
  "portal-actions": handlePortalActions,
  "admin-return": handleAdminReturn,
  "admin-reservations": handleAdminReservations,
  timing: handleTiming,
  "production-booking": handleProductionBooking,
};

export default async function handler(req, res) {
  const resource = String(req.query?.resource || "");
  const resourceHandler = RESOURCE_HANDLERS[resource];
  if (!resourceHandler) return res.status(400).json({ error: "Unknown Square resource" });

  return resourceHandler(req, res);
}
