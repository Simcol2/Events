import React from "react";
import { Check } from "lucide-react";
import { usePalette } from "../PaletteContext";

// Meant to sit inside SiteHeader, at the very top of every page. Clicking a
// swatch repaints the whole site instantly via PaletteContext — no reload,
// no per-page logic needed elsewhere.
export default function PaletteToggle() {
  const { palette, paletteId, setPaletteId, palettes, fonts } = usePalette();

  return (
    <div
      className="w-full flex items-center justify-center gap-2 px-4 py-2 overflow-x-auto"
      style={{ background: palette.primaryDeep }}
    >
      <span
        className="text-[9px] font-semibold tracking-[0.25em] mr-2 flex-shrink-0"
        style={{ ...fonts.bodyFont, color: palette.gold }}
      >
        CHOOSE YOUR PALETTE
      </span>
      {palettes.map((p) => {
        const isActive = p.id === paletteId;
        return (
          <button
            key={p.id}
            onClick={() => setPaletteId(p.id)}
            title={p.name}
            className="flex-shrink-0 flex items-center justify-center rounded-full transition-all"
            style={{
              width: 26,
              height: 26,
              background: p.primary,
              border: isActive ? `2px solid ${p.gold}` : "2px solid rgba(255,255,255,0.3)",
              boxShadow: isActive ? `0 0 0 2px ${palette.primaryDeep}, 0 0 0 3px ${p.gold}` : "none",
            }}
          >
            {isActive && <Check size={12} color="#FFFFFF" />}
          </button>
        );
      })}
    </div>
  );
}
