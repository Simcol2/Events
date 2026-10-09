import React from "react";
import { usePalette } from "../PaletteContext";
import { SERVICE_AREA_SHORT } from "../seo";

// Sits just below the sticky header on every page (not part of the sticky
// unit itself, so it scrolls away normally). States the two-part model in
// as few words as possible: interactive, guest-facing pieces that are also
// keepsakes — the site's actual differentiator, not "activities" (too
// school-project) and not vague "rental" language.
//
// Scrolls right to left continuously (see .marquee-track in SRC/index.css).
// The message is rendered twice back to back inside a track twice as wide
// as the viewport, then animated from translateX(0) to translateX(-50%) -
// since the two copies are identical, the loop point is invisible and the
// scroll reads as endless rather than a jarring reset.
function Message({ palette, fonts, light = false }) {
  return (
    <span className="mx-6 inline-flex items-center whitespace-nowrap">
      <span
        className="text-sm font-semibold tracking-[0.18em]"
        style={{ ...fonts.bodyFont, color: light ? "#FFF9EF" : palette.primaryDeep }}
      >
        INTERACTIVE GUEST EXPERIENCES
      </span>
      <span className="mx-3" style={{ color: palette.goldDeep }}>
        &middot;
      </span>
      <span
        className="text-sm font-semibold tracking-[0.18em]"
        style={{ ...fonts.bodyFont, color: light ? "#FFF9EF" : palette.primaryDeep }}
      >
        CUSTOM KEEPSAKES
      </span>
      <span className="mx-3" style={{ color: palette.goldDeep }}>
        &middot;
      </span>
      {/* The service area belongs in the one strip that appears on every
          page. A visitor should never have to hunt for whether we come to
          them, and a crawler should see the same answer on every URL. */}
      <span
        className="text-sm font-semibold tracking-[0.18em]"
        style={{ ...fonts.bodyFont, color: light ? "#FFF9EF" : palette.primaryDeep }}
      >
        RENTALS ACROSS {SERVICE_AREA_SHORT.toUpperCase()}
      </span>
    </span>
  );
}

export default function ValuePropBar({ integrated = false }) {
  // ASG_TABLE_BOX_HERO_NAV_GLASS_V1
  const { palette, fonts } = usePalette();

  return (
    <div
      className="relative z-10 w-full overflow-hidden py-2.5"
      style={integrated ? { background: "linear-gradient(100deg, #083D2E 0%, #0C553E 55%, #083D2E 100%)", borderBottom: "1px solid rgba(213,175,90,.42)" } : { background: palette.surface, borderBottom: `1px solid ${palette.line}` }}
    >
      <div className="marquee-track flex w-max">
        <Message palette={palette} fonts={fonts} light={integrated} />
        <Message palette={palette} fonts={fonts} light={integrated} />
      </div>
    </div>
  );
}
