import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Leaf } from "lucide-react";
import {
  SAGE,
  SAGE_DEEP,
  GOLD,
  CREAM,
  INK,
  LINE,
  displayFont,
  scriptFont,
  bodyFont,
  ensureFonts,
} from "../theme";

import heroImage from "../media/file_000000009b0081f6ab943d7379508069.png";

const PILLARS = [
  {
    num: "01",
    title: "THE DECOR",
    body: "Statement pieces, tabletop details, and the little things that pull a story together.",
    path: "/decor",
  },
  {
    num: "02",
    title: "THE DIGITAL EXPERIENCE",
    body: "A personalized web experience for your event — guest predictions, private messages, and moments that live beyond the party.",
    path: "/reservations",
  },
  {
    num: "03",
    title: "THE FUN",
    body: "Photo challenges, trivia, and prediction games your guests actually want to play.",
    path: "/activities",
  },
  {
    num: "04",
    title: "THE KEEPSAKE",
    body: "Something meaningful to keep — not another favour that gets forgotten by Monday.",
    path: "/collections",
  },
];

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

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
      { threshold: 0.08 }
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
        transform: visible ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 700ms ease ${delay}ms, transform 700ms cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children, light = false }) {
  return (
    <div
      className="text-[9px] font-semibold tracking-[0.3em]"
      style={{ ...bodyFont, color: light ? "#D4BC91" : GOLD }}
    >
      {children}
    </div>
  );
}

export default function Home({ navigate }) {
  ensureFonts();

  return (
    <div
      className="overflow-hidden"
      style={{
        background: CREAM,
        color: INK,
      }}
    >
      {/* HERO */}
      <section
        className="relative overflow-hidden border-b"
        style={{
          background: "#FAF6ED",
          borderColor: LINE,
        }}
      >
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
            <Reveal className="relative z-10">
              <Eyebrow>CELEBRATIONS WITH A STORY TO TELL</Eyebrow>

              <h1
                className="mt-5 font-semibold tracking-[-0.045em]"
                style={{
                  ...displayFont,
                  color: SAGE_DEEP,
                  fontSize: "clamp(3.35rem, 7vw, 6.7rem)",
                  lineHeight: 0.84,
                }}
              >
                Every story
                <br />
                deserves its own
                <br />
                <span
                  style={{
                    ...scriptFont,
                    color: GOLD,
                    fontSize: "0.7em",
                    fontWeight: 400,
                    letterSpacing: "normal",
                  }}
                >
                  collection.
                </span>
              </h1>

              <p
                className="mt-7 max-w-xl text-[14px] leading-7 sm:mt-8 sm:text-[15px] sm:leading-8"
                style={{ ...bodyFont, color: "#716B5C" }}
              >
                Thoughtfully curated decor, playful experiences, and meaningful
                details designed around the people you're celebrating — not
                another generic party theme.
              </p>

              <div className="mt-7 flex flex-wrap gap-3 sm:mt-9">
                <button
                  onClick={() => navigate("/collections")}
                  className="group inline-flex items-center gap-3 px-5 py-3.5 text-[9px] font-semibold tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-0.5 sm:px-6 sm:text-[10px]"
                  style={{
                    ...bodyFont,
                    background: SAGE_DEEP,
                    boxShadow: "0 8px 20px rgba(78,90,68,.10)",
                  }}
                >
                  VIEW THE COLLECTIONS
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

                <button
                  onClick={() => navigate("/reservations")}
                  className="group inline-flex items-center gap-3 border px-5 py-3.5 text-[9px] font-semibold tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 sm:px-6 sm:text-[10px]"
                  style={{
                    ...bodyFont,
                    borderColor: GOLD,
                    color: SAGE_DEEP,
                  }}
                >
                  PLAN YOUR EVENT
                </button>
              </div>

              <div
                className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[8px] tracking-[0.18em]"
                style={{ ...bodyFont, color: "#8A8268" }}
              >
                <span>RENT INDIVIDUAL PIECES</span>
                <span style={{ color: GOLD }}>•</span>
                <span>OR CHOOSE A COLLECTION</span>
                <span style={{ color: GOLD }}>•</span>
                <span>DIY &amp; PICKUP</span>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="relative mx-auto w-full max-w-[620px]">
                <div
                  className="absolute -inset-3 hidden sm:block"
                  style={{ border: `1px solid ${GOLD}66` }}
                />

                <div
                  className="relative overflow-hidden"
                  style={{
                    aspectRatio: "4 / 3",
                    background: "#EAE5D7",
                  }}
                >
                  <img
                    src={heroImage}
                    alt="Curated event rental display"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out hover:scale-[1.025]"
                  />

                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(30,35,27,.01) 0%, rgba(30,35,27,.14) 100%)",
                    }}
                  />

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between sm:bottom-5 sm:left-5 sm:right-5">
                    <div
                      className="px-3 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3"
                      style={{ background: "rgba(250,246,237,.9)" }}
                    >
                      <div
                        className="text-[8px] font-semibold tracking-[0.24em] sm:text-[9px]"
                        style={{ ...bodyFont, color: SAGE_DEEP }}
                      >
                        A SLICE OF G
                      </div>
                      <div
                        className="mt-1 text-[7px] tracking-[0.15em] sm:text-[8px]"
                        style={{ ...bodyFont, color: "#8A8268" }}
                      >
                        DECOR · EXPERIENCES · KEEPSAKES
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
        <Reveal>
          <div className="grid items-end gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <Eyebrow>THE IDEA</Eyebrow>
              <h2
                className="mt-4 font-semibold leading-[0.92]"
                style={{
                  ...displayFont,
                  color: SAGE_DEEP,
                  fontSize: "clamp(3rem, 5.5vw, 5.5rem)",
                }}
              >
                Baby showers
                <br />
                shouldn't all
                <br />
                look the same.
              </h2>
            </div>

            <div className="max-w-2xl pb-1">
              <p
                className="text-base leading-8 sm:text-lg sm:leading-9"
                style={{ ...bodyFont, color: "#716B5C" }}
              >
                Why do adults have to choose between a room full of baby
                bottles and a luxury wedding installation?
              </p>
              <p
                className="mt-5 text-sm leading-7 sm:text-[15px] sm:leading-8"
                style={{ ...bodyFont, color: "#716B5C" }}
              >
                Our collections are designed to feel like real celebrations:
                something you could set up in a home, backyard, restaurant
                private room, community space, or small venue. The baby is
                part of the story — but the people, memories, culture and
                personality at the centre of it get to be there too.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* EXPERIENCE / PILLARS */}
      <section
        className="border-y"
        style={{ background: "#F3EEE2", borderColor: LINE }}
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <div className="text-center">
              <Eyebrow>THE EXPERIENCE</Eyebrow>
              <h2
                className="mt-3 font-semibold leading-none"
                style={{
                  ...displayFont,
                  color: SAGE_DEEP,
                  fontSize: "clamp(3rem, 5vw, 5rem)",
                }}
              >
                More than a rental.
              </h2>
              <p
                className="mx-auto mt-5 max-w-2xl text-sm leading-7"
                style={{ ...bodyFont, color: "#716B5C" }}
              >
                Choose a complete collection, or rent only the pieces you
                need. Either way, everything is designed to work together.
              </p>
            </div>
          </Reveal>

          <div
            className="mt-12 grid overflow-hidden border sm:mt-16 sm:grid-cols-2 lg:grid-cols-4"
            style={{
              borderColor: LINE,
              background: LINE,
              gap: "1px",
            }}
          >
            {PILLARS.map((p, index) => (
              <Reveal key={p.num} delay={index * 70}>
                <button
                  onClick={() => navigate(p.path)}
                  className="group flex h-full w-full flex-col p-7 text-left transition-all duration-500 sm:p-8 lg:p-9"
                  style={{ background: CREAM }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FAF6ED";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = CREAM;
                  }}
                >
                  <div
                    className="text-4xl transition-transform duration-500 group-hover:translate-x-1"
                    style={{ ...displayFont, color: GOLD }}
                  >
                    {p.num}
                  </div>

                  <h3
                    className="mt-7 text-[9px] font-semibold tracking-[0.24em] sm:mt-8"
                    style={{ ...bodyFont, color: SAGE_DEEP }}
                  >
                    {p.title}
                  </h3>

                  <p
                    className="mt-4 text-[13px] leading-6 sm:text-sm sm:leading-7"
                    style={{ ...bodyFont, color: "#716B5C" }}
                  >
                    {p.body}
                  </p>

                  <div
                    className="mt-auto flex items-center gap-2 pt-7 text-[8px] font-semibold tracking-[0.18em]"
                    style={{ ...bodyFont, color: GOLD }}
                  >
                    EXPLORE
                    <ArrowRight
                      size={12}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* COLLECTIONS STATEMENT */}
      <Reveal>
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-stretch lg:grid-cols-2">
            <div
              className="flex items-center px-6 py-20 sm:px-10 sm:py-28 lg:px-16"
              style={{ background: CREAM }}
            >
              <div className="max-w-xl">
                <Leaf size={18} strokeWidth={1.2} style={{ color: GOLD }} />

                <div className="mt-5">
                  <Eyebrow>THE COLLECTIONS</Eyebrow>
                </div>

                <h2
                  className="mt-4 font-semibold leading-[0.92]"
                  style={{
                    ...displayFont,
                    color: SAGE_DEEP,
                    fontSize: "clamp(3rem, 5vw, 5rem)",
                  }}
                >
                  Built around
                  <br />
                  <span
                    style={{
                      ...scriptFont,
                      color: GOLD,
                      fontWeight: 400,
                      fontSize: "0.75em",
                    }}
                  >
                    your story.
                  </span>
                </h2>

                <p
                  className="mt-6 text-sm leading-7 sm:text-[15px] sm:leading-8"
                  style={{ ...bodyFont, color: "#716B5C" }}
                >
                  The themes rotate throughout the year, so there is always
                  something fresh to discover. Carnival Baby. Never Let Anyone
                  Dull Your Sparkle. Sunday Best. It Takes a Village. And
                  collections inspired by the childhoods, cultures and
                  personalities of the families celebrating.
                </p>

                <button
                  onClick={() => navigate("/collections")}
                  className="group mt-7 inline-flex items-center gap-3 text-[9px] font-semibold tracking-[0.2em]"
                  style={{ ...bodyFont, color: SAGE_DEEP }}
                >
                  SEE WHAT'S IN THE COLLECTION
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>

            <div
              className="relative min-h-[380px] overflow-hidden sm:min-h-[480px] lg:min-h-[560px]"
              style={{ background: "#EAE5D7" }}
            >
              <img
                src={heroImage}
                alt="A Slice of G event rental details"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(78,90,68,.08), rgba(30,35,27,.2))",
                }}
              />
              <div
                className="absolute left-5 top-5 right-5 bottom-5 sm:left-7 sm:top-7 sm:right-7 sm:bottom-7"
                style={{ border: `1px solid rgba(255,255,255,.65)` }}
              />
              <div className="absolute bottom-7 left-7 sm:bottom-9 sm:left-9">
                <div
                  className="text-4xl sm:text-5xl"
                  style={{ ...scriptFont, color: "#FFF8EA" }}
                >
                  sophisticated
                </div>
                <div
                  className="mt-[-3px] text-3xl font-semibold sm:text-4xl"
                  style={{ ...displayFont, color: "#FFF8EA" }}
                >
                  nostalgia
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* DIY MESSAGE */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <div
            className="relative overflow-hidden border px-6 py-12 text-center sm:px-12 sm:py-16"
            style={{
              borderColor: GOLD,
              background: "#FAF6ED",
            }}
          >
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-px w-24 -translate-x-1/2"
              style={{ background: GOLD }}
            />

            <Eyebrow>THE DIY PART</Eyebrow>

            <h2
              className="mx-auto mt-4 max-w-3xl font-semibold leading-[0.95]"
              style={{
                ...displayFont,
                color: SAGE_DEEP,
                fontSize: "clamp(2.7rem, 5vw, 4.8rem)",
              }}
            >
              We provide the pieces.
              <br />
              <span
                style={{
                  ...scriptFont,
                  color: GOLD,
                  fontWeight: 400,
                  fontSize: "0.75em",
                }}
              >
                You make it yours.
              </span>
            </h2>

            <p
              className="mx-auto mt-5 max-w-2xl text-sm leading-7"
              style={{ ...bodyFont, color: "#716B5C" }}
            >
              Your box arrives with the coordinated decor, display pieces,
              signage, tabletop details and instructions you need. You set it
              up your way, in your space, on your schedule.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate("/decor")}
                className="group inline-flex items-center gap-3 border px-6 py-3.5 text-[9px] font-semibold tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  ...bodyFont,
                  borderColor: GOLD,
                  color: SAGE_DEEP,
                }}
              >
                BROWSE DECOR
                <ArrowRight
                  size={13}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              <button
                onClick={() => navigate("/collections")}
                className="group inline-flex items-center gap-3 px-6 py-3.5 text-[9px] font-semibold tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  ...bodyFont,
                  background: SAGE_DEEP,
                }}
              >
                SHOP THE COLLECTIONS
                <ArrowRight
                  size={13}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FINAL CTA */}
      <section
        className="text-center"
        style={{ background: SAGE_DEEP, color: CREAM }}
      >
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <Sparkles
              className="mx-auto"
              color={GOLD}
              size={20}
              strokeWidth={1.2}
            />

            <div className="mt-5">
              <Eyebrow light>THE POINT</Eyebrow>
            </div>

            <h2
              className="mt-4 font-semibold leading-[0.92]"
              style={{
                ...displayFont,
                fontSize: "clamp(3rem, 5.5vw, 5.5rem)",
              }}
            >
              The vibe is in
              <br />
              the details.
            </h2>

            <p
              className="mx-auto mt-6 max-w-xl text-sm leading-7"
              style={{ ...bodyFont, color: "#DAD7C9" }}
            >
              Start with a Collection, browse the decor, or build exactly
              what you have in mind.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate("/collections")}
                className="px-6 py-3.5 text-[9px] font-semibold tracking-[0.2em] transition hover:bg-white/5"
                style={{
                  ...bodyFont,
                  border: `1px solid #D4BC91`,
                  color: CREAM,
                }}
              >
                VIEW THE COLLECTIONS
              </button>

              <button
                onClick={() => navigate("/reservations")}
                className="px-6 py-3.5 text-[9px] font-semibold tracking-[0.2em] transition hover:opacity-90"
                style={{
                  ...bodyFont,
                  background: GOLD,
                  color: SAGE_DEEP,
                }}
              >
                START PLANNING
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
