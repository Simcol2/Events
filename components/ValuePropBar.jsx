import React from "react";
import { usePalette } from "../PaletteContext";

// Sits just below the sticky header on every page (not part of the sticky
// unit itself, so it scrolls away normally). States the two-part model in
// as few words as possible: interactive, guest-facing pieces that are also
// keepsakes — the site's actual differentiator, not "activities" (too
// school-project) and not vague "rental" language.
export default function ValuePropBar() {
  const { palette, fonts } = usePalette();

  return (
    <div
      className="w-full text-center px-4 py-2.5"
      style={{ background: palette.surface, borderBottom: `1px solid ${palette.line}` }}
    >
      <span
        className="text-xs sm:text-xs font-semibold tracking-[0.18em]"
        style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
      >
        INTERACTIVE GUEST EXPERIENCES
      </span>
      <span className="mx-3 align-middle" style={{ color: palette.gold }}>
        &middot;
      </span>
      <span
        className="text-xs sm:text-xs font-semibold tracking-[0.18em]"
        style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
      >
        CUSTOM KEEPSAKES
      </span>
    </div>
  );
}
