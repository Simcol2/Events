import React from "react";
import { Check, Sparkles } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import FeatureCard from "../components/FeatureCard";
import { DISPLAYS, DISPLAY_PRICING_TIERS } from "../packageContent";
import {
  ElevatedCard,
  JewelBand,
  PageHero,
  PrimaryButton,
  Reveal,
  SectionIntro,
  paperTexture,
} from "../components/EditorialKit";

export default function DisplayOptions() {
  const { palette, fonts } = usePalette();
  const { openPickerForBuilder } = useEventType();

  return (
    <main style={{ ...paperTexture(palette), color: palette.ink }}>
      <PageHero
        eyebrow="DISPLAY WALLS"
        title="A backdrop worth remembering."
        script="The corner every camera finds first."
        body="Statement displays designed to give your celebration a focal point, frame the experience and create the photo moment people naturally gather around."
        palette={palette}
        fonts={fonts}
        align="center"
      >
        <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts}>
          Add a display to my experience
        </PrimaryButton>
      </PageHero>

      <JewelBand palette={palette} style={{ padding: "92px 24px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="CHOOSE YOUR DISPLAY"
            title="Big enough to anchor the room. Interesting enough to earn the photos."
            body="Pick the display that fits the event, then decide whether you want to set it yourself or have us handle the styling."
            palette={palette}
            fonts={fonts}
            light
          />

          <div className="mt-14 grid gap-7 sm:grid-cols-2">
            {DISPLAYS.map((display, i) => (
              <Reveal key={display.id} delay={i * 80}>
                <div
                  className="h-full overflow-hidden rounded-md"
                  style={{
                    background: palette.surface,
                    boxShadow: "0 26px 64px rgba(0,0,0,0.22)",
                    border: `1px solid ${palette.gold}55`,
                  }}
                >
                  <FeatureCard
                    icon={display.icon}
                    name={display.name}
                    tagline={display.tagline}
                    description={display.description}
                    photoUrl={display.photoUrl}
                    photoUrls={display.photoUrls}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </JewelBand>

      <section style={{ ...paperTexture(palette), padding: "94px 24px" }}>
        <div className="mx-auto max-w-6xl">
          <SectionIntro
            eyebrow="PRICING"
            title="One Display. Your Style. We Set It Up."
            body="Choose your favourite display and we'll turn it into a finished backdrop designed for your celebration. Every display includes professional setup and teardown, so when you arrive, your photo moment is ready for you."
            palette={palette}
            fonts={fonts}
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {DISPLAY_PRICING_TIERS.map((tier, i) => (
              <Reveal key={tier.id} delay={i * 80}>
                <ElevatedCard palette={palette} className="flex h-full flex-col p-8">
                  <h3 className="text-3xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                    {tier.name}
                  </h3>
                  <span className="mt-2 text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.accent }}>
                    ${tier.price}
                  </span>
                  <p className="mt-4 text-base leading-7" style={{ ...fonts.bodyFont, color: palette.ink }}>
                    {tier.description}
                  </p>
                  <p className="mt-3 text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
                    {tier.subDescription}
                  </p>

                  <div className="mt-6 flex-1">
                    <p
                      style={{
                        ...fonts.bodyFont,
                        color: palette.goldDeep,
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                      }}
                    >
                      Includes
                    </p>
                    <ul className="mt-3 space-y-2">
                      {tier.includes.map((line) => (
                        <li key={line} className="flex items-start gap-2 text-base leading-6" style={{ ...fonts.bodyFont, color: palette.ink }}>
                          <Check size={16} className="mt-1 flex-shrink-0" color={palette.primaryDeep} />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => openPickerForBuilder()}
                    className="mt-7 rounded-full py-3.5 text-sm font-semibold tracking-[0.16em]"
                    style={{ ...fonts.bodyFont, background: palette.primaryDeep, color: "#FFFFFF" }}
                  >
                    {tier.ctaLabel}
                  </button>
                </ElevatedCard>
              </Reveal>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-2xl text-center">
            <h3 className="text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
              Make It Even More Yours
            </h3>
            <p className="mt-3 text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Want something beyond what's included? Add custom signage, specialty florals, additional balloons, personalized details or other finishing touches to make your display completely your own.
            </p>
            <p className="mt-2 text-sm" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Custom upgrades are quoted separately.
            </p>
          </div>
        </div>
      </section>

      <JewelBand palette={palette} style={{ padding: "84px 24px" }}>
        <div className="mx-auto max-w-4xl text-center">
          <Sparkles className="mx-auto" size={20} color={palette.gold} />
          <h2
            className="mt-5"
            style={{
              ...fonts.displayFont,
              color: "#FFFFFF",
              fontSize: "clamp(2.8rem, 5vw, 4.8rem)",
              lineHeight: 1,
              fontWeight: 630,
            }}
          >
            Make the display part of the experience, not an isolated pretty corner.
          </h2>
          <div className="mt-8">
            <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts} light>
              Build my experience
            </PrimaryButton>
          </div>
        </div>
      </JewelBand>
    </main>
  );
}
