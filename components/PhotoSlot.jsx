import React, { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { usePalette } from "../PaletteContext";

const SLIDE_INTERVAL = 3800;
const CROSSFADE_MS = 700;

// `photoUrls` (an array of real imported images) takes priority when
// provided, and cycles through them as a crossfading slideshow when there's
// more than one. `photoUrl` (a single image) still works for callers that
// only ever have one photo. Falls back to palette.photos[photoKey] for
// palette-specific photos once those exist, and to a placeholder otherwise.
// `fit` defaults to "cover" (crops to fill the frame) but pass "contain" for
// photos, like screenshots, where the whole image needs to stay visible
// uncropped.
export default function PhotoSlot({ photoKey, photoUrl, photoUrls, label, aspect = "aspect-[4/3]", fit = "cover" }) {
  const { palette, fonts } = usePalette();
  const explicit = (photoUrls && photoUrls.filter(Boolean)) || (photoUrl ? [photoUrl] : []);
  const slides = explicit.length ? explicit : palette.photos?.[photoKey] ? [palette.photos[photoKey]] : [];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length) {
    return (
      <div
        className={`relative w-full ${aspect} overflow-hidden flex items-center justify-center`}
        style={{ borderBottom: `1px solid ${palette.line}`, background: fit === "contain" ? `${palette.primary}0D` : "transparent" }}
      >
        {slides.map((url, i) => (
          <img
            key={url}
            src={url}
            alt={label}
            className={`absolute inset-0 w-full h-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
            style={{
              opacity: i === index ? 1 : 0,
              transition: `opacity ${CROSSFADE_MS}ms ease`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`w-full ${aspect} flex flex-col items-center justify-center gap-1.5`}
      style={{ background: `${palette.primary}0D`, borderBottom: `1.5px dashed ${palette.line}` }}
    >
      <ImagePlus size={20} color={palette.muted} />
      <span className="text-xs text-center px-3" style={{ ...fonts.bodyFont, color: palette.muted }}>
        Photo coming soon
      </span>
    </div>
  );
}
