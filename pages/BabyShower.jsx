import React from "react";
import { Camera, Heart, MessageCircle, Sparkles } from "lucide-react";
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

import essentialsImage from "../media/hero.png";
import arrivalPhoto from "../media/web_arrival.png";
import babyTriviaPhoto from "../media/babytrivia.png";
import wallPuzzleShowerPhoto from "../media/wallpuzzle-babyshower.png";
import photoWallPhoto from "../media/featurewall.png";
import lilRootsPhoto from "../media/lilroots.png";
import readyToPopPhoto from "../media/readytopop.png";
import kindnessPhoto from "../media/poem.png";

const CTA_LABEL = "PLAN YOUR BABY SHOWER EXPERIENCE";

const EXPERIENCE_CARDS = [
  {
    image: arrivalPhoto,
    title: "Guess The Arrival",
    tagline: "The countdown to baby becomes a celebration of its own.",
    body: "Guests predict when baby will arrive, where mom will be, what she'll be doing, and what time baby makes their entrance. Guests submit their guesses through a custom digital experience and can sign up for email updates as the big day approaches.",
  },
  {
    image: babyTriviaPhoto,
    title: "Baby Trivia",
    tagline: "How well do they really know the parents-to-be?",
    body: "We create a custom trivia experience featuring questions about the parents-to-be, their relationship and their story. Guests laugh, compete, and discover something new about the couple they came to celebrate.",
  },
  {
    image: wallPuzzleShowerPhoto,
    title: "Interactive Wall Puzzle",
    tagline: "A keepsake built one guest at a time.",
    body: "Each guest contributes a part of the display throughout the event. A visual reminder that every person there played a part in welcoming this new chapter.",
  },
  {
    image: kindnessPhoto,
    title: "Hello World Kindness Station",
    tagline: "A little kindness goes out. Something meaningful stays behind.",
    body: "Guests pass a kindness card forward and leave genuine words for the host to keep for a rainy day.",
  },
];

const KEEP = [
  {
    icon: Camera,
    title: "Photos worth opening again",
    body: "Not just images from the day, but photos paired with the memories and messages behind them.",
  },
  {
    icon: MessageCircle,
    title: "Words for the future",
    body: "Advice, stories, wishes and messages that become part of the baby's story before they even arrive.",
  },
  {
    icon: Heart,
    title: "Something made together",
    body: "The best keepsakes are not bought finished. They become meaningful because the people in the room helped create them.",
  },
];

const KEEPSAKE_NOTES = [
  {
    icon: Heart,
    title: "Wishes For Baby",
    body: "A place for guests to share hopes, advice, and heartfelt messages for the little one. A keepsake the family can return to as baby grows.",
  },
  {
    icon: MessageCircle,
    title: "Advice For The Parents",
    body: "Because every new parent needs encouragement, wisdom, and a little laughter along the way. Guests share their words, memories, and advice to create something meaningful for the journey ahead.",
  },
];

const PHOTO_MOMENT_THINK = [
  "Custom-designed statement walls",
  "Light-up displays",
  "Lounge-style setups",
  "Statement furniture",
  "Couch installations",
  "Theme-inspired photo environments",
  "Instagram-worthy moments guests actually want to step into",
];

export default function BabyShower() {
  const { openPickerForBuilder } = useEventType();
  const { palette, fonts } = usePalette();

  return (
    <main style={{ background: palette.bg, color: palette.ink }}>
      <PageHero
        eyebrow="BABY SHOWER EXPERIENCES"
        title="A baby shower where every guest becomes part of the story."
        script="Not just a shower. A memory in the making."
        body="Interactive experiences, meaningful keepsakes and thoughtful details that bring guests together and give the parents-to-be something worth keeping long after the day is over."
        image={essentialsImage}
        imageAlt="Interactive baby shower experience by A Slice of G Events"
        palette={palette}
        fonts={fonts}
      >
        <div className="flex flex-wrap items-center gap-5">
          <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts}>
            {CTA_LABEL}
          </PrimaryButton>
          <span
            style={{
              ...fonts.bodyFont,
              color: palette.goldDeep,
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Starting at $1,295
          </span>
        </div>
      </PageHero>

      <section style={{ ...paperTexture(palette), padding: "88px 24px" }}>
        <div className="mx-auto max-w-3xl text-center">
          <Kicker palette={palette} fonts={fonts}>THE BABY SHOWER EXPERIENCE</Kicker>
          <h2
            className="mt-4"
            style={{
              ...fonts.displayFont,
              color: palette.primaryDeep,
              fontSize: "clamp(2.5rem, 5vw, 4.2rem)",
              lineHeight: 1,
              fontWeight: 630,
            }}
          >
            Your celebration includes:
          </h2>

          <div className="mx-auto mt-9 flex max-w-xl flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
            <p
              className="rounded-sm border px-6 py-4 text-lg font-semibold"
              style={{ ...fonts.bodyFont, color: palette.primaryDeep, borderColor: palette.line, background: palette.surface }}
            >
              Choose 2 Interactive Experiences
            </p>
            <span className="text-sm italic" style={{ ...fonts.displayFont, color: palette.goldDeep }}>and</span>
            <p
              className="rounded-sm border px-6 py-4 text-lg font-semibold"
              style={{ ...fonts.bodyFont, color: palette.primaryDeep, borderColor: palette.line, background: palette.surface }}
            >
              Choose 2 Keepsake Experiences
            </p>
          </div>

          <p className="mx-auto mt-8 max-w-xl text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
            Then personalize your celebration with additional add-ons. Every experience is designed to work together, creating a baby shower that feels personal, thoughtful, and completely yours.
          </p>
        </div>
      </section>

      <section style={{ background: palette.surface, padding: "90px 24px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="THE BABY SHOWER EXPERIENCE"
            title="The pretty details matter. The moments people join in on matter more."
            body="A prediction someone gets right. A message baby reads years later. A story created by the people who love them most. That is the part we design around."
            palette={palette}
            fonts={fonts}
          />

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {EXPERIENCE_CARDS.map((item, i) => (
              <Reveal key={item.title} delay={i * 70}>
                <ElevatedCard palette={palette} className="h-full overflow-hidden">
                  <div className="overflow-hidden" style={{ aspectRatio: "16 / 10" }}>
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-7">
                    <h3 className="text-3xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                      {item.title}
                    </h3>
                    <p className="mt-2 text-lg italic" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
                      {item.tagline}
                    </p>
                    <p className="mt-4 text-sm leading-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
                      {item.body}
                    </p>
                  </div>
                </ElevatedCard>
              </Reveal>
            ))}
          </div>

          <p className="mx-auto mt-12 max-w-2xl text-center text-lg italic leading-8" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
            Also available: a collaborative Custom Story Book, where guests contribute pages using guided prompts until the pieces become a one-of-a-kind keepsake.
          </p>
        </div>
      </section>

      <FullBleedStatement
        image={photoWallPhoto}
        imageAlt="Baby shower memory display"
        eyebrow="THE PART PEOPLE KEEP"
        title="The experience does not end when the shower does."
        body="The celebration becomes photos, notes, predictions, stories and keepsakes that can live in a nursery, a home or a box that gets opened years later."
        palette={palette}
        fonts={fonts}
      />

      <JewelBand palette={palette} style={{ padding: "94px 24px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="BUILT FOR PARTICIPATION"
            title="Your guests are not just watching the day happen."
            body="They are contributing to it, and that is what makes the final keepsakes matter."
            palette={palette}
            fonts={fonts}
            light
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {KEEP.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={i * 80}>
                  <ElevatedCard palette={palette} className="h-full p-7">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ background: i === 1 ? palette.gold : palette.accent, color: i === 1 ? palette.primaryDeep : "#fff" }}
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

          <div className="mt-14 grid gap-7 sm:grid-cols-2">
            {KEEPSAKE_NOTES.map((item) => {
              const Icon = item.icon;
              return (
                <ElevatedCard key={item.title} palette={palette} className="h-full p-7">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full"
                    style={{ background: palette.gold, color: palette.primaryDeep }}
                  >
                    <Icon size={19} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
                    {item.body}
                  </p>
                </ElevatedCard>
              );
            })}
          </div>
        </div>
      </JewelBand>

      <section style={{ ...paperTexture(palette), padding: "96px 24px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="IMMERSIVE PHOTO MOMENTS"
            title="More than a backdrop."
            body="Create a photo experience that feels like part of the celebration. Our custom-built display walls and photo moments are designed to be unique, creative, and memorable. No standard arch-and-balloon setup."
            palette={palette}
            fonts={fonts}
            align="left"
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {PHOTO_MOMENT_THINK.map((item) => (
              <div key={item} className="flex items-center gap-3 border-b pb-3" style={{ borderColor: palette.line }}>
                <Sparkles size={14} color={palette.goldDeep} />
                <span className="text-sm" style={{ ...fonts.bodyFont, color: palette.ink }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: palette.surface, padding: "96px 24px" }}>
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Kicker palette={palette} fonts={fonts}>GUEST GIFTS</Kicker>
            <h2
              className="mt-4"
              style={{
                ...fonts.displayFont,
                color: palette.primaryDeep,
                fontSize: "clamp(2.7rem, 5vw, 4.7rem)",
                lineHeight: 1,
                fontWeight: 630,
              }}
            >
              A little something for the road.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Our customized guest gifts are designed to complement your theme, colours, and the story you are creating. Every package includes a guest gift, and you can choose the option that fits the celebration. Ready to Pop is included, with additional keepsakes and gifts available as upgrades.
            </p>
            <div className="mt-8">
              <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts}>
                Build the full experience
              </PrimaryButton>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              { src: lilRootsPhoto, alt: "Lil Roots planted seedling guest gift", title: "Lil Roots", body: "A little reminder that something beautiful is growing." },
              { src: readyToPopPhoto, alt: "Ready to Pop popcorn favour guest gift", title: "Ready To Pop", body: "A fun little thank you for guests celebrating your little one who is about to pop." },
            ].map((gift, i) => (
              <div key={gift.title}>
                <div
                  className="overflow-hidden"
                  style={{
                    borderRadius: "5px",
                    boxShadow: editorialShadow,
                    border: `1px solid ${palette.line}`,
                    transform: `rotate(${i ? 2 : -2}deg)`,
                  }}
                >
                  <img src={gift.src} alt={gift.alt} className="aspect-[4/5] h-full w-full object-cover" />
                </div>
                <h4 className="mt-4 text-lg font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                  {gift.title}
                </h4>
                <p className="mt-1 text-sm leading-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
                  {gift.body}
                </p>
              </div>
            ))}
          </div>
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
            Your baby shower. Your story.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7" style={{ ...fonts.bodyFont, color: "rgba(255,255,255,0.80)" }}>
            Start with the experiences that feel most meaningful. Add the details that make it yours. We will help you create a celebration where guests do not just show up. They become part of the story.
          </p>
          <div className="mt-8">
            <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts} light>
              {CTA_LABEL}
            </PrimaryButton>
          </div>
        </div>
      </JewelBand>
    </main>
  );
}
