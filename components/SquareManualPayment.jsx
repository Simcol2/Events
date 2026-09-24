import React, { useCallback, useRef, useState } from "react";
import SquareCardPayment from "./SquareCardPayment";
import { API_BASE } from "../apiBase";

function money(cents, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: String(currency || "CAD").toUpperCase(),
  }).format(Number(cents || 0) / 100);
}

export default function SquareManualPayment({
  accessToken, reservationId, kind, amountCents, currency = "CAD",
  customerName = "", customerEmail = "", customerPhone = "", onPaid,
}) {
  const tokenizeRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);

  const handleReady = useCallback((tokenize) => {
    tokenizeRef.current = tokenize;
    setReady(Boolean(tokenize));
  }, []);

  async function pay() {
    if (!ready || !tokenizeRef.current || busy) return;
    setBusy(true);
    setError("");
    try {
      const paymentToken = await tokenizeRef.current();
      const response = await fetch(`${API_BASE}/square?resource=portal-manual-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reservationId, kind, paymentToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Payment could not be completed.");
      setPaid(true);
      onPaid?.(data);
    } catch (err) {
      setError(err.message || "Payment could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  const label = kind === "balance" ? "remaining rental balance" : "refundable security deposit";

  if (paid) {
    return (
      <div className="mt-4 rounded-xl border border-[#CFE3D7] bg-[#F1F8F4] p-4">
        <p className="font-[Space_Grotesk] text-sm font-semibold text-[#0B4933]">Payment received</p>
        <p className="mt-1 font-[Space_Grotesk] text-xs text-[#4E6B5C]">
          Your {label} is paid. Thank you.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-[#E7DFCE] bg-white p-4">
      <p className="font-[Space_Grotesk] text-sm font-semibold text-[#0B4933]">Pay {label}</p>
      <p className="mt-1 font-[Space_Grotesk] text-xs text-[#6F6859]">{money(amountCents, currency)} due</p>
      <div className="mt-4">
        <SquareCardPayment
          amountCents={amountCents}
          name={customerName}
          email={customerEmail}
          phone={customerPhone}
          saveCard={false}
          onReady={handleReady}
        />
      </div>
      {error && <p className="mt-3 font-[Space_Grotesk] text-xs text-red-700">{error}</p>}
      <button
        type="button"
        onClick={pay}
        disabled={!ready || busy}
        className="mt-4 w-full rounded-full bg-[#0B4933] px-5 py-3 font-[Space_Grotesk] text-xs font-semibold tracking-[0.1em] text-white disabled:opacity-50"
      >
        {busy ? "PROCESSING..." : `PAY ${money(amountCents, currency)}`}
      </button>
      <p className="mt-2 font-[Space_Grotesk] text-[11px] leading-5 text-[#8C846F]">
        This is a one-time payment. This card will not be saved for future automatic charges.
      </p>
    </div>
  );
}
