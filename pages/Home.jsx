import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Heart, Sparkles, PackageCheck, Truck, Users, Gift } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import FeatureCard from "../components/FeatureCard";
import {
  MAIN_PACKAGE_ITEMS,
  ADDONS,
  PACKAGE_NAME,
  MADE_FOR_MEMORIES_PRICE,
  resolvePackageItem,
} from "../packageContent";

import heroFullBleed from "../media/timecapsul.png";
import essentialsImage from "../media/hero.png";
import wallPuzzleEngagementPhoto from "../media/file_00000000a204822f9ab953201c8b7043.png";
import babyTriviaPhoto from "../media/babytrivia.png";
import nurseryRhymePhoto from "../media/poem.png";

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

const HERO_STATES = [
  {
    image: essentialsImage,
    headline: "Your guests don't just attend. They leave something behind.",
    supporting:
      "Interactive event experiences that turn your baby shower, first birthday, or celebration into memories you can actually keep.",
    secondaryLabel: "Explore the experiences",
    secondaryTarget: "/gifts-activities",
  },
  {
    image: heroFullBleed,
    headline: "A time capsule your guests actually fill.",
    supporting:
      "Photos, stories, wishes, and little pieces of the day come together to create something you'll treasure long after the celebration ends.",
    secondaryLabel: "See how it works",
    secondaryTarget: "/how-it-works",
  },
  {
    image: wallPuzzleEngagementPhoto,
    headline: "Not just decor. Something your guests can create.",
    supporting:
      "Beautiful pieces designed to get everyone involved, then become keepsakes you can take home.",
    secondaryLabel: "Explore the experiences",
    secondaryTarget: "/gifts-activities",
  },
  {
    image: babyTriviaPhoto,
    headline: "The celebration that gets better after it ends.",
    supporting:
      "Your guests play, write, photograph, tell stories, and leave something meaningful behind for you to keep.",
    secondaryLabel: "See it in action",
    secondaryTarget: "/how-it-works",
  },
  {
    image: nurseryRhymePhoto,
    headline: "Give your guests something to do. Give yourself something to keep.",
    supporting:
      "Interactive experiences for baby showers, first birthdays, and celebrations designed around the people who make them special.",
    secondaryLabel: "Find your perfect experience",
    secondaryTarget: "/gifts-activities",
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

  const current = HERO_STATES[index];

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
          alt=""
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
        <div
          className="relative mx-auto w-full"
          style={{ minHeight: "clamp(5.5rem, 13vw, 9rem)", marginBottom: "1.5rem", maxWidth: "100%" }}
        >
          {HERO_STATES.map((state, i) => (
            <h1
              key={state.headline}
              style={{
                ...fonts.displayFont,
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 10px",
                margin: 0,
                width: "100%",
                maxWidth: "100%",
                fontSize: "clamp(2rem, 5vw, 4.2rem)",
                fontWeight: 500,
                lineHeight: 1.1,
                color: "#FDF6EE",
                opacity: i === index ? 1 : 0,
                transform: i === index ? "translateY(0)" : "translateY(18px)",
                transition: "opacity 1100ms ease, transform 1100ms cubic-bezier(.22,1,.36,1)",
                textShadow: "0 2px 24px rgba(0,0,0,0.45)",
                pointerEvents: "none",
                textAlign: "center",
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {state.headline}
            </h1>
          ))}
        </div>

        <div className="relative mx-auto w-full" style={{ minHeight: "clamp(4.5rem, 11vw, 7rem)", maxWidth: "100%" }}>
          {HERO_STATES.map((state, i) => (
            <p
              key={state.supporting}
              style={{
                ...fonts.bodyFont,
                position: "absolute",
                inset: 0,
                maxWidth: "620px",
                margin: "0 auto",
                color: "#FDF6EEE6",
                fontSize: "clamp(15px, 2vw, 18px)",
                lineHeight: 1.6,
                opacity: i === index ? 1 : 0,
                transition: "opacity 1100ms ease",
                pointerEvents: "none",
              }}
            >
              {state.supporting}
            </p>
          ))}
        </div>

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
            onClick={() => navigate("/package-builder")}
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
            onClick={() => navigate(current.secondaryTarget)}
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
            {current.secondaryLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Main page ─── */
export default function Home({ navigate }) {
  const { palette, fonts } = usePalette();
  const { eventTypeId, eventType } = useEventType();

  const resolvedItems = useMemo(
    () => MAIN_PACKAGE_ITEMS.map((item) => resolvePackageItem(item, eventTypeId)),
    [eventTypeId]
  );

  const guessArrivalAddon = ADDONS.find((a) => a.id === "guessArrival");
  const [showArrivalModal, setShowArrivalModal] = useState(false);

  return (
    <div className="overflow-hidden" style={{ background: palette.bg }}>
      <Hero fonts={fonts} palette={palette} navigate={navigate} />

      {/* ═══════════════════════════════════════
          WHAT MAKES US DIFFERENT - leads before anything else
          ═══════════════════════════════════════ */}
      <section style={{ background: palette.bg, padding: "80px 40px 40px" }}>
        <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <Sparkles className="mx-auto" size={22} strokeWidth={1.2} style={{ color: palette.gold }} />
          <p
            className="mt-4 text-xs font-semibold tracking-[0.3em]"
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
            And when the celebration is over, you don't just pack away the
            decor. <strong style={{ color: palette.primaryDeep }}>You keep the memories.</strong>
          </p>
        </div>

        <div
          className="mx-auto mt-14 grid gap-8 sm:grid-cols-3"
          style={{ width: "100%", maxWidth: "900px" }}
        >
          {[
            { icon: Users, title: "Guests participate", body: "Activities designed to get people talking, laughing, creating, and connecting." },
            { icon: Heart, title: "Guests contribute", body: "Photos, stories, wishes, messages, and little moments that become part of your celebration." },
            { icon: Gift, title: "You keep it", body: "Finished pieces become meaningful keepsakes you can display, revisit, and treasure." },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="text-center">
                <div
                  className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `${palette.accent}1F` }}
                >
                  <Icon size={20} color={palette.accent} strokeWidth={1.8} />
                </div>
                <p className="mt-3 text-sm font-semibold" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
                  {f.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ ...fonts.bodyFont, color: palette.muted }}>
                  {f.body}
                </p>
              </div>
            );
          })}
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
          <div className="grid gap-6 sm:grid-cols-4">
            {[
              { icon: PackageCheck, title: "Choose your experience", body: "Pick the interactive pieces that fit your celebration, your guests, and the memories you want to create." },
              { icon: Truck, title: "We deliver and style", body: "Choose the setup option that works for your event. We can deliver, or you can pick up your package." },
              { icon: Users, title: "Your guests participate", body: "During the celebration, your guests become part of the experience. They write, play, create, photograph, and leave something behind." },
              { icon: Gift, title: "You keep the memories", body: "When the party is over, the experience doesn't have to be. Your finished pieces become keepsakes from the day." },
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
                    className="mt-3 text-sm font-semibold"
                    style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
                  >
                    {i + 1}. {step.title}
                  </p>
                  <p
                    className="mt-1.5 text-sm leading-relaxed"
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
          THE PACKAGE
          ═══════════════════════════════════════ */}
      <section
        style={{
          background: palette.bg,
          padding: "40px 0",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 40px",
          }}
        >
          <Reveal>
            <div
              className="essentials-split"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                minHeight: "560px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  padding: "60px 70px 60px 0",
                }}
              >
                <p
                  style={{
                    ...fonts.bodyFont,
                    margin: 0,
                    color: palette.gold,
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.3em",
                  }}
                >
                  THE {PACKAGE_NAME.toUpperCase()} PACKAGE
                </p>

                <h2
                  style={{
                    ...fonts.displayFont,
                    margin: "20px 0 0",
                    color: palette.primaryDeep,
                    fontSize: "clamp(3rem, 6vw, 5.5rem)",
                    fontWeight: 600,
                    lineHeight: 0.95,
                  }}
                >
                  {PACKAGE_NAME}.
                </h2>

                <p
                  style={{
                    ...fonts.displayFont,
                    margin: "18px 0 0",
                    color: palette.gold,
                    fontSize: "2.75rem",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  ${MADE_FOR_MEMORIES_PRICE}
                </p>

                <p
                  style={{
                    ...fonts.bodyFont,
                    maxWidth: "500px",
                    margin: "18px 0 0",
                    color: palette.ink,
                    fontSize: "18px",
                    lineHeight: 1.7,
                  }}
                >
                  Seven signature pieces for your {eventType.label.toLowerCase()}.
                  Every piece is built to get guests involved, not just
                  looking at decor.
                </p>
              </div>

              <div
                style={{
                  position: "relative",
                  width: "100%",
                  minHeight: "560px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={essentialsImage}
                  alt="Event styling"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          </Reveal>

          <div
            className="essentials-grid"
            style={{
              marginTop: "64px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {resolvedItems.map((item, i) => (
              <Reveal key={item.id} delay={i * 60}>
                <FeatureCard
                  icon={item.icon}
                  name={item.name}
                  tagline={item.tagline}
                  description={item.description}
                  photoKey={item.id}
                  photoUrls={item.photoUrls}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {showArrivalModal && guessArrivalAddon && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(20,18,12,.72)", backdropFilter: "blur(6px)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Guess the Arrival Day"
          onClick={() => setShowArrivalModal(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl p-8 text-center"
            style={{ background: palette.surface }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowArrivalModal(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full"
              style={{ color: palette.muted }}
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={guessArrivalAddon.photoUrl}
              alt="Guess the Arrival Day prediction website"
              className="mx-auto w-full max-w-[220px]"
              style={{ background: "transparent" }}
            />
            <h2
              className="mt-5 text-2xl font-semibold"
              style={{ ...fonts.displayFont, color: palette.primaryDeep }}
            >
              {guessArrivalAddon.name}
            </h2>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ ...fonts.bodyFont, color: palette.ink }}
            >
              {guessArrivalAddon.description}
            </p>
            <button
              onClick={() => {
                setShowArrivalModal(false);
                navigate("/package-builder");
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-sm px-6 py-3 text-xs font-semibold tracking-[0.15em] text-white"
              style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
            >
              ADD IT TO YOUR PACKAGE <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          ADD-ONS
          ═══════════════════════════════════════ */}
      <section className="py-20 sm:py-28" style={{ background: `${palette.primary}0D` }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              <p
                className="text-xs font-semibold tracking-[0.3em]"
                style={{ ...fonts.bodyFont, color: palette.gold }}
              >
                MAKE IT YOURS
              </p>
              <h2
                className="mt-3 text-4xl font-semibold sm:text-5xl"
                style={{ ...fonts.displayFont, color: palette.primaryDeep }}
              >
                Build your own experience
              </h2>
              <p
                className="mt-3 text-lg"
                style={{ ...fonts.bodyFont, color: palette.ink }}
              >
                Start with {PACKAGE_NAME}, then layer on any upgrades that fit
                your celebration.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-3">
            {ADDONS.slice(0, 3).map((a, i) => (
              <Reveal key={a.id} delay={i * 80}>
                {a.id === "guessArrival" ? (
                  <button
                    onClick={() => setShowArrivalModal(true)}
                    className="flex h-full w-full flex-col rounded-xl p-5 text-left shadow-sm"
                    style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{ background: `${palette.accent}1F` }}
                        >
                          <a.icon size={18} color={palette.accent} strokeWidth={1.8} />
                        </div>
                        <h3 className="text-lg font-bold leading-tight" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                          {a.name}
                        </h3>
                      </div>
                      <span className="flex-shrink-0 text-sm font-bold" style={{ ...fonts.displayFont, color: palette.accent }}>
                        +${a.price}
                      </span>
                    </div>
                    <p className="flex-1 text-sm leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
                      Want your guests guessing where Mom will be when she
                      goes into labor?
                    </p>
                    <p
                      className="mt-3 text-xs font-semibold tracking-[0.1em] underline underline-offset-4"
                      style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
                    >
                      SEE HOW IT WORKS
                    </p>
                  </button>
                ) : (
                  <FeatureCard
                    icon={a.icon}
                    name={a.name}
                    tagline={a.tagline}
                    description={a.description}
                    photoKey={a.id}
                    photoUrl={a.photoUrl}
                    fit={a.fit}
                    priceLabel={`+$${a.price}`}
                  />
                )}
              </Reveal>
            ))}
          </div>

          <Reveal delay={300}>
            <div className="mt-12 text-center">
              <button
                onClick={() => navigate("/package-builder")}
                className="inline-flex items-center gap-3 rounded-sm px-8 py-4 text-sm font-semibold tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
              >
                BUILD MY EXPERIENCE <ArrowRight size={17} />
              </button>
            </div>
          </Reveal>
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
              The vibe is in the details.
            </h2>
            <p
              className="mx-auto mt-5 max-w-lg text-lg leading-8"
              style={{ ...fonts.bodyFont, color: `${palette.bg}DD` }}
            >
              Browse the full decor collection and start pulling together the
              pieces that fit your celebration.
            </p>
            <button
              onClick={() => navigate("/decor")}
              className="mt-7 inline-flex items-center gap-3 border-2 px-7 py-4 text-sm font-semibold tracking-[0.1em] text-white transition-all duration-300 hover:bg-white/10"
              style={{ ...fonts.bodyFont, borderColor: palette.gold }}
            >
              BROWSE THE COLLECTION <ArrowRight size={17} />
            </button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
