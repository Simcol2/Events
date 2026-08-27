import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { usePalette } from "../PaletteContext";
import FeatureCard from "../components/FeatureCard";
import { ESSENTIALS_FEATURES, ADDONS } from "../packageContent";

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
  "Balloons Die. Voice Notes Last Forever.",
  "Curated Décor. Real Keepsakes. Zero Stress.",
  "Your Guests Don't Just Show Up—They Leave Something Real.",
  "The Only Baby Shower That Gets Better After It Ends.",
  "Pick a Date. Pick a Vibe. We Handle the Rest.",
];

function RotatingHeadline({ fonts }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_LINES.length);
    }, 3500);

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
            transform: i === index ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 600ms ease, transform 600ms cubic-bezier(.22,1,.36,1)",
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
          alt="Baby shower styling"
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
              maxWidth: "600px",
              margin: "0 auto",
              color: "#FDF6EE",
              fontSize: "18px",
              lineHeight: 1.7,
            }}
          >
            Everything for an unforgettable baby shower. Delivered, styled,
            and designed to be remembered forever. Starting at $795.
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

      <section
        style={{
          background: palette.bg,
          padding: "100px 0",
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
                  THE ESSENTIALS
                </p>

                <h2
                  style={{
                    ...fonts.displayFont,
                    margin: "20px 0 0",
                    color: palette.primaryDeep,
                    fontSize: "clamp(5rem, 9vw, 9rem)",
                    fontWeight: 600,
                    lineHeight: 0.9,
                  }}
                >
                  $795
                </h2>

                <p
                  style={{
                    ...fonts.bodyFont,
                    maxWidth: "500px",
                    margin: "28px 0 0",
                    color: palette.ink,
                    fontSize: "18px",
                    lineHeight: 1.7,
                  }}
                >
                  The core experience. Everything you need for a shower guests
                  will actually remember.
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
                  alt="Essentials event styling"
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
            style={{
              marginTop: "64px",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "24px",
            }}
          >
            {ESSENTIALS_FEATURES.map((f, i) => (
              <Reveal key={f.id} delay={i * 60}>
                <FeatureCard
                  icon={f.icon}
                  name={f.name}
                  tagline={f.tagline}
                  description={f.description}
                  photoKey={f.id}
                  photoUrl={f.photoUrl}
                  fit={f.fit}
                  aspect={f.aspect}
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
                MAKE IT MORE
              </p>
              <h2
                className="mt-3 text-4xl font-semibold sm:text-5xl"
                style={{ ...fonts.displayFont, color: palette.primaryDeep }}
              >
                Add any extras
              </h2>
              <p
                className="mt-3 text-lg"
                style={{ ...fonts.bodyFont, color: palette.ink }}
              >
                Or get all three bundled into It Lasts Forever, our complete
                experience.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-3">
            {ADDONS.map((a, i) => (
              <Reveal key={a.id} delay={i * 80}>
                <FeatureCard
                  icon={a.icon}
                  name={a.name}
                  tagline={a.tagline}
                  description={a.description}
                  photoKey={a.id}
                  photoUrl={a.photoUrl}
                  fit={a.fit}
                  aspect={a.aspect}
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
              Looking for a specific color palette or theme instead of building
              from scratch?
            </p>
            <button
              onClick={() => navigate("/collections")}
              className="mt-7 inline-flex items-center gap-3 border-2 px-7 py-4 text-sm font-semibold tracking-[0.1em] text-white transition-all duration-300 hover:bg-white/10"
              style={{ ...fonts.bodyFont, borderColor: palette.gold }}
            >
              BROWSE COLLECTIONS <ArrowRight size={17} />
            </button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
