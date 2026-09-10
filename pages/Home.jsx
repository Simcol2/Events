import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Truck, Users, Gift, CalendarHeart } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";

import heroFullBleed from "../media/timecapsul.png";
import essentialsImage from "../media/hero.png";
import wallPuzzleEngagementPhoto from "../media/file_00000000a204822f9ab953201c8b7043.png";
import babyTriviaPhoto from "../media/babytrivia.png";
import nurseryRhymePhoto from "../media/poem.png";

const TUTU_IMAGE = "/photos/tutu-twirls-tea-hero.jpg";

/* ─── Scroll reveal wrapper ─── */
function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 800ms ease ${delay}ms, transform 800ms cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Hero: photos crossfade behind a fixed headline ─── */
const HERO_LEAD_LINE = "We create celebrations people don't just attend. They experience.";
const HERO_HEADLINE_LINES = ["Rent the pieces", "Create the keepsakes", "Enjoy the memories"];
const HERO_SUPPORTING =
  "From Tutu Pop-Ups that bring dress-up fun back, to thoughtful baby showers and milestone celebrations, we design interactive experiences that give guests something to do, something to feel, and something to remember.";
const HERO_ACCENT_LINE = "Because the best celebrations are the ones where everyone becomes part of the story.";
const HERO_CTA_LABEL = "EXPLORE EXPERIENCES";
const HERO_CTA_TARGET = "/experiences";

const HERO_STATES = [
  {
    image: essentialsImage,
    alt: "Interactive baby shower experience set up by A Slice of G Events in Toronto",
  },
  {
    image: heroFullBleed,
    alt: "Time capsule keepsake experience available for event rental in Toronto and the GTA",
  },
  {
    image: wallPuzzleEngagementPhoto,
    alt: "Guest-built wall puzzle keepsake at an engagement party in Toronto",
  },
  {
    image: babyTriviaPhoto,
    alt: "Guests playing baby trivia at a celebration in the Greater Toronto Area",
  },
  {
    image: nurseryRhymePhoto,
    alt: "Custom keepsake art piece created by guests at a Toronto celebration",
  },
];

function Hero({ fonts, palette, navigate }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_STATES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100svh",
        overflow: "hidden",
        isolation: "isolate",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {HERO_STATES.map((state, i) => (
        <img
          key={state.image}
          src={state.image}
          alt={state.alt}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            opacity: i === index ? 1 : 0,
            transition: "opacity 1400ms ease",
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(20,12,16,.80) 0%, rgba(20,12,16,.72) 35%, rgba(20,12,16,.70) 65%, rgba(20,12,16,.74) 100%)",
        }}
      />

      {/* A second, tighter scrim centered behind the text block itself.
          The linear gradient above keeps the photo readable at the edges,
          but on its own still lets a busy or light part of the rotating
          photos show through directly behind the words (this is what made
          the accent line unreadable against the mailbox photo). This darkens
          just the text's own footprint, regardless of which photo is
          showing. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "radial-gradient(ellipse 640px 620px at 50% 48%, rgba(15,9,12,.42) 0%, rgba(15,9,12,0) 72%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "clamp(90px, 15vw, 120px) 28px clamp(56px, 10vw, 80px)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            ...fonts.bodyFont,
            maxWidth: "560px",
            margin: "0 auto 0.75rem",
            color: "#FDF6EEC2",
            fontSize: "clamp(13px, 1.6vw, 15px)",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1.5,
          }}
        >
          {HERO_LEAD_LINE}
        </p>

        <h1
          style={{
            ...fonts.displayFont,
            margin: "0 auto 1.25rem",
            fontSize: "clamp(2rem, 5vw, 4.2rem)",
            fontWeight: 500,
            lineHeight: 1.15,
            color: "#FDF6EE",
            textShadow: "0 8px 24px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)",
            textAlign: "center",
          }}
        >
          {HERO_HEADLINE_LINES.map((line, i) => (
            <React.Fragment key={line}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </h1>

        <p
          style={{
            ...fonts.bodyFont,
            maxWidth: "580px",
            margin: "0 auto",
            color: "#FDF6EEE6",
            fontSize: "clamp(16px, 2.1vw, 19px)",
            lineHeight: 1.6,
          }}
        >
          {HERO_SUPPORTING}
        </p>

        <p
          style={{
            ...fonts.displayFont,
            maxWidth: "560px",
            margin: "1.1rem auto 0",
            color: "#F2D9A3",
            fontSize: "clamp(17px, 2.2vw, 21px)",
            fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          {HERO_ACCENT_LINE}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "20px",
            width: "100%",
            marginTop: "36px",
          }}
        >
          <button
            onClick={() => navigate(HERO_CTA_TARGET)}
            style={{
              ...fonts.bodyFont,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "16px 28px",
              border: "0",
              borderRadius: "2px",
              background: "#FFFFFF",
              color: palette.primaryDeep,
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              whiteSpace: "nowrap",
            }}
          >
            {HERO_CTA_LABEL}
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}

const EXPERIENCE_CARDS = [
  {
    image: TUTU_IMAGE,
    alt: "Tutu Twirls pop-up dress-up experience",
    title: "Tutu Pop-Ups",
    tagline: "Dress-up is back, and everyone gets invited.",
    body: "A playful pop-up experience filled with statement pieces, tutus, accessories, and creative moments where kids and grown-ups can step into something a little more fun.",
    accent: "Because getting dressed up should not have an age limit.",
    ctaLabel: "EXPLORE TUTU TWIRLS",
    action: "tutu",
  },
  {
    image: essentialsImage,
    alt: "Interactive baby shower experience set up by A Slice of G Events",
    title: "Baby Shower Experiences",
    tagline: "More than games. More than decorations.",
    body: "We create thoughtful moments that bring guests together and give the parents-to-be something meaningful to keep.",
    accent: "From advice and wishes to memories that baby can discover years later, these experiences turn a gathering into a story.",
    ctaLabel: "EXPLORE BABY SHOWERS",
    action: "babyShower",
  },
  {
    image: wallPuzzleEngagementPhoto,
    alt: "Guest-built keepsake at a milestone celebration",
    title: "Milestone & Custom Celebrations",
    tagline: "Some moments deserve more than a standard setup.",
    body: "Whether it is a special birthday, family celebration, or an idea you have been dreaming up, we create experiences designed around the people you are celebrating.",
    ctaLabel: "CREATE SOMETHING CUSTOM",
    action: "custom",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    icon: CalendarHeart,
    title: "Choose your experience",
    body: "Start with one of our signature experiences or tell us what you are imagining.",
  },
  {
    icon: Truck,
    title: "We bring the pieces",
    body: "We provide the interactive elements, styled details, and thoughtful touches that bring the experience to life.",
  },
  {
    icon: Users,
    title: "Your guests take part",
    body: "They play, connect, create, and contribute to the moment.",
  },
  {
    icon: Gift,
    title: "You keep the memories",
    body: "Photos, messages, keepsakes, and stories that continue long after the celebration ends.",
  },
];

/* ─── Main page ─── */
export default function Home({ navigate }) {
  const { palette, fonts } = usePalette();
  const { openPickerForBuilder, chooseEventType } = useEventType();

  const handleCardAction = (action) => {
    if (action === "tutu") {
      navigate("/birthdays/tutu-twirls-tea");
      return;
    }
    if (action === "babyShower") {
      chooseEventType("babyShower");
      navigate("/milestone-events/baby-shower");
      return;
    }
    openPickerForBuilder();
  };

  return (
    <div className="overflow-hidden" style={{ background: palette.bg }}>
      <Hero fonts={fonts} palette={palette} navigate={navigate} />

      {/* ═══════════════════════════════════════
          CELEBRATIONS ARE BETTER WHEN PEOPLE ARE PART OF THEM
          ═══════════════════════════════════════ */}
      <section style={{ background: palette.bg, padding: "80px 40px" }}>
        <div style={{ width: "100%", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h2
            className="text-3xl font-semibold sm:text-4xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            Celebrations are better when people are part of them.
          </h2>

          <p className="mt-6 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
            A beautiful setup is nice.
          </p>
          <p className="mt-3 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.muted }}>
            But the moments people talk about later are usually the ones
            where something happened.
          </p>

          <div className="mx-auto mt-8 max-w-md space-y-3">
            {[
              "Someone wrote a message for the future.",
              "Someone dressed up and surprised themselves.",
              "Someone laughed harder than they expected.",
              "Someone created something they got to take home.",
            ].map((line) => (
              <p key={line} className="text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
                {line}
              </p>
            ))}
          </div>

          <p
            className="mx-auto mt-8 max-w-xl text-lg font-semibold leading-8"
            style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
          >
            We create the details that turn guests from people watching into
            people participating.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          EXPERIENCES DESIGNED AROUND CONNECTION
          ═══════════════════════════════════════ */}
      <section style={{ background: `${palette.primary}0D`, padding: "80px 40px" }}>
        <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            className="mx-auto max-w-2xl text-center text-3xl font-semibold sm:text-4xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            Experiences designed around connection, creativity, and a little
            bit of fun.
          </h2>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {EXPERIENCE_CARDS.map((card, i) => (
              <Reveal key={card.title} delay={i * 80}>
                <div
                  className="flex h-full flex-col overflow-hidden rounded-xl"
                  style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
                >
                  <div className="overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
                    <img src={card.image} alt={card.alt} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <h3
                      className="text-2xl font-semibold"
                      style={{ ...fonts.displayFont, color: palette.primaryDeep }}
                    >
                      {card.title}
                    </h3>
                    <p className="mt-2 text-base italic" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
                      {card.tagline}
                    </p>
                    <p className="mt-3 text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.muted }}>
                      {card.body}
                    </p>
                    {card.accent && (
                      <p className="mt-3 text-sm leading-relaxed" style={{ ...fonts.bodyFont, color: palette.muted }}>
                        {card.accent}
                      </p>
                    )}
                    <button
                      onClick={() => handleCardAction(card.action)}
                      className="mt-6 inline-flex items-center gap-2 self-start text-sm font-semibold tracking-[0.1em]"
                      style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
                    >
                      {card.ctaLabel}
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════ */}
      <section style={{ background: palette.bg, padding: "80px 40px" }}>
        <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
          <h2
            className="mb-12 text-center text-3xl font-semibold sm:text-4xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="text-center sm:text-left">
                  <div
                    className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl sm:mx-0"
                    style={{ background: `${palette.accent}1F` }}
                  >
                    <Icon size={20} color={palette.accent} strokeWidth={1.8} />
                  </div>
                  <p
                    className="mt-3 text-base font-semibold"
                    style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
                  >
                    {i + 1}. {step.title}
                  </p>
                  <p
                    className="mt-1.5 text-base leading-relaxed"
                    style={{ ...fonts.bodyFont, color: palette.muted }}
                  >
                    {step.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MORE THAN DÉCOR
          ═══════════════════════════════════════ */}
      <section style={{ background: `${palette.primary}0D`, padding: "80px 40px" }}>
        <div style={{ width: "100%", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h2
            className="text-3xl font-semibold sm:text-4xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            More than décor. More than a rental.
          </h2>

          <p className="mt-6 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
            We are not here to create another pretty corner that guests walk
            past.
          </p>
          <p className="mt-3 text-xl italic leading-8" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
            We create experiences that invite people in.
          </p>

          <div className="mx-auto mt-8 max-w-md space-y-3">
            {[
              "A place to leave a message.",
              "A moment to try something new.",
              "A reason to laugh together.",
              "A keepsake that tells the story later.",
            ].map((line) => (
              <p key={line} className="text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
                {line}
              </p>
            ))}
          </div>

          <p
            className="mx-auto mt-8 max-w-xl text-lg font-semibold leading-8"
            style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
          >
            The details matter because the feelings matter.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY PEOPLE CHOOSE A SLICE OF G
          ═══════════════════════════════════════ */}
      <section style={{ background: palette.bg, padding: "80px 40px" }}>
        <div style={{ width: "100%", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <Sparkles className="mx-auto mb-4" size={22} strokeWidth={1.2} style={{ color: palette.goldDeep }} />
          <h2
            className="text-3xl font-semibold sm:text-4xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            Why people choose A Slice of G
          </h2>

          <p className="mt-6 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
            Because celebrations do not have to look the same.
          </p>
          <p className="mt-3 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.muted }}>
            We love the unexpected details.
          </p>
          <p className="mt-1 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.muted }}>
            The moments that make people smile.
          </p>

          <p className="mt-6 text-xl italic leading-8" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
            The ideas that make guests say, "Wait, this is so cool."
          </p>

          <p
            className="mx-auto mt-6 max-w-xl text-lg leading-8"
            style={{ ...fonts.bodyFont, color: palette.ink }}
          >
            From playful dress-up experiences to meaningful keepsakes,
            everything we create is designed to help people connect.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          THE EXPERIENCE DOES NOT END WHEN THE EVENT DOES
          ═══════════════════════════════════════ */}
      <section style={{ background: `${palette.primary}0D`, padding: "80px 40px" }}>
        <div style={{ width: "100%", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h2
            className="text-3xl font-semibold sm:text-4xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            The experience does not end when the event does.
          </h2>

          <p className="mt-6 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
            The best celebrations leave something behind.
          </p>

          <div className="mx-auto mt-8 max-w-md space-y-3">
            {["A photo.", "A message.", "A memory.", "A story someone tells years later."].map((line) => (
              <p key={line} className="text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
                {line}
              </p>
            ))}
          </div>

          <p
            className="mx-auto mt-8 max-w-xl text-lg font-semibold leading-8"
            style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
          >
            That is what we create.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════ */}
      <section style={{ background: palette.primaryDeep }}>
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <Reveal>
            <Sparkles className="mx-auto" style={{ color: palette.gold }} size={22} strokeWidth={1.2} />
            <h2
              className="mt-5 text-4xl font-semibold sm:text-5xl"
              style={{ ...fonts.displayFont, color: "#FFFFFF" }}
            >
              Ready to create something people will remember?
            </h2>
            <p
              className="mx-auto mt-5 max-w-lg text-lg leading-8"
              style={{ ...fonts.bodyFont, color: `${palette.bg}DD` }}
            >
              Whether you are planning a baby shower, a milestone
              celebration, or a Tutu Pop-Up full of personality and fun, we
              would love to help bring your idea to life.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
              <button
                onClick={() => navigate("/experiences")}
                className="text-base font-semibold tracking-[0.1em] text-white underline underline-offset-4"
                style={fonts.bodyFont}
              >
                EXPLORE EXPERIENCES
              </button>
              <button
                onClick={() => openPickerForBuilder()}
                className="inline-flex items-center gap-3 rounded-sm px-7 py-4 text-base font-semibold tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ ...fonts.bodyFont, background: palette.gold }}
              >
                START PLANNING <ArrowRight size={17} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
