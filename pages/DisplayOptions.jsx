import React from "react";
import { Sparkles } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import FeatureCard from "../components/FeatureCard";
import { DISPLAYS, DISPLAY_SETUP_OPTIONS } from "../packageContent";
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
    <main style={{ background: palette.bg, color: palette.ink }}>
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
            eyebrow="SETUP OPTIONS"
            title="Choose how hands-on you want to be."
            body="The display itself stays the star. You are simply choosing whether setup day involves you or not."
            palette={palette}
            fonts={fonts}
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {DISPLAY_SETUP_OPTIONS.map((option, i) => (
              <Reveal key={option.id} delay={i * 80}>
                <ElevatedCard palette={palette} className="h-full p-8">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <span
                        style={{
                          ...fonts.bodyFont,
                          color: palette.goldDeep,
                          fontSize: "11px",
                          fontWeight: 800,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                        }}
                      >
                        Option {i + 1}
                      </span>
                      <h3 className="mt-3 text-3xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                        {option.label}
                      </h3>
                    </div>
                    <span className="text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.accent }}>
                      ${option.price}
                    </span>
                  </div>
                  <p className="mt-5 text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
                    {option.description}
                  </p>
                </ElevatedCard>
              </Reveal>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
            Self setup includes easy-to-follow instructions. Floral arrangements arrive already arranged. Light-up displays require a nearby outlet and extension cords are included.
          </p>
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
