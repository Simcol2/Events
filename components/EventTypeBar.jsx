import React from "react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";

// Sits inside SiteHeader, at the very top of every page, replacing the old
// site-wide color-palette switcher. Theme/design selection now lives only on
// the Design page — this bar is purely about which event the visitor is
// planning, and is always changeable from here.
export default function EventTypeBar() {
  const { palette, fonts } = usePalette();
  const { eventType, openPicker } = useEventType();

  return (
    <div
      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-center"
      style={{ background: palette.primaryDeep }}
    >
      <span
        className="text-[10px] tracking-[0.15em]"
        style={{ ...fonts.bodyFont, color: "#FFFFFFCC" }}
      >
        PLANNING A <strong style={{ color: palette.gold }}>{eventType.shortLabel.toUpperCase()}</strong>?
      </span>
      <button
        onClick={openPicker}
        className="text-[10px] font-semibold tracking-[0.15em] underline underline-offset-4"
        style={{ ...fonts.bodyFont, color: "#FFFFFF" }}
      >
        CHANGE
      </button>
    </div>
  );
}
