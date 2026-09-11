import React from "react";
import { Camera, Heart, Sparkles, Star, UtensilsCrossed, Wand2 } from "lucide-react";
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
  ScriptNote,
  SectionIntro,
  editorialShadow,
  paperTexture,
} from "../components/EditorialKit";

const HERO_IMAGE = "/photos/tutu-twirls-tea-hero.jpg";
const WARDROBE_IMAGE = "/photos/tutu-twirls-tea-wardrobe.jpg";
const TEA_IMAGE = "/photos/tutu-twirls-tea-table.jpg";
const PHOTO_IMAGE = "/photos/tutu-twirls-tea-photo-wall.jpg";
const BIRTHDAY_IMAGE = "/photos/tutu-twirls-tea-birthday-star.jpg";
const BACKYARD_IMAGE = "/photos/tutu-twirls-tea-backyard.jpg";

const FEATURES = [
  {
    icon: Sparkles,
    title: "The Tutu Tent",
    body: "A wardrobe moment filled with pieces waiting to be discovered.",
  },
  {
    icon: Star,
    title: "Statement Looks",
    body: "Tutus, sequin blazers, suspenders and unexpected accessories for kids and grown-ups.",
  },
  {
    icon: Camera,
    title: "A photo moment",
    body: "Because once everyone is dressed up, somebody is absolutely taking pictures.",
  },
  {
    icon: UtensilsCrossed,
    title: "Tea and treats",
    body: "Add a styled table or snack moment so the experience can keep going after the wardrobe raid.",
  },
];

const ADD_ONS = [
  {
    icon: Camera,
    title: "Event Photography",
    body: "Capture the looks, the laughter and the moments guests will want to remember.",
  },
  {
    icon: Sparkles,
    title: "Tutu Event Stylist",
    body: "Want someone there to help guide the experience and encourage guests to jump in? Add a stylist to your pop-up.",
  },
  {
    icon: UtensilsCrossed,
    title: "Caribbean Catering",
    body: "Bring delicious Caribbean flavours into your celebration.",
  },
  {
    icon: Wand2,
    title: "Custom Enhancements",
    body: "Have a vision? Let's create something unforgettable.",
  },
];

const OCCASIONS = [
  "Birthdays",
  "Playdates",
  "Family celebrations",
  "Special occasions",
  "School or community events",
  "Any gathering where people want to have fun again",
];

export default function TutuTwirlsTea() {
  const { palette, fonts } = usePalette();
  const { openPickerForBuilder } = useEventType();

  return (
    <main style={{ background: palette.bg, color: palette.ink }}>
      <PageHero
        eyebrow="A TUTU POP-UP EXPERIENCE"
        title="Tutu Twirls"
        script="Dress-up fun is back."
        body="A playful pop-up experience filled with statement pieces, sparkly details and the very serious business of becoming a little more fabulous for the day."
        image={HERO_IMAGE}
        imageAlt="Tutu Twirls pop-up dress-up experience"
        palette={palette}
        fonts={fonts}
      >
        <div className="flex flex-wrap items-center gap-5">
          <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts}>
            Create your Tutu Pop-Up
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
            Starting at $495
          </span>
        </div>
      </PageHero>

      <section style={{ ...paperTexture(palette), padding: "96px 24px" }}>
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Kicker palette={palette} fonts={fonts}>NOT JUST FOR KIDS</Kicker>
            <h2
              className="mt-4"
              style={{
                ...fonts.displayFont,
                color: palette.primaryDeep,
                fontSize: "clamp(3rem, 6vw, 5.5rem)",
                lineHeight: 0.98,
                fontWeight: 630,
              }}
            >
              Dress-up is for everyone.
            </h2>
            <ScriptNote
              palette={palette}
              fonts={fonts}
              style={{ fontSize: "clamp(2rem, 4vw, 3.6rem)", marginTop: "18px" }}
            >
              Who decided we had to grow out of fun?
            </ScriptNote>
            <p className="mt-7 max-w-xl text-base leading-8" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Little ones can twirl, layer, accessorize and step into their imagination. Grown-ups can join in with adult-sized pieces, statement looks and enough sparkle to make restraint feel like a strange personal choice.
            </p>
          </div>

          <div
            className="overflow-hidden"
            style={{
              borderRadius: "5px",
              boxShadow: editorialShadow,
              border: `1px solid ${palette.line}`,
            }}
          >
            <img src={BACKYARD_IMAGE} alt="Kids and grown-ups enjoying Tutu Twirls together" className="aspect-[5/4] h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <JewelBand palette={palette} style={{ padding: "94px 24px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="MORE THAN TUTUS"
            title="The magic is in the transformation."
            body="The wardrobe is the invitation. The real experience is the moment guests stop worrying about looking silly and start having fun."
            palette={palette}
            fonts={fonts}
            light
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((item, i) => {
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

      <section style={{ ...paperTexture(palette), padding: "96px 24px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="BUILD THE MOMENT"
            title="Wardrobe. Table. Photos. Personality."
            body="Choose how simple or styled you want the pop-up to feel. The point is not to make everyone match. The point is to give everyone permission to play."
            palette={palette}
            fonts={fonts}
          />

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { src: WARDROBE_IMAGE, label: "The wardrobe" },
              { src: TEA_IMAGE, label: "The table" },
              { src: PHOTO_IMAGE, label: "The photo moment" },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 80}>
                <div>
                  <div
                    className="overflow-hidden"
                    style={{
                      aspectRatio: "4 / 5",
                      borderRadius: "5px",
                      boxShadow: editorialShadow,
                      transform: `rotate(${i === 1 ? 1.5 : i === 0 ? -1.5 : 1}deg)`,
                      border: `1px solid ${palette.line}`,
                    }}
                  >
                    <img src={item.src} alt={item.label} className="h-full w-full object-cover" />
                  </div>
                  <p
                    className="mt-5 text-center text-sm font-semibold tracking-[0.12em]"
                    style={{ ...fonts.bodyFont, color: palette.primaryDeep, textTransform: "uppercase" }}
                  >
                    {item.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: palette.surface, padding: "96px 24px" }}>
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Kicker palette={palette} fonts={fonts}>HOW IT WORKS</Kicker>
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
              You bring the people. We bring the magic.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Tutu Twirls is not a traditional party entertainer. We don't take over your event. We create the moment everyone wants to be part of.
            </p>
            <ScriptNote
              palette={palette}
              fonts={fonts}
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", marginTop: "18px" }}
            >
              We arrive, style the space, set everything up, and pack it away when the fun is done.
            </ScriptNote>
            <p className="mt-6 max-w-xl text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
              You get to enjoy your guests.
            </p>
          </div>

          <ElevatedCard palette={palette} className="p-8">
            <Kicker palette={palette} fonts={fonts}>MADE FOR EVERYONE</Kicker>
            <h3 className="mt-3 text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
              Dress-up should feel exciting, not limiting.
            </h3>
            <p className="mt-4 text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Our collection includes options designed with different comfort needs in mind, including Velcro-opening tutus that make dressing easier and more accessible.
            </p>
            <p className="mt-4 text-lg font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
              There is no single way to wear the magic.
            </p>
            <p className="mt-3 text-base leading-7" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Everyone deserves the chance to feel included, creative, and confident.
            </p>
          </ElevatedCard>
        </div>
      </section>

      <JewelBand palette={palette} style={{ padding: "94px 24px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="ADD-ON EXPERIENCES"
            title="Want to make it even bigger?"
            palette={palette}
            fonts={fonts}
            light
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ADD_ONS.map((item, i) => {
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
        image={BIRTHDAY_IMAGE}
        imageAlt="Tutu Twirls birthday celebration"
        eyebrow="FOR BIRTHDAYS AND BEYOND"
        title="A little dramatic? Perfect."
        body="Tutu Twirls works beautifully for birthdays, family celebrations, pop-up dress-up moments and any event that needs a little permission to stop taking itself so seriously."
        palette={palette}
        fonts={fonts}
      >
        <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts} light>
          Create your Tutu Pop-Up
        </PrimaryButton>
      </FullBleedStatement>

      <section style={{ ...paperTexture(palette), padding: "88px 24px" }}>
        <div className="mx-auto max-w-3xl text-center">
          <Kicker palette={palette} fonts={fonts}>WHERE THE MAGIC FITS</Kicker>
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
            Perfect for
          </h2>
          <div className="mx-auto mt-9 grid max-w-xl gap-3 sm:grid-cols-2">
            {OCCASIONS.map((item) => (
              <div key={item} className="border-b pb-3" style={{ borderColor: palette.line }}>
                <span className="text-lg italic" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...paperTexture(palette), padding: "88px 24px" }}>
        <div className="mx-auto max-w-4xl text-center">
          <Heart className="mx-auto" size={22} color={palette.accent} />
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
            The best part is watching people forget they were supposed to be too grown-up for this.
          </h2>
          <div className="mt-8">
            <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts}>
              Build the experience
            </PrimaryButton>
          </div>
        </div>
      </section>
    </main>
  );
}
