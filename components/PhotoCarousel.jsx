import React from "react";
import { withBasePath } from "../apiBase";

export function normalizePhotos(photos) {
  if (!Array.isArray(photos)) return [];
  return photos.map((p) => (typeof p === "string" ? p : p?.url)).filter(Boolean).map(withBasePath);
}

// Drop-in replacement for a plain <img> wherever a card shows one of an
// item's `photos`. Always shows the first photo, static - no auto-cycling.
// Anyone who wants to see the rest clicks through to the item's own detail
// page, where every photo is browsable on demand.
export default function PhotoCarousel({ photos, alt, className }) {
  const list = normalizePhotos(photos);
  if (!list.length) return null;

  return (
    <>
      <img src={list[0]} alt={alt} className={`glossy-photo ${className}`} />
      <div aria-hidden="true" className="glossy-sheen" />
      <div aria-hidden="true" className="glossy-glaze" />
    </>
  );
}
