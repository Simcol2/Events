import React, { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useEventDate } from "../EventDateContext";

const inputClass =
  "w-full rounded-sm border border-[#D8D0BC] bg-white px-3 py-2.5 font-[Jost] text-base text-[#3A342A] outline-none focus:border-[#4E5A44]";

function LineRow({ label, price }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="font-[Jost] text-sm text-[#5C5645]">{label}</span>
      {price > 0 ? (
        <span className="font-[Jost] text-sm font-medium text-[#8C846F]">+${price.toLocaleString()}</span>
      ) : (
        <span className="font-[Jost] text-sm font-medium text-[#8C846F]">Included</span>
      )}
    </div>
  );
}

// Closes out the Package Builder wizard. Section 19 of the Master Plan: a
// full "Your Experience Is Ready" review before submission, so the
// customer never reaches this screen wondering what exactly they chose.
// Captures contact info and the running total, writes to package_requests,
// then the business owner follows up to confirm every pick against real
// availability and payment. HST is a presentational breakdown only - the
// stored `total` field is the same grand total shown here.
export default function PackageRequestModal({ total, subtotal, hst, summary, onClose }) {
  const { eventDate } = useEventDate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim() && email.trim() && !submitting;

  async function handleSubmit() {
    if (!supabase) {
      setSubmitError("The request form isn't connected yet. Please reach out directly for now.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    const { error } = await supabase.from("package_requests").insert({
      event_date: eventDate || null,
      total,
      customer_name: name.trim(),
      customer_email: email.trim(),
      customer_phone: phone.trim() || null,
    });

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
      aria-label="Your Experience is Ready"
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
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">Request received</h2>
            <p className="mx-auto mt-3 max-w-xs font-[Jost] text-base leading-6 text-[#8C846F]">
              We'll confirm availability for everything in your experience and follow up by email to arrange
              payment.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-[#4E5A44] py-3 font-[Jost] text-xs font-semibold tracking-[0.2em] text-white"
            >
              CLOSE
            </button>
          </div>
        ) : (
          <>
            <p className="font-[Jost] text-xs font-semibold tracking-[0.2em] text-[#B8935A]">YOUR EXPERIENCE IS READY</p>
            <h2 className="mt-1 font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">
              {summary?.eventTypeLabel}
            </h2>
            {eventDate && (
              <p className="mt-1 font-[Jost] text-sm text-[#8C846F]">For your event on {eventDate}</p>
            )}

            {summary && (
              <div className="mt-5 space-y-4 border-t border-[#E4DCC8] pt-4">
                <div>
                  <p className="font-[Jost] text-xs font-semibold tracking-[0.15em] text-[#4E5A44]">STARTING PRICE</p>
                  <LineRow label={summary.eventTypeLabel} price={summary.startingPrice} />
                </div>

                {summary.experiences?.length > 0 && (
                  <div>
                    <p className="font-[Jost] text-xs font-semibold tracking-[0.15em] text-[#4E5A44]">EXPERIENCES</p>
                    {summary.experiences.map((e) => (
                      <LineRow key={e.name} label={e.name} price={e.included ? 0 : e.price} />
                    ))}
                  </div>
                )}

                {summary.servingDish && (
                  <div>
                    <p className="font-[Jost] text-xs font-semibold tracking-[0.15em] text-[#4E5A44]">MAKE IT YOURS</p>
                    <LineRow label={summary.servingDish.name} price={summary.servingDish.price} />
                  </div>
                )}

                {summary.playful?.length > 0 && (
                  <div>
                    <p className="font-[Jost] text-xs font-semibold tracking-[0.15em] text-[#4E5A44]">PLAYFUL ADD-ONS</p>
                    {summary.playful.map((p) => (
                      <LineRow key={p.name} label={p.name} price={p.price} />
                    ))}
                  </div>
                )}

                {summary.guestGift && (
                  <div>
                    <p className="font-[Jost] text-xs font-semibold tracking-[0.15em] text-[#4E5A44]">GUEST GIFT</p>
                    <LineRow label={summary.guestGift.name} price={summary.guestGift.price} />
                  </div>
                )}

                {summary.addons?.length > 0 && (
                  <div>
                    <p className="font-[Jost] text-xs font-semibold tracking-[0.15em] text-[#4E5A44]">ADD-ONS</p>
                    {summary.addons.map((a) => (
                      <LineRow key={a.name} label={a.name} price={a.price} />
                    ))}
                  </div>
                )}

                {summary.serviceStyle && (
                  <div>
                    <p className="font-[Jost] text-xs font-semibold tracking-[0.15em] text-[#4E5A44]">SERVICE</p>
                    <LineRow label={summary.serviceStyle.name} price={summary.serviceStyle.price} />
                  </div>
                )}

                {summary.display && (
                  <div>
                    <p className="font-[Jost] text-xs font-semibold tracking-[0.15em] text-[#4E5A44]">MEMORY DISPLAY</p>
                    <LineRow
                      label={summary.display.setup ? `${summary.display.name} - ${summary.display.setup}` : summary.display.name}
                      price={summary.display.price}
                    />
                  </div>
                )}

                <div className="border-t border-[#E4DCC8] pt-3">
                  <div className="flex items-center justify-between font-[Jost] text-sm text-[#8C846F]">
                    <span>Subtotal</span>
                    <span>${subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between font-[Jost] text-sm text-[#8C846F]">
                    <span>HST (13%)</span>
                    <span>${hst?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between font-['Cormorant_Garamond'] text-xl font-semibold text-[#4E5A44]">
                    <span>Total</span>
                    <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-5 font-[Jost] text-sm leading-5 text-[#8C846F]">
              Submit your experience and we'll review the details and help you take the next step.
            </p>

            <div className="mt-4 space-y-3">
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

            {submitError && <p className="mt-3 font-[Jost] text-sm text-red-700">{submitError}</p>}

            <button
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="mt-5 w-full rounded-full bg-[#4E5A44] py-3 font-[Jost] text-xs font-semibold tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              {submitting ? "SENDING..." : "REQUEST MY EXPERIENCE"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
