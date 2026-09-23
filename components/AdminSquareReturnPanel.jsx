import React, { useState } from "react";
import { API_BASE } from "../apiBase";

const moneyToCents = (value) =>
  Math.round(Math.max(0, Number(value || 0)) * 100);

export default function AdminSquareReturnPanel({
  reservation,
  adminPasscode,
  onComplete,
}) {
  const [condition, setCondition] = useState("normal_wear");
  const [refund, setRefund] = useState(
    ((Number(reservation?.security_deposit_cents || 0)) / 100).toFixed(2)
  );
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/square?resource=admin-return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": adminPasscode,
        },
        body: JSON.stringify({
          reservationId: reservation.id,
          condition,
          refundAmountCents: moneyToCents(refund),
          notes,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not complete return.");

      setMessage(
        data.refundAmountCents > 0
          ? "Return saved and Square refund requested."
          : "Return saved. No security-deposit refund was issued."
      );
      onComplete?.(data);
    } catch (error) {
      setMessage(error.message || "Could not complete return.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#E7DFCE] bg-white p-4">
      <h3 className="font-['Fraunces'] text-xl font-semibold text-[#0B4933]">
        Return inspection
      </h3>

      <div className="mt-4 grid gap-3">
        <label className="font-[Space_Grotesk] text-sm">
          Condition
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#D9D9D9] px-3 py-2"
          >
            <option value="excellent">Excellent</option>
            <option value="normal_wear">Normal wear</option>
            <option value="needs_cleaning">Needs cleaning</option>
            <option value="minor_damage">Minor damage</option>
            <option value="major_damage">Major damage</option>
            <option value="missing">Missing items</option>
          </select>
        </label>

        <label className="font-[Space_Grotesk] text-sm">
          Security deposit refund
          <input
            type="number"
            min="0"
            step="0.01"
            value={refund}
            onChange={(e) => setRefund(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#D9D9D9] px-3 py-2"
          />
        </label>

        <label className="font-[Space_Grotesk] text-sm">
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-[#D9D9D9] px-3 py-2"
          />
        </label>

        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="rounded-full bg-[#0B4933] px-5 py-3 font-[Space_Grotesk] text-xs font-semibold tracking-[0.12em] text-white disabled:opacity-50"
        >
          {busy ? "PROCESSING..." : "COMPLETE RETURN & PROCESS DEPOSIT"}
        </button>

        {message && (
          <p className="font-[Space_Grotesk] text-sm text-[#5C5645]">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
