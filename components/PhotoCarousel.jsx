import React, { useEffect, useState } from "react";

function normalizePhotos(photos) {
  if (!Array.isArray(photos)) return [];
  return photos.map((p) => (typeof p === "string" ? p : p?.url)).filter(Boolean);
}

// Drop-in replacement for a plain <img> wherever a card shows one of an
// item's `photos` - a single photo renders exactly as a plain <img> always
// has, and two or more crossfade through every one of them automatically,
// matching the hero crossfade pattern used elsewhere on the site (see
// Activities.jsx's HERO_PHOTOS). The parent element must be `position:
// relative` (every card/tile already wraps its photo in one) since the
// multi-photo case stacks images with `absolute inset-0`.
export default function PhotoCarousel({ photos, alt, className, intervalMs = 4000 }) {
  const list = normalizePhotos(photos);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (list.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length, intervalMs]);

  if (!list.length) return null;

  if (list.length === 1) {
    return <img src={list[0]} alt={alt} className={className} />;
  }

  return (
    <>
      {list.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={alt}
          className={`${className} absolute inset-0 transition-opacity duration-1000 ease-in-out`}
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
    </>
  );
}
