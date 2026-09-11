import React, { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import {
  ElevatedCard,
  JewelBand,
  PageHero,
  PrimaryButton,
  SectionIntro,
  paperTexture,
} from "../components/EditorialKit";

const FAQS = [
  {
    q: "Do the experiences change based on my event?",
    a: "Yes. Choose your event first and we'll show you the experiences designed for that celebration.",
  },
  {
    q: "Is this a rental package?",
    a: "You're building an interactive experience. The pieces are designed to be used during your celebration and, where applicable, become keepsakes afterward.",
  },
  {
    q: "What does Self Setup mean?",
    a: "Your experience is prepared and ready for you to place and arrange. Self Setup is intended for Toronto pickup or Toronto drop-off. Contact us if you need delivery.",
  },
  {
    q: "What does the Event Stylist do?",
    a: "You don't lift a finger. We bring everything, set it up, style it, make sure every detail is ready, and take it all back when the celebration is over.",
  },
  {
    q: "Can I have the Event Stylist and a professionally styled Memory Display?",
    a: "Yes. They are separate choices, so you can select the service level you want for each.",
  },
  {
    q: "Does Picture This include audio?",
    a: "No. Picture This includes photos and handwritten notes. Audio or voice messages are a separate upgrade.",
  },
  {
    q: "Are games included?",
    a: "Baby Shower builds include Play & Connect experiences. For Engagement, Birthday, Holiday, and Special Moment builds, games are optional add-ons.",
  },
  {
    q: "Can I add another keepsake experience?",
    a: "Yes. Add an Additional Keepsake Experience for +$125.",
  },
  {
    q: "What is the difference between an Additional Keepsake Experience and a Playful Add-On?",
    a: "An Additional Keepsake Experience adds another memory-making experience. A Playful Add-On adds a game designed to get guests talking, laughing, and competing.",
  },
  {
    q: "Is Kindness Station available for engagement and other events?",
    a: "Yes. Kindness Station is available across event types and is framed around the people being celebrated.",
  },
];

function FAQItem({ item, palette, fonts }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b" style={{ borderColor: palette.line }}>
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-5 py-6 text-left"
      >
        <span className="text-lg font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
          {item.q}
        </span>
        <ChevronDown
          size={18}
          color={palette.muted}
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 180ms ease",
          }}
        />
      </button>

      <p
        hidden={!open}
        className="pb-6 text-base leading-7"
        style={{ ...fonts.bodyFont, color: palette.muted }}
      >
        {item.a}
      </p>
    </div>
  );
}

function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function FAQ() {
  const { palette, fonts } = usePalette();
  const { openPickerForBuilder } = useEventType();

  return (
    <main style={{ background: palette.bg, color: palette.ink }}>
      <FaqJsonLd />

      <PageHero
        eyebrow="FREQUENTLY ASKED QUESTIONS"
        title="The questions people ask before they hand over their event."
        script="Reasonable, honestly."
        body="Setup, games, keepsakes, upgrades and the difference between renting pieces and building a full experience."
        palette={palette}
        fonts={fonts}
        align="center"
      />

      <section style={{ ...paperTexture(palette), padding: "88px 24px" }}>
        <div className="mx-auto max-w-4xl">
          <SectionIntro
            eyebrow="THE ANSWERS"
            title="Start here. Then build what fits."
            palette={palette}
            fonts={fonts}
          />

          <ElevatedCard palette={palette} className="mt-12 px-7 sm:px-9">
            {FAQS.map((item) => (
              <FAQItem key={item.q} item={item} palette={palette} fonts={fonts} />
            ))}
          </ElevatedCard>
        </div>
      </section>

      <JewelBand palette={palette} style={{ padding: "82px 24px" }}>
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
            Got the practical stuff sorted?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7" style={{ ...fonts.bodyFont, color: "rgba(255,255,255,0.80)" }}>
            Now for the fun part. Choose the celebration and start building the pieces, keepsakes and guest moments around it.
          </p>
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
