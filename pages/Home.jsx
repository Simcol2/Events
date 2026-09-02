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

/* ─── Hero rotating text ─── */
const HERO_LINES = [
  "A Time Capsule Your Guests Actually Fill.",
  "Balloons Die. Memories Last Forever.",
  "Curated Décor. Real Keepsakes. Zero Stress.",
  "Your Guests Don't Just Show Up. They Leave Something Real.",
  "The Celebration That Gets Better After It Ends.",
  "Pick a Date. Pick a Vibe. We Handle the Rest.",
];

function RotatingHeadline({ fonts }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_LINES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="relative mx-auto w-full"
      style={{
        minHeight: "clamp(5.5rem, 13vw, 9rem)",
        marginBottom: "1.5rem",
        maxWidth: "100%",
      }}
    >
      {HERO_LINES.map((line, i) => (
        <h1
          key={line}
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
          {line}
        </h1>
      ))}
    </div>
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

  return (
    <div className="overflow-hidden" style={{ background: palette.bg }}>
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
        <img
          src={heroFullBleed}
          alt="Event styling"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />

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
          <RotatingHeadline fonts={fonts} />

          <p
            style={{
              ...fonts.bodyFont,
              maxWidth: "620px",
              margin: "0 auto",
              color: "#FDF6EEE6",
              fontSize: "clamp(15px, 2vw, 18px)",
              lineHeight: 1.6,
            }}
          >
            Interactive keepsake experiences for baby showers and first
            birthdays across Toronto and the GTA. We deliver and style, or
            you pick up — either way, you keep the memories.
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
              BUILD YOUR PACKAGE
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => navigate("/how-it-works")}
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
              SEE HOW IT WORKS
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHO WE ARE — leads before anything else
          ═══════════════════════════════════════ */}
      <section style={{ background: palette.bg, padding: "80px 40px 40px" }}>
        <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <Heart className="mx-auto" size={22} strokeWidth={1.2} style={{ color: palette.gold }} />
          <p
            className="mt-4 text-xs font-semibold tracking-[0.3em]"
            style={{ ...fonts.bodyFont, color: palette.gold }}
          >
            NOT YOUR TYPICAL RENTAL COMPANY
          </p>
          <h2
            className="mt-3 text-4xl font-semibold sm:text-5xl"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            Rent the experience. Keep the memories.
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-lg leading-8"
            style={{ ...fonts.bodyFont, color: palette.ink }}
          >
            We're not here to just drop off decor and pick it up the next
            day. Guests leave a note at the kindness station, add a page to
            the storybook, snap a photo for the wall. The styling goes back
            to us — the puzzle, the storybook, and the sealed time capsule
            go home with you.
          </p>
          <p
            className="mx-auto mt-4 max-w-xl text-base leading-7"
            style={{ ...fonts.bodyFont, color: palette.muted }}
          >
            We specialize in baby showers and 1st–3rd birthdays, and
            customize every package for other milestones too — holidays,
            engagements, or anything worth celebrating.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS — compact strip, logistics up front
          ═══════════════════════════════════════ */}
      <section style={{ background: `${palette.primary}0D`, padding: "48px 40px" }}>
        <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto" }}>
          <div className="grid gap-6 sm:grid-cols-4">
            {[
              { icon: PackageCheck, title: "Pick your package", body: "Choose your event type and build it out with any add-ons." },
              { icon: Truck, title: "We deliver, or you pick up", body: "Book a facilitator to set up and style everything, or pick up your box yourself." },
              { icon: Users, title: "Guests play", body: "Everyone leaves a note, a page, or a photo behind." },
              { icon: Gift, title: "We collect, you keep the memories", body: "The styling comes back to us. The keepsakes go home with you." },
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
                Build your own package
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
                BUILD YOUR PACKAGE <ArrowRight size={17} />
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
              Looking for a specific color palette or design theme instead of
              building from scratch?
            </p>
            <button
              onClick={() => navigate("/design")}
              className="mt-7 inline-flex items-center gap-3 border-2 px-7 py-4 text-sm font-semibold tracking-[0.1em] text-white transition-all duration-300 hover:bg-white/10"
              style={{ ...fonts.bodyFont, borderColor: palette.gold }}
            >
              BROWSE DESIGN & THEMES <ArrowRight size={17} />
            </button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
