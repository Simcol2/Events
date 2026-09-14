// Shared brand tokens for A Slice of G Events: the "Modern Glam Playhouse"
// direction. Import these into every page/component instead of redefining
// colors locally.

export const SAGE = "#17724F";
export const SAGE_DEEP = "#0B4933";
export const GOLD = "#D9AE45";
export const CREAM = "#FCFBF7";
export const INK = "#12201A";
export const LINE = "#EAE3D3";
export const MUTED = "#5A5F54";

export const displayFont = { fontFamily: "'Fraunces', serif" };
export const scriptFont = { fontFamily: "'Permanent Marker', cursive" };
export const bodyFont = { fontFamily: "'Space Grotesk', sans-serif" };

// Converts a "#RRGGBB" palette color into an rgba() string at the given
// alpha, so glow accents and paper texture always derive from the live
// palette instead of a second, hardcoded set of hex values that could
// drift out of sync with it.
export function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
}

function rgbToHex(r, g, b) {
  const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Mixes a palette color toward black (amount 0-1) - used to derive a deep,
// section-background-worthy tone from a color that's only defined bright
// (e.g. `accent`), the same way `primaryDeep` already relates to `primary`.
export function shadeHex(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  const t = 1 - amount;
  return rgbToHex(r * t, g * t, b * t);
}

// Mixes a palette color toward white (amount 0-1) - used for a pale
// "champagne" highlight stop in a metallic gold gradient.
export function tintHex(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

// A moving-metal gradient built from the palette's own gold tones instead of
// a second, hardcoded gold scale - bronze/gold/champagne stops that track
// whatever `gold`/`goldDeep` a given palette defines. `goldDeep` is already
// a real, fixed bronze tone (not computed by darkening `gold`), per the
// brand sheet's rule against manufacturing "deep" colors by mixing toward
// black. `onDark` only affects how pale the champagne highlight runs (for
// gold set on a dark section vs gold text on the light cream bg).
export function metallicGoldGradient(palette, { onDark = false, angle = "100deg" } = {}) {
  const bronze = palette.goldDeep;
  const champagne = tintHex(palette.gold, onDark ? 0.65 : 0.4);
  return `linear-gradient(${angle}, ${bronze} 0%, ${palette.gold} 32%, ${champagne} 50%, ${palette.gold} 68%, ${bronze} 100%)`;
}

export function metallicGoldTextStyle(palette, opts) {
  return {
    backgroundImage: metallicGoldGradient(palette, opts),
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
  };
}

export function paperTexture(palette) {
  return {
    backgroundColor: palette.bg,
    backgroundImage: [
      `radial-gradient(circle at 18% 10%, ${hexToRgba(palette.gold, 0.16)}, transparent 28%)`,
      `radial-gradient(circle at 85% 18%, ${hexToRgba(palette.accent, 0.09)}, transparent 24%)`,
      `repeating-linear-gradient(0deg, ${hexToRgba(palette.ink, 0.035)} 0, ${hexToRgba(palette.ink, 0.035)} 1px, transparent 1px, transparent 4px)`,
    ].join(", "),
  };
}

const FONT_IMPORT_ID = "aslice-fonts";
const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Space+Grotesk:wght@400;500;600;700&family=Permanent+Marker&display=swap";
export function ensureFonts() {
  if (typeof document === "undefined") return;
  const existing = document.getElementById(FONT_IMPORT_ID);
  if (existing) {
    // Prerendered HTML can bake in a stale href from a previous font
    // direction; keep it in sync instead of trusting the id alone,
    // otherwise a font change never reaches already-prerendered pages.
    if (existing.getAttribute("href") !== FONT_IMPORT_URL) {
      existing.setAttribute("href", FONT_IMPORT_URL);
    }
    return;
  }
  const link = document.createElement("link");
  link.id = FONT_IMPORT_ID;
  link.rel = "stylesheet";
  link.href = FONT_IMPORT_URL;
  document.head.appendChild(link);
}
