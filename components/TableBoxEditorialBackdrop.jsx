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
    src: "/photos/decor/stemmed-wine-glass-cutout.png",
    className:
      "right-[56px] top-[395px] w-[92px] sm:right-[36px] sm:top-[430px] sm:w-[120px]",
  },
  {
    src: "/photos/decor/gold-candleholder-cutout.png",
    className:
      "left-[-28px] top-[880px] w-[100px] sm:left-[-38px] sm:w-[145px]",
  },
  {
    src: "/photos/decor/gold-cake-stand-cutout.png",
    className:
      // Mobile shows this beside the Build Your Box heading instead (TableBox.jsx).
      "hidden sm:block right-[-64px] top-[1780px] w-[210px] sm:right-[-74px] sm:w-[280px]",
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

export default function TableBoxEditorialBackdrop() {
  return (
    <>
      {/* Stationary cream paper background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          // Kept deliberately cool: the owner has rejected warm beige twice.
          backgroundColor: "#FBFAF6",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(30, 50, 42, 0.018) 0px, rgba(30, 50, 42, 0.018) 1px, transparent 1px, transparent 3px)",
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
