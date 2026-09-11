import React from "react";
import { ArrowRight, Heart, MessageCircle, Sparkles } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";

import essentialsImage from "../media/hero.png";
import arrivalPhoto from "../media/web_arrival.png";
import babyTriviaPhoto from "../media/babytrivia.png";
import wallPuzzleShowerPhoto from "../media/wallpuzzle-babyshower.png";
import photoWallPhoto from "../media/featurewall.png";
import lilRootsPhoto from "../media/lilroots.png";
import readyToPopPhoto from "../media/readytopop.png";

const CTA_LABEL = "PLAN YOUR BABY SHOWER EXPERIENCE";

function SectionLabel({ children, palette, fonts }) {
  return (
    <p
      className="text-xs font-semibold tracking-[0.3em]"
      style={{ ...fonts.bodyFont, color: palette.goldDeep }}
    >
      {children}
    </p>
  );
}

function ImagePanel({ src, alt, className = "" }) {
  return (
    <div className={`overflow-hidden ${className}`} style={{ background: "#E9E1D2" }}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
      />
    </div>
  );
}

function ExperienceRow({
  image,
  imageAlt,
  title,
  tagline,
  paragraphs = [],
  listLabel,
  listItems,
  accent,
  reverse,
  palette,
  fonts,
}) {
  const content = (
    <div>
      <h3 className="text-3xl font-semibold sm:text-4xl" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
        {title}
      </h3>
      {tagline && (
        <p className="mt-2 text-lg italic" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
          {tagline}
        </p>
      )}
      <div className="mt-5 space-y-3">
        {paragraphs.map((p) => (
          <p key={p} className="text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.muted }}>
            {p}
          </p>
        ))}
      </div>
      {listLabel && listItems && (
        <>
          <p className="mt-6 text-sm font-semibold tracking-[0.18em]" style={{ ...fonts.bodyFont, color: palette.goldDeep }}>
            {listLabel}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {listItems.map((item) => (
              <div key={item} className="flex items-center gap-3 border-b pb-3" style={{ borderColor: palette.line }}>
                <Sparkles size={14} color={palette.goldDeep} />
                <span className="text-sm" style={{ ...fonts.bodyFont, color: palette.ink }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      {accent && (
        <p className="mt-6 text-lg italic leading-relaxed" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
          {accent}
        </p>
      )}
    </div>
  );

  if (!image) {
    return <div className="mx-auto max-w-2xl">{content}</div>;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div className={reverse ? "lg:order-2" : "lg:order-1"}>
        <ImagePanel src={image} alt={imageAlt} className="aspect-[4/5]" />
      </div>
      <div className={reverse ? "lg:order-1" : "lg:order-2"}>{content}</div>
    </div>
  );
}

function KeepsakeNote({ icon: Icon, title, children, palette, fonts }) {
  return (
    <div className="border-t pt-6" style={{ borderColor: palette.line }}>
      <Icon size={20} strokeWidth={1.5} color={palette.goldDeep} />
      <h4 className="mt-4 text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
        {title}
      </h4>
      <p className="mt-3 text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
        {children}
      </p>
    </div>
  );
}

function GiftCard({ image, alt, title, paragraphs, palette, fonts }) {
  return (
    <div>
      <ImagePanel src={image} alt={alt} className="aspect-[4/3]" />
      <h4 className="mt-5 text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
        {title}
      </h4>
      <div className="mt-3 space-y-2">
        {paragraphs.map((p) => (
          <p key={p} className="text-sm leading-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function BabyShower() {
  const { openPickerForBuilder } = useEventType();
  const { palette, fonts } = usePalette();

  return (
    <main className="min-h-screen overflow-hidden" style={{ background: palette.bg, color: palette.ink }}>
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
            <div className="max-w-xl">
              <SectionLabel palette={palette} fonts={fonts}>
                BABY SHOWER EXPERIENCES
              </SectionLabel>

              <h1
                className="mt-5 text-5xl font-medium leading-[1.05] sm:text-6xl lg:text-[64px]"
                style={{ ...fonts.displayFont, color: palette.primaryDeep }}
              >
                A baby shower where every guest becomes part of the story.
              </h1>

              <p
                className="mt-7 text-sm font-semibold tracking-[0.2em]"
                style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
              >
                STARTING AT $1,295
              </p>

              <p className="mt-6 text-base leading-8" style={{ ...fonts.bodyFont, color: palette.muted }}>
                A baby shower is more than a celebration before baby arrives.
              </p>

              <p className="mt-4 text-base leading-8" style={{ ...fonts.bodyFont, color: palette.muted }}>
                It is the beginning of a story.
              </p>

              <p className="mt-4 text-base leading-8" style={{ ...fonts.bodyFont, color: palette.muted }}>
                We create interactive experiences, meaningful keepsakes, and
                thoughtful details that bring guests together and give the
                parents-to-be memories they can treasure long after the day
                is over.
              </p>

              <p className="mt-4 text-base leading-8" style={{ ...fonts.bodyFont, color: palette.muted }}>
                From predicting baby's arrival to creating messages for the
                future, every experience gives guests a way to connect,
                contribute, and celebrate the little one on the way.
              </p>

              <p className="mt-5 text-xl italic" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
                Not just a baby shower. A memory in the making.
              </p>

              <button
                onClick={() => openPickerForBuilder()}
                className="mt-7 inline-flex items-center gap-3 rounded-sm px-7 py-4 text-sm font-semibold tracking-[0.14em] text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
              >
                {CTA_LABEL}
                <ArrowRight size={17} strokeWidth={1.7} />
              </button>
            </div>
          </div>

          <ImagePanel
            src={essentialsImage}
            alt="Interactive baby shower experience set up by A Slice of G Events"
            className="min-h-[520px] lg:min-h-[720px]"
          />
        </div>
      </section>

      {/* THE PRETTIEST DETAILS */}
      <section className="px-6 py-20 sm:px-10 lg:py-28" style={{ background: palette.surface }}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-2xl leading-9" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
            The prettiest details are wonderful.
          </p>
          <p className="mt-2 text-2xl leading-9" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
            But the moments people remember are the ones they were part of.
          </p>

          <div className="mx-auto mt-9 max-w-xl space-y-2">
            <p className="text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
              A prediction someone gets right.
            </p>
            <p className="text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
              A message baby reads years later.
            </p>
            <p className="text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
              A story created by the people who love them most.
            </p>
            <p className="text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
              A keepsake that brings everyone back to this special time.
            </p>
          </div>

          <p className="mx-auto mt-8 max-w-xl text-xl italic leading-8" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
            We design experiences that turn guests from attendees into
            contributors.
          </p>
        </div>
      </section>

      {/* THE BABY SHOWER EXPERIENCE (overview) */}
      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel palette={palette} fonts={fonts}>
            THE BABY SHOWER EXPERIENCE
          </SectionLabel>

          <h2
            className="mt-4 text-4xl font-medium leading-tight sm:text-5xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            Your celebration includes:
          </h2>

          <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
            <p
              className="rounded-sm border px-6 py-4 text-lg font-semibold"
              style={{ ...fonts.bodyFont, color: palette.primaryDeep, borderColor: palette.line }}
            >
              Choose 2 Interactive Experiences
            </p>
            <span className="text-sm italic" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
              and
            </span>
            <p
              className="rounded-sm border px-6 py-4 text-lg font-semibold"
              style={{ ...fonts.bodyFont, color: palette.primaryDeep, borderColor: palette.line }}
            >
              Choose 2 Keepsake Experiences
            </p>
          </div>

          <p className="mx-auto mt-8 max-w-xl text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
            Then personalize your celebration with additional add-ons.
          </p>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
            Every experience is designed to work together, creating a baby
            shower that feels personal, thoughtful, and completely yours.
          </p>
        </div>
      </section>

      {/* INTERACTIVE EXPERIENCES */}
      <section className="px-6 py-20 sm:px-10 lg:py-28" style={{ background: palette.surface }}>
        <div className="mx-auto mb-14 max-w-6xl text-center">
          <SectionLabel palette={palette} fonts={fonts}>
            INTERACTIVE EXPERIENCES
          </SectionLabel>
        </div>

        <div className="space-y-20">
          <ExperienceRow
            image={arrivalPhoto}
            imageAlt="Guess the Arrival baby shower prediction game"
            title="Guess The Arrival"
            tagline="The countdown to baby becomes a celebration of its own."
            paragraphs={[
              "Guests predict:",
              "When will baby arrive?",
              "Where will mom be?",
              "What will she be doing?",
              "What time will baby make their entrance?",
              "Guests submit their guesses through a custom digital experience and can sign up for email updates as the big day approaches.",
              "When baby arrives, everyone who joined in gets to share the excitement.",
            ]}
            accent="Because waiting for baby is better when everyone is part of the journey."
            palette={palette}
            fonts={fonts}
          />

          <ExperienceRow
            image={babyTriviaPhoto}
            imageAlt="Custom trivia experience about the parents-to-be at a baby shower"
            title="Custom Trivia: How Well Do You Know Mom & Dad?"
            tagline="A baby shower game that is actually about the people being celebrated."
            paragraphs={[
              "We create a custom trivia experience featuring questions about the parents-to-be, their relationship, their story, and the little details guests love.",
              "Guests laugh, compete, and discover something new about the couple they came to celebrate.",
            ]}
            reverse
            palette={palette}
            fonts={fonts}
          />

          <ExperienceRow
            title="Custom Story Book"
            tagline="A story created by the people who love them most."
            paragraphs={[
              "Guests contribute pages to a custom digital story experience using guided prompts.",
              "The parents choose the overall concept, story direction, and visual style.",
              "Each guest creates their own page.",
              "Together, those pages become a one-of-a-kind keepsake created by the people who will surround this child with love.",
            ]}
            palette={palette}
            fonts={fonts}
          />

          <ExperienceRow
            image={wallPuzzleShowerPhoto}
            imageAlt="Guests completing an interactive wall puzzle keepsake at a baby shower"
            title="Interactive Wall Puzzle"
            tagline="A celebration keepsake created piece by piece."
            paragraphs={[
              "Each guest contributes a part of the experience, creating a larger interactive display that comes together throughout the event.",
              "A visual reminder that every person there played a part in welcoming this new chapter.",
            ]}
            reverse
            palette={palette}
            fonts={fonts}
          />
        </div>
      </section>

      {/* KEEPSAKE EXPERIENCES */}
      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto mb-14 max-w-6xl text-center">
          <SectionLabel palette={palette} fonts={fonts}>
            KEEPSAKE EXPERIENCES
          </SectionLabel>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 sm:grid-cols-2">
            <KeepsakeNote icon={Heart} title="Wishes For Baby" palette={palette} fonts={fonts}>
              A place for guests to share hopes, advice, and heartfelt
              messages for the little one. A keepsake the family can return
              to as baby grows.
            </KeepsakeNote>

            <KeepsakeNote icon={MessageCircle} title="Advice For The Parents" palette={palette} fonts={fonts}>
              Because every new parent needs encouragement, wisdom, and a
              little laughter along the way. Guests share their words,
              memories, and advice to create something meaningful for the
              journey ahead.
            </KeepsakeNote>
          </div>

          <div className="mt-24">
            <ExperienceRow
              image={photoWallPhoto}
              imageAlt="Custom-built display wall photo moment at a baby shower"
              title="Immersive Photo Moments"
              tagline="More than a backdrop."
              paragraphs={[
                "Create a photo experience that feels like part of the celebration.",
                "Our custom-built display walls and photo moments are designed to be unique, creative, and memorable.",
                "No standard arch-and-balloon setup.",
              ]}
              listLabel="THINK:"
              listItems={[
                "Custom-designed statement walls",
                "Light-up displays",
                "Lounge-style setups",
                "Statement furniture",
                "Couch installations",
                "Theme-inspired photo environments",
                "Instagram-worthy moments guests actually want to step into",
              ]}
              palette={palette}
              fonts={fonts}
            />
          </div>
        </div>
      </section>

      {/* GUEST GIFTS */}
      <section className="px-6 py-20 sm:px-10 lg:py-28" style={{ background: palette.surface }}>
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel palette={palette} fonts={fonts}>
              GUEST GIFTS & LITTLE THANK YOUS
            </SectionLabel>

            <h2
              className="mt-4 text-4xl font-medium leading-tight sm:text-5xl"
              style={{ ...fonts.displayFont, color: palette.primaryDeep }}
            >
              Send guests home with something thoughtful.
            </h2>

            <p className="mt-5 text-base leading-8" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Our customized guest gifts are designed to complement your
              theme, colours, and the story you are creating.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl gap-12 sm:grid-cols-2">
            <GiftCard
              image={lilRootsPhoto}
              alt="Lil Roots planted seedling guest gift for a baby shower"
              title="Lil Roots"
              paragraphs={[
                "A little reminder that something beautiful is growing.",
                "A customized keepsake designed around your baby shower theme and personalized with the parents' names.",
                "A meaningful gift guests can take home as they celebrate the arrival of your little one.",
              ]}
              palette={palette}
              fonts={fonts}
            />

            <GiftCard
              image={readyToPopPhoto}
              alt="Ready to Pop popcorn favour guest gift for a baby shower"
              title="Ready To Pop"
              paragraphs={[
                "A fun little thank you for guests celebrating your little one who is about to pop.",
                "A customized jar of popcorn seasoning with a personalized tag designed to match your baby shower theme.",
                "A playful favour guests can enjoy after the celebration.",
              ]}
              palette={palette}
              fonts={fonts}
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-24 text-center sm:px-10 lg:py-32" style={{ background: palette.primaryDeep }}>
        <div className="mx-auto max-w-3xl">
          <h2
            className="text-5xl font-medium leading-tight sm:text-6xl"
            style={{ ...fonts.displayFont, color: "#FFFFFF" }}
          >
            Your Baby Shower.
            <br />
            Your Story.
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-lg leading-8" style={{ ...fonts.bodyFont, color: "#FFFFFFCC" }}>
            Start with the experiences that feel most meaningful.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-lg leading-8" style={{ ...fonts.bodyFont, color: "#FFFFFFCC" }}>
            Add the details that make it yours.
          </p>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7" style={{ ...fonts.bodyFont, color: "#FFFFFFB8" }}>
            We will help you create a celebration where guests do not just
            show up. They become part of the story.
          </p>

          <p className="mx-auto mt-8 max-w-xl text-xl italic leading-8" style={{ ...fonts.displayFont, color: palette.gold }}>
            Ready to create your baby shower experience?
          </p>

          <p className="mt-5 text-sm font-semibold tracking-[0.2em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
            STARTING AT $1,295
          </p>

          <button
            onClick={() => openPickerForBuilder()}
            className="mt-8 inline-flex items-center gap-3 rounded-sm px-8 py-4 text-sm font-semibold tracking-[0.14em] transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ ...fonts.bodyFont, background: palette.gold, color: palette.primaryDeep }}
          >
            {CTA_LABEL}
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}
