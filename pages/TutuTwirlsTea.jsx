import React from "react";
import { ArrowRight, Camera, Heart, Sparkles, Star, Palette, UtensilsCrossed, Wand2 } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";

const HERO_IMAGE = "/photos/tutu-twirls-tea-hero.jpg";
const WARDROBE_IMAGE = "/photos/tutu-twirls-tea-wardrobe.jpg";
const TEA_IMAGE = "/photos/tutu-twirls-tea-table.jpg";
const PHOTO_IMAGE = "/photos/tutu-twirls-tea-photo-wall.jpg";
const BIRTHDAY_IMAGE = "/photos/tutu-twirls-tea-birthday-star.jpg";
const BACKYARD_IMAGE = "/photos/tutu-twirls-tea-backyard.jpg";

const CTA_LABEL = "CREATE YOUR TUTU POP-UP";

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

export default function TutuTwirlsTea() {
  const { openPickerForBuilder } = useEventType();
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
                A TUTU POP-UP EXPERIENCE
              </SectionLabel>

              <h1
                className="mt-5 text-6xl font-medium leading-[0.9] sm:text-7xl lg:text-[88px]"
                style={{ ...fonts.displayFont, color: palette.primaryDeep }}
              >
                Tutu
                <br />
                Twirls
              </h1>

              <p
                className="mt-7 text-2xl leading-9"
                style={{ ...fonts.displayFont, color: palette.ink }}
              >
                Remember when getting dressed up was the best part?
              </p>

              <p
                className="mt-6 max-w-md text-base leading-7"
                style={{ ...fonts.bodyFont, color: palette.muted }}
              >
                The sparkle. The confidence. The feeling of becoming someone
                a little more fabulous for the day.
              </p>

              <p
                className="mt-5 text-xl italic"
                style={{ ...fonts.displayFont, color: palette.gold }}
              >
                Tutu Twirls brings that feeling back.
              </p>

              <p
                className="mt-5 max-w-md text-base leading-7"
                style={{ ...fonts.bodyFont, color: palette.muted }}
              >
                We create pop-up dress-up experiences filled with statement
                pieces, playful styling, and unforgettable moments for kids
                and grown-ups who still know how to have fun.
              </p>

              <p
                className="mt-7 text-sm font-semibold tracking-[0.2em]"
                style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
              >
                STARTING AT $495
              </p>

              <button
                onClick={() => openPickerForBuilder()}
                className="mt-5 inline-flex items-center gap-3 rounded-sm px-7 py-4 text-sm font-semibold tracking-[0.14em] text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
              >
                {CTA_LABEL}
                <ArrowRight size={17} strokeWidth={1.7} />
              </button>
            </div>
          </div>

          <ImagePanel
            src={HERO_IMAGE}
            alt="Tutu Twirls pop-up dress-up experience"
            className="min-h-[520px] lg:min-h-[720px]"
          />
        </div>
      </section>

      {/* DRESS UP IS FOR EVERYONE */}
      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <SectionLabel palette={palette} fonts={fonts}>
              NOT JUST FOR KIDS
            </SectionLabel>

            <h2
              className="mt-4 text-5xl font-medium leading-tight sm:text-6xl"
              style={{ ...fonts.displayFont, color: palette.primaryDeep }}
            >
              Dress up is
              <br />
              for everyone.
            </h2>

            <p
              className="mt-5 text-xl italic"
              style={{ ...fonts.displayFont, color: palette.gold }}
            >
              Who decided dress-up was only for kids?
            </p>

            <p
              className="mt-6 text-base leading-8"
              style={{ ...fonts.bodyFont, color: palette.muted }}
            >
              At Tutu Twirls, everyone gets to join in.
            </p>

            <p
              className="mt-4 text-base leading-8"
              style={{ ...fonts.bodyFont, color: palette.muted }}
            >
              Little ones can twirl in tutus, try on bold looks, and step
              into their imagination.
            </p>

            <p
              className="mt-4 text-base leading-8"
              style={{ ...fonts.bodyFont, color: palette.muted }}
            >
              Grown-ups can join the fun too, with adult-sized tutus,
              statement pieces, sequin blazers, suspenders, and playful
              accessories designed for anyone who wants to get involved.
            </p>

            <p
              className="mt-5 text-xl italic"
              style={{ ...fonts.displayFont, color: palette.gold }}
            >
              Because the best events are the ones where everyone is
              smiling.
            </p>
          </div>

          <ImagePanel
            src={BACKYARD_IMAGE}
            alt="Kids and grown-ups twirling together in tutus at a Tutu Twirls pop-up"
            className="aspect-[4/5] sm:aspect-[5/4]"
          />
        </div>
      </section>

      {/* MORE THAN TUTUS */}
      <section className="px-6 py-20 sm:px-10 lg:py-28" style={{ background: palette.surface }}>
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <ImagePanel
            src={WARDROBE_IMAGE}
            alt="The Tutu Tent, filled with dress-up pieces waiting to be discovered"
            className="aspect-[4/5]"
          />

          <div>
            <SectionLabel palette={palette} fonts={fonts}>
              MORE THAN TUTUS
            </SectionLabel>

            <h2
              className="mt-4 text-5xl font-medium leading-tight sm:text-6xl"
              style={{ ...fonts.displayFont, color: palette.primaryDeep }}
            >
              Yes, there are tutus.
            </h2>

            <p
              className="mt-5 text-xl italic"
              style={{ ...fonts.displayFont, color: palette.gold }}
            >
              But the magic is in the transformation.
            </p>

            <p
              className="mt-6 text-sm font-semibold tracking-[0.18em]"
              style={{ ...fonts.bodyFont, color: palette.gold }}
            >
              A TUTU TWIRLS POP-UP MIGHT INCLUDE:
            </p>

            <div className="mt-6 grid gap-7 sm:grid-cols-2">
              <Feature icon={Sparkles} title="The Tutu Tent" palette={palette} fonts={fonts}>
                A whimsical space filled with dress-up pieces waiting to be
                discovered.
              </Feature>

              <Feature icon={Star} title="Statement Looks" palette={palette} fonts={fonts}>
                From colourful tutus to sequin blazers, suspenders, and
                unexpected accessories that make guests feel like the best
                version of themselves.
              </Feature>

              <Feature icon={Heart} title="Styled Details" palette={palette} fonts={fonts}>
                A beautiful setup designed to turn your space into an
                experience.
              </Feature>

              <Feature icon={Palette} title="Creative Moments" palette={palette} fonts={fonts}>
                Activity stations and interactive elements that give guests
                something to do, create, and remember.
              </Feature>
            </div>
          </div>
        </div>
      </section>

      {/* YOU BRING THE PEOPLE, WE BRING THE MAGIC */}
      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <ImagePanel
            src={TEA_IMAGE}
            alt="A fully styled Tutu Twirls setup, ready for guests to arrive"
            className="aspect-[4/5] sm:aspect-[5/4]"
          />

          <div>
            <SectionLabel palette={palette} fonts={fonts}>
              HOW IT WORKS
            </SectionLabel>

            <h2
              className="mt-4 text-5xl font-medium leading-tight sm:text-6xl"
              style={{ ...fonts.displayFont, color: palette.primaryDeep }}
            >
              You bring the people.
              <br />
              We bring the magic.
            </h2>

            <p
              className="mt-6 text-base leading-8"
              style={{ ...fonts.bodyFont, color: palette.muted }}
            >
              Tutu Twirls is not a traditional party entertainer. We don't
              take over your event. We create the moment everyone wants to
              be part of.
            </p>

            <p
              className="mt-5 text-xl italic"
              style={{ ...fonts.displayFont, color: palette.gold }}
            >
              We arrive, style the space, set everything up, and pack it
              away when the fun is done.
            </p>

            <p
              className="mt-5 text-base leading-8"
              style={{ ...fonts.bodyFont, color: palette.muted }}
            >
              You get to enjoy your guests.
            </p>
          </div>
        </div>
      </section>

      {/* DESIGNED SO EVERYONE CAN JOIN IN */}
      <section className="px-6 py-20 sm:px-10 lg:py-28" style={{ background: palette.surface }}>
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel palette={palette} fonts={fonts}>
            MADE FOR EVERYONE
          </SectionLabel>

          <h2
            className="mt-4 text-5xl font-medium leading-tight sm:text-6xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            Designed so everyone
            <br />
            can join in.
          </h2>

          <p
            className="mt-5 text-xl italic"
            style={{ ...fonts.displayFont, color: palette.gold }}
          >
            Dress-up should feel exciting, not limiting.
          </p>

          <p
            className="mx-auto mt-6 max-w-2xl text-base leading-8"
            style={{ ...fonts.bodyFont, color: palette.muted }}
          >
            Our collection includes options designed with different comfort
            needs in mind, including Velcro-opening tutus that make dressing
            easier and more accessible.
          </p>

          <p
            className="mx-auto mt-6 max-w-2xl text-xl font-medium leading-8"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            There is no single way to wear the magic.
          </p>

          <p
            className="mx-auto mt-4 max-w-2xl text-base leading-8"
            style={{ ...fonts.bodyFont, color: palette.muted }}
          >
            Everyone deserves the chance to feel included, creative, and
            confident.
          </p>
        </div>
      </section>

      {/* WANT TO MAKE IT EVEN BIGGER */}
      <section className="px-6 py-20 sm:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <ImagePanel
            src={PHOTO_IMAGE}
            alt="Guests celebrating together at a Tutu Twirls pop-up"
            className="aspect-[4/5]"
          />

          <div>
            <SectionLabel palette={palette} fonts={fonts}>
              ADD-ON EXPERIENCES
            </SectionLabel>

            <h2
              className="mt-4 text-5xl font-medium leading-tight sm:text-6xl"
              style={{ ...fonts.displayFont, color: palette.primaryDeep }}
            >
              Want to make it
              <br />
              even bigger?
            </h2>

            <div className="mt-9 grid gap-7 sm:grid-cols-2">
              <Feature icon={Camera} title="Event Photography" palette={palette} fonts={fonts}>
                Capture the looks, the laughter, and the moments guests will
                want to remember.
              </Feature>

              <Feature icon={Sparkles} title="Tutu Event Stylist" palette={palette} fonts={fonts}>
                Want someone there to help guide the experience and
                encourage guests to jump in? Add a stylist to your pop-up.
              </Feature>

              <Feature icon={UtensilsCrossed} title="Caribbean Catering" palette={palette} fonts={fonts}>
                Bring delicious Caribbean flavours into your celebration.
              </Feature>

              <Feature icon={Wand2} title="Custom Enhancements" palette={palette} fonts={fonts}>
                Have a vision? Let's create something unforgettable.
              </Feature>
            </div>
          </div>
        </div>
      </section>

      {/* PERFECT FOR */}
      <section className="px-6 py-20 sm:px-10 lg:py-28" style={{ background: palette.surface }}>
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel palette={palette} fonts={fonts}>
            WHERE THE MAGIC FITS
          </SectionLabel>

          <h2
            className="mt-4 text-5xl font-medium leading-tight sm:text-6xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            Perfect for
          </h2>

          <div className="mx-auto mt-10 grid max-w-xl gap-3 sm:grid-cols-2">
            {[
              "Birthdays",
              "Playdates",
              "Family celebrations",
              "Special occasions",
              "School or community events",
              "Any gathering where people want to have fun again",
            ].map((item) => (
              <div
                key={item}
                className="border-b pb-3"
                style={{ borderColor: palette.line }}
              >
                <span
                  className="text-lg italic"
                  style={{ ...fonts.displayFont, color: palette.primaryDeep }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE TUTU TWIRLS FEELING */}
      <section className="px-6 py-20 sm:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid overflow-hidden lg:grid-cols-2">
            <ImagePanel
              src={BIRTHDAY_IMAGE}
              alt="A custom tiered tutu gown"
              className="min-h-[500px]"
            />

            <div
              className="flex items-center px-8 py-14 sm:px-12 lg:px-16"
              style={{ background: palette.primaryDeep }}
            >
              <div>
                <SectionLabel palette={{ ...palette, gold: "#D7B77C" }} fonts={fonts}>
                  THE TUTU TWIRLS FEELING
                </SectionLabel>

                <p
                  className="mt-6 text-2xl leading-9"
                  style={{ ...fonts.displayFont, color: "#FFFFFF" }}
                >
                  It's the moment someone puts on a piece they never
                  expected to wear.
                </p>

                <p
                  className="mt-5 text-2xl leading-9"
                  style={{ ...fonts.displayFont, color: "#FFFFFF" }}
                >
                  It's the laugh when an adult decides to join the fun.
                </p>

                <p
                  className="mt-5 text-2xl leading-9"
                  style={{ ...fonts.displayFont, color: "#FFFFFF" }}
                >
                  It's kids seeing themselves as creative, confident, and
                  completely themselves.
                </p>

                <p
                  className="mt-8 text-base leading-7"
                  style={{ ...fonts.bodyFont, color: "#FFFFFFB8" }}
                >
                  It's not just dressing up.
                </p>

                <p
                  className="mt-2 text-xl italic leading-8"
                  style={{ ...fonts.displayFont, color: "#D7B77C" }}
                >
                  It's creating a memory.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="px-6 py-24 text-center sm:px-10 lg:py-32"
        style={{ background: palette.primaryDeep }}
      >
        <div className="mx-auto max-w-3xl">
          <h2
            className="text-5xl font-medium leading-tight sm:text-7xl"
            style={{ ...fonts.displayFont, color: "#FFFFFF" }}
          >
            Ready to bring
            <br />
            back the fun?
          </h2>

          <p
            className="mx-auto mt-6 max-w-xl text-xl italic leading-8"
            style={{ ...fonts.displayFont, color: "#D7B77C" }}
          >
            Let's create a Tutu Pop-Up that people will talk about long
            after the last twirl.
          </p>

          <button
            onClick={() => openPickerForBuilder()}
            className="mt-9 inline-flex items-center gap-3 rounded-sm px-8 py-4 text-sm font-semibold tracking-[0.14em] transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              ...fonts.bodyFont,
              background: palette.gold,
              color: palette.primaryDeep,
            }}
          >
            {CTA_LABEL}
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}
