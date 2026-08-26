// Shared brand tokens for A Slice of G Events — pulled from the reference flyer.
// Import these into every page/component instead of redefining colors locally.

export const SAGE = "#6B7A5E";
export const SAGE_DEEP = "#4E5A44";
export const GOLD = "#B8935A";
export const CREAM = "#FAF6ED";
export const INK = "#3A342A";
export const LINE = "#E4DCC8";
export const MUTED = "#A69C7E";

export const displayFont = { fontFamily: "'Cormorant Garamond', serif" };
export const scriptFont = { fontFamily: "'Parisienne', cursive" };
export const bodyFont = { fontFamily: "'Jost', sans-serif" };

const FONT_IMPORT_ID = "aslice-fonts";
export function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_IMPORT_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_IMPORT_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Parisienne&family=Jost:wght@400;500;600&display=swap";
  document.head.appendChild(link);
}
