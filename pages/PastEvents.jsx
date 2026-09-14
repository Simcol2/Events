import React, { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import { FAMILIES } from "../pageColors";

const EMERALD = FAMILIES.emerald.base;
const EMERALD_DEEP = FAMILIES.emerald.deep;
const FUCHSIA = FAMILIES.fuchsia.base;
const CORAL = FAMILIES.coral.base;
const NAVY = FAMILIES.navy.base;
const YELLOW = FAMILIES.yellow.base;
const GOLD = FAMILIES.gold.base;
const GOLD_DEEP = FAMILIES.gold.deep;

// Each frame carries the real aspect ratio of its photo, so a collage print
// is never a crop of someone's face - the frame changes shape, not the photo.
const EVENTS = [
  {
    id: "oscars",
    label: "60th Birthday",
    body:
      "A night of glamour, good company and picture-perfect moments. This custom backdrop set the tone for a celebration that was anything but ordinary.",
    note: "She wanted drama. We understood the assignment.",
    photos: [
      { src: "/photos/oscars-60th-backdrop-wall.jpg", ratio: 0.8, alt: "A Night at the Oscars backdrop in black and gold" },
      { src: "/photos/oscars-60th-take-one-leave-one-station.jpg", ratio: 1.16, alt: "The Take One, Leave One station" },
      { src: "/photos/oscars-60th-drinks-sign.jpg", ratio: 1.06, alt: "A humorous sign at the bar" },
      { src: "/photos/oscars-60th-red-carpet-entrance.jpg", ratio: 0.75, alt: "The red carpet entrance with stanchions" },
      { src: "/photos/oscars-60th-sweetheart-table-wide.jpg", ratio: 0.94, alt: "The head table framed in gold candlelight" },
      { src: "/photos/oscars-60th-guest-card-exchange.jpg", ratio: 0.75, alt: "A guest leaving a note at the station" },
      { src: "/photos/oscars-60th-saxophonist.jpg", ratio: 0.75, alt: "A live saxophonist performing" },
      { src: "/photos/oscars-60th-red-carpet-welcome.jpg", ratio: 0.752, alt: "The welcome sign and red carpet walk-in" },
      { src: "/photos/oscars-60th-gold-florals.jpg", ratio: 0.831, alt: "Gold and white florals with black feathers" },
    ],
  },
  {
    id: "baby-shower",
    label: "Baby Shower",
    body:
      "A beautiful day to celebrate an even bigger chapter. From the custom display to the sweet little details, everything came together to create a warm and memorable experience for the guest of honour.",
    note: "Sweet moments everywhere.",
    photos: [
      { src: "/photos/baby-shower-photo-challenge-arch.jpg", ratio: 0.73, alt: "Bump portraits taken for The Photo Challenge" },
      { src: "/photos/baby-shower-welcome-poem.jpg", ratio: 1.4, alt: "A custom welcome poem greeting guests" },
      { src: "/photos/baby-shower-favor-table.jpg", ratio: 1.5, alt: "A table of sweet treats and favour jars" },
      { src: "/photos/baby-shower-challenge-course-group.jpg", ratio: 1.32, alt: "Guests holding swaddled babies for a group shot" },
      { src: "/photos/baby-shower-bottle-chug.jpg", ratio: 0.9, alt: "Guests racing at the baby relay challenge" },
      { src: "/photos/baby-shower-lullaby-doll.jpg", ratio: 0.75, alt: "A quiet moment with the baby" },
      { src: "/photos/baby-shower-framed-keepsake.jpg", ratio: 0.74, alt: "A framed portrait and poem keepsake" },
      { src: "/photos/baby-shower-photo-challenge-portrait.jpg", ratio: 0.75, alt: "Another Photo Challenge capture" },
      { src: "/photos/baby-shower-drink-station.jpg", ratio: 1.5, alt: "Mocktails being made at the drink station" },
    ],
  },
  {
    id: "oscars-guests",
    label: "60th Birthday",
    body:
      "Guests arrived dressed for the occasion, and the backdrop did the rest. Give people a corner worth standing in, and they will use it.",
    note: "Happiness looks so good on them.",
    photos: [
      { src: "/photos/oscars-guests-pair.jpg", ratio: 0.704, alt: "Two guests dressed up at the Oscars backdrop" },
      { src: "/photos/oscars-60th-saxophonist.jpg", ratio: 0.75, alt: "A live saxophonist performing" },
      { src: "/photos/oscars-guest-black-dress.jpg", ratio: 0.875, alt: "A guest posing at the Oscars backdrop" },
      { src: "/photos/guest-red-dress.jpg", ratio: 0.75, alt: "A guest laughing in front of a red, gold and black balloon arch" },
      { src: "/photos/oscars-60th-guest-card-exchange.jpg", ratio: 0.75, alt: "A guest leaving a note at the Take One, Leave One station" },
      { src: "/photos/oscars-60th-floral-centerpiece.jpg", ratio: 0.75, alt: "A gold script topper in a white floral centerpiece" },
    ],
  },
];

function Print({ photo, className = "", style = {}, rotate = 0, gold = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group block w-full overflow-hidden text-left ${className}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        background: "#FFFFFF",
        padding: gold ? "0" : "10px",
        border: gold ? `2px solid ${GOLD}` : "none",
        boxShadow: "0 2px 6px rgba(41,41,41,0.08), 0 18px 40px rgba(41,41,41,0.13)",
        ...style,
      }}
    >
      <span className="block w-full overflow-hidden" style={{ aspectRatio: String(photo.ratio) }}>
        <img
          src={photo.src}
          alt={photo.alt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </span>
    </button>
  );
}

function HandNote({ children, color = FUCHSIA, rotate = -3, size = "clamp(0.95rem, 1.6vw, 1.25rem)", className = "", style = {} }) {
  const { fonts } = usePalette();
  return (
    <span
      className={className}
      style={{
        ...fonts.scriptFont,
        color,
        fontSize: size,
        lineHeight: 1.25,
        display: "inline-block",
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function Label({ children, color = NAVY }) {
  const { fonts } = usePalette();
  return (
    <p
      style={{
        ...fonts.bodyFont,
        color,
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.26em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </p>
  );
}

function PhotoButton({ onClick, color, children }) {
  const { fonts } = usePalette();
  return (
    <button
      onClick={onClick}
      className="mt-7 inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-white transition-transform hover:scale-[1.03]"
      style={{ ...fonts.bodyFont, background: color, fontSize: "13px", fontWeight: 700, letterSpacing: "0.16em" }}
    >
      {children} <ArrowRight size={15} />
    </button>
  );
}

function Lightbox({ event, onClose }) {
  const { fonts } = usePalette();
  const [i, setI] = useState(0);
  const count = event.photos.length;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => (v + 1) % count);
      if (e.key === "ArrowLeft") setI((v) => (v - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [count, onClose]);

  const photo = event.photos[i];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(24,24,24,0.92)" }}
      onClick={onClose}
    >
      <div className="relative flex w-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
        {/* object-contain: the whole photo, never a crop */}
        <img
          src={photo.src}
          alt={photo.alt}
          className="max-h-[72vh] w-auto max-w-full object-contain"
          style={{ background: "#FFFFFF" }}
        />

        <p className="mt-4 text-center text-white" style={{ ...fonts.bodyFont, fontSize: "14px" }}>
          {photo.alt}
        </p>
        <p className="mt-1 text-center" style={{ ...fonts.bodyFont, fontSize: "12px", color: "rgba(255,255,255,0.6)", letterSpacing: "0.18em" }}>
          {i + 1} / {count}
        </p>

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-2 right-0 flex h-10 w-10 items-center justify-center rounded-full text-white sm:-top-4"
          style={{ background: "rgba(255,255,255,0.16)" }}
        >
          <X size={18} />
        </button>

        {count > 1 && (
          <>
            <button
              onClick={() => setI((v) => (v - 1 + count) % count)}
              aria-label="Previous photo"
              className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white"
              style={{ background: "rgba(255,255,255,0.16)" }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setI((v) => (v + 1) % count)}
              aria-label="Next photo"
              className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white"
              style={{ background: "rgba(255,255,255,0.16)" }}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PastEvents() {
  const { fonts } = usePalette();
  const { openPickerForBuilder } = useEventType();
  const [open, setOpen] = useState(null);

  const [oscars, babyShower, oscarsNight] = EVENTS;
  const show = (event) => () => setOpen(event);

  return (
    <main style={{ background: "#FFFFFF", color: "#292929" }}>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{ width: "460px", height: "460px", right: "-170px", top: "-200px", background: `${FUCHSIA}14` }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-20">
          <div>
            <Label color={GOLD_DEEP}>Past Events</Label>

            <HandNote color={CORAL} rotate={-2} size="clamp(1.05rem, 2vw, 1.5rem)" className="mt-4">
              We&apos;ve been busy...
            </HandNote>

            <h1
              className="mt-2"
              style={{
                ...fonts.displayFont,
                color: NAVY,
                fontSize: "clamp(2.7rem, 6.2vw, 5.1rem)",
                lineHeight: 0.98,
                fontWeight: 660,
                letterSpacing: "-0.035em",
              }}
            >
              Some parties are just{" "}
              <span className="relative inline-block">
                <span
                  style={{
                    ...fonts.scriptFont,
                    color: FUCHSIA,
                    fontSize: "clamp(2.6rem, 6vw, 4.9rem)",
                    display: "inline-block",
                    transform: "rotate(-3deg)",
                    lineHeight: 0.9,
                    marginRight: "0.1em",
                  }}
                >
                  too good
                </span>
                <span
                  aria-hidden="true"
                  className="absolute left-0 right-2 block"
                  style={{ bottom: "0.1em", height: "6px", background: YELLOW, borderRadius: "3px", zIndex: -1 }}
                />
              </span>
              to forget.
            </h1>

            <p className="mt-6 max-w-xl" style={{ ...fonts.bodyFont, color: "#292929", fontSize: "17px", lineHeight: 1.75 }}>
              Different people. Different spaces. Different reasons to celebrate. Here&apos;s what happened when the
              ideas left our studio and joined the party.
            </p>

            <div
              className="mt-8 inline-block px-6 py-3"
              style={{ border: `2px solid ${GOLD}`, borderRadius: "999px", transform: "rotate(-2.5deg)" }}
            >
              <HandNote color={GOLD_DEEP} rotate={0} size="clamp(0.95rem, 1.7vw, 1.2rem)">
                Consider this your permission to get inspired.
              </HandNote>
            </div>
          </div>

          {/* two overlapping prints, like a couple of photos dropped on the desk */}
          {/* Overlap via negative margin keeps both prints in flow, so the
              amount they overlap is fixed no matter each photo's shape. */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <Print photo={babyShower.photos[6]} rotate={2.5} onClick={show(babyShower)} className="w-[72%]" />
            <div className="relative z-10 -mt-[12%] ml-auto w-[44%]">
              <Print photo={oscars.photos[3]} rotate={-4} onClick={show(oscars)} />
            </div>
            <HandNote
              color={FUCHSIA}
              rotate={-8}
              className="absolute hidden sm:block"
              style={{ left: "0%", bottom: "6%", maxWidth: "140px" }}
            >
              Real people. Amazing parties.
            </HandNote>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- 60TH BIRTHDAY */}
      <section className="mx-auto max-w-7xl px-5 pb-8 pt-20 sm:px-8 lg:pt-28">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          {/* Hero stays in flow and keeps its own space; the small print hangs
              off the bottom-right corner into reserved padding, so it frames
              the hero instead of covering it. */}
          <div className="relative">
            <Print photo={oscars.photos[7]} gold onClick={show(oscars)} className="w-[80%]" />
            <div className="relative z-10 -mt-[8%] ml-auto flex w-[82%] items-start gap-3 sm:-mt-[11%] sm:w-[66%] sm:gap-4">
              <div className="flex-1">
                <Print photo={oscars.photos[1]} rotate={3} onClick={show(oscars)} />
              </div>
              <div className="mt-8 flex-1">
                <Print photo={oscars.photos[8]} rotate={-3} onClick={show(oscars)} />
              </div>
            </div>
          </div>

          <div className="mt-6 lg:mt-0">
            <HandNote color={NAVY} rotate={-4} size="clamp(0.85rem, 1.4vw, 1rem)" className="hidden lg:inline-block">
              &#8598; That entrance
            </HandNote>

            <h2
              className="mt-3"
              style={{
                ...fonts.scriptFont,
                color: GOLD_DEEP,
                fontSize: "clamp(1.9rem, 3.6vw, 3rem)",
                lineHeight: 1.05,
                transform: "rotate(-1.5deg)",
              }}
            >
              Black + gold + absolutely no subtlety.
            </h2>

            <div className="mt-7">
              <Label color={NAVY}>{oscars.label}</Label>
            </div>

            <p className="mt-4 max-w-md" style={{ ...fonts.bodyFont, color: "#292929", fontSize: "16px", lineHeight: 1.8 }}>
              {oscars.body}
            </p>

            <PhotoButton onClick={show(oscars)} color={GOLD_DEEP}>
              VIEW MORE PHOTOS
            </PhotoButton>

            <div className="mt-8">
              <HandNote color={FUCHSIA} rotate={-3} style={{ maxWidth: "260px" }}>
                {oscars.note}
              </HandNote>
            </div>
          </div>
        </div>

        {/* Three offset prints. DOM order is also the phone stacking order:
            sweetheart table, then the note, then the drinks sign. */}
        <div className="mt-16 grid gap-6 sm:grid-cols-3 lg:mt-20">
          <Print photo={oscars.photos[4]} rotate={-1.5} onClick={show(oscars)} />
          <Print photo={oscars.photos[5]} rotate={1.5} onClick={show(oscars)} className="sm:mt-10" />
          <Print photo={oscars.photos[2]} rotate={-2} onClick={show(oscars)} className="sm:mt-20" />
        </div>
      </section>

      {/* ------------------------------------------------- fuchsia statement strip */}
      <section className="relative mt-24 overflow-hidden py-10 sm:py-12" style={{ background: FUCHSIA }}>
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{ width: "260px", height: "260px", left: "-90px", top: "-120px", background: "rgba(255,255,255,0.12)" }}
        />
        <p
          className="relative mx-auto max-w-5xl px-5 text-center text-white sm:px-8"
          style={{ ...fonts.scriptFont, fontSize: "clamp(1.5rem, 3.4vw, 2.6rem)", lineHeight: 1.15 }}
        >
          The photos did not disappoint.
        </p>
      </section>

      {/* ------------------------------------------------------------ BABY SHOWER */}
      <section className="relative overflow-hidden" style={{ background: "#FFFEFC" }}>
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{ width: "420px", height: "420px", left: "-190px", bottom: "-160px", background: `${EMERALD}12` }}
        />
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{ width: "180px", height: "180px", right: "6%", top: "12%", background: `${CORAL}14` }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-28">
          <div>
            <Label color={EMERALD_DEEP}>{babyShower.label}</Label>
            <h2
              className="mt-4"
              style={{
                ...fonts.displayFont,
                color: EMERALD_DEEP,
                fontSize: "clamp(2.2rem, 4.4vw, 3.5rem)",
                lineHeight: 1,
                fontWeight: 650,
                letterSpacing: "-0.03em",
              }}
            >
              Soft details.
              <br />
              Big feelings.
            </h2>

            <p className="mt-5 max-w-md" style={{ ...fonts.bodyFont, color: "#292929", fontSize: "16px", lineHeight: 1.8 }}>
              {babyShower.body}
            </p>

            <PhotoButton onClick={show(babyShower)} color={EMERALD_DEEP}>
              VIEW THIS EVENT
            </PhotoButton>
          </div>

          <div className="relative">
            <Print photo={babyShower.photos[0]} rotate={-1.5} onClick={show(babyShower)} className="w-[66%]" />

            <div className="relative z-10 -mt-[12%] ml-auto w-[50%]">
              <Print photo={babyShower.photos[3]} rotate={3} onClick={show(babyShower)} />
            </div>

            <HandNote
              color={CORAL}
              rotate={-7}
              className="absolute hidden sm:block"
              style={{ left: "2%", bottom: "4%", maxWidth: "150px" }}
            >
              {babyShower.note}
            </HandNote>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- TUTU TWIRLS */}
      <section className="relative overflow-hidden bg-white">
        <div
          aria-hidden="true"
          className="absolute"
          style={{ width: "230px", height: "230px", right: "-70px", top: "8%", background: `${YELLOW}26`, borderRadius: "46% 54% 42% 58% / 55% 42% 58% 45%" }}
        />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute"
                style={{ left: "-3%", top: "-4%", width: "38%", height: "26px", background: FUCHSIA, transform: "rotate(-6deg)", opacity: 0.9 }}
              />
              <Print photo={oscarsNight.photos[2]} rotate={-1.5} onClick={show(oscarsNight)} className="relative w-[82%]" />
              <div className="relative z-10 -mt-[10%] ml-auto w-[40%]">
                <Print photo={oscarsNight.photos[0]} rotate={4} onClick={show(oscarsNight)} />
              </div>
            </div>

            <div className="mt-6 lg:mt-0">
              <Label color={FUCHSIA}>{oscarsNight.label}</Label>

              <h2
                className="mt-4"
                style={{
                  ...fonts.scriptFont,
                  color: FUCHSIA,
                  fontSize: "clamp(1.9rem, 3.8vw, 3rem)",
                  lineHeight: 1.05,
                  transform: "rotate(-1.5deg)",
                }}
              >
                Everybody understood the dress code.
              </h2>

              <p className="mt-6 max-w-md" style={{ ...fonts.bodyFont, color: "#292929", fontSize: "16px", lineHeight: 1.8 }}>
                {oscarsNight.body}
              </p>

              <PhotoButton onClick={show(oscarsNight)} color={FUCHSIA}>
                SEE MORE PHOTOS
              </PhotoButton>

              <div className="mt-8">
                <HandNote color={GOLD_DEEP} rotate={-3} style={{ maxWidth: "240px" }}>
                  &ldquo;{oscarsNight.note}&rdquo;
                </HandNote>
              </div>
            </div>
          </div>

          <div className="mt-24 grid gap-6 sm:grid-cols-3">
            <Print photo={oscarsNight.photos[1]} rotate={-1} onClick={show(oscarsNight)} />
            <Print photo={oscarsNight.photos[5]} rotate={2} onClick={show(oscarsNight)} className="sm:mt-10" />
            <Print photo={oscarsNight.photos[3]} rotate={-1.5} onClick={show(oscarsNight)} className="sm:mt-20" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- CTA */}
      <section className="relative overflow-hidden" style={{ background: EMERALD_DEEP }}>
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{ width: "320px", height: "320px", right: "-120px", top: "-140px", background: "rgba(255,255,255,0.07)" }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-7 px-5 py-16 text-center sm:px-8 lg:flex-row lg:justify-between lg:text-left">
          <div>
            <h2
              style={{
                ...fonts.displayFont,
                color: "#FFFFFF",
                fontSize: "clamp(2rem, 3.6vw, 3rem)",
                lineHeight: 1.05,
                fontWeight: 640,
                letterSpacing: "-0.025em",
              }}
            >
              Your celebration could be next.
            </h2>
            <p
              className="mt-3"
              style={{ ...fonts.bodyFont, color: "rgba(255,255,255,0.8)", fontSize: "13px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}
            >
              Let&apos;s create something unforgettable together
            </p>
          </div>

          <button
            onClick={() => openPickerForBuilder()}
            className="inline-flex flex-shrink-0 items-center gap-2.5 rounded-full px-8 py-4 transition-transform hover:scale-[1.03]"
            style={{ ...fonts.bodyFont, background: GOLD, color: NAVY, fontSize: "13px", fontWeight: 800, letterSpacing: "0.16em" }}
          >
            GET STARTED <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {open && <Lightbox event={open} onClose={() => setOpen(null)} />}
    </main>
  );
}
