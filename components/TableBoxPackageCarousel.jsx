import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { withBasePath } from "../apiBase";
import { Kicker } from "./EditorialKit";

function money(value) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(Number(value || 0));
}

function photoUrl(path) {
  return withBasePath(path || "/photos/table-box-after.jpg");
}

/*
  One-card package carousel.
  - Auto-advances every 5.5 seconds.
  - Pauses while the user is interacting with it.
  - Swipe gestures work on mobile.
  - Dots + arrow controls allow manual selection.
*/
export default function TableBoxPackageCarousel({
  packages,
  onOpen,
  intervalMs = 5500,
}) {
  const { palette, fonts } = usePalette();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const safePackages = useMemo(() => packages || [], [packages]);

  useEffect(() => {
    if (safePackages.length < 2 || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % safePackages.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [safePackages.length, intervalMs, paused]);

  useEffect(() => {
    if (index >= safePackages.length && safePackages.length > 0) setIndex(0);
  }, [index, safePackages.length]);

  if (!safePackages.length) return null;

  const go = (next) => {
    const count = safePackages.length;
    setIndex((next + count) % count);
  };

  const pkg = safePackages[index];

  return (
    <div
      className="relative mt-9"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(event) => setTouchStartX(event.touches?.[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        const endX = event.changedTouches?.[0]?.clientX;
        if (touchStartX == null || endX == null) return;
        const delta = endX - touchStartX;
        if (Math.abs(delta) > 45) go(index + (delta < 0 ? 1 : -1));
        setTouchStartX(null);
      }}
    >
      <button
        type="button"
        onClick={() => onOpen(pkg)}
        className="group block w-full overflow-hidden rounded-[18px] border text-left shadow-[0_2px_4px_rgba(24,43,35,0.06),0_16px_36px_rgba(24,43,35,0.16)]"
        style={{
          borderColor: "rgba(199,154,59,.35)",
          background: "#FFFFFF",
        }}
      >
        <div className="relative min-h-[440px] sm:min-h-[390px]">
          <div className="p-6 pb-[220px] sm:p-8 sm:pb-8 sm:pr-[48%]">
            <Kicker palette={palette} fonts={fonts}>
              {pkg.guest_count} GUESTS
            </Kicker>

            <h2
              className="mt-2"
              style={{
                ...fonts.displayFont,
                color: palette.primaryDeep,
                fontSize: "clamp(2.15rem, 8vw, 3.4rem)",
                fontWeight: 650,
                lineHeight: 0.98,
                letterSpacing: "-0.035em",
              }}
            >
              {pkg.name}
            </h2>

            <p
              className="mt-3 max-w-sm"
              style={{
                ...fonts.bodyFont,
                color: palette.muted,
                fontSize: "15px",
                lineHeight: 1.55,
              }}
            >
              {pkg.blurb}
            </p>

            <div className="mt-7">
              <p
                style={{
                  ...fonts.bodyFont,
                  color: palette.muted,
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                }}
              >
                PACKAGE RENTAL
              </p>

              <strong
                className="mt-1 block"
                style={{
                  ...fonts.displayFont,
                  color: palette.primaryDeep,
                  fontSize: "42px",
                  lineHeight: 1,
                }}
              >
                {money(pkg.rental_price)}
              </strong>
            </div>

            <p
              className="mt-5"
              style={{
                ...fonts.bodyFont,
                color: palette.accent,
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.04em",
              }}
            >
              VIEW + ADD OPTIONS →
            </p>
          </div>

          {/* Product/lifestyle image deliberately fills the lower-right portion,
              matching the approved mobile mockup instead of appearing as a tiny thumbnail. */}
          <div
            className="absolute bottom-0 right-0 h-[205px] w-full bg-cover bg-center sm:top-0 sm:h-full sm:w-[45%]"
            style={{ backgroundImage: `url(${photoUrl(pkg.image_url)})` }}
          />

          <div
            className="absolute inset-x-0 bottom-0 h-8 sm:hidden"
            style={{
              background:
                "linear-gradient(to top, rgba(255,255,255,.18), transparent)",
            }}
          />
        </div>
      </button>

      {safePackages.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous package"
            className="absolute left-[-8px] top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white/95 shadow-md"
            style={{ borderColor: "rgba(199,154,59,.35)", color: palette.primaryDeep }}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next package"
            className="absolute right-[-8px] top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white/95 shadow-md"
            style={{ borderColor: "rgba(199,154,59,.35)", color: palette.primaryDeep }}
          >
            <ChevronRight size={18} />
          </button>

          <div className="mt-4 flex items-center justify-center gap-2">
            {safePackages.map((row, dotIndex) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setIndex(dotIndex)}
                aria-label={`Show ${row.name}`}
                className="h-2 rounded-full transition-all"
                style={{
                  width: dotIndex === index ? "28px" : "8px",
                  background:
                    dotIndex === index ? palette.accent : "rgba(18,74,56,.22)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
