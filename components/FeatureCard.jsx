import React, { useState } from "react";
import { usePalette } from "../PaletteContext";
import PhotoSlot from "./PhotoSlot";
import ItemDetailPopup from "./ItemDetailPopup";

function CardStats({ stats, palette, fonts }) {
  if (!stats) return null;
  const rows = [
    ["Best for", stats.bestFor],
    ["Length", stats.length],
    ["Guests", stats.guests],
    ["Creates a keepsake", stats.createsKeepsake],
  ].filter(([, value]) => value);

  return (
    <div className="mb-2 space-y-0.5" style={{ ...fonts.bodyFont }}>
      {rows.map(([label, value]) => (
        <p key={label} className="text-xs sm:text-sm">
          <span className="font-semibold" style={{ color: palette.primaryDeep }}>{label}:</span>{" "}
          <span style={{ color: palette.muted }}>{value}</span>
        </p>
      ))}
      {stats.energy > 0 && (
        <p className="text-xs sm:text-sm">
          <span className="font-semibold" style={{ color: palette.primaryDeep }}>Energy:</span>{" "}
          <span style={{ color: palette.accent, letterSpacing: "0.05em" }}>
            {"★".repeat(Math.max(0, Math.min(5, stats.energy)))}
            {"☆".repeat(5 - Math.max(0, Math.min(5, stats.energy)))}
          </span>
        </p>
      )}
    </div>
  );
}

// Used for Essentials features, add-ons, and keepsakes alike. `priceLabel`
// is optional (e.g. "+$350" or "$10/guest") and renders as a badge next to
// the name when present. `details`, when passed, adds a "View More" (or
// custom `viewMoreLabel`) button that opens a popup with a fuller
// breakdown - kept as a real nested <button>, so the card itself is a
// styled <div> with button-like keyboard behavior rather than an actual
// <button>, since a button can't contain another button.
export default function FeatureCard({
  icon: Icon,
  name,
  tagline,
  description,
  photoKey,
  photoUrl,
  photoUrls,
  fit,
  priceLabel,
  badge,
  selected,
  onClick,
  details,
  viewMoreLabel = "VIEW MORE",
}) {
  const { palette, fonts } = usePalette();
  const [showDetail, setShowDetail] = useState(false);
  const clickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`text-left rounded-xl overflow-hidden shadow-sm flex flex-col w-full ${clickable ? "cursor-pointer transition-all" : ""}`}
      style={{
        background: palette.surface,
        border: selected ? `2px solid ${palette.accent}` : `1px solid ${palette.line}`,
      }}
    >
      <PhotoSlot photoKey={photoKey} photoUrl={photoUrl} photoUrls={photoUrls} label={name} fit={fit} />
      <div className="p-3.5 flex-1 flex flex-col sm:p-5">
        {badge && <div className="mb-2">{badge}</div>}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 sm:h-9 sm:w-9"
              style={{ background: `${palette.accent}1F` }}
            >
              <Icon size={15} color={palette.accent} strokeWidth={1.8} className="sm:hidden" />
              <Icon size={18} color={palette.accent} strokeWidth={1.8} className="hidden sm:block" />
            </div>
            <h3 className="text-base font-bold leading-tight sm:text-lg" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
              {name}
            </h3>
          </div>
          {priceLabel && (
            <span className="text-sm font-bold flex-shrink-0 sm:text-base" style={{ ...fonts.displayFont, color: palette.accent }}>
              {priceLabel}
            </span>
          )}
        </div>
        <p className="text-sm italic mb-2 sm:text-base" style={{ ...fonts.bodyFont, color: palette.muted }}>
          {tagline}
        </p>
        <p className="text-sm leading-relaxed flex-1 sm:text-base" style={{ ...fonts.bodyFont, color: palette.ink }}>
          {description}
        </p>
        <CardStats stats={details?.stats} palette={palette} fonts={fonts} />
        {details && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetail(true);
            }}
            className="mt-3 self-start text-xs font-semibold tracking-[0.08em] underline underline-offset-4 sm:text-sm"
            style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
          >
            {viewMoreLabel}
          </button>
        )}
      </div>

      {showDetail && (
        <ItemDetailPopup name={name} tagline={tagline} details={details} onClose={() => setShowDetail(false)} />
      )}
    </div>
  );
}
