import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useEventDate } from "../EventDateContext";
import RentalCalendar from "./RentalCalendar";

const MAX_INCLUDED_DAYS = 3;

function addDays(isoDate, delta) {
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

function dayCount(pickup, dropoff) {
  const a = new Date(pickup + "T00:00:00");
  const b = new Date(dropoff + "T00:00:00");
  return Math.round((b - a) / 86400000) + 1;
}

const inputClass =
  "w-full rounded-sm border border-[#D8D0BC] bg-white px-3 py-2.5 font-[Jost] text-sm text-[#3A342A] outline-none focus:border-[#4E5A44]";

// Handles both the rental request flow (date range, live availability) and
// the purchase inquiry placeholder (no dates). Both write to the same
// item_requests table with a different request_type. This is the seam a
// real Square or Stripe checkout attaches to later - for now every request
// just gets recorded as "pending" for the business owner to follow up on.
export default function RentalRequestModal({ item, requestType, onClose }) {
  const { eventDate } = useEventDate();
  const isRental = requestType === "rental";

  const [pickup, setPickup] = useState(() => (isRental && eventDate ? addDays(eventDate, -1) : ""));
  const [dropoff, setDropoff] = useState(() => (isRental && eventDate ? addDays(eventDate, 1) : ""));
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const days = isRental && pickup && dropoff ? dayCount(pickup, dropoff) : 0;
  const overLimit = isRental && days > MAX_INCLUDED_DAYS;
  const datesValid = !isRental || (pickup && dropoff && dropoff >= pickup);

  useEffect(() => {
    if (!isRental || !datesValid || !supabase) {
      setAvailability(null);
      return;
    }
    let cancelled = false;
    setCheckingAvailability(true);
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc("get_item_availability", {
        p_item_id: item.id,
        p_pickup: pickup,
        p_dropoff: dropoff,
      });
      if (cancelled) return;
      setCheckingAvailability(false);
      if (!error) setAvailability(data);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRental, datesValid, pickup, dropoff, item.id]);

  const canSubmit =
    name.trim() && email.trim() && (!isRental || (datesValid && (availability ?? 0) > 0)) && !submitting;

  async function handleSubmit() {
    if (!supabase) {
      setSubmitError("The request form isn't connected yet. Please reach out directly for now.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    const payload = {
      item_id: item.id,
      request_type: requestType,
      quantity: 1,
      customer_name: name.trim(),
      customer_email: email.trim(),
      customer_phone: phone.trim() || null,
      ...(isRental
        ? { pickup_date: pickup, dropoff_date: dropoff, event_date: eventDate || null }
        : { pickup_date: null, dropoff_date: null, event_date: null }),
    };

    const { error } = await supabase.from("item_requests").insert(payload);
    setSubmitting(false);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    setSubmitted(true);
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(20,18,12,.72)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-label={isRental ? "Request to rent" : "Request to purchase"}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-[#FAF6ED] px-6 py-8 sm:px-8"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#A69C7E]"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        {submitted ? (
          <div className="pt-4 text-center">
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">
              Request received
            </h2>
            <p className="mx-auto mt-3 max-w-xs font-[Jost] text-sm leading-6 text-[#8C846F]">
              We will confirm {isRental ? "availability" : "details"} for {item.name} and follow up by email to arrange payment.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-[#4E5A44] py-3 font-[Jost] text-[11px] font-semibold tracking-[0.2em] text-white"
            >
              CLOSE
            </button>
          </div>
        ) : (
          <>
            <p className="font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-[#B8935A]">
              {isRental ? "REQUEST TO RENT" : "REQUEST TO PURCHASE"}
            </p>
            <h2 className="mt-1 font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">
              {item.name}
            </h2>

            {isRental && (
              <div className="mt-5 space-y-3">
                <p className="font-[Jost] text-[10px] tracking-[0.1em] text-[#8C846F]">
                  {pickup && dropoff ? `PICKUP ${pickup} · DROP-OFF ${dropoff}` : "SELECT PICKUP, THEN DROP-OFF"}
                </p>
                <RentalCalendar
                  itemId={item.id}
                  pickup={pickup}
                  dropoff={pickup === dropoff ? "" : dropoff}
                  onSelectRange={(p, d) => {
                    setPickup(p);
                    setDropoff(d);
                  }}
                />

                {overLimit && (
                  <p className="rounded-sm bg-[#FBF1E4] px-3 py-2 font-[Jost] text-xs leading-5 text-[#8A6B3A]">
                    Rentals longer than {MAX_INCLUDED_DAYS} days include an additional fee, we will follow up with the total.
                  </p>
                )}

                {!datesValid && (
                  <p className="font-[Jost] text-xs text-red-700">Drop-off must be on or after pickup.</p>
                )}

                {datesValid && (
                  <p className="font-[Jost] text-xs text-[#8C846F]">
                    {checkingAvailability
                      ? "Checking availability..."
                      : availability == null
                        ? ""
                        : availability > 0
                          ? `${availability} available for these dates`
                          : "Not available for these dates"}
                  </p>
                )}
              </div>
            )}

            <div className="mt-5 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={inputClass}
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (optional)"
                className={inputClass}
              />
            </div>

            {submitError && <p className="mt-3 font-[Jost] text-xs text-red-700">{submitError}</p>}

            <button
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="mt-5 w-full rounded-full bg-[#4E5A44] py-3 font-[Jost] text-[11px] font-semibold tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              {submitting ? "SENDING..." : isRental ? "REQUEST TO RENT" : "REQUEST TO PURCHASE"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
