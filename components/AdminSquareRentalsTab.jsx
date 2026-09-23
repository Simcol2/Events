import React, { useEffect, useState } from "react";
import { adminApi, getStoredPasscode } from "../adminApi";
import AdminSquareReturnPanel from "./AdminSquareReturnPanel";

const money = (cents, currency = "CAD") =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: String(currency || "CAD").toUpperCase(),
  }).format(Number(cents || 0) / 100);

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleString("en-CA", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

// <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" in local time, not
// an ISO string.
function toDateTimeLocalValue(isoValue) {
  if (!isoValue) return "";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function PickupTimeEditor({ reservation, onSaved }) {
  const [value, setValue] = useState(toDateTimeLocalValue(reservation.pickup_at));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const pickupAt = value ? new Date(value).toISOString() : null;
      await adminApi.updateSquareReservationPickup(reservation.id, pickupAt);
      onSaved(reservation.id, pickupAt);
    } catch (err) {
      setError(err.message || "Could not save pickup time.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-lg border border-[#D9D9D9] px-3 py-2 font-[Space_Grotesk] text-sm"
      />
      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="rounded-full bg-[#0B4933] px-4 py-2 font-[Space_Grotesk] text-xs font-semibold tracking-[0.1em] text-white disabled:opacity-50"
      >
        {busy ? "SAVING..." : "SAVE PICKUP TIME"}
      </button>
      {error && <span className="font-[Space_Grotesk] text-xs text-red-700">{error}</span>}
    </div>
  );
}

export default function AdminSquareRentalsTab() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returnOpenId, setReturnOpenId] = useState(null);
  const passcode = getStoredPasscode();

  const load = async () => {
    setLoading(true);
    try {
      setReservations(await adminApi.listSquareReservations());
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onPickupSaved = (id, pickupAt) => {
    setReservations((rows) => rows.map((row) => (row.id === id ? { ...row, pickup_at: pickupAt } : row)));
  };

  if (loading) return <p className="font-[Space_Grotesk] text-sm text-[#8C846F]">Loading Square rentals...</p>;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">Square Rentals</h2>
        <button
          onClick={load}
          className="font-[Space_Grotesk] text-[11px] font-semibold tracking-[0.1em] text-[#0B4933] underline underline-offset-4"
        >
          REFRESH
        </button>
      </div>

      {error && <p className="mb-4 font-[Space_Grotesk] text-sm text-red-700">{error}</p>}

      {!reservations.length && (
        <p className="font-[Space_Grotesk] text-sm text-[#8C846F]">
          No Square rental bookings yet. Live rental checkouts land here once a customer completes checkout.
        </p>
      )}

      <div className="space-y-3">
        {reservations.map((reservation) => {
          const customer = reservation.customers || {};
          const canReturn = reservation.status !== "returned" && Number(reservation.security_deposit_cents || 0) >= 0;

          return (
            <div key={reservation.id} className="rounded-sm border border-[#E6E6E6] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-[Space_Grotesk] text-sm font-semibold text-[#292929]">
                    {reservation.booking_number || `Booking ${reservation.id}`}
                    <span className="ml-2 font-normal text-[#8C846F]">
                      {customer.name || "Unknown"} · {customer.email || "no email"}
                    </span>
                  </p>
                  <p className="mt-1 font-[Space_Grotesk] text-xs text-[#8C846F]">
                    Status: {reservation.status || "pending"} · Contract: {reservation.contract_status || "pending"} ·
                    {" "}Square invoice: {reservation.square_invoice_status || "not created"}
                  </p>
                  <p className="mt-1 font-[Space_Grotesk] text-xs text-[#8C846F]">
                    Pickup {formatDate(reservation.pickup_date)} · Return {formatDate(reservation.drop_off_date)} · Event{" "}
                    {formatDate(reservation.event_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.1em] text-[#9A9A9A]">RENTAL</p>
                  <p className="font-['Fraunces'] text-lg font-semibold text-[#0B4933]">
                    {money(reservation.rental_total_cents, reservation.currency)}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-x-4 gap-y-1 border-t border-[#F0EBDD] pt-3 font-[Space_Grotesk] text-xs text-[#5C5645] sm:grid-cols-3">
                <span>Booking deposit: {money(reservation.booking_deposit_cents, reservation.currency)}</span>
                <span>Balance due: {money(reservation.balance_due_cents, reservation.currency)}</span>
                <span>Security deposit: {money(reservation.security_deposit_cents, reservation.currency)}</span>
              </div>

              {reservation.square_payment_failed && (
                <p className="mt-2 font-[Space_Grotesk] text-xs font-semibold text-red-700">
                  A scheduled Square payment needs attention.
                </p>
              )}

              {reservation.square_invoice_url && (
                <a
                  href={reservation.square_invoice_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block font-[Space_Grotesk] text-xs font-semibold text-[#0B4933] underline underline-offset-4"
                >
                  View Square invoice
                </a>
              )}

              <div className="mt-3 border-t border-[#F0EBDD] pt-3">
                <p className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.1em] text-[#8A6A1E]">
                  EXACT PICKUP TIME
                </p>
                <p className="mt-1 font-[Space_Grotesk] text-xs text-[#8C846F]">
                  Drives the 24-hour balance charge and 12-hour auto-cancel timing rules. Currently set to{" "}
                  {formatDateTime(reservation.pickup_at)}.
                </p>
                <PickupTimeEditor reservation={reservation} onSaved={onPickupSaved} />
              </div>

              {canReturn && (
                <div className="mt-3 border-t border-[#F0EBDD] pt-3">
                  <button
                    type="button"
                    onClick={() => setReturnOpenId(returnOpenId === reservation.id ? null : reservation.id)}
                    className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.1em] text-[#0B4933] underline underline-offset-4"
                  >
                    {returnOpenId === reservation.id ? "HIDE RETURN INSPECTION" : "PROCESS RETURN"}
                  </button>

                  {returnOpenId === reservation.id && (
                    <div className="mt-3">
                      <AdminSquareReturnPanel
                        reservation={reservation}
                        adminPasscode={passcode}
                        onComplete={() => {
                          setReturnOpenId(null);
                          load();
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
