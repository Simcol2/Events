import React from "react";
import { Sparkles } from "lucide-react";
import { usePalette } from "../PaletteContext";
import FeatureCard from "../components/FeatureCard";
import { DISPLAYS, DISPLAY_SETUP_OPTIONS } from "../packageContent";

export default function DisplayOptions({ navigate }) {
  const { palette, fonts } = usePalette();

  return (
    <div className="min-h-screen" style={{ background: palette.bg, color: palette.ink }}>
      <div className="relative overflow-hidden px-6 py-20 text-center" style={{ background: palette.primaryDeep }}>
        <Sparkles className="absolute top-8 right-10 opacity-60" size={22} color={palette.gold} />
        <Sparkles className="absolute bottom-8 left-10 opacity-40" size={16} color={palette.gold} />
        <p className="text-xs font-semibold tracking-[0.35em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
          A SLICE OF G EVENTS
        </p>
        <h1 className="mt-3 text-6xl sm:text-7xl font-bold" style={{ ...fonts.displayFont, color: palette.gold }}>
          Display Options
        </h1>
        <p className="mt-4 text-2xl sm:text-3xl" style={{ ...fonts.scriptFont, color: "#FFFFFF" }}>
          A backdrop worth remembering.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <p className="mx-auto mb-10 max-w-2xl text-center text-sm leading-relaxed" style={{ ...fonts.bodyFont, color: palette.muted }}>
          Displays aren't included in any package, they're always an add-on you choose when building your package.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          {DISPLAYS.map((d) => (
            <FeatureCard
              key={d.id}
              icon={d.icon}
              name={d.name}
              tagline={d.tagline}
              description={d.description}
            />
          ))}
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-2 text-center" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
            Setup Pricing
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-relaxed" style={{ ...fonts.bodyFont, color: palette.muted }}>
            Same price for either display above, based only on which setup option you choose.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {DISPLAY_SETUP_OPTIONS.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl p-6 shadow-sm"
                style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                    {s.label}
                  </h3>
                  <span className="text-lg font-bold" style={{ ...fonts.displayFont, color: palette.accent }}>
                    ${s.price}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
                  {s.description}
                </p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed" style={{ ...fonts.bodyFont, color: palette.muted }}>
            Self setup comes with easy to follow instructions, and all floral arrangements come already arranged.
            The light up display requires a nearby outlet, extension cords are included.
          </p>
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => navigate("/package-builder")}
            className="px-8 py-3 rounded-full text-xs font-semibold tracking-widest text-white"
            style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
          >
            BUILD YOUR PACKAGE
          </button>
        </div>
      </div>
    </div>
  );
}
