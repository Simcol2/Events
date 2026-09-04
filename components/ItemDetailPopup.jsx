import React from "react";
import { X, Check } from "lucide-react";

// Visual, non-paragraph breakdown of a single package item: a short
// summary, a numbered "How It Works" walkthrough, and an optional "Good
// To Know" list. Placeholder content for now, written from what's already
// known about each item - gets replaced with the business owner's own
// comprehensive write-up per item later.
export default function ItemDetailPopup({ name, tagline, details, onClose }) {
  const { summary, howItWorks, goodToKnow } = details || {};

  return (
    <div
      className="fixed inset-0 z-[170] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(20,18,12,.72)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#FAF6ED] px-6 py-8 sm:px-8"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#A69C7E]"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        {tagline && (
          <p className="pr-10 font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-[#B8935A]">
            {tagline.toUpperCase()}
          </p>
        )}
        <h2 className="mt-1 font-['Cormorant_Garamond'] text-3xl font-semibold text-[#4E5A44]">{name}</h2>

        {summary && (
          <p className="mt-3 font-[Jost] text-sm leading-6 text-[#5C5645]">{summary}</p>
        )}

        {howItWorks && howItWorks.length > 0 && (
          <div className="mt-7">
            <p className="font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-[#4E5A44]">HOW IT WORKS</p>
            <div className="mt-4 space-y-4">
              {howItWorks.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#4E5A44] font-[Jost] text-[11px] font-semibold text-white">
                    {i + 1}
                  </span>
                  <p className="mt-0.5 font-[Jost] text-sm leading-5 text-[#3A342A]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {goodToKnow && goodToKnow.length > 0 && (
          <div className="mt-7 rounded-xl bg-white p-4">
            <p className="font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-[#4E5A44]">GOOD TO KNOW</p>
            <ul className="mt-3 space-y-2.5">
              {goodToKnow.map((line, i) => (
                <li key={i} className="flex items-start gap-2 font-[Jost] text-xs leading-5 text-[#5C5645]">
                  <Check size={13} className="mt-0.5 flex-shrink-0" color="#B8935A" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
