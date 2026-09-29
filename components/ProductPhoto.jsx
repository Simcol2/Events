import React, { useEffect, useState } from "react";

// Product photos are a mix of studio shots on a white backdrop and styled
// lifestyle shots. Only the studio shots should melt into the page behind
// them, so each photo's border is sampled once in the browser: when
// (nearly) every edge pixel is white, the image is blended with
// `mix-blend-mode: multiply`, which turns pure white into whatever is
// underneath and leaves the product's own shading intact. Lifestyle shots,
// and PNGs that already have a transparent background, are left alone.
//
// Detection uses a separate off-screen Image with `crossOrigin` so the
// visible <img> never depends on the host sending CORS headers. If the
// canvas read is blocked for any reason the photo simply renders normally.

const SIZE = 64;
const WHITE_MIN = 238;
const WHITE_SHARE = 0.92;
const cache = new Map();

function detectWhiteBackdrop(src) {
  if (cache.has(src)) return cache.get(src);

  const result = new Promise((resolve) => {
    const probe = new Image();
    probe.crossOrigin = "anonymous";
    probe.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(probe, 0, 0, SIZE, SIZE);
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

        let edge = 0;
        let white = 0;
        let transparent = 0;
        for (let y = 0; y < SIZE; y++) {
          for (let x = 0; x < SIZE; x++) {
            if (y !== 0 && y !== SIZE - 1 && x !== 0 && x !== SIZE - 1) continue;
            const i = (y * SIZE + x) * 4;
            edge++;
            if (data[i + 3] < 20) transparent++;
            else if (data[i] >= WHITE_MIN && data[i + 1] >= WHITE_MIN && data[i + 2] >= WHITE_MIN) white++;
          }
        }
        // Already a cut-out: nothing to remove.
        if (transparent / edge > 0.5) return resolve(false);
        resolve(white / edge >= WHITE_SHARE);
      } catch {
        resolve(false);
      }
    };
    probe.onerror = () => resolve(false);
    probe.src = src;
  });

  cache.set(src, result);
  return result;
}

// Photos that keep their own backdrop (styled shots) are boxes on the page,
// so `lift` gives them a soft shadow to sit slightly above it. White-backdrop
// studio shots have no box, so they never get one. The shadow waits for the
// detection result (null) so it doesn't flash on and off for white shots.
const LIFT_SHADOW = "0 14px 34px rgba(25,23,19,0.18), 0 3px 8px rgba(25,23,19,0.10)";

export default function ProductPhoto({ src, alt = "", className = "", style, lift = false, ...rest }) {
  const [whiteBackdrop, setWhiteBackdrop] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setWhiteBackdrop(null);
    if (src) {
      detectWhiteBackdrop(src).then((isWhite) => {
        if (!cancelled) setWhiteBackdrop(isWhite);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        ...style,
        ...(whiteBackdrop ? { mixBlendMode: "multiply" } : null),
        ...(lift ? { boxShadow: whiteBackdrop === false ? LIFT_SHADOW : "none", transition: "box-shadow 200ms ease" } : null),
      }}
      data-white-backdrop={whiteBackdrop ? "true" : undefined}
      {...rest}
    />
  );
}
