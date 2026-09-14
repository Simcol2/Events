import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import SectionHeading from "../components/SectionHeading";
import { paperTexture, hexToRgba } from "../theme";

// Every photo from every real celebration lives in one pool and plays in a
// random order, so the page doesn't read as one event followed by the next.
const PHOTOS = [
  { image: "/photos/oscars-60th-backdrop-wall.jpg", caption: "A Night at the Oscars, dressed in black and gold." },
  { image: "/photos/oscars-60th-red-carpet-entrance.jpg", caption: "The red carpet welcome, stanchions and all." },
  { image: "/photos/oscars-60th-sweetheart-table-wide.jpg", caption: "Gold candlelight framed the head table." },
  { image: "/photos/oscars-60th-take-one-leave-one-station.jpg", caption: "Take a fact from 1966, leave a note in return." },
  { image: "/photos/oscars-60th-guest-card-exchange.jpg", caption: "A guest leaves her note at the Take One, Leave One station." },
  { image: "/photos/oscars-60th-saxophonist.jpg", caption: "Live saxophone kept the night moving." },
  { image: "/photos/oscars-60th-drinks-sign.jpg", caption: "A little humor at the bar." },
  { image: "/photos/baby-shower-welcome-poem.jpg", caption: "A custom welcome poem, ready to greet every guest." },
  { image: "/photos/baby-shower-photo-challenge-arch.jpg", caption: "Bump portraits from The Photo Challenge, golden hour included." },
  { image: "/photos/baby-shower-photo-challenge-portrait.jpg", caption: "Another Photo Challenge capture for the shared album." },
  { image: "/photos/baby-shower-bottle-chug.jpg", caption: "Bottoms up at the baby relay challenge." },
  { image: "/photos/baby-shower-challenge-course-group.jpg", caption: "Four guests, four swaddled babies, one group shot." },
  { image: "/photos/baby-shower-lullaby-doll.jpg", caption: "A quiet moment with the baby, mid celebration." },
  { image: "/photos/baby-shower-framed-keepsake.jpg", caption: "A framed portrait and poem, one of the day's most treasured keepsakes." },
  { image: "/photos/baby-shower-favor-table.jpg", caption: "A table of sweet treats and favor jars for guests to take home." },
  { image: "/photos/baby-shower-drink-station.jpg", caption: "Mocktails in the making, mid taste test." },
];

const AUTO_ADVANCE_MS = 5000;

function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function PastEvents() {
  const { palette, fonts } = usePalette();
  const { openPickerForBuilder } = useEventType();

  // Shuffled after mount rather than during render, so the prerendered
  // snapshot and the first client render agree.
  const [photos, setPhotos] = useState(PHOTOS);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setPhotos(shuffle(PHOTOS));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % PHOTOS.length), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, []);

  const go = (next) => setIndex((i) => (i + next + photos.length) % photos.length);
  const current = photos[index];

  return (
    <div style={{ ...paperTexture(palette), color: palette.ink }}>
      <section className="border-b" style={{ borderColor: palette.line }}>
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-20 sm:px-8">
          <SectionHeading
            eyebrow="THE PROOF"
            title="No two celebrations should look or feel exactly alike."
            subtitle="Here's a look at what happens when the ideas leave our studio and meet the people they were made for. Different spaces, different personalities, different reasons to celebrate, and plenty of moments we couldn't have planned if we tried."
          />
          <p
            className="mx-auto mt-4 max-w-2xl text-center text-base italic leading-7"
            style={{ ...fonts.bodyFont, color: palette.muted }}
          >
            Consider this your permission to get inspired.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        {/* Whole photo always visible: portrait shots get letterboxed rather
            than cropped, which is what was cutting off heads before. */}
        <div
          className="relative mx-auto flex max-w-3xl items-center justify-center overflow-hidden rounded-sm"
          style={{
            border: `1px solid ${palette.line}`,
            background: hexToRgba(palette.ink, 0.04),
            height: "clamp(380px, 68vh, 620px)",
          }}
        >
          <img src={current.image} alt={current.caption} className="max-h-full max-w-full object-contain" />

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
        </div>

        <p
          className="mx-auto mt-4 max-w-3xl text-center text-base leading-relaxed"
          style={{ ...fonts.bodyFont, color: palette.ink }}
        >
          {current.caption}
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {photos.map((photo, i) => (
            <button
              key={photo.image}
              onClick={() => setIndex(i)}
              aria-label={`Go to photo ${i + 1}`}
              className="h-2 w-2 rounded-full"
              style={{ background: i === index ? palette.primaryDeep : palette.line }}
            />
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
