import React from "react";

export function rentalDatesValid(dates) {
  const ok = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || "");
  return ok(dates?.pickup) && ok(dates?.dropoff) && dates.dropoff >= dates.pickup;
}

// Shared pickup/event/return inputs so the Decor page and the cart collect
// rental dates in exactly the same shape (CartContext.rentalDates), rather
// than each screen inventing its own date fields.
export default function RentalDateFields({ dates, onChange }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.08em] text-[#5C5645]">
        PICKUP
        <input
          type="date"
          min={today}
          value={dates.pickup}
          onChange={(e) => onChange({ ...dates, pickup: e.target.value })}
          className="mt-1 w-full rounded-sm border border-[#D8D0BC] bg-white px-3 py-2.5 text-sm text-[#12201A]"
        />
      </label>
      <label className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.08em] text-[#5C5645]">
        EVENT
        <input
          type="date"
          min={dates.pickup || today}
          value={dates.event}
          onChange={(e) => onChange({ ...dates, event: e.target.value })}
          className="mt-1 w-full rounded-sm border border-[#D8D0BC] bg-white px-3 py-2.5 text-sm text-[#12201A]"
        />
      </label>
      <label className="font-[Space_Grotesk] text-xs font-semibold tracking-[0.08em] text-[#5C5645]">
        RETURN
        <input
          type="date"
          min={dates.event || dates.pickup || today}
          value={dates.dropoff}
          onChange={(e) => onChange({ ...dates, dropoff: e.target.value })}
          className="mt-1 w-full rounded-sm border border-[#D8D0BC] bg-white px-3 py-2.5 text-sm text-[#12201A]"
        />
      </label>
    </div>
  );
}
