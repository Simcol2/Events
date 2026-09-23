import crypto from "crypto";
import { squareLocationId, squareRequest } from "./_squareRest.js";

function torontoDateToday() {
  // en-CA yields YYYY-MM-DD in current Node runtimes.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Square rejects an invoice_number containing the literal substring "-R-"
// ("Invoice number cannot contain -R-") - every booking_number this app
// generates is "ASG-R-<year>-<seq>", so every rental checkout was hitting
// this and failing before the customer could reach secure checkout.
// Strip just that substring for the Square-facing field; booking_number
// itself (shown everywhere else - portal, admin, emails) is unchanged.
function squareSafeInvoiceNumber(bookingNumber) {
  return String(bookingNumber || "").replace(/-R-/g, "-");
}

function previousCalendarDate(yyyyMmDd) {
  const [year, month, day] = String(yyyyMmDd).split("-").map(Number);
  if (!year || !month || !day) throw new Error("Invalid pickup date.");
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function invoiceScheduleForReservation(reservation) {
  if (!reservation?.pickup_date) throw new Error("Reservation has no pickup date.");

  return {
    depositDueDate: torontoDateToday(),
    balanceDueDate: previousCalendarDate(reservation.pickup_date),
  };
}

/**
 * Creates a DRAFT Square invoice only.
 *
 * Why draft? Square Contracts can be created/attached only in Square's own
 * Dashboard/Invoices UI. There is no public Contracts API. Keeping the invoice
 * draft lets the seller attach the rental agreement and enable "Require
 * unsigned contracts to be signed before payment" before publishing it.
 */
export async function createSquareInvoiceDraft({
  reservation,
  squareCustomerId,
}) {
  if (!reservation.square_order_id) {
    throw new Error("Reservation does not have a Square order yet.");
  }

  const { depositDueDate, balanceDueDate } =
    invoiceScheduleForReservation(reservation);

  const body = {
    idempotency_key: `asg-events-invoice-${reservation.id}`,
    invoice: {
      location_id: squareLocationId(),
      order_id: reservation.square_order_id,
      primary_recipient: {
        customer_id: squareCustomerId,
      },
      delivery_method: "EMAIL",
      invoice_number: squareSafeInvoiceNumber(reservation.booking_number),
      title: "A Slice of G Rental Booking",
      description:
        "Rental booking. Your booking deposit secures the reservation. " +
        "The remaining rental balance is due before pickup.",
      sale_or_service_date:
        reservation.event_date || reservation.pickup_date || undefined,
      accepted_payment_methods: {
        card: true,
        square_gift_card: false,
        bank_account: false,
        buy_now_pay_later: false,
        cash_app_pay: false,
      },

      // Step 10: Square's hosted invoice page offers an explicit buyer opt-in
      // checkbox to save their payment method to this Square customer profile.
      store_payment_method_enabled: true,

      payment_requests: [
        {
          request_type: "DEPOSIT",
          due_date: depositDueDate,
          percentage_requested: "50",
          automatic_payment_source: "NONE",
          reminders: [
            {
              relative_scheduled_days: 0,
              message: "Your 50% booking deposit is due today.",
            },
          ],
        },
        {
          request_type: "BALANCE",
          due_date: balanceDueDate,
          automatic_payment_source: "NONE",
          reminders: [
            {
              relative_scheduled_days: -3,
              message: "Your remaining rental balance is due soon.",
            },
            {
              relative_scheduled_days: -1,
              message: "Your remaining rental balance is due tomorrow.",
            },
          ],
        },
      ],
    },
  };

  const data = await squareRequest("/v2/invoices", {
    method: "POST",
    body,
  });

  if (!data.invoice?.id) {
    throw new Error("Square did not return an invoice ID.");
  }

  return data.invoice;
}

export async function publishSquareInvoice(invoiceId, version) {
  const data = await squareRequest(
    `/v2/invoices/${encodeURIComponent(invoiceId)}/publish`,
    {
      method: "POST",
      body: {
        version,
        idempotency_key: `asg-events-publish-${invoiceId}-${version}`,
      },
    }
  );

  if (!data.invoice?.id) {
    throw new Error("Square did not return the published invoice.");
  }

  return data.invoice;
}

export async function getSquareInvoice(invoiceId) {
  const data = await squareRequest(
    `/v2/invoices/${encodeURIComponent(invoiceId)}`
  );
  return data.invoice || null;
}

export async function listSquareCardsForCustomer(squareCustomerId) {
  const params = new URLSearchParams({
    customer_id: squareCustomerId,
    include_disabled: "false",
  });
  const data = await squareRequest(`/v2/cards?${params.toString()}`);
  return data.cards || [];
}
