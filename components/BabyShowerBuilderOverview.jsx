import React from "react";
import { ArrowRight, Check, Gift, Heart, Sparkles } from "lucide-react";

function PackagePiece({ number, title, description, options, icon: Icon, palette, fonts }) {
  return (
    <div
      className="relative rounded-[2rem] p-6 sm:p-7"
      style={{
        background: palette.surface,
        border: `1px solid ${palette.line}`,
      }}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{
          background: `${palette.accent}14`,
          color: palette.accent,
        }}
      >
        <Icon size={20} strokeWidth={1.8} />
      </div>

      <div
        className="mt-5 text-4xl font-semibold"
        style={{
          ...fonts.displayFont,
          color: palette.primaryDeep,
        }}
      >
        {number}
      </div>

      <h3
        className="mt-1 text-xl font-semibold"
        style={{
          ...fonts.displayFont,
          color: palette.primaryDeep,
        }}
      >
        {title}
      </h3>

      <p
        className="mt-2 text-sm leading-6"
        style={{
          ...fonts.bodyFont,
          color: palette.muted,
        }}
      >
        {description}
      </p>

      {options?.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t pt-4" style={{ borderColor: palette.line }}>
          {options.map((option) => (
            <li key={option} className="flex items-start gap-2 text-sm leading-5" style={{ ...fonts.bodyFont, color: palette.ink }}>
              <Check size={13} className="mt-1 flex-shrink-0" style={{ color: palette.accent }} />
              <span>{option}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function BabyShowerBuilderOverview({
  startingPrice = 1295,
  playConnectOptions = [],
  createKeepOptions = [],
  onStart,
  palette,
  fonts,
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:pb-24 lg:pt-16">
      <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div>
          <p
            className="text-xs font-bold tracking-[0.24em]"
            style={{
              ...fonts.bodyFont,
              color: palette.goldDeep,
            }}
          >
            BUILD YOUR BABY SHOWER EXPERIENCE
          </p>

          <h1
            className="mt-4 max-w-3xl"
            style={{
              ...fonts.displayFont,
              color: palette.primaryDeep,
              fontSize: "clamp(2.6rem, 6vw, 5rem)",
              lineHeight: 0.98,
              fontWeight: 650,
              letterSpacing: "-0.04em",
            }}
          >
            Five experiences.
            <br />
            One guest gift.
            <br />
            <span style={{ color: palette.accent }}>Built around your people.</span>
          </h1>

          <p
            className="mt-6 max-w-2xl text-base leading-7 sm:text-lg"
            style={{
              ...fonts.bodyFont,
              color: palette.muted,
            }}
          >
            Start with five interactive experiences: choose{" "}
            <strong style={{ color: palette.ink }}>2 ways to Play & Connect</strong> and{" "}
            <strong style={{ color: palette.ink }}>3 ways to Create & Keep</strong>. Then choose your included
            guest gift and personalize the celebration with displays, optional extras, or full-service styling.
          </p>

          <div className="mt-8 flex flex-wrap items-end gap-3">
            <div>
              <p
                className="text-xs font-bold tracking-[0.18em]"
                style={{
                  ...fonts.bodyFont,
                  color: palette.muted,
                }}
              >
                STARTING AT
              </p>

              <p
                style={{
                  ...fonts.displayFont,
                  color: palette.primaryDeep,
                  fontSize: "clamp(2.4rem, 5vw, 4rem)",
                  lineHeight: 1,
                  fontWeight: 650,
                }}
              >
                ${startingPrice.toLocaleString()}
              </p>
            </div>

            <p
              className="pb-1 text-sm"
              style={{
                ...fonts.bodyFont,
                color: palette.muted,
              }}
            >
              before optional upgrades
            </p>
          </div>

          <button
            type="button"
            onClick={onStart}
            className="mt-8 inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-bold tracking-[0.14em] text-white transition-transform hover:scale-[1.02]"
            style={{
              ...fonts.bodyFont,
              background: palette.primaryDeep,
            }}
          >
            START BUILDING
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <PackagePiece
            number="2"
            title="Play & Connect"
            description="Choose 2. Games and experiences that get people talking, laughing and joining in."
            options={playConnectOptions}
            icon={Sparkles}
            palette={palette}
            fonts={fonts}
          />

          <PackagePiece
            number="3"
            title="Create & Keep"
            description="Choose 3. Meaningful moments your guests help turn into something worth keeping."
            options={createKeepOptions}
            icon={Heart}
            palette={palette}
            fonts={fonts}
          />

          <PackagePiece
            number="1"
            title="Guest Gift"
            description="Ready to Pop is included, or choose an upgraded gift."
            icon={Gift}
            palette={palette}
            fonts={fonts}
          />
        </div>
      </div>

      <div
        className="mt-12 rounded-[1.75rem] p-6 sm:p-8"
        style={{
          background: `${palette.gold}10`,
          border: `1px solid ${palette.gold}45`,
        }}
      >
        <p
          className="text-xs font-bold tracking-[0.2em]"
          style={{
            ...fonts.bodyFont,
            color: palette.goldDeep,
          }}
        >
          YOUR STARTING PRICE INCLUDES
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "5 selected experiences",
            "1 included guest gift",
            "1 welcome sign",
            "1 gift table sign",
            "Custom preparation",
            "Activity materials & signage",
          ].map(
            (item) => (
              <div key={item} className="flex items-start gap-2.5">
                <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: palette.accent }} />
                <span
                  className="text-sm leading-6"
                  style={{
                    ...fonts.bodyFont,
                    color: palette.ink,
                  }}
                >
                  {item}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
