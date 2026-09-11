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

export function paperTexture(palette) {
  return {
    backgroundColor: palette.bg,
    backgroundImage: [
      `radial-gradient(circle at 18% 10%, ${hexToRgba(palette.gold, 0.08)}, transparent 28%)`,
      `radial-gradient(circle at 85% 18%, ${hexToRgba(palette.accent, 0.045)}, transparent 24%)`,
      `repeating-linear-gradient(0deg, ${hexToRgba(palette.ink, 0.018)} 0, ${hexToRgba(palette.ink, 0.018)} 1px, transparent 1px, transparent 4px)`,
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
