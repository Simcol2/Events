import React, { useEffect } from "react";

/*
  Decorative page layer for /table-box.

  IMPORTANT:
  Use transparent PNG/WebP cutouts for the decorative products.
  These images intentionally sit behind the real content cards.
*/
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
    <div
      aria-hidden="true"
      data-table-box-background="ASG_TABLE_BOX_STATIC_IMAGE_BACKGROUND_V1"
      className="pointer-events-none sticky top-0 z-0 h-screen w-full overflow-hidden"
      style={{
        // Sticky rather than position:fixed keeps this image scoped to the
        // Table Box page. It does not continue through the rest of the site.
        marginBottom: "-100vh",
        backgroundImage: `linear-gradient(rgba(255, 252, 247, 0.14), rgba(255, 252, 247, 0.14)), url("https://rsexseihtkaqoxccrylk.supabase.co/storage/v1/object/public/Photos%20from/tableboxbackground.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "scroll",
      }}
    />
  );
}
