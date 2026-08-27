import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Leaf } from "lucide-react";
import { usePalette } from "../PaletteContext";

import heroImage from "./media/file_000000009b0081f6ab943d7379508069.png";

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

function SectionHeading({ eyebrow, title, subtitle, palette, fonts }) {
  return (
    <div>
      <div className="font-[Jost] text-[9px] font-semibold tracking-[0.3em]" style={{ color: palette.gold }}>
        {eyebrow}
      </div>
      <h2
        className="mt-4 font-['Cormorant_Garamond'] text-5xl font-semibold leading-none sm:text-6xl"
        style={{ color: palette.primaryDeep }}
      >
        {title}
      </h2>
      <p className="mt-5 max-w-2xl font-[Jost] text-sm leading-7" style={{ color: palette.muted }}>
        {subtitle}
      </p>
    </div>
  );
}

const PILLARS = [
  ["01", "THE DECOR", "Statement pieces, tabletop details, and the little things that pull a story together.", "/decor"],
  ["02", "THE DIGITAL EXPERIENCE", "A personalized web app for your event — guest predictions, private messages, a results board that outlives the party.", "/package-builder"],
  ["03", "THE FUN", "Games and experiences guests actually want to participate in.", "/activities"],
  ["04", "THE KEEPSAKE", "Something guests take home that means more than a favor bag ever did.", "/package-builder"],
];

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
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">

            <Reveal className="relative z-10">
              <div className="font-[Jost] text-[10px] font-semibold tracking-[0.35em]" style={{ color: palette.gold }}>
                CELEBRATIONS WITH A STORY TO TELL
              </div>

              <h1
                className="mt-5 font-['Cormorant_Garamond'] font-semibold tracking-[-0.04em]"
                style={{ color: palette.primaryDeep, fontSize: "clamp(4rem, 8vw, 7rem)", lineHeight: 0.82 }}
              >
                Every story
                <br />
                deserves its own
              </h1>

              <div className="mt-3 font-[Parisienne] text-5xl font-normal sm:text-6xl lg:text-7xl" style={{ color: palette.accent }}>
                collection.
              </div>

              <p className="mt-8 max-w-xl font-[Jost] text-[15px] leading-8" style={{ color: palette.muted }}>
                Curated decor, a personalized digital experience, and interactive moments guests
                actually remember — bundled into one story, built entirely around the people at the
                center of it.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/package-builder")}
                  className="group inline-flex items-center gap-3 px-6 py-3.5 font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: palette.primaryDeep, boxShadow: `0 8px 20px ${palette.primaryDeep}1A` }}
                >
                  PLAN YOUR EVENT
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => navigate("/decor")}
                  className="group inline-flex items-center gap-3 border px-6 py-3.5 font-[Jost] text-[10px] font-semibold tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5"
                  style={{ borderColor: palette.gold, color: palette.primaryDeep }}
                >
                  EXPLORE DECOR
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="relative group" style={{ transform: `translateY(${heroOffset}px)`, transition: "transform 120ms linear" }}>
                <div className="absolute -inset-3 opacity-40" style={{ border: `1px solid ${palette.gold}` }} />
                <div className="relative overflow-hidden" style={{ aspectRatio: "4 / 5", background: `${palette.primary}1A` }}>
                  <img
                    src={heroImage}
                    alt="A Slice of G Events"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.035]"
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "linear-gradient(180deg, rgba(30,35,27,.02) 0%, rgba(30,35,27,.10) 100%)" }}
                  />
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div className="px-4 py-3 backdrop-blur-sm" style={{ background: `${palette.bg}E0` }}>
                    <div className="font-[Jost] text-[9px] font-semibold tracking-[0.25em]" style={{ color: palette.primaryDeep }}>
                      A SLICE OF G
                    </div>
                    <div className="mt-1 font-[Jost] text-[8px] tracking-[0.18em]" style={{ color: palette.muted }}>
                      STORY COLLECTIONS · $350–$499+ CAD
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* EXPERIENCE — four pillars */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <SectionHeading
            eyebrow="THE EXPERIENCE"
            title="More than a rental."
            subtitle="Every story is built on four pillars, so nothing about your day feels like an afterthought — and nothing about hosting it feels like a second job."
            palette={palette}
            fonts={fonts}
          />
        </Reveal>

        <div className="mt-16 grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ border: `1px solid ${palette.line}`, background: palette.line }}>
          {PILLARS.map(([num, title, body, path], index) => (
            <Reveal key={num} delay={index * 100}>
              <button
                onClick={() => navigate(path)}
                className="group h-full w-full p-8 text-left transition-all duration-500 hover:-translate-y-1 sm:p-10"
                style={{ background: palette.bg }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${palette.primary}0D`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = palette.bg)}
              >
                <div className="font-[Cormorant_Garamond] text-4xl transition-transform duration-500 group-hover:translate-x-1" style={{ color: palette.gold }}>
                  {num}
                </div>
                <h2 className="mt-8 font-[Jost] text-[10px] font-semibold tracking-[0.25em]" style={{ color: palette.primaryDeep }}>
                  {title}
                </h2>
                <p className="mt-4 font-[Jost] text-sm leading-7" style={{ color: palette.muted }}>
                  {body}
                </p>
                <div className="mt-7 flex items-center gap-2 font-[Jost] text-[9px] font-semibold tracking-[0.18em]" style={{ color: palette.gold }}>
                  EXPLORE
                  <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* VISUAL BREAK */}
      <Reveal>
        <section className="relative overflow-hidden" style={{ background: `${palette.primary}12` }}>
          <div className="mx-auto grid max-w-7xl items-center lg:grid-cols-2">
            <div className="px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
              <Leaf size={18} strokeWidth={1.2} style={{ color: palette.gold }} />
              <div className="mt-5 font-[Jost] text-[9px] font-semibold tracking-[0.3em]" style={{ color: palette.muted }}>
                BEAUTIFULLY CONSIDERED
              </div>
              <h2 className="mt-4 font-['Cormorant_Garamond'] text-5xl font-semibold leading-none sm:text-6xl" style={{ color: palette.primaryDeep }}>
                It's the little
                <br />
                things.
              </h2>
              <p className="mt-6 max-w-xl font-[Jost] text-sm leading-7" style={{ color: palette.muted }}>
                The right table detail. The game everyone actually wants to play. The tiny moment
                that makes someone stop and say, "This is so us."
              </p>
            </div>
            <div
              className="min-h-[360px] lg:min-h-[500px]"
              style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
          </div>
        </section>
      </Reveal>

      {/* CTA */}
      <section style={{ background: palette.primaryDeep, color: palette.bg }}>
        <div className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8 sm:py-32">
          <Reveal>
            <Sparkles className="mx-auto" style={{ color: palette.gold }} size={20} strokeWidth={1.2} />
            <div className="mt-5 font-[Jost] text-[9px] font-semibold tracking-[0.3em]" style={{ color: palette.gold }}>
              THE POINT
            </div>
            <h2 className="mt-4 font-['Cormorant_Garamond'] text-5xl font-semibold leading-none sm:text-6xl" style={{ color: "#FFFFFF" }}>
              The vibe is in the details.
            </h2>
            <p className="mx-auto mt-6 max-w-xl font-[Jost] text-sm leading-7" style={{ color: `${palette.bg}CC` }}>
              Start with a Collection, browse the decor, or build exactly what you have in mind.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate("/how-it-works")}
                className="group inline-flex items-center gap-3 border px-7 py-3.5 font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{ borderColor: palette.gold }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                HOW IT WORKS
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate("/package-builder")}
                className="group inline-flex items-center gap-3 px-7 py-3.5 font-[Jost] text-[10px] font-semibold tracking-[0.2em]"
                style={{ background: palette.gold, color: palette.primaryDeep }}
              >
                START PLANNING
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
