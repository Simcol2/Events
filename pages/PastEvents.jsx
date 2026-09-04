import React from "react";
import { ArrowRight, ImagePlus } from "lucide-react";
import { usePalette } from "../PaletteContext";
import SectionHeading from "../components/SectionHeading";

// Placeholder gallery — real event photos get dropped in here later. Each
// tile mirrors PhotoSlot's "coming soon" look so the page feels intentional,
// not broken, until photos exist.
const PLACEHOLDER_COUNT = 6;

export default function PastEvents({ navigate }) {
  const { palette, fonts } = usePalette();

  return (
    <div style={{ background: palette.bg, color: palette.ink }}>
      <section className="border-b" style={{ borderColor: palette.line }}>
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-20 sm:px-8">
          <SectionHeading
            eyebrow="THE PROOF"
            title="Real celebrations. Real memories."
            subtitle="A look at the moments we've helped bring to life. Photos from recent events are added here as celebrations wrap up."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
            <div
              key={i}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-sm"
              style={{ background: `${palette.primary}0D`, border: `1.5px dashed ${palette.line}` }}
            >
              <ImagePlus size={22} color={palette.muted} />
              <span
                className="px-4 text-center text-xs"
                style={{ ...fonts.bodyFont, color: palette.muted }}
              >
                Event photos coming soon
              </span>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center" style={{ borderTop: `1px solid ${palette.line}`, paddingTop: "40px" }}>
          <p className="text-sm mb-5" style={{ ...fonts.bodyFont, color: palette.muted }}>
            Want your celebration featured here next?
          </p>
          <button
            onClick={() => navigate("/package-builder")}
            className="inline-flex items-center gap-3 px-7 py-3.5 text-[10px] font-semibold tracking-[0.2em] text-white"
            style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
          >
            BUILD MY EXPERIENCE <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
