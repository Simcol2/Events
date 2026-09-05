import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../supabaseClient";

const SAGE_DEEP = "#4E5A44";
const LINE = "#D8D0BC";
const MUTED = "#A69C7E";
const INK = "#3A342A";

function toISODate(y, m, d) {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

// Visual month-grid date-range picker. Booked-out and past days are
// disabled directly on the grid instead of relying on a customer to guess
// a date and get told after the fact. Availability per day comes from
// get_item_availability_calendar - the final go/no-go for the exact
// selected range still comes from get_item_availability in
// RentalRequestModal, this is just for what the grid shows as clickable.
export default function RentalCalendar({ itemId, pickup, dropoff, onSelectRange }) {
  const initial = pickup ? new Date(pickup + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);

  const { weeks, monthLabel, daysInMonth } = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const monthLabel = firstOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    return { weeks, monthLabel, daysInMonth };
  }, [viewYear, viewMonth]);

  useEffect(() => {
    if (!supabase || !itemId) return;
    let cancelled = false;
    setLoading(true);
    supabase
      .rpc("get_item_availability_calendar", {
        p_item_id: itemId,
        p_start: toISODate(viewYear, viewMonth, 1),
        p_end: toISODate(viewYear, viewMonth, daysInMonth),
      })
      .then(({ data, error }) => {
        if (cancelled) return;
        setLoading(false);
        if (error || !data) return;
        const map = {};
        data.forEach((row) => {
          map[row.day] = row.available;
        });
        setAvailability(map);
      });
    return () => {
      cancelled = true;
    };
  }, [itemId, viewYear, viewMonth, daysInMonth]);

  const changeMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isPast = (iso) => new Date(iso + "T00:00:00") < todayMidnight;

  const handleClick = (iso) => {
    if (!pickup || dropoff) {
      onSelectRange(iso, iso);
      return;
    }
    if (iso < pickup) {
      onSelectRange(iso, iso);
      return;
    }
    onSelectRange(pickup, iso);
  };

  return (
    <div className="rounded-sm border p-4" style={{ borderColor: LINE, background: "#FFFFFF" }}>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="rounded-full p-1.5 hover:bg-[#F3EEE0]"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} color={SAGE_DEEP} />
        </button>
        <span className="font-['Cormorant_Garamond'] text-base font-semibold" style={{ color: SAGE_DEEP }}>
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="rounded-full p-1.5 hover:bg-[#F3EEE0]"
          aria-label="Next month"
        >
          <ChevronRight size={16} color={SAGE_DEEP} />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="py-1 text-center font-[Jost] text-xs font-medium text-[#B0A98C]">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((d, i) => {
          if (d === null) return <div key={i} />;
          const iso = toISODate(viewYear, viewMonth, d);
          const past = isPast(iso);
          const booked = (availability[iso] ?? 1) <= 0;
          const disabled = past || booked;
          const inRange = pickup && dropoff && iso >= pickup && iso <= dropoff;
          const isEndpoint = iso === pickup || iso === dropoff;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(iso)}
              className="flex aspect-square items-center justify-center rounded-full font-[Jost] text-sm transition disabled:cursor-not-allowed"
              style={{
                background: isEndpoint ? SAGE_DEEP : inRange ? "#EDEFE6" : "transparent",
                color: isEndpoint ? "#FFFFFF" : disabled ? "#D8D2BE" : INK,
                textDecoration: booked && !past ? "line-through" : "none",
                fontWeight: isEndpoint ? 600 : 400,
              }}
            >
              {d}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-4 font-[Jost] text-xs" style={{ color: MUTED }}>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ border: "1px solid #D8D2BE" }} /> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: SAGE_DEEP }} /> Selected
        </span>
      </div>
      {loading && <p className="mt-2 font-[Jost] text-xs text-[#A69C7E]">Loading availability...</p>}
    </div>
  );
}
