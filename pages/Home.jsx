import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, PackageCheck, Truck, Users, Gift, Package, CalendarHeart } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";

import heroFullBleed from "../media/timecapsul.png";
import essentialsImage from "../media/hero.png";
import wallPuzzleEngagementPhoto from "../media/file_00000000a204822f9ab953201c8b7043.png";
import babyTriviaPhoto from "../media/babytrivia.png";
import nurseryRhymePhoto from "../media/poem.png";
import flowerWallPhoto from "../media/flowerwall-notjustdecor.jpg";

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

/* ─── Hero: 5 states, each its own image, headline, copy, and CTA ─── */
const HERO_CTA_LABEL = "BUILD MY EXPERIENCE";
const HERO_HEADLINE_LINES = ["Rent the pieces", "Create the keepsakes", "Enjoy the memories"];
const HERO_SUPPORTING =
  "Interactive event experiences, styled decor, and keepsake activities for celebrations where guests don't just show up, they take part.";
const HERO_SECONDARY_LABEL = "Explore the experiences";
const HERO_SECONDARY_TARGET = "/experiences";

// Photos still crossfade behind the fixed headline/supporting copy above -
// only the text stopped rotating with them.
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
  const { openPickerForBuilder } = useEventType();
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
            "linear-gradient(180deg, rgba(25,15,20,.82) 0%, rgba(25,15,20,.68) 38%, rgba(25,15,20,.38) 72%, rgba(25,15,20,.18) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "120px 32px 80px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            ...fonts.displayFont,
            margin: "0 auto 1.5rem",
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
            maxWidth: "620px",
            margin: "0 auto",
            color: "#FDF6EEE6",
            fontSize: "clamp(18px, 2.6vw, 23px)",
            lineHeight: 1.6,
          }}
        >
          {HERO_SUPPORTING}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "20px",
            width: "100%",
            marginTop: "32px",
          }}
        >
          <button
            onClick={() => openPickerForBuilder()}
            style={{
              ...fonts.bodyFont,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "16px 28px",
              border: "0",
              borderRadius: "2px",
              background: palette.primaryDeep,
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              whiteSpace: "nowrap",
            }}
          >
            {HERO_CTA_LABEL}
            <ArrowRight size={17} />
          </button>

          <button
            onClick={() => navigate(HERO_SECONDARY_TARGET)}
            style={{
              ...fonts.bodyFont,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 10px",
              border: "0",
              background: "transparent",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
              whiteSpace: "nowrap",
            }}
          >
            {HERO_SECONDARY_LABEL}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Main page ─── */
export default function Home({ navigate }) {
  const { palette, fonts } = usePalette();
  const { openPickerForBuilder } = useEventType();

  return (
    <div className="overflow-hidden" style={{ background: palette.bg }}>
      <Hero fonts={fonts} palette={palette} navigate={navigate} />

      {/* ═══════════════════════════════════════
          PARTICIPATE → CONTRIBUTE → KEEP - the brand spine, right below the hero
          ═══════════════════════════════════════ */}
      <section style={{ background: palette.primaryDeep, padding: "48px 40px" }}>
        <div
          className="mx-auto grid gap-8 sm:grid-cols-3"
          style={{ width: "100%", maxWidth: "1000px" }}
        >
          {[
            { title: "PARTICIPATE", body: "Guests play, create, laugh, connect, and become part of the celebration." },
            { title: "CONTRIBUTE", body: "They leave photos, stories, wishes, messages, predictions, and pieces of themselves." },
            { title: "KEEP", body: "You take those memories home and get to revisit them long after the party ends." },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <p
                className="text-lg font-semibold tracking-[0.3em]"
                style={{ ...fonts.bodyFont, color: palette.gold, textShadow: "0 4px 14px rgba(0,0,0,0.35)" }}
              >
                {f.title}
              </p>
              <p className="mt-2 text-xl leading-relaxed" style={{ ...fonts.bodyFont, color: "#FFFFFFCC" }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHAT MAKES US DIFFERENT - leads before anything else
          ═══════════════════════════════════════ */}
      <section style={{ position: "relative", background: palette.bg, padding: "80px 40px 40px", overflow: "hidden" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${flowerWallPhoto})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.16,
          }}
        />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: palette.bg, opacity: 0.82 }} />
        <div style={{ position: "relative", width: "100%", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <Sparkles className="mx-auto" size={22} strokeWidth={1.2} style={{ color: palette.gold }} />
          <p
            className="mt-4 text-sm font-semibold tracking-[0.3em]"
            style={{ ...fonts.bodyFont, color: palette.gold }}
          >
            NOT JUST DECOR
          </p>
          <h2
            className="mt-3 text-4xl font-semibold sm:text-5xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            Your guests actually get to be part of it.
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-lg leading-8"
            style={{ ...fonts.bodyFont, color: palette.ink }}
          >
            We create interactive event experiences designed to get your
            guests involved. They write, play, take photos, share stories,
            make memories, and create something together.
          </p>
          <p
            className="mx-auto mt-4 max-w-xl text-lg leading-7"
            style={{ ...fonts.bodyFont, color: palette.ink }}
          >
            And when the celebration is over, you don't just pack everything
            away. <strong style={{ color: palette.primaryDeep }}>You keep the memories.</strong>
          </p>

          <h3
            className="mt-12 text-2xl font-semibold sm:text-3xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            Are you curious?
          </h3>
          <button
            onClick={() => navigate("/experiences")}
            className="mt-5 inline-flex items-center gap-3 rounded-sm px-7 py-3.5 text-sm font-semibold tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
          >
            CHECK OUT THE EXPERIENCE <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS — compact strip, logistics up front
          ═══════════════════════════════════════ */}
      <section style={{ background: `${palette.primary}0D`, padding: "56px 40px 48px" }}>
        <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto" }}>
          <h2
            className="mb-10 text-center text-3xl font-semibold sm:text-4xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            From setup to keepsake.
          </h2>
          <div className="grid gap-6 sm:grid-cols-5">
            {[
              { icon: CalendarHeart, title: "Choose your event", body: "Tell us what you're celebrating. We'll show you the experiences designed for it." },
              { icon: PackageCheck, title: "Choose your experiences", body: "Pick the experiences that fit your people and the memories you want to make." },
              { icon: Truck, title: "We prepare everything", body: "Your selected experiences arrive prepared and ready. Choose Self Setup or let an Event Stylist handle everything." },
              { icon: Users, title: "Your guests participate", body: "They play, photograph, write, share, laugh, and help create something you'll keep." },
              { icon: Gift, title: "You keep the memories", body: "When the celebration is over, what your guests created becomes part of your story." },
            ].map((step, i) => {
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
          HOW INVOLVED DO YOU WANT TO BE - service style, independent of Memory Display
          ═══════════════════════════════════════ */}
      <section style={{ background: palette.bg, padding: "64px 40px" }}>
        <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
          <h2
            className="mb-10 text-center text-3xl font-semibold sm:text-4xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            How involved do you want to be?
          </h2>
          <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
            {[
              { icon: Package, title: "Self Setup", hook: "You set the scene. We make it easy.", body: "Everything arrives prepared and ready for you to place and arrange." },
              { icon: Sparkles, title: "Event Stylist", hook: "You don't lift a finger.", body: "We bring everything, set it up, style it, make sure every detail is ready, and take it all back when the celebration is over." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-xl p-6 text-center" style={{ background: palette.surface, border: `1px solid ${palette.line}` }}>
                  <div
                    className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: `${palette.accent}1F` }}
                  >
                    <Icon size={20} color={palette.accent} strokeWidth={1.8} />
                  </div>
                  <p className="mt-3 text-base font-semibold" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
                    {f.title}
                  </p>
                  <p className="mt-1 text-base italic" style={{ ...fonts.bodyFont, color: palette.gold }}>
                    {f.hook}
                  </p>
                  <p className="mt-2 text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.muted }}>
                    {f.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SEE IT IN ACTION - at the party, then after the party
          ═══════════════════════════════════════ */}
      <section style={{ background: `${palette.primary}0D`, padding: "80px 40px" }}>
        <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto" }}>
          <h2
            className="mb-12 text-center text-3xl font-semibold sm:text-4xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            See what happens when your guests become part of the celebration.
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            <Reveal>
              <div className="overflow-hidden rounded-xl" style={{ aspectRatio: "4 / 3" }}>
                <img
                  src={babyTriviaPhoto}
                  alt="Guests playing a baby shower game rented from A Slice of G Events in Toronto"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-4 text-sm font-semibold tracking-[0.25em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
                AT THE PARTY
              </p>
              <p className="mt-1 text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
                Guests interacting, laughing, writing, photographing, assembling, competing, and creating.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <div className="overflow-hidden rounded-xl" style={{ aspectRatio: "4 / 3" }}>
                <img
                  src={nurseryRhymePhoto}
                  alt="Custom keepsake art piece created by guests at a Toronto baby shower"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-4 text-sm font-semibold tracking-[0.25em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
                AFTER THE PARTY
              </p>
              <p className="mt-1 text-base leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
                The finished book, artwork, photos, notes, capsule, or display in the home or nursery.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          THE EXPERIENCE AFTER THE PARTY
          ═══════════════════════════════════════ */}
      <section style={{ background: palette.bg, padding: "80px 40px" }}>
        <div style={{ width: "100%", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <h2
            className="text-3xl font-semibold sm:text-4xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            Because the best part can happen later.
          </h2>
          <p className="mt-5 text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
            The party lasts a few hours. The memories don't have to. Revisit the messages, photos, stories,
            artwork, and little pieces of the people who were there.
          </p>
          <p className="mt-4 text-lg font-semibold" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
            That is what makes an A Slice of G experience different.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BUILD MY EXPERIENCE
          ═══════════════════════════════════════ */}
      <section className="py-16" style={{ background: `${palette.primary}0D` }}>
        <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
          <button
            onClick={() => openPickerForBuilder()}
            className="inline-flex items-center gap-3 rounded-sm px-8 py-4 text-base font-semibold tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
          >
            BUILD MY EXPERIENCE <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA
          ═══════════════════════════════════════ */}
      <section style={{ background: palette.primaryDeep }}>
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <Reveal>
            <Sparkles
              className="mx-auto"
              style={{ color: palette.gold }}
              size={22}
              strokeWidth={1.2}
            />
            <h2
              className="mt-5 text-4xl font-semibold sm:text-5xl"
              style={{ ...fonts.displayFont, color: "#FFFFFF" }}
            >
              Your event is one day. Make the memories last longer.
            </h2>
            <p
              className="mx-auto mt-5 max-w-lg text-lg leading-8"
              style={{ ...fonts.bodyFont, color: `${palette.bg}DD` }}
            >
              Choose the experiences your guests will love and the keepsakes
              you'll want to keep.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
              <button
                onClick={() => openPickerForBuilder()}
                className="inline-flex items-center gap-3 rounded-sm px-7 py-4 text-base font-semibold tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ ...fonts.bodyFont, background: palette.gold }}
              >
                BUILD MY EXPERIENCE <ArrowRight size={17} />
              </button>
              <button
                onClick={() => navigate("/experiences")}
                className="text-base font-semibold tracking-[0.1em] text-white underline underline-offset-4"
                style={fonts.bodyFont}
              >
                EXPLORE THE EXPERIENCES
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
