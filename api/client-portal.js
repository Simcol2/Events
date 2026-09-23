import Stripe from "stripe";
import { handleApiError, requireClient } from "./_clientAuth.js";
import { BASE_PATH } from "./_basePath.js";
import { squareRequest } from "./_squareRest.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.stripe_secret);

const PAYMENT_LABELS = {
  booking_deposit: "Booking deposit",
  security_deposit: "Refundable security deposit",
  balance: "Remaining rental balance",
};

function sortNewest(rows, field = "created_at") {
  return [...(rows || [])].sort((a, b) => {
    const left = new Date(a?.[field] || 0).getTime();
    const right = new Date(b?.[field] || 0).getTime();
    return right - left;
  });
}

async function getPortalData(req, res) {
  const { supabase, user, customer } = await requireClient(req);

  await supabase.rpc("claim_my_records");
  await supabase.rpc("claim_my_purchases");

  const [reservationsResult, purchasesResult, requestsResult] = await Promise.all([
    supabase.from("reservations").select("*").eq("customer_id", customer.id).order("event_date", { ascending: false }),
    supabase.from("purchase_orders").select("*").eq("customer_id", customer.id).order("purchased_at", { ascending: false }),
    supabase.from("item_requests").select("*").eq("customer_id", customer.id).order("created_at", { ascending: false }),
  ]);

  if (reservationsResult.error) throw reservationsResult.error;
  if (purchasesResult.error) throw purchasesResult.error;
  if (requestsResult.error) throw requestsResult.error;

  const allReservations = reservationsResult.data || [];
  const reservationIds = allReservations.map((row) => row.id);
  const purchases = purchasesResult.data || [];
  const purchaseIds = purchases.map((row) => row.id);

  const [itemsResult, contractsResult, transactionsResult, squareTransactionsResult, purchaseItemsResult] = await Promise.all([
    reservationIds.length
      ? supabase.from("reservation_items").select("*").in("reservation_id", reservationIds)
      : Promise.resolve({ data: [], error: null }),
    reservationIds.length
      ? supabase.from("contracts").select("*").in("reservation_id", reservationIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("stripe_transactions")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false }),
    // Square-provider payments never land in stripe_transactions, so "was
    // anything ever paid on this reservation" has to check both ledgers -
    // otherwise a paid Square booking that got cancelled would look
    // indistinguishable from an abandoned, never-paid one below.
    supabase
      .from("square_transactions")
      .select("id,reservation_id,status")
      .eq("customer_id", customer.id)
      .eq("status", "paid"),
    purchaseIds.length
      ? supabase.from("purchase_order_items").select("*").in("purchase_order_id", purchaseIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (itemsResult.error) throw itemsResult.error;
  if (contractsResult.error) throw contractsResult.error;
  if (transactionsResult.error) throw transactionsResult.error;
  if (squareTransactionsResult.error) throw squareTransactionsResult.error;
  if (purchaseItemsResult.error) throw purchaseItemsResult.error;

  const paidReservationIds = new Set(
    [
      ...(transactionsResult.data || []).filter((row) => row.status === "paid"),
      ...(squareTransactionsResult.data || []),
    ]
      .map((row) => row.reservation_id)
      .filter(Boolean)
  );

  // A failed/abandoned checkout is not a booking - it should quietly
  // disappear rather than sit in the portal forever as a "permanent
  // monument to somebody clicking Back". Two cases get hidden entirely:
  // a cancelled reservation nobody ever paid a cent on, and a
  // checkout_pending hold whose window has expired without becoming a
  // real booking. A cancelled reservation that DID collect a payment is
  // kept (flagged via has_payment) so its receipt/refund record stays
  // reachable - the client renders those separately under Past/Cancelled.
  const now = Date.now();
  const visibleReservations = allReservations.filter((reservation) => {
    const hasPayment = paidReservationIds.has(reservation.id);
    if (reservation.status === "cancelled" && !hasPayment) return false;
    if (
      reservation.status === "checkout_pending" &&
      reservation.checkout_expires_at &&
      new Date(reservation.checkout_expires_at).getTime() < now
    ) {
      return false;
    }
    return true;
  });

  const reservationItems = itemsResult.data || [];
  const itemIds = [...new Set(reservationItems.map((row) => row.item_id).filter(Boolean))];

  let itemCatalog = [];
  if (itemIds.length) {
    const { data, error } = await supabase.from("items").select("id,name,photos").in("id", itemIds);
    if (error) throw error;
    itemCatalog = data || [];
  }

  const itemMap = new Map(itemCatalog.map((item) => [item.id, item]));
  const decoratedReservationItems = reservationItems.map((row) => ({
    ...row,
    item: itemMap.get(row.item_id) || null,
  }));

  const decoratedReservations = sortNewest(visibleReservations, "event_date").map((reservation) => ({
    ...reservation,
    has_payment: paidReservationIds.has(reservation.id),
  }));

  return res.status(200).json({
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email || user.email,
    },
    reservations: decoratedReservations,
    reservationItems: decoratedReservationItems,
    contracts: contractsResult.data || [],
    transactions: transactionsResult.data || [],
    purchases,
    purchaseItems: purchaseItemsResult.data || [],
    requests: requestsResult.data || [],
  });
}

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

async function createInvoice(req, res) {
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

  if (reservation.payment_provider === "square") {
    const error = new Error(
      "This booking is billed through Square, not Stripe. Use the Square invoice sent to your email, or the Square booking status section of your portal."
    );
    error.statusCode = 409;
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
}

const SELF_CANCEL_STATUSES = new Set(["checkout_pending", "pending"]);

// Lets a customer release their own reservation before any money has
// changed hands - no cancellation fee applies, so there is nothing for a
// human to adjudicate. Once a deposit is paid this path is gated off
// entirely and the normal cancellation policy takes over.
async function cancelReservation(req, res) {
  const { supabase, customer } = await requireClient(req);
  const reservationId = Number(req.body?.reservationId);

  if (!Number.isFinite(reservationId)) {
    const error = new Error("reservationId is required.");
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

  if (!SELF_CANCEL_STATUSES.has(reservation.status)) {
    const error = new Error("This booking can no longer be cancelled here. Contact us to cancel it.");
    error.statusCode = 409;
    throw error;
  }

  const [stripePaid, squarePaid] = await Promise.all([
    supabase.from("stripe_transactions").select("id").eq("reservation_id", reservation.id).eq("status", "paid").limit(1),
    supabase.from("square_transactions").select("id").eq("reservation_id", reservation.id).eq("status", "paid").limit(1),
  ]);

  if (stripePaid.error) throw stripePaid.error;
  if (squarePaid.error) throw squarePaid.error;

  if ((stripePaid.data || []).length || (squarePaid.data || []).length) {
    const error = new Error("A payment has already been made on this booking. Contact us to cancel it.");
    error.statusCode = 409;
    throw error;
  }

  // Cancel the Square draft/published invoice, if one was ever created, so
  // it can't be paid after the reservation is gone. Not fatal to the
  // customer's own cancellation if Square has already moved on (e.g. the
  // invoice was already canceled or deleted on the seller's side).
  if (reservation.square_invoice_id) {
    try {
      const current = await squareRequest(`/v2/invoices/${encodeURIComponent(reservation.square_invoice_id)}`);
      const version = current.invoice?.version;
      if (version != null) {
        await squareRequest(`/v2/invoices/${encodeURIComponent(reservation.square_invoice_id)}/cancel`, {
          method: "POST",
          body: { version },
        });
      }
    } catch (squareError) {
      console.error("Square invoice cancel failed during self-service cancellation:", squareError);
    }
  }

  // Same for any draft/open Stripe invoice on this reservation.
  const { data: openStripeInvoices, error: openStripeError } = await supabase
    .from("stripe_transactions")
    .select("*")
    .eq("reservation_id", reservation.id)
    .in("status", ["draft", "open"]);

  if (openStripeError) throw openStripeError;

  for (const row of openStripeInvoices || []) {
    if (!row.stripe_invoice_id) continue;
    try {
      if (row.status === "draft") await stripe.invoices.del(row.stripe_invoice_id);
      else await stripe.invoices.voidInvoice(row.stripe_invoice_id);
    } catch (stripeError) {
      console.error("Stripe invoice void failed during self-service cancellation:", stripeError);
    }
  }

  // Nothing separately tracks held inventory - availability is computed
  // live from reservation status (see get_reservation_item_availability),
  // so flipping status to cancelled releases the hold immediately on its
  // own; there is no additional release step to perform.
  const { error: updateError } = await supabase
    .from("reservations")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: "customer_before_payment",
    })
    .eq("id", reservation.id);

  if (updateError) throw updateError;

  return res.status(200).json({ ok: true });
}

async function createBillingPortalSession(req, res) {
  if (!process.env.STRIPE_SECRET_KEY && !process.env.stripe_secret) {
    throw new Error("Stripe is not configured on the server.");
  }

  const { supabase, customer } = await requireClient(req);

  const [{ data: reservation }, { data: purchase }] = await Promise.all([
    supabase
      .from("reservations")
      .select("stripe_customer_id")
      .eq("customer_id", customer.id)
      .not("stripe_customer_id", "is", null)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("purchase_orders")
      .select("stripe_customer_id")
      .eq("customer_id", customer.id)
      .not("stripe_customer_id", "is", null)
      .limit(1)
      .maybeSingle(),
  ]);

  let stripeCustomerId = reservation?.stripe_customer_id || purchase?.stripe_customer_id || null;

  if (!stripeCustomerId) {
    const existing = await stripe.customers.list({ email: customer.email, limit: 1 });
    stripeCustomerId = existing.data[0]?.id || null;
  }

  if (!stripeCustomerId) {
    const error = new Error("No Stripe billing history exists for this account yet.");
    error.statusCode = 404;
    throw error;
  }

  const origin = req.headers.origin || `https://${req.headers.host}`;
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${origin}${BASE_PATH}/client`,
  });

  return res.status(200).json({ url: session.url });
}

export default async function handler(req, res) {
  try {
    const action = String(req.query?.action || "");

    if (req.method === "GET" && !action) return await getPortalData(req, res);
    if (req.method === "POST" && action === "invoice") return await createInvoice(req, res);
    if (req.method === "POST" && action === "billing-portal") return await createBillingPortalSession(req, res);
    if (req.method === "POST" && action === "cancel-reservation") return await cancelReservation(req, res);

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return handleApiError(res, error);
  }
}
