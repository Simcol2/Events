import React from "react";
import { Camera, Gift, Heart, Sparkles, WandSparkles } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import {
  ElevatedCard,
  FullBleedStatement,
  JewelBand,
  Kicker,
  PageHero,
  PrimaryButton,
  Reveal,
  SectionIntro,
  editorialShadow,
  paperTexture,
} from "../components/EditorialKit";

import arrivalPhoto from "../media/web_arrival.png";
import babyTriviaPhoto from "../media/babytrivia.png";
import wallPuzzleShowerPhoto from "../media/wallpuzzle-babyshower.png";
import photoWallPhoto from "../media/featurewall.png";

const TUTU_IMAGE = "/photos/tutu-twirls-tea-hero.jpg";

const FEATURES = [
  {
    image: arrivalPhoto,
    eyebrow: "INTERACTIVE",
    title: "Guess The Arrival",
    tagline: "The countdown becomes part of the party.",
    body:
      "Guests predict when baby will arrive, where Mom will be, what she will be doing and what time the big entrance happens. The fun keeps going after the shower because everyone can follow along until the winner is revealed.",
  },
  {
    image: babyTriviaPhoto,
    eyebrow: "PLAY & CONNECT",
    title: "Custom Trivia",
    tagline: "Questions that could only belong at this celebration.",
    body:
      "Forget generic party trivia. We build questions around the people being celebrated so guests laugh, remember stories and discover how well they really know the guest of honour.",
  },
  {
    image: wallPuzzleShowerPhoto,
    eyebrow: "CREATE TOGETHER",
    title: "Interactive Wall Puzzle",
    tagline: "One piece from every guest. One finished keepsake.",
    body:
      "Guests add to the display throughout the celebration until the final image comes together. The result is a visual reminder that everyone played a part.",
  },
];

const MINI = [
  {
    icon: Heart,
    title: "Custom Story Book",
    body: "Guests contribute pages that become one collaborative story made by the people who came to celebrate.",
  },
  {
    icon: Camera,
    title: "Picture This",
    body: "Photos and handwritten memories turn into something worth opening again years later.",
  },
  {
    icon: Gift,
    title: "Kindness Station",
    body: "Guests pass a little kindness forward and leave meaningful words behind for the host.",
  },
  {
    icon: WandSparkles,
    title: "Memory Displays",
    body: "A visual focal point designed around the keepsakes and experiences happening throughout the event.",
  },
];

const COMBOS = [
  {
    intro: "A baby shower might include:",
    items: ["Guess The Arrival", "Custom Trivia", "Custom Story Book", "Immersive Photo Moment"],
  },
  {
    intro: "A Tutu Pop-Up might include:",
    items: ["The Tutu Tent", "Dress-Up Experiences", "Photo Moments", "Creative Activities"],
  },
  {
    intro: "A milestone celebration might include:",
    items: ["A Story Experience", "Interactive Guest Activity", "Custom Display"],
  },
];

export default function Experiences({ navigate }) {
  const { palette, fonts } = usePalette();
  const { openPickerForBuilder } = useEventType();

  return (
    <main style={{ background: palette.bg, color: palette.ink }}>
      <PageHero
        eyebrow="EXPERIENCES"
        title="Celebrations where guests become part of the story."
        script="Not just something pretty to look at."
        body="We create interactive moments, collaborative keepsakes and playful experiences that give guests something to do, something to feel and something to remember."
        image={photoWallPhoto}
        imageAlt="Interactive celebration display by A Slice of G Events"
        palette={palette}
        fonts={fonts}
      >
        <div className="flex flex-wrap gap-4">
          <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts}>
            Build my experience
          </PrimaryButton>
          <button
            onClick={() => navigate("/how-it-works")}
            className="border-b-2 pb-1 text-sm font-semibold tracking-[0.08em]"
            style={{ ...fonts.bodyFont, color: palette.primaryDeep, borderColor: palette.gold }}
          >
            HOW IT WORKS
          </button>
        </div>
      </PageHero>

      <section style={{ ...paperTexture(palette), padding: "96px 24px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="A FEW OF OUR FAVOURITES"
            title="The kind of thing guests talk about on the ride home."
            body="The experience should feel like it belongs to the people in the room, not like another activity downloaded from the internet fifteen minutes before everyone arrived."
            palette={palette}
            fonts={fonts}
          />

          <div className="mt-16 space-y-20">
            {FEATURES.map((item, index) => (
              <Reveal key={item.title}>
                <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
                  <div
                    className={index % 2 ? "lg:order-2" : ""}
                    style={{
                      overflow: "hidden",
                      borderRadius: "5px",
                      boxShadow: editorialShadow,
                      border: `1px solid ${palette.line}`,
                    }}
                  >
                    <img src={item.image} alt={item.title} className="aspect-[5/4] h-full w-full object-cover" />
                  </div>
                  <div className={index % 2 ? "lg:order-1" : ""}>
                    <Kicker palette={palette} fonts={fonts}>{item.eyebrow}</Kicker>
                    <h2
                      className="mt-3"
                      style={{
                        ...fonts.displayFont,
                        color: palette.primaryDeep,
                        fontSize: "clamp(2.4rem, 4.5vw, 4.2rem)",
                        lineHeight: 1,
                        fontWeight: 640,
                      }}
                    >
                      {item.title}
                    </h2>
                    <p
                      className="mt-4 text-xl italic"
                      style={{ ...fonts.displayFont, color: palette.goldDeep }}
                    >
                      {item.tagline}
                    </p>
                    <p
                      className="mt-6"
                      style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "16px", lineHeight: 1.75 }}
                    >
                      {item.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <JewelBand palette={palette} style={{ padding: "94px 24px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="MORE WAYS TO MAKE IT YOURS"
            title="Some memories are made. Some are actually built together."
            palette={palette}
            fonts={fonts}
            light
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {MINI.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={i * 70}>
                  <ElevatedCard palette={palette} className="h-full p-7">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ background: i % 2 ? palette.gold : palette.accent, color: i % 2 ? palette.primaryDeep : "#fff" }}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
                      {item.body}
                    </p>
                  </ElevatedCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </JewelBand>

      <FullBleedStatement
        image={TUTU_IMAGE}
        imageAlt="Tutu Twirls dress-up experience"
        eyebrow="DRESS-UP EXPERIENCES"
        title="Dress-up is back, and everybody gets invited."
        body="Tutu Twirls is a playful pop-up experience for kids and grown-ups who still know how to have fun."
        palette={palette}
        fonts={fonts}
      >
        <PrimaryButton onClick={() => navigate("/birthdays/tutu-twirls-tea")} palette={palette} fonts={fonts} light>
          Explore Tutu Twirls
        </PrimaryButton>
      </FullBleedStatement>

      <section style={{ ...paperTexture(palette), padding: "96px 24px" }}>
        <div className="mx-auto max-w-5xl text-center">
          <SectionIntro
            eyebrow="BUILD YOUR OWN EXPERIENCE"
            title="Every celebration has its own story."
            body="Choose one experience or combine multiple elements to create something completely custom."
            palette={palette}
            fonts={fonts}
          />

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-3">
            {COMBOS.map((combo) => (
              <ElevatedCard key={combo.intro} palette={palette} className="p-6 text-left">
                <p className="text-base font-semibold leading-relaxed" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
                  {combo.intro}
                </p>
                <div className="mt-4 space-y-2">
                  {combo.items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Sparkles size={13} color={palette.goldDeep} />
                      <span className="text-sm" style={{ ...fonts.bodyFont, color: palette.ink }}>{item}</span>
                    </div>
                  ))}
                </div>
              </ElevatedCard>
            ))}
          </div>

          <p className="mx-auto mt-14 max-w-2xl text-lg italic leading-8" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
            The possibilities are endless because your celebration should not feel like everyone else's.
          </p>
        </div>
      </section>

      {/* "WAIT, THIS IS SO COOL" QUOTE BAND */}
      <section
        className="relative overflow-hidden text-center"
        style={{ background: palette.primaryDeep, padding: "90px 40px" }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute select-none whitespace-nowrap"
          style={{
            ...fonts.scriptFont,
            fontSize: "clamp(60px, 14vw, 160px)",
            color: "#FFFFFF",
            opacity: 0.06,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-4deg)",
          }}
        >
          everyday magic
        </span>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            width: "min(50vw, 420px)",
            height: "min(50vw, 420px)",
            top: "-15%",
            left: "-12%",
            background: palette.gold,
            opacity: 0.14,
          }}
        />

        <div className="relative mx-auto max-w-2xl">
          <p
            className="text-2xl leading-tight sm:text-4xl"
            style={{ ...fonts.displayFont, fontStyle: "italic", color: "#FFFFFF" }}
          >
            "Wait, this is so cool."
            <br />
            The reaction we design every piece for.
          </p>
          <div className="mt-9">
            <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts} light>
              Start Planning
            </PrimaryButton>
          </div>
        </div>
      </section>

      <section style={{ ...paperTexture(palette), padding: "94px 24px" }}>
        <div className="mx-auto max-w-4xl text-center">
          <Sparkles className="mx-auto" size={20} color={palette.goldDeep} />
          <h2
            className="mt-5"
            style={{
              ...fonts.displayFont,
              color: palette.primaryDeep,
              fontSize: "clamp(2.8rem, 5vw, 4.8rem)",
              lineHeight: 1,
              fontWeight: 630,
            }}
          >
            Have an idea that is not on this page?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
            Excellent. Customization is the fun part. Bring the problem, the screenshot, the strange idea or the feeling you are trying to create.
          </p>
          <div className="mt-8">
            <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts}>
              Tell us what you are imagining
            </PrimaryButton>
          </div>
        </div>
      </section>
    </main>
  );
}
