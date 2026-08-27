import React from "react";
import { ImagePlus } from "lucide-react";
import { usePalette } from "../PaletteContext";

// Every package feature gets one of these. `photoKey` looks up
// palette.photos[photoKey] — once real photos are uploaded per palette,
// they'll appear automatically here with zero changes to this component.
export default function PhotoSlot({ photoKey, label, aspect = "aspect-[4/3]" }) {
  const { palette, fonts } = usePalette();
  const url = palette.photos?.[photoKey];

  if (url) {
    return (
      <div className={`w-full ${aspect} overflow-hidden rounded-sm`} style={{ border: `1px solid ${palette.line}` }}>
        <img src={url} alt={label} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`w-full ${aspect} flex flex-col items-center justify-center gap-1.5 rounded-sm`}
      style={{ background: `${palette.primary}0D`, border: `1.5px dashed ${palette.line}` }}
    >
      <ImagePlus size={20} color={palette.muted} />
      <span className="text-[10px] text-center px-3" style={{ ...fonts.bodyFont, color: palette.muted }}>
        Photo coming soon — {label}
      </span>
    </div>
  );
}
