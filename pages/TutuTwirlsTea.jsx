import React from "react";
import { ArrowRight, Camera, Heart, Sparkles, Star, Wine } from "lucide-react";
import { usePalette } from "../PaletteContext";

const HERO_IMAGE = "/photos/tutu-twirls-tea-hero.jpg";
const WARDROBE_IMAGE = "/photos/tutu-twirls-tea-wardrobe.jpg";
const TEA_IMAGE = "/photos/tutu-twirls-tea-table.jpg";
const PHOTO_IMAGE = "/photos/tutu-twirls-tea-photo-wall.jpg";
const BIRTHDAY_IMAGE = "/photos/tutu-twirls-tea-birthday-star.jpg";
const BACKYARD_IMAGE = "/photos/tutu-twirls-tea-backyard.jpg";

function SectionLabel({ children, palette, fonts }) {
  return (
    <p
      className="text-xs font-semibold tracking-[0.3em]"
      style={{ ...fonts.bodyFont, color: palette.gold }}
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
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}

function Feature({ icon: Icon, title, children, palette, fonts }) {
  return (
    <div className="border-t pt-6" style={{ borderColor: palette.line }}>
      <Icon size={20} strokeWidth={1.5} color={palette.gold} />
      <h3
        className="mt-4 text-2xl font-semibold"
        style={{ ...fonts.displayFont, color: palette.primaryDeep }}
      >
        {title}
      </h3>
      <p
        className="mt-3 text-base leading-7"
        style={{ ...fonts.bodyFont, color: palette.muted }}
      >
        {children}
      </p>
    </div>
  );
}

export default function TutuTwirlsTea({ navigate }) {
  const { palette, fonts } = usePalette();

  return (
    <main
      className="min-h-screen overflow-hidden"
      style={{ background: palette.bg, color: palette.ink }}
    >
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
            <div className="max-w-xl">
              <SectionLabel palette={palette} fonts={fonts}>
                BIRTHDAYS · A SIGNATURE EXPERIENCE
              </SectionLabel>

              <h1
                className="mt-5 text-6xl font-medium leading-[0.9] sm:text-7xl lg:text-[88px]"
                style={{ ...fonts.displayFont, color: palette.primaryDeep }}
              >
                Tutu
                <br />
                Twirls
                <br />
                <span className="font-normal" style={{ color: palette.gold }}>
                  & Tea
                </span>
              </h1>

              <p
                className="mt-7 text-2xl leading-9"
                style={{ ...fonts.displayFont, color: palette.ink }}
              >
                Tea. Twirls. Photos.
                <br />
                Memories.
              </p>

              <p
                className="mt-6 max-w-md text-base leading-7"
                style={{ ...fonts.bodyFont, color: palette.muted }}
              >
                A beautifully styled tea-time experience where kids and
                grown-ups get to celebrate together, with a little dress-up,
                a little sparkle, and a lot to remember.
              </p>

              <button
                onClick={() => navigate("/package-builder")}
                className="mt-9 inline-flex items-center gap-3 rounded-sm px-7 py-4 text-sm font-semibold tracking-[0.14em] text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
              >
                BUILD MY EXPERIENCE
                <ArrowRight size={17} strokeWidth={1.7} />
              </button>
            </div>
          </div>

          <ImagePanel
            src={HERO_IMAGE}
            alt="Tutu Twirls & Tea birthday experience"
            className="min-h-[520px] lg:min-h-[720px]"
          />
        </div>
      </section>

      {/* INTRO */}
      <section
        className="px-6 py-20 sm:px-10 lg:py-28"
        style={{ background: palette.primaryDeep }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel palette={{ ...palette, gold: "#D7B77C" }} fonts={fonts}>
            NOT A DROP-OFF ACTIVITY
          </SectionLabel>

          <h2
            className="mt-5 text-5xl font-medium leading-tight sm:text-6xl"
            style={{ ...fonts.displayFont, color: "#FFFFFF" }}
          >
            Everyone gets to
            <br />
            celebrate.
          </h2>

          <p
            className="mx-auto mt-7 max-w-2xl text-base leading-8"
            style={{ ...fonts.bodyFont, color: "#FFFFFFB8" }}
          >
            Tutu Twirls & Tea is designed for the whole room. Beautiful tea
            service, a styled tablescape, a photo wall, a dress-up wardrobe,
            meaningful activities and plenty of room for adults to enjoy
            themselves too.
          </p>
        </div>
      </section>

      {/* BACKYARD AFFAIR */}
      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <SectionLabel palette={palette} fonts={fonts}>
              ANY SETTING
            </SectionLabel>

            <h2
              className="mt-4 text-5xl font-medium leading-tight sm:text-6xl"
              style={{ ...fonts.displayFont, color: palette.primaryDeep }}
            >
              A backyard affair
              <br />
              to be remembered.
            </h2>

            <p
              className="mt-6 text-base leading-8"
              style={{ ...fonts.bodyFont, color: palette.muted }}
            >
              Your own lawn can become the venue. A tented backyard, a garden
              tablescape dressed in blush chair bows and fresh florals, and
              the same twirls, tea and kindness carried right outside.
            </p>

            <p
              className="mt-5 text-xl italic"
              style={{ ...fonts.displayFont, color: palette.gold }}
            >
              Indoors, outdoors, or somewhere in between.
            </p>
          </div>

          <ImagePanel
            src={BACKYARD_IMAGE}
            alt="A backyard Tutu Twirls & Tea celebration with a garden tablescape"
            className="aspect-[4/5] sm:aspect-[5/4]"
          />
        </div>
      </section>

      {/* TEA */}
      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <ImagePanel
            src={TEA_IMAGE}
            alt="Styled tea table for Tutu Twirls & Tea"
            className="aspect-[4/5] sm:aspect-[5/4]"
          />

          <div>
            <SectionLabel palette={palette} fonts={fonts}>
              TEA FOR EVERYONE
            </SectionLabel>

            <h2
              className="mt-4 text-5xl font-medium leading-tight sm:text-6xl"
              style={{ ...fonts.displayFont, color: palette.primaryDeep }}
            >
              Little cups.
              <br />
              Big conversations.
            </h2>

            <p
              className="mt-6 text-base leading-8"
              style={{ ...fonts.bodyFont, color: palette.muted }}
            >
              The tea experience can be styled around the celebration and the
              people attending it. Kids can enjoy their own tea service while
              grown-ups enjoy something a little more their speed.
            </p>

            <div className="mt-10 grid gap-7 sm:grid-cols-2">
              <Feature icon={Sparkles} title="For the kids" palette={palette} fonts={fonts}>
                Kid-friendly tea, treats and beautifully styled place settings
                designed to make them feel like part of something special.
              </Feature>

              <Feature icon={Wine} title="For the grown-ups" palette={palette} fonts={fonts}>
                Traditional tea, specialty beverages, mocktails, mimosas or
                whatever suits the host and the celebration.
              </Feature>
            </div>
          </div>
        </div>
      </section>

      {/* WARDROBE */}
      <section
        className="px-6 py-20 sm:px-10 lg:py-28"
        style={{ background: palette.surface }}
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20">
          <div className="order-2 lg:order-1">
            <SectionLabel palette={palette} fonts={fonts}>
              CHOOSE YOUR LOOK
            </SectionLabel>

            <h2
              className="mt-4 text-5xl font-medium leading-tight sm:text-6xl"
              style={{ ...fonts.displayFont, color: palette.primaryDeep }}
            >
              Whatever their
              <br />
              heart desires.
            </h2>

            <p
              className="mt-6 text-base leading-8"
              style={{ ...fonts.bodyFont, color: palette.muted }}
            >
              The garment rack is a celebration wardrobe, filled with tutus,
              styled blazers and statement pieces for kids and grown-ups.
            </p>

            <p
              className="mt-5 text-xl italic"
              style={{ ...fonts.displayFont, color: palette.gold }}
            >
              Any gender. Any garment.
            </p>

            <div className="mt-9 grid gap-5 sm:grid-cols-2">
              {[
                "Children's tutus",
                "Adult tutus",
                "Styled blazers",
                "Statement jackets",
                "Adjustable pieces",
                "Velcro-opening tutus",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 border-b pb-3"
                  style={{ borderColor: palette.line }}
                >
                  <Sparkles size={14} color={palette.gold} />
                  <span
                    className="text-sm"
                    style={{ ...fonts.bodyFont, color: palette.ink }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <p
              className="mt-8 text-sm leading-6"
              style={{ ...fonts.bodyFont, color: palette.muted }}
            >
              Velcro-opening styles are available so children with different
              mobility needs can participate comfortably. There is no separate
              wardrobe, just different ways to wear the magic.
            </p>
          </div>

          <ImagePanel
            src={WARDROBE_IMAGE}
            alt="Tutus and styled blazers on a garment rack"
            className="order-1 aspect-[4/5] lg:order-2"
          />
        </div>
      </section>

      {/* KINDNESS + TIME CAPSULE */}
      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <SectionLabel palette={palette} fonts={fonts}>
              SOMETHING TO KEEP
            </SectionLabel>

            <h2
              className="mt-4 text-5xl font-medium leading-tight sm:text-6xl"
              style={{ ...fonts.displayFont, color: palette.primaryDeep }}
            >
              The party becomes
              <br />
              part of their story.
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            <div
              className="p-8 sm:p-10"
              style={{
                background: palette.cream || palette.bg,
                border: `1px solid ${palette.line}`,
              }}
            >
              <Heart size={23} color={palette.gold} strokeWidth={1.5} />

              <h3
                className="mt-6 text-4xl font-medium"
                style={{ ...fonts.displayFont, color: palette.primaryDeep }}
              >
                The Kindness Station
              </h3>

              <p
                className="mt-4 text-base leading-8"
                style={{ ...fonts.bodyFont, color: palette.muted }}
              >
                Because we really can start kids young. Guests create little
                kindness cards for someone else, something genuine,
                encouraging and worth keeping.
              </p>

              <p
                className="mt-5 text-sm font-semibold tracking-[0.18em]"
                style={{ ...fonts.bodyFont, color: palette.gold }}
              >
                PARTICIPATE · CONTRIBUTE · KEEP
              </p>
            </div>

            <div
              className="p-8 sm:p-10"
              style={{
                background: palette.surface,
                border: `1px solid ${palette.line}`,
              }}
            >
              <Star size={23} color={palette.gold} strokeWidth={1.5} />

              <h3
                className="mt-6 text-4xl font-medium"
                style={{ ...fonts.displayFont, color: palette.primaryDeep }}
              >
                The Time Capsule
              </h3>

              <p
                className="mt-4 text-base leading-8"
                style={{ ...fonts.bodyFont, color: palette.muted }}
              >
                Children and adults can leave messages, memories, predictions,
                drawings and little pieces of themselves for the birthday child
                to revisit later.
              </p>

              <p
                className="mt-5 text-sm font-semibold tracking-[0.18em]"
                style={{ ...fonts.bodyFont, color: palette.gold }}
              >
                PHOTOS · STORIES · WISHES · MEMORIES
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PHOTO WALL */}
      <section
        className="px-6 py-20 sm:px-10 lg:py-28"
        style={{ background: palette.primary }}
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <SectionLabel palette={{ ...palette, gold: "#D7B77C" }} fonts={fonts}>
              PICTURE THIS
            </SectionLabel>

            <h2
              className="mt-4 text-5xl font-medium leading-tight sm:text-6xl"
              style={{ ...fonts.displayFont, color: "#FFFFFF" }}
            >
              The photo wall
              <br />
              is part of the party.
            </h2>

            <p
              className="mt-6 text-base leading-8"
              style={{ ...fonts.bodyFont, color: "#FFFFFFB8" }}
            >
              Styled to coordinate with the celebration, the photo wall becomes
              a place for birthday portraits, family photographs, sibling
              pictures, best-friend moments, group shots and all the completely
              unplanned magic in between.
            </p>

            <div
              className="mt-9 flex items-start gap-4 border-t pt-6"
              style={{ borderColor: "#FFFFFF30" }}
            >
              <Camera size={22} color="#D7B77C" strokeWidth={1.5} className="mt-1 flex-shrink-0" />
              <div>
                <h3
                  className="text-2xl font-semibold"
                  style={{ ...fonts.displayFont, color: "#FFFFFF" }}
                >
                  Professional photography
                </h3>
                <p
                  className="mt-2 text-base leading-7"
                  style={{ ...fonts.bodyFont, color: "#FFFFFFB8" }}
                >
                  Add professional event photography so the host can actually
                  enjoy the celebration instead of spending the whole afternoon
                  behind their phone.
                </p>
              </div>
            </div>
          </div>

          <ImagePanel
            src={PHOTO_IMAGE}
            alt="Birthday photo wall at Tutu Twirls & Tea"
            className="aspect-[4/5]"
          />
        </div>
      </section>

      {/* BIRTHDAY STAR */}
      <section className="px-6 py-20 sm:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid overflow-hidden lg:grid-cols-2">
            <ImagePanel
              src={BIRTHDAY_IMAGE}
              alt="Custom embellished birthday star outfit"
              className="min-h-[500px]"
            />

            <div
              className="flex items-center px-8 py-14 sm:px-12 lg:px-16"
              style={{ background: palette.primaryDeep }}
            >
              <div>
                <SectionLabel palette={{ ...palette, gold: "#D7B77C" }} fonts={fonts}>
                  OPTIONAL ADD-ON
                </SectionLabel>

                <h2
                  className="mt-5 text-5xl font-medium leading-tight sm:text-6xl"
                  style={{ ...fonts.displayFont, color: "#FFFFFF" }}
                >
                  Make them
                  <br />
                  impossible
                  <br />
                  to miss.
                </h2>

                <p
                  className="mt-6 text-base leading-8"
                  style={{ ...fonts.bodyFont, color: "#FFFFFFB8" }}
                >
                  The birthday child can receive a custom-styled tutu or
                  statement jacket designed specifically for their celebration.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    "Custom colours",
                    "Rhinestones & sparkle",
                    "Personalized details",
                    "Designed around their personality",
                    "Styled to coordinate with the party",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3"
                      style={{ ...fonts.bodyFont, color: "#FFFFFFDD" }}
                    >
                      <Sparkles size={14} color="#D7B77C" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <p
                  className="mt-8 text-xl italic leading-8"
                  style={{ ...fonts.displayFont, color: "#D7B77C" }}
                >
                  From across the room, everyone knows who we're celebrating.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="px-6 py-20 sm:px-10 lg:py-28"
        style={{ background: palette.surface }}
      >
        <div className="mx-auto max-w-6xl text-center">
          <SectionLabel palette={palette} fonts={fonts}>
            ONE EXPERIENCE
          </SectionLabel>

          <h2
            className="mt-4 text-5xl font-medium sm:text-6xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            Choose your magic.
          </h2>

          <div className="mt-14 grid gap-10 text-left md:grid-cols-4">
            {[
              [
                "01",
                "Choose your look",
                "Pick a tutu, blazer or statement piece, or let your little guest skip the dress-up entirely.",
              ],
              [
                "02",
                "Twirl & photograph",
                "The photo wall becomes part of the experience, not an afterthought.",
              ],
              [
                "03",
                "Create & connect",
                "Guests contribute to the Kindness Station and Time Capsule.",
              ],
              [
                "04",
                "Sit for tea",
                "Everyone settles in, celebrates together and enjoys the room.",
              ],
            ].map(([number, title, text]) => (
              <div key={number} className="border-t pt-5" style={{ borderColor: palette.line }}>
                <p
                  className="text-sm font-semibold tracking-[0.18em]"
                  style={{ ...fonts.bodyFont, color: palette.gold }}
                >
                  {number}
                </p>

                <h3
                  className="mt-4 text-2xl font-semibold"
                  style={{ ...fonts.displayFont, color: palette.primaryDeep }}
                >
                  {title}
                </h3>

                <p
                  className="mt-3 text-sm leading-7"
                  style={{ ...fonts.bodyFont, color: palette.muted }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADD-ONS */}
      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <SectionLabel palette={palette} fonts={fonts}>
              MAKE IT YOURS
            </SectionLabel>

            <h2
              className="mt-4 text-5xl font-medium sm:text-6xl"
              style={{ ...fonts.displayFont, color: palette.primaryDeep }}
            >
              Build the celebration
              <br />
              around your people.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Tutu Twirls",
                text: "Add the styled garment rack of tutus, blazers and statement pieces.",
              },
              {
                title: "Birthday Star",
                text: "Give the birthday child a custom embellished tutu or statement jacket.",
              },
              {
                title: "Professional Photography",
                text: "Have the celebration professionally documented from the details to the dance floor.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-7"
                style={{
                  background: palette.surface,
                  border: `1px solid ${palette.line}`,
                }}
              >
                <h3
                  className="text-3xl font-semibold"
                  style={{ ...fonts.displayFont, color: palette.primaryDeep }}
                >
                  {item.title}
                </h3>

                <p
                  className="mt-3 text-base leading-7"
                  style={{ ...fonts.bodyFont, color: palette.muted }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="px-6 py-24 text-center sm:px-10 lg:py-32"
        style={{ background: palette.primaryDeep }}
      >
        <div className="mx-auto max-w-3xl">
          <p
            className="text-3xl italic"
            style={{ ...fonts.displayFont, color: "#D7B77C" }}
          >
            Your event is one day.
          </p>

          <h2
            className="mt-3 text-5xl font-medium leading-tight sm:text-7xl"
            style={{ ...fonts.displayFont, color: "#FFFFFF" }}
          >
            Make the memories
            <br />
            last longer.
          </h2>

          <p
            className="mx-auto mt-6 max-w-xl text-base leading-7"
            style={{ ...fonts.bodyFont, color: "#FFFFFFB8" }}
          >
            Choose the experiences your guests will love and the memories
            you'll want to keep.
          </p>

          <button
            onClick={() => navigate("/package-builder")}
            className="mt-9 inline-flex items-center gap-3 rounded-sm px-8 py-4 text-sm font-semibold tracking-[0.14em] transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              ...fonts.bodyFont,
              background: palette.gold,
              color: palette.primaryDeep,
            }}
          >
            BUILD MY EXPERIENCE
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}
