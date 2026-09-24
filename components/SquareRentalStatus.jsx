import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, CreditCard, ReceiptText } from "lucide-react";
import { API_BASE } from "../apiBase";
import SquareManualPayment from "./SquareManualPayment";

const money = (cents, currency = "CAD") =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: String(currency || "CAD").toUpperCase(),
  }).format(Number(cents || 0) / 100);

function dateLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

function dateTimeLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function Flag({ done, children }) {
  return (
    <div className="flex items-center gap-2 font-[Space_Grotesk] text-sm">
      {done ? (
        <CheckCircle2 size={16} className="text-[#17724F]" />
      ) : (
        <Circle size={16} className="text-[#C9C0AA]" />
      )}
      <span className={done ? "text-[#292929]" : "text-[#8C846F]"}>
        {children}
      </span>
    </div>
  );
}

function StatusCard({ label, done, children }) {
  return (
    <div className="rounded-lg border border-[#E7DFCE] bg-white p-3.5">
      <div className="flex items-center gap-2">
        {done ? (
          <CheckCircle2 size={15} className="text-[#17724F]" />
        ) : (
          <Circle size={15} className="text-[#C9C0AA]" />
        )}
        <p className="font-[Space_Grotesk] text-xs font-bold tracking-[0.1em] text-[#8A6A1E]">{label}</p>
      </div>
      <div className="mt-1.5 pl-6 font-[Space_Grotesk] text-sm leading-5 text-[#3E3A31]">{children}</div>
    </div>
  );
}

/**
 * Temporary migration component.
 *
 * Add inside ClientPortal while Stripe and Square coexist:
 *
 *   <SquareRentalStatus accessToken={session.access_token} />
 *
 * Once Square fully replaces Stripe, fold these states into the existing
 * Payments/Documents panels and remove the duplicate migration card.
 */
export default function SquareRentalStatus({ accessToken, customer }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((value) => value + 1);

  useEffect(() => {
    if (!accessToken) return;

    fetch(`${API_BASE}/square?resource=portal`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Could not load your booking status.");
        setData(payload);
      })
      .catch((err) => setError(err.message || "Could not load your booking status."));
  }, [accessToken, refreshKey]);

  const txByReservation = useMemo(() => {
    const map = new Map();
    for (const row of data?.transactions || []) {
      if (!map.has(row.reservation_id)) map.set(row.reservation_id, []);
      map.get(row.reservation_id).push(row);
    }
    return map;
  }, [data]);

  if (error) {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 font-[Space_Grotesk] text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (!data?.reservations?.length) return null;

  return (
    <section className="mt-6 rounded-2xl border border-[#E7DFCE] bg-[#FFFDF8] p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <CreditCard size={20} className="text-[#D9AE45]" />
        <h2 className="font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">
          Booking status
        </h2>
      </div>

      <div className="mt-5 space-y-5">
        {data.reservations.map((reservation) => {
          const tx = txByReservation.get(reservation.id) || [];
          const paid = (kind) =>
            tx
              .filter((row) => row.kind === kind && row.status === "paid")
              .reduce((sum, row) => sum + Number(row.amount_cents || 0), 0);

          const depositPaid =
            reservation.square_booking_deposit_status === "COMPLETED" ||
            paid("booking_deposit") >= Number(reservation.booking_deposit_cents || 0);
          const balanceDue = Number(reservation.balance_due_cents || 0);
          const balancePaid = balanceDue <= 0 || paid("balance") >= balanceDue;
          const securityDue = Number(reservation.security_deposit_cents || 0);
          const securityPaid = securityDue <= 0 || paid("security_deposit") >= securityDue;
          const securityReleased = reservation.square_security_refund_status === "COMPLETED";
          const cardOnFile = reservation.future_payment_method === "card_on_file";
          const manualPayment = reservation.future_payment_method === "manual";
          const contractSigned = reservation.contract_status === "signed";
          // Refundable money should not be held for months, so the manual
          // security-deposit form only opens shortly before pickup (the server
          // decides when and refuses earlier payments).
          const securityOpensAt = reservation.security_deposit_opens_at;
          const securityPayable = !securityOpensAt || Date.now() >= new Date(securityOpensAt).getTime();

          return (
            <div
              key={reservation.id}
              className="rounded-xl bg-[#F8F3E8] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-[Space_Grotesk] text-sm font-bold text-[#0B4933]">
                    {reservation.booking_number || `Booking ${reservation.id}`}
                  </p>
                </div>

                {reservation.square_invoice_url && (
                  <a
                    href={reservation.square_invoice_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#CFC5AE] bg-white px-4 py-2 font-[Space_Grotesk] text-xs font-semibold text-[#0B4933]"
                  >
                    <ReceiptText size={14} /> VIEW INVOICE
                  </a>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <StatusCard label="BOOKING DEPOSIT" done={depositPaid}>
                  {depositPaid ? "Paid at checkout." : "Not yet paid."}
                </StatusCard>

                <StatusCard label="REMAINING RENTAL BALANCE" done={balancePaid}>
                  {balancePaid ? (
                    "Paid."
                  ) : cardOnFile ? (
                    <>
                      {money(balanceDue, reservation.currency)} will be charged automatically 7 days before pickup.
                      {reservation.balance_due_at && (
                        <span className="mt-1 block text-xs text-[#8C846F]">
                          Due {dateLabel(reservation.balance_due_at)}.
                        </span>
                      )}
                    </>
                  ) : manualPayment ? (
                    <>
                      Manual payment selected.
                      <span className="mt-1 block">
                        {money(balanceDue, reservation.currency)} must be paid at least 7 days before pickup.
                      </span>
                      {reservation.balance_due_at && (
                        <span className="mt-1 block text-xs text-[#8C846F]">
                          Due {dateLabel(reservation.balance_due_at)}.
                        </span>
                      )}
                    </>
                  ) : (
                    "Collected closer to pickup."
                  )}
                </StatusCard>

                <StatusCard label="REFUNDABLE SECURITY DEPOSIT" done={securityPaid}>
                  {securityPaid ? (
                    "Collected."
                  ) : cardOnFile ? (
                    <>
                      {money(securityDue, reservation.currency)} will be charged automatically 48 hours before
                      pickup.
                      {reservation.security_deposit_due_at && (
                        <span className="mt-1 block text-xs text-[#8C846F]">
                          Due {dateLabel(reservation.security_deposit_due_at)}.
                        </span>
                      )}
                    </>
                  ) : manualPayment ? (
                    <>
                      Manual payment selected.
                      <span className="mt-1 block">
                        {money(securityDue, reservation.currency)} must be paid at least 48 hours before pickup.
                      </span>
                      {reservation.security_deposit_due_at && (
                        <span className="mt-1 block text-xs text-[#8C846F]">
                          Due {dateLabel(reservation.security_deposit_due_at)}.
                        </span>
                      )}
                      {!securityPayable && (
                        <span className="mt-1 block text-xs text-[#8C846F]">
                          You can pay this from {dateTimeLabel(securityOpensAt)}.
                        </span>
                      )}
                    </>
                  ) : (
                    "Collected closer to pickup."
                  )}
                </StatusCard>
              </div>

              {manualPayment && (
                <div className="mt-4 rounded-xl border border-[#E7D7AD] bg-[#FFFDF6] p-4">
                  <p className="font-[Space_Grotesk] text-sm font-semibold text-[#6B5517]">
                    Manual payment selected
                  </p>

                  <p className="mt-1 font-[Space_Grotesk] text-xs leading-5 text-[#6F6859]">
                    Your card is not being kept on file. Your remaining rental balance must be paid at least 7 days
                    before pickup, and your refundable security deposit must be paid at least 48 hours before
                    pickup. Required payments that are not received by their deadlines may result in cancellation
                    of the reservation.
                  </p>
                </div>
              )}

              {manualPayment && !balancePaid && (
                <SquareManualPayment
                  accessToken={accessToken}
                  reservationId={reservation.id}
                  kind="balance"
                  amountCents={Math.max(0, balanceDue - paid("balance"))}
                  currency={reservation.currency}
                  customerName={customer?.name || ""}
                  customerEmail={customer?.email || ""}
                  customerPhone={customer?.phone || ""}
                  onPaid={refresh}
                />
              )}

              {manualPayment && !securityPaid && securityPayable && (
                <SquareManualPayment
                  accessToken={accessToken}
                  reservationId={reservation.id}
                  kind="security_deposit"
                  amountCents={Math.max(0, securityDue - paid("security_deposit"))}
                  currency={reservation.currency}
                  customerName={customer?.name || ""}
                  customerEmail={customer?.email || ""}
                  customerPhone={customer?.phone || ""}
                  onPaid={refresh}
                />
              )}

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Flag done={depositPaid}>Booking deposit paid</Flag>
                <Flag done={contractSigned}>Rental agreement signed</Flag>
                {cardOnFile && <Flag done>Card saved for automatic payments</Flag>}
                {manualPayment && <Flag done>Manual payment selected</Flag>}
                <Flag done={balancePaid}>Remaining balance paid</Flag>
                <Flag done={securityPaid}>Security deposit collected</Flag>
              </div>

              {reservation.square_payment_failed && (
                <p className="mt-3 font-[Space_Grotesk] text-xs font-semibold text-red-700">
                  A scheduled payment needs attention.
                </p>
              )}

              {securityReleased && (
                <p className="mt-3 font-[Space_Grotesk] text-xs text-[#6B6B6B]">
                  Security deposit refund:{" "}
                  {money(
                    reservation.square_security_refund_cents,
                    reservation.currency
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
