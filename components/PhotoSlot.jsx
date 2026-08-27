import React from "react";
import { ImagePlus } from "lucide-react";
import { usePalette } from "../PaletteContext";

// `photoUrl` (a real imported image) takes priority when provided — that's
// how a confirmed asset like the arrival page screenshot gets used right
// away. Falls back to palette.photos[photoKey] for palette-specific photos
// once those exist, and to a placeholder otherwise.
export default function PhotoSlot({ photoKey, photoUrl, label, aspect = "aspect-[4/3]" }) {
  const { palette, fonts } = usePalette();
  const url = photoUrl || palette.photos?.[photoKey];

  if (url) {
    return (
      <div className={`w-full ${aspect} overflow-hidden`} style={{ borderBottom: `1px solid ${palette.line}` }}>
        <img src={url} alt={label} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`w-full ${aspect} flex flex-col items-center justify-center gap-1.5`}
      style={{ background: `${palette.primary}0D`, borderBottom: `1.5px dashed ${palette.line}` }}
    >
      <ImagePlus size={20} color={palette.muted} />
      <span className="text-xs text-center px-3" style={{ ...fonts.bodyFont, color: palette.muted }}>
        Photo coming soon
      </span>
    </div>
  );
}
