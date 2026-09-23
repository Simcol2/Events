import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, CreditCard, ReceiptText } from "lucide-react";
import { API_BASE } from "../apiBase";

const money = (cents, currency = "CAD") =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: String(currency || "CAD").toUpperCase(),
  }).format(Number(cents || 0) / 100);

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
export default function SquareRentalStatus({ accessToken }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    fetch(`${API_BASE}/square?resource=portal`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Could not load Square status.");
        setData(payload);
      })
      .catch((err) => setError(err.message || "Could not load Square status."));
  }, [accessToken]);

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
          Square booking status
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
            paid("booking_deposit") >=
            Number(reservation.booking_deposit_cents || 0);
          const balancePaid =
            paid("balance") >= Number(reservation.balance_due_cents || 0);
          const securityPaid =
            paid("security_deposit") >=
            Number(reservation.security_deposit_cents || 0);
          const securityReleased =
            reservation.square_security_refund_status === "COMPLETED";

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
                  <p className="mt-1 font-[Space_Grotesk] text-xs text-[#7E7767]">
                    Square invoice: {reservation.square_invoice_status || "Not created"}
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

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Flag done={depositPaid}>Booking deposit paid</Flag>
                <Flag done={reservation.contract_status === "signed"}>
                  Rental agreement signed
                </Flag>
                <Flag done={balancePaid}>Remaining balance paid</Flag>
                <Flag done={reservation.square_balance_autopay}>
                  Balance auto-payment configured
                </Flag>
                <Flag done={securityPaid}>
                  Security deposit collected
                </Flag>
                <Flag done={securityReleased}>
                  Security deposit released
                </Flag>
              </div>

              {reservation.square_payment_failed && (
                <p className="mt-3 font-[Space_Grotesk] text-xs font-semibold text-red-700">
                  A scheduled Square payment needs attention.
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
