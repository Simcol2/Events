import React from "react";
import { ImagePlus } from "lucide-react";
import { usePalette } from "../PaletteContext";

// `photoUrl` (a real imported image) takes priority when provided â€” that's
// how a confirmed asset like the arrival page screenshot gets used right
// away. Falls back to palette.photos[photoKey] for palette-specific photos
// once those exist, and to a placeholder otherwise. `fit` defaults to
// "cover" (crops to fill the frame) but pass "contain" for photos, like
// screenshots, where the whole image needs to stay visible uncropped.
export default function PhotoSlot({ photoKey, photoUrl, label, aspect = "aspect-[4/3]", fit = "cover" }) {
  const { palette, fonts } = usePalette();
  const url = photoUrl || palette.photos?.[photoKey];

  if (url) {
    return (
      <div
        className={`w-full ${aspect} overflow-hidden flex items-center justify-center`}
        style={{ borderBottom: `1px solid ${palette.line}`, background: fit === "contain" ? `${palette.primary}0D` : "transparent" }}
      >
        <img
          src={url}
          alt={label}
          className={`w-full h-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
        />
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
