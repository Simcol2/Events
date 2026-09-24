import React, { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../supabaseClient";

const inputClass =
  "w-full rounded-sm border border-[#D9D9D9] bg-white px-3 py-2.5 font-[Space_Grotesk] text-base text-[#292929] outline-none focus:border-[#0B4933]";

// The "Request the Thing" form under the Table Box builder: a customer
// describes something that isn't in the catalog at all (not an existing
// item's availability, which item_requests already covers), and the
// business owner decides whether it's worth sourcing and adding to the
// rental collection.
export default function SourcingRequestModal({ onClose }) {
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = description.trim() && email.trim() && !submitting;

  async function handleSubmit() {
    if (!supabase) {
      setSubmitError("The request form isn't connected yet. Please reach out directly for now.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    const { error } = await supabase.from("sourcing_requests").insert({
      description: description.trim(),
      reference: reference.trim() || null,
      event_date: eventDate || null,
      customer_email: email.trim(),
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
      aria-label="Request the thing"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-[#FFFFFF] px-6 py-8 sm:px-8"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#6B6B6B]"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        {submitted ? (
          <div className="pt-4 text-center">
            <h2 className="font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">Request sent</h2>
            <p className="mx-auto mt-3 max-w-xs font-[Space_Grotesk] text-base leading-6 text-[#8C846F]">
              I will take a look and email you to let you know if I can track it down.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-[#0B4933] py-3 font-[Space_Grotesk] text-sm font-semibold tracking-[0.2em] text-white"
            >
              CLOSE
            </button>
          </div>
        ) : (
          <>
            <p className="font-[Space_Grotesk] text-sm font-semibold tracking-[0.2em] text-[#8A6A1E]">
              REQUEST THE THING
            </p>
            <h2 className="mt-1 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">
              What are you looking for?
            </h2>

            <div className="mt-5 space-y-3">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you looking for?"
                rows={3}
                className={inputClass}
              />
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Add a photo or link"
                className={inputClass}
              />
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="Event date"
                aria-label="Event date"
                className={inputClass}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={inputClass}
              />
            </div>

            <p className="mt-4 font-[Space_Grotesk] text-sm leading-5 text-[#8C846F]">
              No promises on impossible internet objects, but I genuinely love hunting this stuff
              down.
            </p>

            {submitError && <p className="mt-3 font-[Space_Grotesk] text-sm text-red-700">{submitError}</p>}

            <button
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="mt-5 w-full rounded-full bg-[#0B4933] py-3 font-[Space_Grotesk] text-sm font-semibold tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              {submitting ? "SENDING..." : "SEND REQUEST"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
