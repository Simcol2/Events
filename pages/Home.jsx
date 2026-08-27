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
      style={{
        position: "relative",
        minHeight: "clamp(4rem, 10vw, 7rem)",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {HERO_LINES.map((line, i) => (
        <h1
          key={i}
          style={{
            ...fonts.displayFont,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform:
              i === index
                ? "translate(-50%, -50%)"
                : "translate(-50%, calc(-50% + 12px))",
            width: "100%",
            margin: 0,
            fontSize: "clamp(2rem, 5vw, 4.2rem)",
            fontWeight: 500,
            lineHeight: 1.15,
            color: "#FDF6EE",
            opacity: i === index ? 1 : 0,
            transition: "opacity 600ms ease, transform 600ms ease",
            textShadow: "0 2px 20px rgba(0,0,0,0.35)",
            pointerEvents: "none",
            textAlign: "center",
            whiteSpace: "nowrap",
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

  /* helper: add alpha to a 6-char hex */
  const hex = (color, alphaHex) => {
    const c = color.replace("#", "");
    return `#${c}${alphaHex}`;
  };

  return (
    <div className="overflow-hidden" style={{ background: palette.bg }}>

      {/* ═══════════════════════════════════════
          FULL-BLEED HERO
          ═══════════════════════════════════════ */}
      <section className="relative w-full" style={{ minHeight: "100vh" }}>
        {/* Background image */}
        <img
          src={heroFullBleed}
          alt="Baby shower styling"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              180deg,
              ${hex(palette.primaryDeep, "E6")} 0%,
              ${hex(palette.primaryDeep, "80")} 40%,
              transparent 65%
            )`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-6 pt-24 pb-16 sm:px-10">
          <div className="w-full max-w-[900px] text-center">
            <RotatingHeadline fonts={fonts} />

            <p
              className="mx-auto max-w-[600px] text-base leading-7 sm:text-lg"
              style={{
                ...fonts.bodyFont,
                color: "rgba(253, 246, 238, 0.92)",
              }}
            >
              Everything for an unforgettable baby shower. Delivered, styled,
              and designed to be remembered forever. Starting at $795.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
              <button
                onClick={() => navigate("/package-builder")}
                className="inline-flex items-center gap-3 rounded-sm px-7 py-4 text-sm font-semibold tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
              >
                BUILD YOUR PACKAGE <ArrowRight size={17} />
              </button>

              <button
                onClick={() => navigate("/how-it-works")}
                className="text-sm font-semibold tracking-[0.1em] text-white underline underline-offset-4 transition-opacity hover:opacity-80"
                style={{ ...fonts.bodyFont }}
              >
                SEE HOW IT WORKS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          THE ESSENTIALS
          ═══════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div className="max-w-xl text-left">
                <p
                  className="text-xs font-semibold tracking-[0.3em]"
                  style={{ ...fonts.bodyFont, color: palette.gold }}
                >
                  THE ESSENTIALS
                </p>
                <h2
                  className="mt-5 font-semibold leading-[0.9]"
                  style={{
                    ...fonts.displayFont,
                    color: palette.primaryDeep,
                    fontSize: "clamp(4rem, 10vw, 9rem)",
                  }}
                >
                  $795
                </h2>
                <p
                  className="mt-5 max-w-lg text-lg leading-8"
                  style={{ ...fonts.bodyFont, color: palette.ink }}
                >
                  The core experience. Everything you need for a shower guests
                  will actually remember.
                </p>
              </div>

              <div className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto lg:h-[560px]">
                <img
                  src={essentialsImage}
                  alt="Essentials event styling"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
