import React, { useEffect, useState } from "react";
import { ArrowRight, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import {
  SAGE_DEEP,
  GOLD,
  CREAM,
  INK,
  LINE,
  MUTED,
  displayFont,
  scriptFont,
  bodyFont,
  ensureFonts,
} from "../lib/theme";

const HERO_IMAGE = "/media/Collections-3-Carnival-baby-mockup.png";

const GALLERY_IMAGES = [
  {
    src: "/media/Collections-1-Carnival-baby.png",
    alt: "Carnival Baby collection decor package",
    title: "Carnival Baby",
    caption: "A bright, Trinidad-inspired baby shower collection with colour, florals, feathers and playful details.",
  },
  {
    src: "/media/Collections-2-Dull your sparkle.png",
    alt: "Dull Your Sparkle collection",
    title: "Dull Your Sparkle",
    caption: "A celebration collection designed around personality, colour and a little bit of extra fun.",
  },
];

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
    body: "A personalized web experience for your event, with guest predictions, private messages, and moments that live beyond the party.",
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
    body: "Something meaningful to keep, not another favour that gets forgotten by Monday.",
    path: "/collections",
  },
];

export default function Home({ navigate }) {
  ensureFonts();

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const openGallery = (index = 0) => {
    setActiveImage(index);
    setGalleryOpen(true);
  };

  const closeGallery = () => setGalleryOpen(false);

  const previousImage = () => {
    setActiveImage((current) =>
      current === 0 ? GALLERY_IMAGES.length - 1 : current - 1
    );
  };

  const nextImage = () => {
    setActiveImage((current) =>
      current === GALLERY_IMAGES.length - 1 ? 0 : current + 1
    );
  };

  useEffect(() => {
    if (!galleryOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeGallery();
      if (event.key === "ArrowLeft") previousImage();
      if (event.key === "ArrowRight") nextImage();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [galleryOpen]);

  return (
    <div
      style={{
        color: INK,
        background: CREAM,
        minHeight: "100vh",
        ...bodyFont,
      }}
    >
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          borderBottom: `1px solid ${LINE}`,
          background:
            "radial-gradient(circle at 86% 18%, rgba(230,83,119,.10), transparent 25%), radial-gradient(circle at 12% 85%, rgba(242,190,55,.10), transparent 26%), #FBF8F0",
        }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[.82fr_1.18fr] lg:gap-14 lg:py-20">
          <div className="max-w-2xl">
            <div
              className="text-[10px] font-semibold tracking-[0.32em]"
              style={{ ...bodyFont, color: "#C99532" }}
            >
              CELEBRATIONS WITH A STORY TO TELL
            </div>

            <h1
              className="mt-5 text-[56px] font-semibold leading-[.91] tracking-[-0.035em] sm:text-[76px] lg:text-[82px]"
              style={{ ...displayFont, color: "#4E6045" }}
            >
              Every story
              <br />
              deserves its own
              <br />
              <span
                style={{
                  ...scriptFont,
                  fontWeight: 400,
                  color: "#D45C78",
                  fontSize: "0.72em",
                  letterSpacing: "normal",
                }}
              >
                collection.
              </span>
            </h1>

            <p
              className="mt-7 max-w-xl text-[15px] leading-8 sm:text-[16px]"
              style={{ ...bodyFont, color: "#6F6A5E" }}
            >
              Thoughtfully curated decor, playful experiences, and meaningful
              details designed around the people you’re celebrating, not
              another generic party theme.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/collections")}
                className="inline-flex items-center gap-3 px-6 py-3.5 text-[10px] font-semibold tracking-[0.2em] text-white shadow-sm transition hover:-translate-y-0.5"
                style={{ ...bodyFont, background: "#536448" }}
              >
                VIEW THE COLLECTIONS <ArrowRight size={15} />
              </button>

              <button
                onClick={() => navigate("/reservations")}
                className="inline-flex items-center gap-3 px-6 py-3.5 text-[10px] font-semibold tracking-[0.2em] transition hover:-translate-y-0.5"
                style={{
                  ...bodyFont,
                  border: "1px solid #C8A66A",
                  color: "#536448",
                  background: "rgba(255,255,255,.35)",
                }}
              >
                PLAN YOUR EVENT
              </button>
            </div>

            <button
              onClick={() => openGallery(0)}
              className="mt-8 block text-left transition hover:opacity-75"
              style={{ ...bodyFont }}
            >
              <div
                className="text-[10px] font-semibold tracking-[0.28em]"
                style={{ color: "#C99532" }}
              >
                RENT INDIVIDUAL PIECES&nbsp; · &nbsp;CHOOSE A COLLECTION
              </div>
              <div
                className="mt-2 text-[10px] font-semibold tracking-[0.28em]"
                style={{ color: "#C99532" }}
              >
                DIY &amp; PICKUP&nbsp; · &nbsp;VIEW COLLECTION GALLERY
              </div>
            </button>
          </div>

          {/* REAL COLLECTION MOCKUP HERO */}
          <button
            onClick={() => openGallery(0)}
            className="group relative block w-full overflow-hidden text-left"
            style={{
              background: "#E8D8C8",
              border: "1px solid rgba(201,149,50,.35)",
            }}
            aria-label="Open collection gallery"
          >
            <div
              className="absolute inset-3 z-10 pointer-events-none"
              style={{ border: "1px solid rgba(255,255,255,.72)" }}
            />

            <img
              src={HERO_IMAGE}
              alt="Carnival Baby collection room mockup"
              className="block h-auto w-full object-cover transition duration-500 group-hover:scale-[1.015]"
              style={{ aspectRatio: "16 / 10" }}
            />

            <div
              className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-4"
              style={{ color: "#fff" }}
            >
              <div>
                <div
                  className="text-[9px] font-semibold tracking-[0.25em]"
                  style={{ ...bodyFont }}
                >
                  FEATURED COLLECTION
                </div>
                <div
                  className="mt-1 text-2xl sm:text-3xl"
                  style={{ ...displayFont }}
                >
                  Carnival Baby
                </div>
              </div>

              <span
                className="hidden px-4 py-2 text-[9px] font-semibold tracking-[0.18em] sm:inline-flex"
                style={{
                  ...bodyFont,
                  background: "#D45C78",
                  border: "1px solid rgba(255,255,255,.5)",
                }}
              >
                VIEW GALLERY
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* IDEA */}
      <section className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 sm:py-24">
        <p
          className="text-[9px] font-semibold tracking-[0.3em]"
          style={{ ...bodyFont, color: "#C99532" }}
        >
          THE IDEA
        </p>

        <p
          className="mx-auto mt-5 max-w-4xl text-[18px] leading-9 sm:text-[20px]"
          style={{ ...bodyFont, color: "#6F6A5E" }}
        >
          Our collections are designed to feel like real celebrations:
          something you could set up in a home, backyard, restaurant private
          room, community space, or small venue. The baby is part of the
          story, but the people, memories, culture and personality at the
          centre of it get to be there too.
        </p>
      </section>

      {/* EXPERIENCE */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #FFF8E8 0%, #FBF4E2 55%, #FFF7EA 100%)",
          borderTop: `1px solid ${LINE}`,
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="text-center">
            <p
              className="text-[9px] font-semibold tracking-[0.3em]"
              style={{ ...bodyFont, color: "#D45C78" }}
            >
              THE EXPERIENCE
            </p>

            <h2
              className="mt-3 text-5xl font-semibold leading-none sm:text-6xl"
              style={{ ...displayFont, color: "#4E6045" }}
            >
              More than a rental.
            </h2>

            <p
              className="mx-auto mt-5 max-w-2xl text-sm leading-7 sm:text-base"
              style={{ ...bodyFont, color: "#716B5C" }}
            >
              Choose a complete collection, or rent only the pieces you need.
              Either way, everything is designed to work together.
            </p>
          </div>

          {/* Package cards intentionally styled as finished editorial cards,
              not a plain 4-column table. */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p, index) => (
              <button
                key={p.num}
                onClick={() => navigate(p.path)}
                className="group relative min-h-[285px] overflow-hidden p-7 text-left transition duration-300 hover:-translate-y-1"
                style={{
                  background: index % 2 === 0 ? "#FFFDF7" : "#FFF7F3",
                  border: "1px solid rgba(198,177,130,.45)",
                  boxShadow: "0 8px 24px rgba(80,70,50,.05)",
                }}
              >
                <div
                  className="absolute right-0 top-0 h-20 w-20 rounded-bl-full opacity-20"
                  style={{
                    background: index === 2 ? "#D45C78" : "#E6BE3E",
                  }}
                />

                <div
                  className="text-3xl"
                  style={{ ...displayFont, color: "#C99532" }}
                >
                  {p.num}
                </div>

                <div
                  className="mt-8 text-[10px] font-semibold tracking-[0.23em]"
                  style={{ ...bodyFont, color: "#4E6045" }}
                >
                  {p.title}
                </div>

                <p
                  className="mt-4 text-sm leading-7"
                  style={{ ...bodyFont, color: "#746E61" }}
                >
                  {p.body}
                </p>

                <div
                  className="absolute bottom-7 left-7 flex items-center gap-2 text-[9px] font-semibold tracking-[0.18em]"
                  style={{ ...bodyFont, color: "#D45C78" }}
                >
                  EXPLORE
                  <ArrowRight
                    size={13}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <Sparkles
              size={20}
              strokeWidth={1.2}
              style={{ color: "#D45C78" }}
            />

            <p
              className="mt-5 text-[9px] font-semibold tracking-[0.3em]"
              style={{ ...bodyFont, color: "#C99532" }}
            >
              SEE THE DETAILS
            </p>

            <h2
              className="mt-3 text-5xl font-semibold leading-none sm:text-6xl"
              style={{ ...displayFont, color: "#4E6045" }}
            >
              View the collection gallery.
            </h2>

            <p
              className="mt-6 max-w-md text-sm leading-7"
              style={{ ...bodyFont, color: "#716B5C" }}
            >
              Flip through the collection like a little lookbook. See the
              setup, the details, and how the pieces come together before you
              decide what belongs at your celebration.
            </p>

            <button
              onClick={() => openGallery(0)}
              className="mt-7 inline-flex items-center gap-3 px-6 py-3.5 text-[10px] font-semibold tracking-[0.2em] text-white"
              style={{ ...bodyFont, background: "#D45C78" }}
            >
              VIEW COLLECTION GALLERY <ArrowRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {GALLERY_IMAGES.map((image, index) => (
              <button
                key={image.src}
                onClick={() => openGallery(index)}
                className="group relative overflow-hidden"
                style={{ border: "1px solid rgba(201,149,50,.35)" }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="block aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                />
                <div
                  className="absolute bottom-0 left-0 right-0 px-4 py-3 text-left text-[9px] font-semibold tracking-[0.16em]"
                  style={{
                    ...bodyFont,
                    color: "#fff",
                    background: "linear-gradient(transparent, rgba(45,45,35,.75))",
                  }}
                >
                  {image.title.toUpperCase()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        style={{
          background: "#4E6045",
          color: CREAM,
        }}
      >
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 sm:py-24">
          <Sparkles
            className="mx-auto"
            color="#E6BE3E"
            size={20}
            strokeWidth={1.2}
          />

          <div
            className="mt-5 text-[9px] font-semibold tracking-[0.3em]"
            style={{ ...bodyFont, color: "#F1C95B" }}
          >
            THE POINT
          </div>

          <h2
            className="mt-4 text-5xl font-semibold leading-none sm:text-6xl"
            style={{ ...displayFont }}
          >
            The vibe is in the details.
          </h2>

          <p
            className="mx-auto mt-6 max-w-xl text-sm leading-7"
            style={{ ...bodyFont, color: "#F1EBDD" }}
          >
            Start with a Collection, browse the decor, or build exactly what
            you have in mind.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("/collections")}
              className="px-7 py-3.5 text-[10px] font-semibold tracking-[0.2em]"
              style={{
                ...bodyFont,
                border: "1px solid #E6BE3E",
                color: "#FFF8E8",
              }}
            >
              VIEW THE COLLECTIONS
            </button>

            <button
              onClick={() => navigate("/reservations")}
              className="px-7 py-3.5 text-[10px] font-semibold tracking-[0.2em]"
              style={{
                ...bodyFont,
                background: "#E6BE3E",
                color: "#4E6045",
              }}
            >
              START PLANNING
            </button>
          </div>
        </div>
      </section>

      {/* MAGAZINE-STYLE COLLECTION GALLERY */}
      {galleryOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          style={{
            background: "rgba(34,37,29,.88)",
            backdropFilter: "blur(8px)",
          }}
          onClick={closeGallery}
          role="dialog"
          aria-modal="true"
          aria-label="Collection gallery"
        >
          <div
            className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden"
            style={{
              background: "#FBF7ED",
              boxShadow: "0 24px 80px rgba(0,0,0,.35)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-4 sm:px-7"
              style={{ borderBottom: "1px solid rgba(185,158,103,.35)" }}
            >
              <div>
                <div
                  className="text-[9px] font-semibold tracking-[0.28em]"
                  style={{ ...bodyFont, color: "#C99532" }}
                >
                  COLLECTION LOOKBOOK
                </div>
                <div
                  className="mt-1 text-2xl"
                  style={{ ...displayFont, color: "#4E6045" }}
                >
                  {GALLERY_IMAGES[activeImage].title}
                </div>
              </div>

              <button
                onClick={closeGallery}
                className="flex h-10 w-10 items-center justify-center"
                style={{ color: "#4E6045" }}
                aria-label="Close gallery"
              >
                <X size={21} />
              </button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-auto p-4 sm:p-7">
              <div className="grid gap-7 lg:grid-cols-[1.55fr_.45fr]">
                <div
                  className="relative flex min-h-[45vh] items-center justify-center overflow-hidden"
                  style={{ background: "#E9E1D1" }}
                >
                  <img
                    src={GALLERY_IMAGES[activeImage].src}
                    alt={GALLERY_IMAGES[activeImage].alt}
                    className="max-h-[66vh] w-full object-contain"
                  />

                  <button
                    onClick={previousImage}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(255,255,255,.88)",
                      color: "#4E6045",
                    }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(255,255,255,.88)",
                      color: "#4E6045",
                    }}
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="flex flex-col justify-center">
                  <div
                    className="text-4xl"
                    style={{ ...scriptFont, color: "#D45C78" }}
                  >
                    the details
                  </div>

                  <div
                    className="mt-5 h-px w-14"
                    style={{ background: "#C99532" }}
                  />

                  <p
                    className="mt-6 text-sm leading-7"
                    style={{ ...bodyFont, color: "#716B5C" }}
                  >
                    {GALLERY_IMAGES[activeImage].caption}
                  </p>

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    {GALLERY_IMAGES.map((image, index) => (
                      <button
                        key={image.src}
                        onClick={() => setActiveImage(index)}
                        className="overflow-hidden"
                        style={{
                          border:
                            index === activeImage
                              ? "2px solid #D45C78"
                              : "1px solid rgba(185,158,103,.4)",
                        }}
                      >
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="aspect-[4/3] w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  <div
                    className="mt-6 text-[9px] font-semibold tracking-[0.22em]"
                    style={{ ...bodyFont, color: "#C99532" }}
                  >
                    {String(activeImage + 1).padStart(2, "0")} /{" "}
                    {String(GALLERY_IMAGES.length).padStart(2, "0")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
