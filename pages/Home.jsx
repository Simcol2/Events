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

/* ─── Hero: kicker, headline, blobs and a rotated polaroid collage ─── */
const HERO_KICKER = "psst... Toronto & the GTA";
const HERO_LEAD_LINE = "We create celebrations people don't just attend. They experience.";
const HERO_HEADLINE_LINES = ["Rent the pieces", "Create the keepsakes", "Enjoy the memories"];
const HERO_SUPPORTING =
  "From Tutu Pop-Ups that bring dress-up fun back, to thoughtful baby showers and milestone celebrations, we design interactive experiences that give guests something to do, something to feel, and something to remember.";
const HERO_ACCENT_LINE = "Because the best celebrations are the ones where everyone becomes part of the story.";
const HERO_CTA_LABEL = "EXPLORE EXPERIENCES";
const HERO_CTA_TARGET = "/experiences";

function Blob({ style }) {
  return <div style={{ position: "absolute", pointerEvents: "none", ...style }} />;
}

function Hero({ fonts, palette, navigate }) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: palette.bg,
        padding: "56px 24px 80px",
      }}
    >
      {/* Organic accent shapes, the same trio as the reference direction:
          a deep emerald arch, a ruby blob, and a small brass-ringed dot. */}
      <Blob
        style={{
          width: "min(46vw, 420px)",
          height: "min(46vw, 420px)",
          top: "-8%",
          right: "-6%",
          background: "linear-gradient(150deg, #17724F 0%, #0A3B2A 100%)",
          border: `3px solid ${palette.gold}`,
          borderRadius: "45% 45% 8% 8%",
          zIndex: 0,
        }}
      />
      <Blob
        style={{
          width: "min(16vw, 150px)",
          height: "min(15vw, 140px)",
          bottom: "6%",
          left: "-3%",
          background: "linear-gradient(135deg, #F03C7E 0%, #B60D46 100%)",
          borderRadius: "41% 59% 37% 63% / 55% 40% 60% 45%",
          opacity: 0.85,
          zIndex: 0,
        }}
      />
      <Blob
        style={{
          width: "min(9vw, 96px)",
          height: "min(9vw, 96px)",
          top: "38%",
          right: "16%",
          background: "linear-gradient(140deg, #FFDE6E 0%, #C99A2E 100%)",
          border: `3px solid ${palette.gold}`,
          borderRadius: "50%",
          zIndex: 0,
          display: "none",
        }}
      />

      <div
        className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div className="max-w-xl">
          <span
            className="inline-block"
            style={{
              ...fonts.scriptFont,
              fontSize: "17px",
              color: palette.accent,
              transform: "rotate(-3deg)",
              marginBottom: "10px",
            }}
          >
            {HERO_KICKER}
          </span>

          <p
            style={{
              ...fonts.bodyFont,
              color: palette.goldDeep,
              fontSize: "clamp(13px, 1.6vw, 15px)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              lineHeight: 1.5,
              margin: "6px 0 14px",
            }}
          >
            {HERO_LEAD_LINE}
          </p>

          <h1
            style={{
              ...fonts.displayFont,
              fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)",
              fontWeight: 600,
              lineHeight: 1.08,
              color: palette.primaryDeep,
              margin: "0 0 22px",
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
              maxWidth: "480px",
              color: palette.ink,
              fontSize: "16px",
              lineHeight: 1.65,
              margin: "0 0 18px",
            }}
          >
            {HERO_SUPPORTING}
          </p>

          <p
            style={{
              ...fonts.displayFont,
              maxWidth: "440px",
              color: palette.accent,
              fontSize: "19px",
              fontStyle: "italic",
              lineHeight: 1.5,
              margin: "0 0 30px",
            }}
          >
            {HERO_ACCENT_LINE}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate(HERO_CTA_TARGET)}
              className="inline-flex items-center gap-3 rounded-full transition-transform hover:-translate-y-0.5"
              style={{
                ...fonts.bodyFont,
                background: "linear-gradient(135deg, #17724F 0%, #0A3B2A 100%)",
                color: "#FFFFFF",
                padding: "16px 30px",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                boxShadow: "0 10px 24px rgba(14,92,65,0.3)",
                border: `1px solid ${palette.gold}`,
              }}
            >
              {HERO_CTA_LABEL}
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/how-it-works")}
              style={{
                ...fonts.bodyFont,
                color: palette.ink,
                fontWeight: 600,
                fontSize: "14px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                borderBottom: `2px solid ${palette.gold}`,
                paddingBottom: "3px",
              }}
            >
              How It Works
            </button>
          </div>
        </div>

        {/* Polaroid collage, layered over the blobs */}
        <div className="relative mx-auto hidden h-[420px] w-full max-w-[420px] sm:block lg:h-[480px]">
          <div
            className="absolute overflow-hidden bg-white shadow-xl"
            style={{
              width: "58%",
              aspectRatio: "4/4.6",
              top: "0",
              left: "8%",
              padding: "10px 10px 34px",
              transform: "rotate(-4deg)",
              borderRadius: "2px",
            }}
          >
            <img src={essentialsImage} alt="Baby shower experience by A Slice of G Events" className="h-full w-full object-cover" />
          </div>
          <div
            className="absolute overflow-hidden bg-white shadow-xl"
            style={{
              width: "50%",
              aspectRatio: "4/4.6",
              top: "34%",
              right: "0",
              padding: "10px 10px 34px",
              transform: "rotate(5deg)",
              borderRadius: "2px",
              zIndex: 2,
            }}
          >
            <img src={TUTU_IMAGE} alt="Tutu Twirls pop-up dress-up experience" className="h-full w-full object-cover" />
          </div>
          <div
            className="absolute overflow-hidden bg-white shadow-xl"
            style={{
              width: "44%",
              aspectRatio: "4/4.6",
              bottom: "0",
              left: "0",
              padding: "10px 10px 34px",
              transform: "rotate(2.5deg)",
              borderRadius: "2px",
            }}
          >
            <img src={wallPuzzleEngagementPhoto} alt="Guest-built keepsake at a milestone celebration" className="h-full w-full object-cover" />
          </div>

          <span
            className="absolute rounded-[10px] bg-white px-3 py-2 text-xs font-semibold shadow-lg"
            style={{ top: "44%", left: "-2%", color: "#2451D9", transform: "rotate(-5deg)" }}
          >
            custom keepsakes
          </span>
          <span
            className="absolute rounded-[10px] bg-white px-3 py-2 text-xs font-semibold shadow-lg"
            style={{ bottom: "2%", right: "4%", color: palette.accent, transform: "rotate(6deg)" }}
          >
            tutu pop-ups
          </span>
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

// The four numbered cards from the reference direction, each with its own
// tilt and its own accent gradient, matching that direction's gallery
// exactly rather than reusing the site's single accent color four times.
const DECOR_GALLERY = [
  {
    num: "01",
    lead: "A place to leave a message.",
    rotate: "-2deg",
    marginTop: "26px",
    background: "linear-gradient(150deg, #17724F 0%, #0A3B2A 100%)",
    textColor: "#FFFFFF",
    numColor: "#D9AE45",
  },
  {
    num: "02",
    lead: "A moment to try something new.",
    rotate: "1.5deg",
    marginTop: "0px",
    background: "#FFFFFF",
    textColor: "#12201A",
    numColor: "#12201A",
  },
  {
    num: "03",
    lead: "A reason to laugh together.",
    rotate: "-1.5deg",
    marginTop: "16px",
    background: "linear-gradient(150deg, #D3B9F2 0%, #8F63C9 100%)",
    textColor: "#12201A",
    numColor: "#12201A",
  },
  {
    num: "04",
    lead: "A keepsake that tells the story later.",
    rotate: "1deg",
    marginTop: "40px",
    background: "linear-gradient(150deg, #6F9CEB 0%, #2451D9 100%)",
    textColor: "#FFFFFF",
    numColor: "#FFFFFF",
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
          MORE THAN DÉCOR - now the numbered, rotated gallery
          ═══════════════════════════════════════ */}
      <section style={{ background: `${palette.primary}0D`, padding: "100px 40px" }}>
        <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <h2
            className="text-3xl font-semibold sm:text-4xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            More than décor. More than a rental.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
            We are not here to create another pretty corner that guests walk
            past.
          </p>
          <p className="mt-3 text-xl italic leading-8" style={{ ...fonts.displayFont, color: palette.goldDeep }}>
            We create experiences that invite people in.
          </p>

          <div className="mx-auto mt-16 flex max-w-[1000px] flex-wrap items-start justify-center gap-8">
            {DECOR_GALLERY.map((card) => (
              <div
                key={card.num}
                className="w-[260px] rounded-2xl px-8 py-9 text-left shadow-xl"
                style={{
                  background: card.background,
                  transform: `rotate(${card.rotate})`,
                  marginTop: card.marginTop,
                  border: card.background === "#FFFFFF" ? `1px solid ${palette.line}` : "none",
                }}
              >
                <span
                  className="mb-4 block italic"
                  style={{ ...fonts.displayFont, fontSize: "15px", color: card.numColor, opacity: 0.75 }}
                >
                  {card.num}
                </span>
                <p
                  className="text-2xl font-semibold leading-tight"
                  style={{ ...fonts.displayFont, color: card.textColor }}
                >
                  {card.lead}
                </p>
              </div>
            ))}
          </div>

          <p
            className="mx-auto mt-16 max-w-xl text-lg font-semibold leading-8"
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
          <span
            className="mt-2 inline-block"
            style={{ ...fonts.scriptFont, fontSize: "16px", color: palette.accent, transform: "rotate(-2deg)" }}
          >
            (besides the fact that we're just really fun)
          </span>

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
            The ideas that make guests say, "Wait, this is so cool." That's
            the reaction we design every piece for.
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
      <section
        style={{
          background:
            "linear-gradient(160deg, rgba(23,114,79,0.92) 0%, rgba(10,59,42,0.96) 100%)",
        }}
      >
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
                className="inline-flex items-center gap-3 rounded-full px-7 py-4 text-base font-semibold tracking-[0.1em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ ...fonts.bodyFont, background: palette.gold, color: palette.primaryDeep }}
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
