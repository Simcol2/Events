import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Baby,
  Gift,
  Palette,
  PartyPopper,
  Sparkles,
  X,
} from "lucide-react";

import {
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

import heroImage from "../media/Collections-3-Carnival baby mockup.png";

const COLORS = {
  blush: "#E8A3A8",
  coral: "#E77D61",
  butter: "#F0C96B",
  lilac: "#A99BCB",
  teal: "#6E9B91",
  pinkSoft: "#F7DDE0",
  blueSoft: "#DCE8EF",
};

const PILLARS = [
  {
    num: "01",
    title: "THE DECOR",
    body: "Statement pieces, tabletop details, signage and the little things that make the theme feel complete.",
    path: "/decor",
    icon: Palette,
    accent: COLORS.coral,
  },
  {
    num: "02",
    title: "THE DIGITAL EXPERIENCE",
    body: "A personalized event experience with guest predictions, private messages and moments that live beyond the party.",
    path: "/reservations",
    icon: Sparkles,
    accent: COLORS.lilac,
  },
  {
    num: "03",
    title: "THE FUN",
    body: "Photo challenges, trivia and prediction games that give guests something fun to actually do.",
    path: "/activities",
    icon: PartyPopper,
    accent: COLORS.butter,
  },
  {
    num: "04",
    title: "THE KEEPSAKE",
    body: "A meaningful piece to keep after the party, instead of another favour that gets forgotten.",
    path: "/collections",
    icon: Gift,
    accent: COLORS.teal,
  },
];

const COLLECTIONS = [
  {
    title: "Carnival Baby",
    subtitle: "Culture, colour and a little masquerader.",
    accent: COLORS.coral,
    label: "COMING SOON",
    image: heroImage,
  },
  {
    title: "Never Let Anyone Dull Your Sparkle",
    subtitle: "The people becoming parents, before they became parents.",
    accent: COLORS.lilac,
    label: "THE PARENTS",
  },
  {
    title: "Sunday Best",
    subtitle: "A dressed-up celebration with personality.",
    accent: COLORS.butter,
    label: "COMING SOON",
  },
  {
    title: "It Takes a Village",
    subtitle: "The people who are already part of the story.",
    accent: COLORS.teal,
    label: "COMING SOON",
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
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 650ms ease ${delay}ms, transform 650ms cubic-bezier(.22,1,.36,1) ${delay}ms`,
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
      style={{ ...bodyFont, color: light ? "#E8D4AC" : GOLD }}
    >
      {children}
    </div>
  );
}

function GalleryModal({ onClose }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto"
      style={{ background: "rgba(38,45,35,.78)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full px-4 py-6 sm:px-8 sm:py-10">
        <div
          className="relative mx-auto max-w-6xl overflow-hidden"
          style={{
            background: "#FAF6ED",
            boxShadow: "0 30px 90px rgba(0,0,0,.25)",
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close gallery"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full transition hover:scale-105"
            style={{
              background: "rgba(250,246,237,.92)",
              color: SAGE_DEEP,
            }}
          >
            <X size={18} />
          </button>

          <div
            className="grid lg:grid-cols-[1.15fr_.85fr]"
            style={{ minHeight: "min(760px, 90vh)" }}
          >
            <div
              className="relative min-h-[430px] overflow-hidden sm:min-h-[560px] lg:min-h-full"
              style={{ background: COLORS.pinkSoft }}
            >
              <img
                src={heroImage}
                alt="Carnival Baby collection preview"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div
                className="absolute left-5 top-5 border px-3 py-2 sm:left-7 sm:top-7"
                style={{
                  borderColor: "rgba(255,255,255,.75)",
                  background: "rgba(250,246,237,.84)",
                }}
              >
                <div
                  className="text-[8px] font-semibold tracking-[0.22em]"
                  style={{ ...bodyFont, color: SAGE_DEEP }}
                >
                  CARNIVAL BABY
                </div>
                <div
                  className="mt-1 text-[8px] tracking-[0.16em]"
                  style={{ ...bodyFont, color: "#716B5C" }}
                >
                  COLLECTION PREVIEW
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-12">
              <div>
                <Eyebrow>THE COLLECTION GALLERY</Eyebrow>

                <h2
                  className="mt-4 font-semibold leading-[0.9]"
                  style={{
                    ...displayFont,
                    color: SAGE_DEEP,
                    fontSize: "clamp(3rem, 5vw, 5rem)",
                  }}
                >
                  A baby shower
                  <br />
                  with a little
                  <br />
                  <span
                    style={{
                      ...scriptFont,
                      color: COLORS.coral,
                      fontWeight: 400,
                      fontSize: "0.78em",
                    }}
                  >
                    more personality.
                  </span>
                </h2>

                <p
                  className="mt-6 text-sm leading-7"
                  style={{ ...bodyFont, color: "#716B5C" }}
                >
                  A magazine-style preview of the collections we are building.
                  The themes will rotate throughout the year, with individual
                  decor pieces available to rent separately too.
                </p>
              </div>

              <div className="mt-10 space-y-3">
                {COLLECTIONS.map((collection, index) => (
                  <div
                    key={collection.title}
                    className="flex items-center gap-4 border p-4"
                    style={{
                      borderColor: LINE,
                      background: index === 0 ? "#FFF8F7" : CREAM,
                    }}
                  >
                    <div
                      className="h-12 w-12 shrink-0"
                      style={{ background: collection.accent }}
                    />

                    <div className="min-w-0">
                      <div
                        className="text-[8px] font-semibold tracking-[0.2em]"
                        style={{ ...bodyFont, color: collection.accent }}
                      >
                        {collection.label}
                      </div>
                      <div
                        className="mt-1 text-sm font-semibold"
                        style={{ ...displayFont, color: SAGE_DEEP }}
                      >
                        {collection.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p
                className="mt-7 text-[10px] leading-5"
                style={{ ...bodyFont, color: "#8A8268" }}
              >
                More collection photography will be added as each theme
                launches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home({ navigate }) {
  ensureFonts();

  const [galleryOpen, setGalleryOpen] = useState(false);

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
          background: "#FFF9F5",
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
                  fontSize: "clamp(3.25rem, 7vw, 6.7rem)",
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
                    color: COLORS.coral,
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
                style={{ ...bodyFont, color: "#68675E" }}
              >
                Curated decor, playful experiences, and meaningful details
                designed around the people you are celebrating, not another
                generic party theme.
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
                    background: "#FFFDF9",
                  }}
                >
                  PLAN YOUR EVENT
                </button>
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  ["INDIVIDUAL RENTALS", COLORS.coral],
                  ["FULL COLLECTIONS", COLORS.lilac],
                  ["DIY + PICKUP", COLORS.teal],
                ].map(([label, color]) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[8px] font-semibold tracking-[0.14em]"
                    style={{
                      ...bodyFont,
                      borderColor: `${color}66`,
                      color: SAGE_DEEP,
                      background: "#FFFDF9",
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: color }}
                    />
                    {label}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="relative mx-auto w-full max-w-[620px]">
                <div
                  className="absolute -right-3 -top-3 hidden h-20 w-20 sm:block"
                  style={{
                    borderTop: `3px solid ${COLORS.coral}`,
                    borderRight: `3px solid ${COLORS.coral}`,
                  }}
                />

                <div
                  className="absolute -bottom-3 -left-3 hidden h-20 w-20 sm:block"
                  style={{
                    borderBottom: `3px solid ${COLORS.teal}`,
                    borderLeft: `3px solid ${COLORS.teal}`,
                  }}
                />

                <div
                  className="relative overflow-hidden border"
                  style={{
                    aspectRatio: "4 / 3",
                    background: COLORS.pinkSoft,
                    borderColor: "#E9D9CC",
                  }}
                >
                  <img
                    src={heroImage}
                    alt="Curated baby shower rental display"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out hover:scale-[1.025]"
                  />

                  <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-3 py-2"
                      style={{ background: "rgba(255,250,246,.92)" }}
                    >
                      <Baby size={13} style={{ color: COLORS.coral }} />
                      <span
                        className="text-[8px] font-semibold tracking-[0.16em]"
                        style={{ ...bodyFont, color: SAGE_DEEP }}
                      >
                        BABY, BUT MAKE IT FUN
                      </span>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
                    <div
                      className="inline-block px-3 py-2.5 sm:px-4 sm:py-3"
                      style={{ background: "rgba(255,250,246,.92)" }}
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

      {/* IDEA */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
        <Reveal>
          <div className="grid items-end gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <Eyebrow>THE IDEA</Eyebrow>

              <h2
                className="mt-4 font-semibold leading-[0.9]"
                style={{
                  ...displayFont,
                  color: SAGE_DEEP,
                  fontSize: "clamp(3rem, 5.5vw, 5.5rem)",
                }}
              >
                Baby showers
                <br />
                can have
                <br />
                <span
                  style={{
                    ...scriptFont,
                    color: COLORS.coral,
                    fontWeight: 400,
                    fontSize: "0.78em",
                  }}
                >
                  personality.
                </span>
              </h2>
            </div>

            <div className="max-w-2xl pb-1">
              <p
                className="text-base leading-8 sm:text-lg sm:leading-9"
                style={{ ...bodyFont, color: "#68675E" }}
              >
                The goal is simple. Make the celebration feel like the adults
                in the room actually chose it.
              </p>

              <p
                className="mt-5 text-sm leading-7 sm:text-[15px] sm:leading-8"
                style={{ ...bodyFont, color: "#68675E" }}
              >
                Our collections are designed for real homes, backyards,
                restaurant private rooms, community spaces and small venues.
                The baby is part of the story, but so are the people, memories,
                culture and personality that brought everyone together.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {["CULTURE", "MEMORIES", "PERSONALITY", "A LITTLE BABY"].map(
                  (label, index) => {
                    const accents = [
                      COLORS.coral,
                      COLORS.lilac,
                      COLORS.teal,
                      COLORS.butter,
                    ];

                    return (
                      <span
                        key={label}
                        className="border px-3 py-2 text-[8px] font-semibold tracking-[0.16em]"
                        style={{
                          ...bodyFont,
                          borderColor: `${accents[index]}66`,
                          color: SAGE_DEEP,
                          background: "#FFFDF9",
                        }}
                      >
                        {label}
                      </span>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* EXPERIENCE */}
      <section
        className="border-y"
        style={{
          background: "#F8F0E7",
          borderColor: LINE,
        }}
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
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
              </div>

              <p
                className="max-w-md text-sm leading-7 sm:text-right"
                style={{ ...bodyFont, color: "#68675E" }}
              >
                Choose the complete collection or pick only the pieces you
                actually want.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2">
            {PILLARS.map((p, index) => {
              const Icon = p.icon;

              return (
                <Reveal key={p.num} delay={index * 70}>
                  <button
                    onClick={() => navigate(p.path)}
                    className="group relative flex h-full w-full overflow-hidden border p-6 text-left transition-all duration-300 hover:-translate-y-1 sm:p-8"
                    style={{
                      borderColor: "#E0D5C7",
                      background: "#FFFDF9",
                    }}
                  >
                    <div
                      className="absolute left-0 top-0 h-full w-1"
                      style={{ background: p.accent }}
                    />

                    <div className="flex w-full gap-5">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: `${p.accent}22`,
                          color: p.accent,
                        }}
                      >
                        <Icon size={19} strokeWidth={1.5} />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center justify-between gap-4">
                          <div
                            className="text-[9px] font-semibold tracking-[0.22em]"
                            style={{ ...bodyFont, color: SAGE_DEEP }}
                          >
                            {p.title}
                          </div>

                          <div
                            className="shrink-0 text-xl"
                            style={{ ...displayFont, color: p.accent }}
                          >
                            {p.num}
                          </div>
                        </div>

                        <p
                          className="mt-4 max-w-xl text-[13px] leading-6 sm:text-sm sm:leading-7"
                          style={{ ...bodyFont, color: "#68675E" }}
                        >
                          {p.body}
                        </p>

                        <div
                          className="mt-5 flex items-center gap-2 text-[8px] font-semibold tracking-[0.18em]"
                          style={{ ...bodyFont, color: p.accent }}
                        >
                          EXPLORE
                          <ArrowRight
                            size={12}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>THE COLLECTIONS</Eyebrow>

              <h2
                className="mt-4 font-semibold leading-[0.9]"
                style={{
                  ...displayFont,
                  color: SAGE_DEEP,
                  fontSize: "clamp(3rem, 5.5vw, 5.5rem)",
                }}
              >
                Themes with
                <br />
                <span
                  style={{
                    ...scriptFont,
                    color: COLORS.coral,
                    fontWeight: 400,
                    fontSize: "0.78em",
                  }}
                >
                  a point of view.
                </span>
              </h2>
            </div>

            <p
              className="max-w-md text-sm leading-7 sm:text-right"
              style={{ ...bodyFont, color: "#68675E" }}
            >
              The lineup rotates throughout the year. Rent the whole look or
              borrow individual pieces.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((collection, index) => (
            <Reveal key={collection.title} delay={index * 70}>
              <div
                className="group relative flex min-h-[330px] flex-col overflow-hidden border"
                style={{
                  borderColor: "#E0D5C7",
                  background: index === 0 ? "#FFF8F7" : "#FFFDF9",
                }}
              >
                <div
                  className="absolute left-0 right-0 top-0 h-1.5"
                  style={{ background: collection.accent }}
                />

                {collection.image ? (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={collection.image}
                      alt={`${collection.title} collection`}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div
                    className="relative flex h-40 items-center justify-center overflow-hidden"
                    style={{
                      background: `${collection.accent}28`,
                    }}
                  >
                    <div
                      className="absolute -right-7 -top-7 h-28 w-28 rounded-full"
                      style={{ background: `${collection.accent}44` }}
                    />

                    <div
                      className="relative text-center"
                      style={{ color: SAGE_DEEP }}
                    >
                      <div
                        className="text-3xl"
                        style={{ ...scriptFont, color: collection.accent }}
                      >
                        a little
                      </div>
                      <div
                        className="text-3xl font-semibold"
                        style={{ ...displayFont }}
                      >
                        personality
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div
                    className="text-[8px] font-semibold tracking-[0.2em]"
                    style={{ ...bodyFont, color: collection.accent }}
                  >
                    {collection.label}
                  </div>

                  <h3
                    className="mt-2 text-2xl font-semibold leading-[0.95]"
                    style={{ ...displayFont, color: SAGE_DEEP }}
                  >
                    {collection.title}
                  </h3>

                  <p
                    className="mt-3 text-[12px] leading-5"
                    style={{ ...bodyFont, color: "#68675E" }}
                  >
                    {collection.subtitle}
                  </p>

                  <div className="mt-auto pt-5">
                    <button
                      onClick={() => setGalleryOpen(true)}
                      className="group/btn inline-flex items-center gap-2 text-[8px] font-semibold tracking-[0.18em]"
                      style={{ ...bodyFont, color: SAGE_DEEP }}
                    >
                      VIEW COLLECTION GALLERY
                      <ArrowRight
                        size={12}
                        className="transition-transform duration-300 group-hover/btn:translate-x-1"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* DIY */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28">
        <Reveal>
          <div
            className="relative overflow-hidden border p-7 sm:p-12 lg:p-16"
            style={{
              borderColor: "#E0D5C7",
              background: "#FFF4F1",
            }}
          >
            <div
              className="absolute right-[-50px] top-[-60px] h-40 w-40 rounded-full"
              style={{ background: `${COLORS.butter}55` }}
            />

            <div
              className="absolute bottom-[-70px] left-[-50px] h-44 w-44 rounded-full"
              style={{ background: `${COLORS.teal}22` }}
            />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div className="max-w-3xl">
                <Eyebrow>THE DIY PART</Eyebrow>

                <h2
                  className="mt-4 font-semibold leading-[0.92]"
                  style={{
                    ...displayFont,
                    color: SAGE_DEEP,
                    fontSize: "clamp(2.8rem, 5vw, 5rem)",
                  }}
                >
                  We provide the pieces.
                  <br />
                  <span
                    style={{
                      ...scriptFont,
                      color: COLORS.coral,
                      fontWeight: 400,
                      fontSize: "0.75em",
                    }}
                  >
                    You make it yours.
                  </span>
                </h2>

                <p
                  className="mt-5 max-w-2xl text-sm leading-7 sm:text-[15px] sm:leading-8"
                  style={{ ...bodyFont, color: "#68675E" }}
                >
                  Your DIY box includes the coordinated decor, display
                  pieces, signage, tabletop details and setup guidance you
                  need. You set it up in your own space, then pack it back up
                  for pickup.
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-[230px]">
                {[
                  ["SET UP", COLORS.coral],
                  ["CELEBRATE", COLORS.lilac],
                  ["PACK UP", COLORS.teal],
                ].map(([label, color]) => (
                  <div
                    key={label}
                    className="border px-4 py-3 text-[8px] font-semibold tracking-[0.18em]"
                    style={{
                      ...bodyFont,
                      borderColor: `${color}66`,
                      background: "#FFFDF9",
                      color: SAGE_DEEP,
                    }}
                  >
                    <span style={{ color }}>●</span> {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section
        className="text-center"
        style={{ background: SAGE_DEEP, color: CREAM }}
      >
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <Sparkles
              className="mx-auto"
              color={COLORS.butter}
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
              Make it feel
              <br />
              <span
                style={{
                  ...scriptFont,
                  color: COLORS.butter,
                  fontWeight: 400,
                  fontSize: "0.78em",
                }}
              >
                like you.
              </span>
            </h2>

            <p
              className="mx-auto mt-6 max-w-xl text-sm leading-7"
              style={{ ...bodyFont, color: "#E0DED3" }}
            >
              Start with a Collection, browse individual decor, or build your
              celebration one piece at a time.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate("/collections")}
                className="px-6 py-3.5 text-[9px] font-semibold tracking-[0.2em] transition hover:bg-white/5"
                style={{
                  ...bodyFont,
                  border: `1px solid #E8D4AC`,
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
                  background: COLORS.butter,
                  color: SAGE_DEEP,
                }}
              >
                START PLANNING
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {galleryOpen && (
        <GalleryModal onClose={() => setGalleryOpen(false)} />
      )}
    </div>
  );
}
