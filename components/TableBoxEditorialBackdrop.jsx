import React from "react";
import { withBasePath } from "../apiBase";

/*
  Decorative page layer for /table-box.

  IMPORTANT:
  Use transparent PNG/WebP cutouts for the decorative products.
  These images intentionally sit behind the real content cards.

  They are part of the static background: pinned in the window while the
  page content scrolls over them. Vertical positions are therefore relative
  to the window (vh), not to the document.
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
      "left-[-28px] top-[28vh] w-[104px] sm:left-[-38px] sm:top-[46vh] sm:w-[145px]",
  },
  {
    src: "/photos/decor/gold-cake-stand-cutout.png",
    className:
      "left-[-50px] top-[40vh] w-[160px] sm:left-auto sm:right-[-74px] sm:top-[47vh] sm:w-[280px]",
  },
  {
    src: "/photos/decor/butter-dish-cutout.png",
    className:
      "left-[-42px] top-[64vh] w-[150px] sm:left-[-56px] sm:w-[200px]",
  },
  {
    src: "/photos/decor/gold-charger-cutout.png",
    className:
      "right-[-70px] top-[72vh] w-[220px] sm:right-[-90px] sm:top-[76vh] sm:w-[310px]",
  },
  {
    src: "/photos/decor/grey-staub-cutout.png",
    className:
      "left-[-40px] bottom-[-60px] w-[210px] sm:left-[-94px] sm:w-[310px]",
  },
];

// Small, subtle lift: a tight contact shadow plus a soft short one.
const LIFT = {
  filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.16)) drop-shadow(0 7px 9px rgba(0,0,0,0.10))",
};

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

      {/* Decorative rental cutouts: pinned in the window (sticky inside a
          full-height wrapper) so the content scrolls over them, and released
          at the end of the page so they never cover the footer. `overflow-clip`
          rather than `hidden`, which would break the sticky. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] overflow-clip"
      >
        <div className="sticky top-0 h-screen overflow-clip">
          {DECOR.map((item) => (
            <img
              key={item.src}
              src={withBasePath(item.src)}
              alt=""
              loading="lazy"
              decoding="async"
              style={LIFT}
              className={`absolute select-none object-contain ${item.className}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
