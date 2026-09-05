import React from "react";
import { Sparkles } from "lucide-react";
import { usePalette } from "../PaletteContext";

// Section 40: personal and purposeful, explaining the belief behind the
// business rather than a company-history bio.
export default function About({ navigate }) {
  const { palette, fonts } = usePalette();

  return (
    <div className="min-h-screen" style={{ background: palette.bg, color: palette.ink }}>
      <div className="relative overflow-hidden px-6 py-20 text-center" style={{ background: palette.primaryDeep }}>
        <Sparkles className="absolute top-8 right-10 opacity-60" size={22} color={palette.gold} />
        <p className="text-xs font-semibold tracking-[0.3em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
          ABOUT
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl text-4xl sm:text-5xl font-bold leading-tight" style={{ ...fonts.displayFont, color: "#FFFFFF" }}>
          The best celebrations aren't just the ones that look beautiful.
          They're the ones people become part of.
        </h1>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <p className="text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
          A Slice of G Events started with a simple observation: the celebrations people remember longest aren't
          the ones with the most beautiful decor. They're the ones where guests actually did something together,
          where the room was full of people playing, writing, laughing, and creating side by side.
        </p>
        <p className="mt-5 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
          So we built a business around that idea. Every experience we design is meant to get your guests
          involved, not just seated. They play games that make them laugh. They write notes that become keepsakes.
          They assemble puzzles, fill time capsules, and leave pieces of themselves behind for you to keep.
        </p>
        <p className="mt-5 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
          <strong style={{ color: palette.primaryDeep }}>Your guests don't just attend. They leave something behind.</strong>{" "}
          That is the promise behind every experience we build, whether you're planning a baby shower, an
          engagement party, a birthday, or any celebration worth remembering.
        </p>
        <p className="mt-5 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
          You bring the people. We create the experience, and whether you choose Self Setup or bring in an Event
          Stylist to handle every detail, the outcome is the same: a celebration your guests actually took part
          in, and memories you get to keep long after it ends.
        </p>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("/package-builder")}
            className="inline-flex items-center gap-3 rounded-sm px-8 py-4 text-sm font-semibold tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
          >
            BUILD MY EXPERIENCE
          </button>
        </div>
      </div>
    </div>
  );
}
