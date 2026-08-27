import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { usePalette } from "../PaletteContext";
import FeatureCard from "../components/FeatureCard";
import { PACKAGE_INTRO, ESSENTIALS_FEATURES, ADDONS } from "../packageContent";

import heroImage from "../media/file_000000009b0081f6ab943d7379508069.png";

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

export default function Home({ navigate }) {
  const { palette, fonts } = usePalette();
  const heroRef = useRef(null);
  const [heroOffset, setHeroOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.bottom > 0 && rect.top < viewportHeight) {
        const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        setHeroOffset((progress - 0.5) * 35);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="overflow-hidden" style={{ background: palette.bg }}>

      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ background: palette.bg, borderBottom: `1px solid ${palette.line}` }}>
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Reveal className="relative z-10">
              <div className="text-xs font-semibold tracking-[0.3em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
                CELEBRATIONS WITH A STORY TO TELL
              </div>
              <h1
                className="mt-5 font-semibold tracking-[-0.03em]"
                style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "clamp(3.2rem, 8vw, 6.5rem)", lineHeight: 0.9 }}
              >
                A curated baby
                <br />
                shower experience.
              </h1>
              <div className="mt-2 text-3xl sm:text-4xl" style={{ ...fonts.scriptFont, color: palette.accent }}>
                Made for memories, saved forever.
              </div>
              <p className="mt-7 max-w-xl text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
                {PACKAGE_INTRO.body}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/package-builder")}
                  className="inline-flex items-center gap-3 px-7 py-4 text-sm font-semibold tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5"
                  style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
                >
                  BUILD YOUR PACKAGE <ArrowRight size={17} />
                </button>
                <button
                  onClick={() => navigate("/how-it-works")}
                  className="inline-flex items-center gap-3 border-2 px-7 py-4 text-sm font-semibold tracking-[0.1em] transition-all duration-300 hover:-translate-y-0.5"
                  style={{ ...fonts.bodyFont, borderColor: palette.gold, color: palette.primaryDeep }}
                >
                  HOW IT WORKS
                </button>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="relative" style={{ transform: `translateY(${heroOffset}px)`, transition: "transform 120ms linear" }}>
                <div className="absolute -inset-3 opacity-40" style={{ border: `1px solid ${palette.gold}` }} />
                <div className="relative overflow-hidden" style={{ aspectRatio: "4 / 5", background: `${palette.primary}1A` }}>
                  <img src={heroImage} alt="A Slice of G Events" className="h-full w-full object-cover" />
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div className="px-4 py-3" style={{ background: `${palette.bg}EE` }}>
                    <div className="text-xs font-bold tracking-[0.2em]" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
                      A SLICE OF G EVENTS
                    </div>
                    <div className="mt-1 text-xs tracking-[0.15em]" style={{ ...fonts.bodyFont, color: palette.muted }}>
                      DESIGNED FOR UP TO 30 GUESTS
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* THE ESSENTIALS */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Reveal>
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.3em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
              THE ESSENTIALS
            </p>
            <h2 className="mt-3 text-5xl sm:text-6xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
              $795
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-lg leading-8" style={{ ...fonts.bodyFont, color: palette.ink }}>
              The core experience. Everything you need for a shower guests will actually remember.
            </p>
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
              />
            </Reveal>
          ))}
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
