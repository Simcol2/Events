import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { usePalette } from "../PaletteContext";
import FeatureCard from "../components/FeatureCard";
import { PACKAGE_INTRO, ESSENTIALS_FEATURES, ADDONS } from "../packageContent";

import heroFullBleed from "../media/timecapsul.png";
import essentialsImage from "../media/hero.png";

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(element);
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

// Each line hits a different angle: emotional hook, product, ease, differentiation.
const HERO_LINES = [
  "A Time Capsule Your Guests Actually Fill.",
  "Balloons Die. Voice Notes Last Forever.",
  "Curated Décor. Real Keepsakes. Zero Stress.",
  "Your Guests Don't Just Show Up. They Leave Something Real.",
  "The Only Baby Shower That Gets Better After It Ends.",
  "Pick a Date. Pick a Vibe. We Handle the Rest.",
];

const VISIBLE_MS = 3500;
const FADE_MS = 500;

function RotatingHeadline({ palette, fonts }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_LINES.length);
    }, VISIBLE_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: "clamp(3.5rem, 8vw, 6rem)",
        marginBottom: "1.5rem",
      }}
    >
      {HERO_LINES.map((line, i) => (
        <h1
          key={line}
          style={{
            ...fonts.displayFont,
            position: "absolute",
            inset: 0,
            width: "100%",
            margin: 0,
            fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
            fontWeight: 500,
            lineHeight: 1.15,
            color: "#FDF6EE",
            opacity: i === index ? 1 : 0,
            transform: i === index ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            pointerEvents: "none",
            textAlign: "center",
          }}
        >
          {line}
        </h1>
      ))}
    </div>
  );
}

export default function Home({ navigate }) {
  const { palette, fonts } = usePalette();

  return (
    <div className="overflow-hidden" style={{ background: palette.bg }}>

      {/* FULL-BLEED HERO */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "88vh" }}>
        <img
          src={heroFullBleed}
          alt="A Slice of G Events"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${palette.primaryDeep}E6 0%, ${palette.primaryDeep}66 38%, rgba(26,60,42,0) 62%)`,
          }}
        />

        <div className="relative z-10 flex min-h-[88vh] items-center justify-center px-6 pb-14 pt-32 sm:px-10 sm:pb-20">
          <div className="w-[90%] max-w-[900px] text-center">
            <RotatingHeadline palette={palette} fonts={fonts} />

            <p className="mx-auto mt-6 max-w-[600px] text-base leading-7 sm:text-lg" style={{ ...fonts.bodyFont, color: "rgba(253, 246, 238, 0.9)" }}>
              Everything for an unforgettable baby shower. Delivered, styled, and designed to be
              remembered forever. Starting at $795.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
              <button
                onClick={() => navigate("/package-builder")}
                className="inline-flex items-center gap-3 px-7 py-4 text-sm font-semibold tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
              >
                BUILD YOUR PACKAGE <ArrowRight size={17} />
              </button>
              <button
                onClick={() => navigate("/how-it-works")}
                className="text-sm font-semibold tracking-[0.1em] underline underline-offset-4"
                style={{ ...fonts.bodyFont, color: "#FFFFFF" }}
              >
                SEE HOW IT WORKS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* THE ESSENTIALS */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
              <div className="max-w-xl text-left">
                <p className="text-xs font-semibold tracking-[0.3em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
                  THE ESSENTIALS
                </p>
                <h2 className="mt-5 font-semibold leading-[0.9]" style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "clamp(4rem, 8vw, 9rem)" }}>
                  $795
                </h2>
                <p className="mt-5 max-w-lg text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
                  The core experience. Everything you need for a shower guests will actually remember.
                </p>
              </div>

              <div className="relative h-[360px] w-full justify-self-end lg:h-[560px] lg:w-full">
                <img
                  src={essentialsImage}
                  alt="Essentials event styling"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: "center" }}
                />
              </div>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* ADD-ONS */}
      <section className="py-20" style={{ background: `${palette.primary}0D` }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-xs font-semibold tracking-[0.3em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
                MAKE IT MORE
              </p>
              <h2 className="mt-3 text-4xl sm:text-5xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                Add any extras
              </h2>
              <p className="mt-3 text-lg" style={{ ...fonts.bodyFont, color: palette.ink }}>
                Or get all three bundled into It Lasts Forever, our complete experience.
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
            <div className="text-center mt-12">
              <button
                onClick={() => navigate("/package-builder")}
                className="inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold tracking-[0.1em] text-white"
                style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
              >
                BUILD YOUR PACKAGE <ArrowRight size={17} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: palette.primaryDeep }}>
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 text-center">
          <Reveal>
            <Sparkles className="mx-auto" style={{ color: palette.gold }} size={22} strokeWidth={1.2} />
            <h2 className="mt-5 text-4xl sm:text-5xl font-semibold" style={{ ...fonts.displayFont, color: "#FFFFFF" }}>
              The vibe is in the details.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg leading-8" style={{ ...fonts.bodyFont, color: `${palette.bg}DD` }}>
              Looking for a specific color palette or theme instead of building from scratch?
            </p>
            <button
              onClick={() => navigate("/collections")}
              className="mt-7 inline-flex items-center gap-3 border-2 px-7 py-4 text-sm font-semibold tracking-[0.1em] text-white"
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
