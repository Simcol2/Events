import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";

import arrivalPhoto from "../media/web_arrival.png";
import babyTriviaPhoto from "../media/babytrivia.png";
import wallPuzzleShowerPhoto from "../media/wallpuzzle-babyshower.png";
import photoWallPhoto from "../media/featurewall.png";

const TUTU_IMAGE = "/photos/tutu-twirls-tea-hero.jpg";

function CategoryLabel({ children, palette, fonts }) {
  return (
    <p
      className="text-xs font-semibold tracking-[0.3em]"
      style={{ ...fonts.bodyFont, color: palette.goldDeep }}
    >
      {children}
    </p>
  );
}

function BulletList({ items, palette, fonts }) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-3 border-b pb-3" style={{ borderColor: palette.line }}>
          <Sparkles size={14} color={palette.goldDeep} />
          <span className="text-sm" style={{ ...fonts.bodyFont, color: palette.ink }}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

function ExperienceBlock({
  image,
  imageAlt,
  title,
  tagline,
  paragraphs = [],
  listLabel,
  listItems,
  accent,
  ctaLabel,
  onCta,
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
          <p key={p} className="text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
            {p}
          </p>
        ))}
      </div>
      {listLabel && listItems && (
        <>
          <p className="mt-6 text-sm font-semibold tracking-[0.18em]" style={{ ...fonts.bodyFont, color: palette.goldDeep }}>
            {listLabel}
          </p>
          <BulletList items={listItems} palette={palette} fonts={fonts} />
        </>
      )}
      {accent && (
        <p className="mt-6 text-lg italic leading-relaxed" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
          {accent}
        </p>
      )}
      {ctaLabel && (
        <button
          onClick={onCta}
          className="mt-7 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.1em]"
          style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
        >
          {ctaLabel}
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );

  if (!image) {
    return <div className="mx-auto max-w-2xl">{content}</div>;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div
        className={reverse ? "lg:order-2" : "lg:order-1"}
        style={{ background: "#E9E1D2" }}
      >
        <div className="overflow-hidden" style={{ aspectRatio: "4 / 5" }}>
          <img src={image} alt={imageAlt} className="h-full w-full object-cover" />
        </div>
      </div>
      <div className={reverse ? "lg:order-1" : "lg:order-2"}>{content}</div>
    </div>
  );
}

export default function Experiences({ navigate }) {
  const { palette, fonts } = usePalette();
  const { openPickerForBuilder } = useEventType();

  const goToTutu = () => navigate("/birthdays/tutu-twirls-tea");
  const goToDisplays = () => navigate("/display-options");

  return (
    <div className="min-h-screen" style={{ background: palette.bg, color: palette.ink }}>
      {/* HERO */}
      <div className="relative overflow-hidden px-6 py-24 text-center sm:px-10" style={{ background: palette.primaryDeep }}>
        <Sparkles className="absolute top-8 right-10 opacity-60" size={22} color={palette.gold} />
        <p className="text-sm font-semibold tracking-[0.3em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
          EXPERIENCES
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold sm:text-6xl" style={{ ...fonts.displayFont, color: "#FFFFFF" }}>
          Celebrations where guests become part of the story.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8" style={{ ...fonts.bodyFont, color: "#FFFFFFCC" }}>
          The best moments are not always the ones you decorate.
        </p>
        <p className="mx-auto mt-1 max-w-2xl text-lg leading-8" style={{ ...fonts.bodyFont, color: "#FFFFFFCC" }}>
          They are the ones people participate in.
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7" style={{ ...fonts.bodyFont, color: "#FFFFFFB8" }}>
          We create interactive experiences, immersive displays, and
          keepsake moments that invite guests to contribute, connect,
          create, and leave something behind.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7" style={{ ...fonts.bodyFont, color: "#FFFFFFB8" }}>
          From Tutu Pop-Ups to baby showers, milestone celebrations, and
          custom events, we design experiences people remember because they
          were part of them.
        </p>
      </div>

      {/* INTERACTIVE EXPERIENCES */}
      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto mb-14 max-w-6xl text-center">
          <CategoryLabel palette={palette} fonts={fonts}>
            INTERACTIVE EXPERIENCES
          </CategoryLabel>
        </div>

        <div className="space-y-20">
          <ExperienceBlock
            image={arrivalPhoto}
            imageAlt="Guess the Arrival baby shower prediction game"
            title="Guess The Arrival"
            tagline="A baby shower experience that keeps the excitement going long after the celebration ends."
            paragraphs={[
              "Guests predict the big moment:",
              "When will baby arrive?",
              "Where will mom be?",
              "What will she be doing?",
              "What time will baby make their entrance?",
              "Guests submit their guesses and can sign up for email updates so they can follow along as the countdown continues.",
              "When baby arrives, everyone gets to share in the excitement.",
            ]}
            accent="Because waiting for baby is better when everyone is part of the story."
            palette={palette}
            fonts={fonts}
          />

          <ExperienceBlock
            image={babyTriviaPhoto}
            imageAlt="Custom trivia experience at a celebration"
            title="Custom Trivia Experiences"
            tagline="Forget the standard party questions."
            paragraphs={[
              "We create custom trivia boards built around the people being celebrated.",
              "For baby showers, guests can test how well they know the parents-to-be.",
              "For milestones, couples, birthdays, and special celebrations, trivia becomes a personalized way to laugh, connect, and share memories.",
            ]}
            reverse
            palette={palette}
            fonts={fonts}
          />
        </div>
      </section>

      {/* STORYTELLING EXPERIENCES */}
      <section className="px-6 py-20 sm:px-10 lg:py-28" style={{ background: palette.surface }}>
        <div className="mx-auto mb-14 max-w-6xl text-center">
          <CategoryLabel palette={palette} fonts={fonts}>
            STORYTELLING EXPERIENCES
          </CategoryLabel>
        </div>

        <div className="space-y-20">
          <ExperienceBlock
            title="Custom Story Book"
            tagline="A collaborative story created by the people who came to celebrate."
            paragraphs={[
              "Guests contribute pages to a custom story using a guided digital experience with prompts and creative direction.",
              "The host chooses the overall story concept, plot direction, and visual style.",
              "Each guest creates their own page.",
              "Together, the pages become a one-of-a-kind storybook created by the people who matter most.",
            ]}
            listLabel="PERFECT FOR:"
            listItems={["Baby showers", "New couples", "Milestone birthdays", "Guest of honor celebrations"]}
            accent="Because some memories deserve to become a story."
            palette={palette}
            fonts={fonts}
          />

          <ExperienceBlock
            image={wallPuzzleShowerPhoto}
            imageAlt="Guests completing an interactive wall puzzle keepsake"
            title="Interactive Wall Puzzle"
            tagline="A celebration keepsake that comes together piece by piece."
            paragraphs={[
              "Each guest contributes a piece of the experience, creating a larger interactive display that reveals the complete picture as everyone participates.",
              "A visual reminder that every guest played a part.",
            ]}
            palette={palette}
            fonts={fonts}
          />
        </div>
      </section>

      {/* DRESS-UP EXPERIENCES */}
      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto mb-14 max-w-6xl text-center">
          <CategoryLabel palette={palette} fonts={fonts}>
            DRESS-UP EXPERIENCES
          </CategoryLabel>
        </div>

        <ExperienceBlock
          image={TUTU_IMAGE}
          imageAlt="Tutu Twirls pop-up dress-up experience"
          title="Tutu Twirls Pop-Up"
          tagline="Dress-up fun is back."
          paragraphs={[
            "A playful pop-up experience where kids and grown-ups can explore tutus, statement pieces, accessories, and creative looks.",
          ]}
          listLabel="FEATURING:"
          listItems={[
            "The Tutu Tent",
            "Adult and child dress-up options",
            "Tutus",
            "Sequin blazers",
            "Suspenders",
            "Statement accessories",
            "Styled details",
            "Photo moments",
          ]}
          accent="Because imagination does not have an age limit."
          ctaLabel="EXPLORE TUTU TWIRLS"
          onCta={goToTutu}
          palette={palette}
          fonts={fonts}
        />
      </section>

      {/* IMMERSIVE PHOTO MOMENTS */}
      <section className="px-6 py-20 sm:px-10 lg:py-28" style={{ background: palette.surface }}>
        <div className="mx-auto mb-14 max-w-6xl text-center">
          <CategoryLabel palette={palette} fonts={fonts}>
            MORE THAN A BACKDROP
          </CategoryLabel>
        </div>

        <ExperienceBlock
          image={photoWallPhoto}
          imageAlt="Custom-built display wall photo moment"
          title="Immersive Photo Moments"
          paragraphs={[
            "Our custom-built display walls and photo experiences are designed to become part of the celebration.",
            "No standard arch-and-balloon setup.",
            "We create statement pieces that give guests a reason to step in, interact, and capture the moment.",
          ]}
          listLabel="FEATURING:"
          listItems={[
            "Custom-designed display walls",
            "Light-up elements",
            "Statement furniture",
            "Lounge-style setups",
            "Couch installations",
            "Creative photo environments",
            "Instagram-worthy moments designed around your event",
          ]}
          accent="These are not just backgrounds. They are part of the experience."
          ctaLabel="EXPLORE DISPLAY WALLS"
          onCta={goToDisplays}
          reverse
          palette={palette}
          fonts={fonts}
        />
      </section>

      {/* BUILD YOUR OWN EXPERIENCE */}
      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-semibold sm:text-5xl" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
            Build Your Own Experience
          </h2>
          <p className="mt-5 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
            Every celebration has its own story.
          </p>
          <p className="mt-2 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.muted }}>
            Choose one experience or combine multiple elements to create
            something completely custom.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-3">
          {[
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
          ].map((combo) => (
            <div key={combo.intro} className="rounded-xl p-6" style={{ background: palette.surface, border: `1px solid ${palette.line}` }}>
              <p className="text-base font-semibold leading-relaxed" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
                {combo.intro}
              </p>
              <div className="mt-4 space-y-2">
                {combo.items.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Sparkles size={13} color={palette.goldDeep} />
                    <span className="text-sm" style={{ ...fonts.bodyFont, color: palette.ink }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-14 max-w-2xl text-center text-lg italic leading-8" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
          The possibilities are endless because your celebration should not
          feel like everyone else's.
        </p>
      </section>

      {/* FINAL CTA */}
      <div className="px-6 py-16 text-center sm:px-10" style={{ background: `${palette.primary}0D` }}>
        <button
          onClick={() => openPickerForBuilder()}
          className="inline-flex items-center gap-3 rounded-sm px-8 py-4 text-base font-semibold tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
        >
          BUILD MY EXPERIENCE <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}
