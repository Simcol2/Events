import React, { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { useCart } from "../CartContext";
import RentalDateFields, { rentalDatesValid } from "./RentalDateFields";

// Collects the one pickup/event/return range that applies to every rental
// in the cart. Opened from the Decor page (first rental add, or "Change
// dates"), and writes straight into CartContext so the cart itself never
// needs to ask again.
export default function RentalDatesModal({ onClose, onSaved }) {
  const { rentalDates, setRentalDates } = useCart();
  const [draft, setDraft] = useState(rentalDates);

  const valid = rentalDatesValid(draft);

  const save = () => {
    if (!valid) return;
    setRentalDates(draft);
    onSaved?.(draft);
  };

  return (
    <div
      className="fixed inset-0 z-[190] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(20,18,12,.72)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Your rental dates"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#FCFBF7] px-6 py-8 sm:px-8"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#5A5F54]"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <CalendarDays size={22} strokeWidth={1.4} style={{ color: "#8A6A1E" }} />
        <h2 className="mt-4 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">
          When is your rental?
        </h2>
        <p className="mt-2 font-[Space_Grotesk] text-sm leading-6 text-[#8C846F]">
          These dates apply to everything you rent this visit, and we will check availability against
          them before anything is added.
        </p>

        <div className="mt-6">
          <RentalDateFields dates={draft} onChange={setDraft} />
        </div>

        <button
          disabled={!valid}
          onClick={save}
          className="mt-6 w-full rounded-full bg-[#0B4933] py-3 font-[Space_Grotesk] text-sm font-semibold tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          SAVE DATES
        </button>
      </div>
    </div>
  );
}
