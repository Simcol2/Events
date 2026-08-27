import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, HeartPulse, Mic } from "lucide-react";
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
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => clearTimeout(fadeOutTimer);
  }, [index]);

  useEffect(() => {
    if (!visible) {
      const switchTimer = setTimeout(() => {
        setIndex((i) => (i + 1) % HERO_LINES.length);
        setVisible(true);
      }, FADE_MS);
      return () => clearTimeout(switchTimer);
    }
  }, [visible]);

  // Voice Notes gets its own icon since the line calls it out directly;
  // every other line gets a subtle heartbeat to reinforce the memory theme.
  const isVoiceNotesLine = HERO_LINES[index].includes("Voice Notes");
  const Icon = isVoiceNotesLine ? Mic : HeartPulse;

  return (
    <div className="flex items-start gap-3">
      <Icon
        size={26}
        className="mt-2 flex-shrink-0 animate-pulse"
        style={{ color: palette.gold }}
        strokeWidth={1.6}
      />
      <h1
        className="font-semibold tracking-[-0.02em]"
        style={{
          ...fonts.displayFont,
          color: "#FFFFFF",
          fontSize: "clamp(2.6rem, 6.5vw, 5.2rem)",
          lineHeight: 1.05,
          opacity: visible ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {HERO_LINES[index]}
      </h1>
    </div>
  );
}

export default function Home({ navigate }) {
  const { palette, fonts } = usePalette();

  return (
    <div className="overflow-hidden" style={{ background: palette.bg }}>

      {/* FULL-BLEED HERO */}
      <section className="relative w-full flex items-end" style={{ minHeight: "88vh" }}>
        <img
          src={heroFullBleed}
          alt="A Slice of G Events"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${palette.primaryDeep}66 0%, ${palette.primaryDeep}CC 100%)`,
          }}
        />

        <div className="relative z-10 w-full px-6 pb-14 pt-32 sm:px-10 sm:pb-20">
          <div className="max-w-3xl">
            <RotatingHeadline palette={palette} fonts={fonts} />

            <p className="mt-6 max-w-xl text-base sm:text-lg leading-7" style={{ ...fonts.bodyFont, color: "#FFFFFFDD" }}>
              Everything for an unforgettable baby shower. Delivered, styled, and designed to be
              remembered forever. Starting at $795.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
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
      <section className="relative overflow-hidden py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <div className="mb-12 grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-0">
              <div className="max-w-xl text-left">
                <p className="text-xs font-semibold tracking-[0.3em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
                  THE ESSENTIALS
                </p>
                <h2 className="mt-5 text-5xl sm:text-6xl lg:text-7xl font-semibold leading-none" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                  $795
                </h2>
                <p className="mt-5 max-w-lg text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
                  The core experience. Everything you need for a shower guests will actually remember.
                </p>
              </div>

              <div className="relative h-[360px] w-full lg:h-[500px] lg:ml-auto lg:w-[calc(100%+2rem)]">
                <img
                  src={essentialsImage}
                  alt="Essentials event styling"
                  className="absolute inset-y-0 right-0 h-full w-full object-cover lg:w-[120%]"
                  style={{ clipPath: "inset(0 0 0 0 round 0 0 0 0)" }}
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
