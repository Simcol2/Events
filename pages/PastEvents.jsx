import React from "react";
import { ArrowRight, ImagePlus } from "lucide-react";
import { usePalette } from "../PaletteContext";
import SectionHeading from "../components/SectionHeading";

// Section 38: each past event is a mini before/during/after story, not a
// gallery of decor photos, proving the "guest interaction becomes a
// keepsake" concept in three beats. Photography for these is still being
// gathered - each beat uses the same "coming soon" placeholder look as the
// rest of the site until real photos are dropped in.
const STORIES = [
  {
    title: "A baby shower where everyone helped create baby's first story.",
    beats: [
      { label: "BEFORE", body: "An empty storybook waited for its first page." },
      { label: "DURING", body: "Guests each contributed a page: a doodle, a wish, a little piece of their imagination." },
      { label: "AFTER", body: "The finished storybook, ready for baby's nursery." },
    ],
  },
  {
    title: "An engagement party where every guest became part of the picture.",
    beats: [
      { label: "BEFORE", body: "An unassembled puzzle sat waiting near the guest book." },
      { label: "DURING", body: "Guests pieced it together throughout the celebration, one piece at a time." },
      { label: "AFTER", body: "The finished portrait, framed and hanging in their home." },
    ],
  },
  {
    title: "A milestone birthday time capsule filled by everyone who came.",
    beats: [
      { label: "BEFORE", body: "An empty capsule sat ready to be filled." },
      { label: "DURING", body: "Guests added messages, wishes, and photos throughout the party." },
      { label: "AFTER", body: "Sealed and ready to open again years from now." },
    ],
  },
];

export default function PastEvents({ navigate }) {
  const { palette, fonts } = usePalette();

  return (
    <div style={{ background: palette.bg, color: palette.ink }}>
      <section className="border-b" style={{ borderColor: palette.line }}>
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-20 sm:px-8">
          <SectionHeading
            eyebrow="THE PROOF"
            title="Real celebrations. Real memories."
            subtitle="Every event tells the same story: guests show up, guests participate, and the host keeps what everyone created together. Photos from recent celebrations are added here as they wrap up."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="space-y-20">
          {STORIES.map((story) => (
            <div key={story.title}>
              <h2 className="mb-6 text-2xl font-semibold sm:text-3xl" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                {story.title}
              </h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {story.beats.map((beat) => (
                  <div key={beat.label}>
                    <div
                      className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-sm"
                      style={{ background: `${palette.primary}0D`, border: `1.5px dashed ${palette.line}` }}
                    >
                      <ImagePlus size={20} color={palette.muted} />
                      <span className="px-4 text-center text-sm" style={{ ...fonts.bodyFont, color: palette.muted }}>
                        Photo coming soon
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold tracking-[0.2em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
                      {beat.label}
                    </p>
                    <p className="mt-1 text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
                      {beat.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center" style={{ borderTop: `1px solid ${palette.line}`, paddingTop: "40px" }}>
          <p className="text-base mb-5" style={{ ...fonts.bodyFont, color: palette.muted }}>
            Want your celebration featured here next?
          </p>
          <button
            onClick={() => navigate("/package-builder")}
            className="inline-flex items-center gap-3 px-7 py-3.5 text-xs font-semibold tracking-[0.2em] text-white"
            style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
          >
            BUILD MY EXPERIENCE <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
