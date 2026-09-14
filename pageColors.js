// The site's color system, per the brand color sheet: a single flat
// spectrum of named brand colors (each with a real, separately-chosen
// "deep" companion - never a computed shade, since mixing a brand color
// toward black to invent a "deep" version reads as muted regardless of the
// exact math), and a per-page assignment of which colors are "dominant"
// (the page's main full-bleed section color), "secondary" (the alternate
// full-bleed color further down the page) and "accent" (used sparingly -
// script text, small buttons, icons, hover states, thin rules - never as a
// big background). The same handful of colors recur across pages without
// every page looking identical or forcing every brand color into every
// viewport.

import { tintHex } from "./theme";

export const FAMILIES = {
  emerald: { base: "#008B57", deep: "#005338" },
  fuchsia: { base: "#E5006D", deep: "#B80056" },
  coral: { base: "#FF5B57", deep: "#D83C45", bright: "#FF746B" },
  navy: { base: "#082B49", deep: "#041D33", companion: "#164563" },
  yellow: { base: "#FFD23F", deep: "#FFD23F" },
  gold: { base: "#D9A928", deep: "#8A6A1E" },
  cream: { base: "#FFFDF5", deep: "#FFFDF5" },
};

export const INK = "#17211D";
export const LINE = "#E8E1D6"; // Warm Taupe
export const CREAM = "#FFFDF5";
export const SURFACE = "#FFFFFF";

// route `current` key -> { dominant, secondary, accent, accentBright }
export const PAGE_COLORS = {
  home: { dominant: "navy", secondary: "emerald", accent: "coral", accentBright: "fuchsia" },
  experiences: { dominant: "emerald", secondary: "fuchsia", accent: "gold" },
  "milestone-events": { dominant: "emerald", secondary: "coral", accent: "gold" }, // Baby Shower page
  birthdays: { dominant: "navy", secondary: "coral", accent: "fuchsia", accentBright: "yellow" }, // Tutu Twirls page
  "display-options": { dominant: "emerald", secondary: "fuchsia", accent: "gold" },
  decor: { dominant: "emerald", secondary: "cream", accent: "fuchsia" }, // Rentals
  "rental-guide": { dominant: "emerald", secondary: "cream", accent: "fuchsia" },
  gifts: { dominant: "fuchsia", secondary: "emerald", accent: "gold" },
};

const DEFAULT_PAGE_COLORS = { dominant: "emerald", secondary: "fuchsia", accent: "gold" };

// Package Builder's own content already varies by the selected event type,
// so (uniquely) its color scheme follows that instead of a fixed page
// assignment - the same family choices as that event type's own landing
// page, so the builder doesn't feel like a different site once you're in it.
const BUILDER_EVENT_TYPE_COLORS = {
  babyShower: PAGE_COLORS["milestone-events"],
  tutuTwirlsTea: PAGE_COLORS.birthdays,
  birthday: { dominant: "navy", secondary: "fuchsia", accent: "yellow" },
};

export function resolvePageColors(pageKey, eventTypeId) {
  if (pageKey === "package-builder") {
    return BUILDER_EVENT_TYPE_COLORS[eventTypeId] || DEFAULT_PAGE_COLORS;
  }
  return PAGE_COLORS[pageKey] || DEFAULT_PAGE_COLORS;
}

// Builds a palette-shaped object so every existing `palette.*` call site
// keeps working unchanged: `primary`/`primaryDeep` are the page's dominant
// color, `secondary`/`secondaryDeep` are its alternate full-bleed color,
// and `accent`/`accentDeep`/`accentBright` are for sparing use only.
export function buildPageColorKey(pageKey, eventTypeId) {
  return pageKey === "package-builder" ? `package-builder:${eventTypeId || "default"}` : pageKey;
}

export function buildPalette(colorKey) {
  const [pageKey, eventTypeId] = colorKey.includes(":") ? colorKey.split(":") : [colorKey, undefined];
  const { dominant, secondary, accent, accentBright } = resolvePageColors(pageKey, eventTypeId);
  const dom = FAMILIES[dominant];
  const sec = FAMILIES[secondary];
  const acc = FAMILIES[accent];
  const bright = FAMILIES[accentBright || accent];

  return {
    bg: CREAM,
    surface: SURFACE,
    primary: dom.base,
    primaryDeep: dom.deep,
    primaryCompanion: dom.companion || dom.deep,
    primaryBright: dom.bright || dom.base,
    secondary: sec.base,
    secondaryDeep: sec.deep,
    secondaryBright: sec.bright || sec.base,
    accent: acc.base,
    accentDeep: acc.deep,
    accentBright: bright.base,
    gold: FAMILIES.gold.base,
    goldDeep: FAMILIES.gold.deep,
    ink: INK,
    line: LINE,
    muted: tintHex(INK, 0.35),
    photos: {},
  };
}

export const DEFAULT_COLOR_KEY = "home";
