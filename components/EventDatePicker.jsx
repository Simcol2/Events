import React, { useState } from "react";
import { X, CalendarDays } from "lucide-react";
import { useEventDate } from "../EventDateContext";

// Full-screen prompt asking for the visitor's event date, the first time
// they try to rent anything. See EventDateContext.requestEventDate - once
// answered, the date is remembered for every item rented afterward.
export default function EventDatePicker() {
  const { isPickerOpen, chooseEventDate, closePicker } = useEventDate();
  const [draft, setDraft] = useState("");

  if (!isPickerOpen) return null;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(20,18,12,.72)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="When is your event?"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-[#FAF6ED] px-6 py-8 text-center sm:px-8"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}
      >
        <button
          onClick={closePicker}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#A69C7E]"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <CalendarDays className="mx-auto" size={22} strokeWidth={1.4} style={{ color: "#B8935A" }} />
        <h2 className="mt-4 font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">
          When is your event?
        </h2>
        <p className="mx-auto mt-2 max-w-xs font-[Jost] text-sm leading-6 text-[#8C846F]">
          We use this to suggest pickup and drop-off dates for anything you rent. You can adjust those later.
        </p>

        <input
          type="date"
          min={today}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="mt-6 w-full rounded-sm border border-[#D8D0BC] bg-white px-4 py-3 font-[Jost] text-sm text-[#3A342A] outline-none focus:border-[#4E5A44]"
        />

        <button
          disabled={!draft}
          onClick={() => chooseEventDate(draft)}
          className="mt-5 w-full rounded-full bg-[#4E5A44] py-3 font-[Jost] text-[11px] font-semibold tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
