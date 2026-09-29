import React, { useEffect } from "react";
import { withBasePath } from "../apiBase";

/*
  Decorative page layer for /table-box.

  IMPORTANT:
  Use transparent PNG/WebP cutouts for the decorative products.
  These images intentionally sit behind the real content cards.
*/
const DECOR = [
  {
    src: "/photos/decor/red-staub-cutout.png",
    className:
      "right-[-58px] top-[115px] w-[210px] sm:right-[-72px] sm:w-[290px] lg:w-[340px]",
  },
  {
    src: "/photos/decor/stemmed-wine-glass-cutout.png",
    className:
      "right-[56px] top-[395px] w-[92px] sm:right-[36px] sm:top-[430px] sm:w-[120px] lg:right-auto lg:left-[28px] lg:top-[160px] lg:w-[140px]",
  },
  {
    src: "/photos/decor/gold-candleholder-cutout.png",
    className:
      // Mobile shows this beside the package pricing note instead (TableBoxPackages.jsx).
      "hidden sm:block left-[-28px] top-[880px] w-[100px] sm:left-[-38px] sm:w-[145px]",
  },
  {
    src: "/photos/decor/gold-cake-stand-cutout.png",
    className:
      // Mobile shows this beside the Build Your Box heading instead (TableBox.jsx).
      "hidden sm:block lg:hidden right-[-64px] top-[1780px] w-[210px] sm:right-[-74px] sm:w-[280px]",
  },
  {
    src: "/photos/decor/butter-dish-cutout.png",
    className:
      "left-[-42px] top-[2450px] w-[150px] sm:left-[-56px] sm:w-[200px]",
  },
  {
    src: "/photos/decor/gold-charger-cutout.png",
    className:
      "right-[-70px] top-[3250px] w-[220px] sm:right-[-90px] sm:w-[310px]",
  },
  {
    src: "/photos/decor/grey-staub-cutout.png",
    className:
      // Mobile shows this beside the Can't Find the Thing card instead (TableBox.jsx).
      "hidden sm:block left-[-72px] top-[4100px] w-[220px] sm:left-[-94px] sm:w-[310px]",
  },
];

/*
  "Reveal in place": every cutout stays exactly where it is laid out, but once
  it reaches its spot it holds still on screen while the page content scrolls
  over it, for up to about 1.4 screens, then moves on with the page.
  Images already in view on load (the hero pair) hold right where they sit;
  the rest lock in when they reach 40% of the way down the screen. The hold
  never carries an image past the bottom of the Table Box page area, so it
  cannot cover the footer. Layout, sizes and positions are untouched: this
  only offsets each image against the scroll.
*/
export function useHoldInPlace(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const offsets = new WeakMap();
    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const scrollY = window.scrollY;
      const rootBottom = root.getBoundingClientRect().bottom + scrollY;
      const maxHold = vh * 1.4;

      // Where each image sits when unshifted, and the scroll position at
      // which it starts holding.
      const items = [];
      root.querySelectorAll("[data-hold-in-place]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (!rect.width && !rect.height) return; // hidden at this screen size, or not laid out yet
        const naturalViewTop = rect.top - (offsets.get(el) || 0);
        const naturalDocTop = naturalViewTop + scrollY;
        const lockAt = naturalDocTop < vh * 0.75 ? naturalDocTop : vh * 0.4;
        items.push({
          el,
          naturalDocTop,
          height: rect.height,
          lockAt,
          side: rect.left + rect.width / 2 < vw / 2 ? "left" : "right",
          start: naturalDocTop - lockAt,
        });
      });

      // Images on the same side that would overlap while held hand off to
      // each other: one lets go exactly as the next one locks in, so two held
      // images never stack up. Ones that sit clear of each other (like the
      // red pot and the glass on a phone) hold at the same time.
      const overlapsWhenHeld = (x, y) =>
        x.lockAt < y.lockAt + y.height + 12 && y.lockAt < x.lockAt + x.height + 12;
      items.sort((x, y) => x.start - y.start);
      items.forEach((item, index) => {
        const next = items
          .slice(index + 1)
          .find((other) => other.side === item.side && overlapsWhenHeld(item, other));
        let hold = next ? Math.min(maxHold, next.start - item.start) : maxHold;
        hold = Math.min(hold, rootBottom - (item.naturalDocTop + item.height));
        const offset = Math.max(0, Math.min(scrollY - item.start, hold));

        const previous = offsets.get(item.el) || 0;
        if (Math.abs(offset - previous) > 0.25) {
          item.el.style.transform = `translate3d(0, ${offset}px, 0)`;
          offsets.set(item.el, offset);
        }
      });
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    root.addEventListener("load", schedule, true); // lazy images change height once loaded
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      root.removeEventListener("load", schedule, true);
      if (frame) window.cancelAnimationFrame(frame);
      root.querySelectorAll("[data-hold-in-place]").forEach((el) => {
        el.style.transform = "";
      });
    };
  }, [rootRef]);
}

export default function TableBoxEditorialBackdrop() {
  return (
    <>
      {/* Page-scoped paper background: must not cover the following footer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          // Bright, neutral off-white. The owner has rejected warm/beige three
          // times; check the RENDERED colour (texture lines darken it), not
          // just this value.
          backgroundColor: "#FDFDFB",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(30, 50, 42, 0.008) 0px, rgba(30, 50, 42, 0.008) 1px, transparent 1px, transparent 3px)",
          // Static: stays put while the page content scrolls over it.
          backgroundAttachment: "fixed",
        }}
      />

      {/* Page-scoped MCM stripe */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-[8px] z-[1] w-[16px]"
      >
        <div
          className="absolute inset-y-0 left-0 w-[2px]"
          style={{ background: "#C79A3B" }}
        />
        <div
          className="absolute inset-y-0 right-0 w-[8px]"
          style={{ background: "#D81B72" }}
        />
      </div>

      {/* Decorative rental cutouts, positioned down the DOCUMENT, not fixed */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
      >
        {DECOR.map((item) => (
          <img
            key={item.src}
            src={withBasePath(item.src)}
            alt=""
            loading="lazy"
            decoding="async"
            data-hold-in-place
            style={{ willChange: "transform" }}
            className={`absolute select-none object-contain [filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.16))_drop-shadow(0_7px_9px_rgba(0,0,0,0.10))] ${item.className}`}
          />
        ))}
      </div>
    </>
  );
}
