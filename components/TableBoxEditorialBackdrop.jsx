import React from "react";
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
    src: "/photos/decor/ribbed-tumbler-cutout.png",
    className:
      "right-[-18px] top-[410px] w-[94px] sm:right-[-24px] sm:w-[125px]",
  },
  {
    src: "/photos/decor/gold-candleholder-cutout.png",
    className:
      "left-[-28px] top-[880px] w-[100px] sm:left-[-38px] sm:w-[145px]",
  },
  {
    src: "/photos/decor/gold-cake-stand-cutout.png",
    className:
      "right-[-64px] top-[1780px] w-[210px] sm:right-[-74px] sm:w-[280px]",
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
      "left-[-72px] top-[4100px] w-[220px] sm:left-[-94px] sm:w-[310px]",
  },
];

export default function TableBoxEditorialBackdrop() {
  return (
    <>
      {/* Stationary cream paper background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundColor: "#FBF8F1",
          backgroundImage: `
            radial-gradient(circle at 20% 10%, rgba(197,154,59,.045), transparent 26%),
            radial-gradient(circle at 85% 35%, rgba(216,27,114,.025), transparent 22%),
            repeating-linear-gradient(
              0deg,
              rgba(18,74,56,.017) 0px,
              rgba(18,74,56,.017) 1px,
              transparent 1px,
              transparent 4px
            )
          `,
        }}
      />

      {/* Stationary MCM stripe */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 right-[8px] z-[1] w-[16px]"
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
            className={`absolute select-none object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.10)] ${item.className}`}
          />
        ))}
      </div>
    </>
  );
}
