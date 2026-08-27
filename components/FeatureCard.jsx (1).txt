import React from "react";
import { usePalette } from "../PaletteContext";
import PhotoSlot from "./PhotoSlot";

// Used for Essentials features, add-ons, and keepsakes alike. `priceLabel`
// is optional (e.g. "+$350" or "$10/guest") and renders as a badge next to
// the name when present.
export default function FeatureCard({ icon: Icon, name, tagline, description, photoKey, photoUrl, fit, priceLabel, selected, onClick }) {
  const { palette, fonts } = usePalette();
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={`text-left rounded-xl overflow-hidden shadow-sm flex flex-col w-full ${onClick ? "transition-all" : ""}`}
      style={{
        background: palette.surface,
        border: selected ? `2px solid ${palette.accent}` : `1px solid ${palette.line}`,
      }}
    >
      <PhotoSlot photoKey={photoKey} photoUrl={photoUrl} label={name} fit={fit} />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${palette.accent}1F` }}
            >
              <Icon size={18} color={palette.accent} strokeWidth={1.8} />
            </div>
            <h3 className="text-lg font-bold leading-tight" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
              {name}
            </h3>
          </div>
          {priceLabel && (
            <span className="text-sm font-bold flex-shrink-0" style={{ ...fonts.displayFont, color: palette.accent }}>
              {priceLabel}
            </span>
          )}
        </div>
        <p className="text-sm italic mb-2" style={{ ...fonts.bodyFont, color: palette.muted }}>
          {tagline}
        </p>
        <p className="text-sm leading-relaxed flex-1" style={{ ...fonts.bodyFont, color: palette.ink }}>
          {description}
        </p>
      </div>
    </Wrapper>
  );
}
