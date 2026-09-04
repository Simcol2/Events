import React from "react";
import { usePalette } from "../PaletteContext";
import { CATERING_ITEMS, RUM_CAKE_STORY, ICING_OPTION, DIETARY_NOTE, ALCOHOL_NOTE } from "../cateringContent";

export default function Catering() {
  const { palette, fonts } = usePalette();

  return (
    <div className="min-h-screen" style={{ background: palette.bg, color: palette.ink }}>
      <div className="px-6 py-20 text-center" style={{ background: palette.primaryDeep }}>
        <p className="text-xs font-semibold tracking-[0.35em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
          A SLICE OF G EVENTS
        </p>
        <h1 className="mt-3 text-5xl sm:text-6xl font-bold" style={{ ...fonts.displayFont, color: "#FFFFFF" }}>
          Catering
        </h1>
        <p className="mt-3 mx-auto max-w-xl text-sm leading-relaxed" style={{ ...fonts.bodyFont, color: "#FFFFFFCC" }}>
          Desserts worth building a whole dessert table around.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16">
        <div className="mb-14 rounded-2xl p-8 text-center" style={{ background: palette.surface, border: `2px solid ${palette.accent}` }}>
          <h2 className="text-3xl font-bold mb-3" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
            {RUM_CAKE_STORY.heading}
          </h2>
          <p className="text-sm leading-relaxed max-w-2xl mx-auto" style={{ ...fonts.bodyFont, color: palette.ink }}>
            {RUM_CAKE_STORY.body}
          </p>
        </div>

        <div className="mb-14 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl p-5" style={{ background: palette.surface, border: `1px solid ${palette.line}` }}>
            <p className="text-xs font-semibold tracking-widest mb-2" style={{ ...fonts.bodyFont, color: palette.accent }}>
              DIETARY
            </p>
            <p className="text-sm leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>{DIETARY_NOTE}</p>
          </div>
          <div className="rounded-xl p-5" style={{ background: palette.surface, border: `1px solid ${palette.line}` }}>
            <p className="text-xs font-semibold tracking-widest mb-2" style={{ ...fonts.bodyFont, color: palette.accent }}>
              ABOUT THE RUM
            </p>
            <p className="text-sm leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>{ALCOHOL_NOTE}</p>
          </div>
        </div>

        <div className="space-y-10">
          {CATERING_ITEMS.map((item) => (
            <div key={item.id} className="rounded-2xl p-7" style={{ background: palette.surface, border: `1px solid ${palette.line}` }}>
              <h3 className="text-2xl font-bold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                {item.name}
              </h3>
              <p className="text-sm italic mt-1 mb-3" style={{ ...fonts.bodyFont, color: palette.accent }}>
                {item.tagline}
              </p>
              <p className="text-sm leading-relaxed mb-5" style={{ ...fonts.bodyFont, color: palette.ink }}>
                {item.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {item.sizes.map((s) => (
                  <span
                    key={s.label}
                    className="px-3 py-2 rounded-full text-xs font-semibold tracking-wide"
                    style={{ ...fonts.bodyFont, background: `${palette.accent}14`, color: palette.primaryDeep }}
                  >
                    {s.label}
                  </span>
                ))}
              </div>
              <p className="text-xs" style={{ ...fonts.bodyFont, color: palette.muted }}>{item.sizeNote}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl p-7 text-center" style={{ background: palette.surface, border: `1px solid ${palette.line}` }}>
          <h3 className="text-xl font-bold mb-2" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
            {ICING_OPTION.name}
          </h3>
          <p className="text-sm leading-relaxed max-w-2xl mx-auto" style={{ ...fonts.bodyFont, color: palette.ink }}>
            {ICING_OPTION.description}
          </p>
        </div>

        <p className="mt-10 text-center text-sm" style={{ ...fonts.bodyFont, color: palette.muted }}>
          Ready to order, or need pricing for a set size not listed here? Reach out and we'll get you sorted.
        </p>
      </div>
    </div>
  );
}
