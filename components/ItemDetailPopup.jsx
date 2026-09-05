import React from "react";
import { X, Check } from "lucide-react";

function StatRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-[Jost] text-xs font-semibold text-[#4E5A44]">{label}:</span>
      <span className="font-[Jost] text-xs text-[#5C5645]">{value}</span>
    </div>
  );
}

function Stars({ energy }) {
  if (!energy) return null;
  const filled = Math.max(0, Math.min(5, energy));
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-[Jost] text-xs font-semibold text-[#4E5A44]">Energy:</span>
      <span className="text-sm tracking-[0.05em] text-[#B8935A]">
        {"★".repeat(filled)}
        {"☆".repeat(5 - filled)}
      </span>
    </div>
  );
}

function BulletList({ heading, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-7 rounded-xl bg-white p-4">
      <p className="font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-[#4E5A44]">{heading}</p>
      <ul className="mt-3 space-y-2.5">
        {items.map((line, i) => (
          <li key={i} className="flex items-start gap-2 font-[Jost] text-xs leading-5 text-[#5C5645]">
            <Check size={13} className="mt-0.5 flex-shrink-0" color="#B8935A" />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TextSection({ heading, text, emphasize }) {
  if (!text) return null;
  return (
    <div className="mt-7">
      <p className="font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-[#4E5A44]">{heading}</p>
      <p className={`mt-2 font-[Jost] leading-6 text-[#3A342A] ${emphasize ? "text-base font-semibold" : "text-sm"}`}>
        {text}
      </p>
    </div>
  );
}

// Visual, non-paragraph breakdown of a single package item: a stat block
// (Best For / Length / Guests / Creates a Keepsake / Energy stars), then a
// full What It Is / How It Works / What's Included / What Guests Do / What
// The Family Keeps / Personalization / Space Required / Approximate
// Duration / Optional Add-Ons write-up. Every section renders only when
// present, so older items that haven't been written up yet in this fuller
// format still fall back gracefully to whatever fields they do have.
export default function ItemDetailPopup({ name, tagline, details, onClose }) {
  const {
    stats,
    summary,
    whatItIs = summary,
    howItWorks,
    whatsIncluded,
    whatGuestsDo,
    whatTheFamilyKeeps,
    personalization,
    spaceRequired,
    approximateDuration,
    optionalAddOns,
    goodToKnow,
  } = details || {};

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

        {stats && (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-[#E4DCC8] pt-4">
            <StatRow label="Best for" value={stats.bestFor} />
            <StatRow label="Length" value={stats.length} />
            <StatRow label="Guests" value={stats.guests} />
            <StatRow label="Creates a keepsake" value={stats.createsKeepsake} />
            <Stars energy={stats.energy} />
          </div>
        )}

        <TextSection heading="WHAT IT IS" text={whatItIs} />

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

        <BulletList heading="WHAT'S INCLUDED" items={whatsIncluded} />
        <TextSection heading="WHAT GUESTS DO" text={whatGuestsDo} />
        <TextSection heading="WHAT THE FAMILY KEEPS" text={whatTheFamilyKeeps} emphasize />
        <BulletList heading="PERSONALIZATION" items={personalization} />
        <TextSection heading="SPACE REQUIRED" text={spaceRequired} />
        <TextSection heading="APPROXIMATE DURATION" text={approximateDuration} />
        <BulletList heading="OPTIONAL ADD-ONS" items={optionalAddOns} />
        <BulletList heading="GOOD TO KNOW" items={goodToKnow} />
      </div>
    </div>
  );
}
