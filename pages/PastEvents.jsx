import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import SectionHeading from "../components/SectionHeading";
import { paperTexture } from "../theme";

// Real photos from real events, one story per celebration. Each event is a
// simple slideshow (one photo + a short caption at a time) rather than a
// forced before/during/after grid - some events won't have a clean "before"
// or "after" shot, and a slideshow doesn't leave empty placeholder boxes
// for the photos that don't exist yet.
const EVENTS = [
  {
    title: "A Night at the Oscars: Jullett's 60th birthday.",
    photos: [
      { image: "/photos/oscars-60th-backdrop-wall.jpg", caption: "A Night at the Oscars, dressed in black and gold." },
      { image: "/photos/oscars-60th-red-carpet-entrance.jpg", caption: "The red carpet welcome, stanchions and all." },
      { image: "/photos/oscars-60th-sweetheart-table-wide.jpg", caption: "The sweetheart table, framed in gold candlelight." },
      { image: "/photos/oscars-60th-take-one-leave-one-station.jpg", caption: "Take a fact from 1966, leave a note in return." },
      { image: "/photos/oscars-60th-guest-card-exchange.jpg", caption: "A guest leaves her note at the Take One, Leave One station." },
      { image: "/photos/oscars-60th-saxophonist.jpg", caption: "Live saxophone kept the night moving." },
      { image: "/photos/oscars-60th-drinks-sign.jpg", caption: "A little humor at the bar." },
    ],
  },
  {
    title: "A \"Mom-to-Bee\" baby shower for Britt.",
    photos: [
      { image: "/photos/britt-baby-shower-welcome-poem.jpg", caption: "\"Britt the B\": a custom welcome poem, ready to greet every guest." },
      { image: "/photos/britt-baby-shower-framed-keepsake.jpg", caption: "A framed portrait and poem, one of the day's most treasured keepsakes." },
      { image: "/photos/britt-baby-shower-favor-table.jpg", caption: "A table of sweet treats and favor jars for guests to take home." },
      { image: "/photos/britt-baby-shower-drink-station.jpg", caption: "Mocktails in the making, mid taste test." },
    ],
  },
];

const AUTO_ADVANCE_MS = 5000;

function EventSlideshow({ event, palette, fonts }) {
  const [index, setIndex] = useState(0);
  const count = event.photos.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [count]);

  const go = (next) => setIndex((i) => (i + next + count) % count);
  const current = event.photos[index];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold sm:text-3xl" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
        {event.title}
      </h2>

      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-sm" style={{ border: `1px solid ${palette.line}` }}>
        <div className="aspect-[4/3]">
          <img src={current.image} alt={current.caption} className="h-full w-full object-cover" />
        </div>

        {count > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2"
              style={{ background: "rgba(255,255,255,0.85)", color: palette.primaryDeep }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2"
              style={{ background: "rgba(255,255,255,0.85)", color: palette.primaryDeep }}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      <p
        className="mx-auto mt-4 max-w-3xl text-center text-base leading-relaxed"
        style={{ ...fonts.bodyFont, color: palette.ink }}
      >
        {current.caption}
      </p>

      {count > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {event.photos.map((photo, i) => (
            <button
              key={photo.image}
              onClick={() => setIndex(i)}
              aria-label={`Go to photo ${i + 1}`}
              className="h-2 w-2 rounded-full"
              style={{ background: i === index ? palette.primaryDeep : palette.line }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PastEvents() {
  const { palette, fonts } = usePalette();
  const { openPickerForBuilder } = useEventType();

  return (
    <div style={{ ...paperTexture(palette), color: palette.ink }}>
      <section className="border-b" style={{ borderColor: palette.line }}>
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-20 sm:px-8">
          <SectionHeading
            eyebrow="THE PROOF"
            title="Real celebrations. Real memories."
            subtitle="Every event tells the same story: guests show up, guests participate, and the host keeps what everyone created together. Photos from recent celebrations are added here as they wrap up."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="space-y-20">
          {EVENTS.map((event) => (
            <EventSlideshow key={event.title} event={event} palette={palette} fonts={fonts} />
          ))}
        </div>

        <div className="mt-20 text-center" style={{ borderTop: `1px solid ${palette.line}`, paddingTop: "40px" }}>
          <p className="text-base mb-5" style={{ ...fonts.bodyFont, color: palette.muted }}>
            Want your celebration featured here next?
          </p>
          <button
            onClick={() => openPickerForBuilder()}
            className="inline-flex items-center gap-3 px-7 py-3.5 text-sm font-semibold tracking-[0.2em] text-white"
            style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
          >
            BUILD MY EXPERIENCE <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
