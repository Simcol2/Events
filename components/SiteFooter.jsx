import React from "react";
import { usePalette } from "../PaletteContext";

export default function SiteFooter({ navigate }) {
  const { palette, fonts } = usePalette();

  return (
    <footer className="mt-24" style={{ borderTop: `1px solid ${palette.line}`, background: `${palette.primary}0D` }}>
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_.7fr_.7fr]">
          <div>
            <div className="text-xs font-semibold tracking-[0.4em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
              A SLICE OF G
            </div>
            <div className="mt-1 text-4xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
              EVENTS
            </div>
            <p className="mt-4 max-w-md text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Thoughtfully curated pieces, playful activities, and beautifully designed details for
              celebrations worth remembering.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-[0.22em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
              EXPLORE
            </div>
            <div className="mt-4 space-y-3 text-base" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
              <button onClick={() => navigate("/how-it-works")} className="block hover:opacity-70">How It Works</button>
              <button onClick={() => navigate("/decor")} className="block hover:opacity-70">Decor Collection</button>
              <button onClick={() => navigate("/gifts-activities")} className="block hover:opacity-70">Gifts & Activities</button>
              <button onClick={() => navigate("/catering")} className="block hover:opacity-70">Catering</button>
              <button onClick={() => navigate("/package-builder")} className="block hover:opacity-70">Build Your Package</button>
              <button onClick={() => navigate("/display-options")} className="block hover:opacity-70">Display Options</button>
              <button onClick={() => navigate("/past-events")} className="block hover:opacity-70">Past Events</button>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-[0.22em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
              THE IDEA
            </div>
            <p className="mt-4 text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
              You bring the people. We help create the vibe.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-5 text-xs tracking-[0.12em]" style={{ ...fonts.bodyFont, color: palette.muted, borderTop: `1px solid ${palette.line}` }}>
          © {new Date().getFullYear()} A Slice of G Events
        </div>
      </div>
    </footer>
  );
}
