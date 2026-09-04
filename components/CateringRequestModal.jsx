import React, { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../supabaseClient";

const inputClass =
  "w-full rounded-sm border border-[#D8D0BC] bg-white px-3 py-2.5 font-[Jost] text-sm text-[#3A342A] outline-none focus:border-[#4E5A44]";

// Bulk catering sizes don't have a fixed price (they're quoted per order),
// so there's no cart to add these to. This is the clickable seam instead:
// pick a size, submit your info, get a real quote back. Writes to
// catering_requests, a standalone table since these items don't live in
// the Supabase items catalog.
export default function CateringRequestModal({ itemName, sizes, initialSize, onClose }) {
  const [sizeLabel, setSizeLabel] = useState(initialSize || sizes[0]?.label || "");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim() && email.trim() && sizeLabel && !submitting;

  async function handleSubmit() {
    if (!supabase) {
      setSubmitError("The order form isn't connected yet. Please reach out directly for now.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    const { error } = await supabase.from("catering_requests").insert({
      item_name: itemName,
      size_label: sizeLabel,
      quantity,
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
      aria-label={`Order ${itemName}`}
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
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">Order received</h2>
            <p className="mx-auto mt-3 max-w-xs font-[Jost] text-sm leading-6 text-[#8C846F]">
              We'll follow up by email with pricing for {sizeLabel.toLowerCase()} of {itemName} and get your order confirmed.
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
            <p className="font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-[#B8935A]">ORDER YOUR CAKE</p>
            <h2 className="mt-1 font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">{itemName}</h2>

            <div className="mt-5 flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSizeLabel(s.label)}
                  className="rounded-full px-4 py-2 font-[Jost] text-xs font-semibold tracking-wide"
                  style={{
                    background: sizeLabel === s.label ? "#4E5A44" : "transparent",
                    color: sizeLabel === s.label ? "#FFFFFF" : "#4E5A44",
                    border: "1px solid #4E5A44",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <label className="font-[Jost] text-xs font-semibold tracking-[0.1em] text-[#4E5A44]">QUANTITY</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 rounded-sm border border-[#D8D0BC] bg-white px-3 py-2 font-[Jost] text-sm text-[#3A342A] outline-none focus:border-[#4E5A44]"
              />
            </div>

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
              {submitting ? "SENDING..." : "REQUEST TO ORDER"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
