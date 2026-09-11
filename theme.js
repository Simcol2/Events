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

const FONT_IMPORT_ID = "aslice-fonts";
export function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_IMPORT_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_IMPORT_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Space+Grotesk:wght@400;500;600;700&family=Permanent+Marker&display=swap";
  document.head.appendChild(link);
}
