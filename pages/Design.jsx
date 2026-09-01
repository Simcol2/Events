import React from "react";
import { ArrowRight, Check, Leaf } from "lucide-react";
import { usePalette } from "../PaletteContext";

function Divider({ gold }) {
  return (
    <div className="flex items-center gap-3 justify-center my-4">
      <span className="h-px w-10" style={{ background: gold }} />
      <Leaf size={14} color={gold} />
      <span className="h-px w-10" style={{ background: gold }} />
    </div>
  );
}

// This page is the one place on the site to pick a visual design/theme for
// your package. It's intentionally decoupled from the event-type selector
// (header bar): the event type shapes *what's included and how it reads*,
// this page shapes *what it looks like*.
export default function Design({ navigate }) {
  const { palette, paletteId, setPaletteId, palettes, fonts } = usePalette();

  return (
    <div className="min-h-screen" style={{ background: palette.bg, color: palette.ink }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <header className="text-center mb-14">
          <p
            className="text-xs tracking-[0.35em] font-medium"
            style={{ ...fonts.bodyFont, color: palette.gold }}
          >
            DESIGN OPTIONS
          </p>
          <h1
            className="text-6xl font-semibold tracking-tight -mt-1"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            Choose your look.
          </h1>
          <Divider gold={palette.gold} />
          <p
            className="mx-auto mt-4 max-w-xl text-sm leading-7"
            style={{ ...fonts.bodyFont, color: palette.muted }}
          >
            These are visual design themes for your package — colors, tone, and
            style. What's included in your package is decided by the type of
            event you're planning, not by the look you pick here. Choose a
            theme below to preview it across the whole site.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {palettes.map((p) => {
            const active = p.id === paletteId;
            return (
              <button
                key={p.id}
                onClick={() => setPaletteId(p.id)}
                className="text-left rounded-sm p-6 transition-all flex flex-col"
                style={{
                  background: palette.surface,
                  border: active ? `2px solid ${p.gold}` : `1px solid ${palette.line}`,
                }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-1.5">
                    {[p.primary, p.accent, p.gold, p.primaryDeep].map((hex, i) => (
                      <span
                        key={i}
                        className="w-6 h-6 rounded-full"
                        style={{ background: hex, border: "2px solid white", boxShadow: `0 0 0 1px ${palette.line}` }}
                      />
                    ))}
                  </div>
                  {active && (
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ background: p.gold }}
                    >
                      <Check size={14} color="#FFFFFF" />
                    </span>
                  )}
                </div>
                <h2
                  className="text-2xl font-semibold leading-tight"
                  style={{ ...fonts.displayFont, color: palette.primaryDeep }}
                >
                  {p.name}
                </h2>
                <p className="text-sm italic mt-3 flex-1" style={{ ...fonts.bodyFont, color: palette.muted }}>
                  {p.description}
                </p>
                <div
                  className="mt-6 flex items-center gap-2 text-[11px] font-semibold tracking-[0.15em]"
                  style={{ ...fonts.bodyFont, color: palette.primary }}
                >
                  {active ? "CURRENTLY APPLIED" : "PREVIEW THIS LOOK"}
                  {!active && <ArrowRight size={13} />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-sm mb-4" style={{ ...fonts.bodyFont, color: palette.muted }}>
            Ready to see what's included?
          </p>
          <button
            onClick={() => navigate("/package-builder")}
            className="px-7 py-3.5 text-[10px] font-semibold tracking-[0.2em] text-white"
            style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
          >
            BUILD YOUR PACKAGE
          </button>
        </div>
      </div>
    </div>
  );
}
