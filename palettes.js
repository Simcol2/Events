// Central palette registry. Every page/component that needs color should
// read from usePalette() (see PaletteContext.jsx) rather than hardcoding
// hex values — that's what makes the site-wide toggle actually work.
//
// `photos` is a placeholder object per palette. Once real photos exist for
// a given palette + feature combination, drop the URL in here (or wire this
// up to Supabase storage later) — PhotoSlot.jsx already knows how to render
// whichever is present and fall back to a placeholder otherwise.

import { tintHex } from "./theme";

// A fixed bronze tone (not computed by darkening the bright gold - see the
// brand sheet's own "don't darken with black, it kills the energy" rule)
// used only for small body-sized gold text on the light cream bg, where the
// bright `gold` itself doesn't have enough contrast to read. Shared by both
// palettes, same as `gold` itself.
const GOLD_TEXT = "#8A6A1E";

const PHOTO_KEYS = [
  "essentials",
  "itLastsForever",
  "guessArrival",
  "pictureThis",
  "ohBabyCenterpiece",
  "babyTrivia",
  "nurseryRhyme",
  "welcomeSign",
  "photoWall",
  "voiceNotes",
  "digitalAlbum",
  "readyToPop",
  "lilRoots",
];

function emptyPhotos() {
  return PHOTO_KEYS.reduce((acc, key) => ({ ...acc, [key]: null }), {});
}

export const PALETTES = [
  {
    id: "signature",
    name: "Signature",
    description: "Emerald & Fuchsia: saturated jewel green, hot fuchsia, warm gold and clean cream.",
    // The brand's official "Emerald & Fuchsia" palette - full saturation
    // throughout, on purpose. Every color below is a named tone straight off
    // the brand color sheet, including the "deep" companion tones used for
    // two-stop gradients. Per that sheet's own explicit rule: never darken
    // one of these by mixing toward black/gray to manufacture a "deep"
    // variant - it reads as muted no matter how it's computed. If a section
    // needs a darker tone, it uses the sheet's own named deep color.
    bg: "#FFFDF5", // Clean Cream
    surface: "#FFFFFF",
    primary: "#007A4D", // Emerald
    primaryDeep: "#00563A", // Deep Emerald
    accent: "#E5006D", // Fuchsia
    accentDeep: "#B80056", // Deep Fuchsia
    accentBright: "#FF3B8D", // Bright Pink - secondary accent for small highlight moments
    gold: "#D9A928", // Warm Gold
    goldDeep: GOLD_TEXT,
    ink: "#17211D", // Ink
    line: "#E8E1D6", // Warm Taupe
    muted: tintHex("#17211D", 0.35),
    photos: emptyPhotos(),
  },
  {
    id: "playful-navy",
    name: "Playful: Navy & Coral",
    description: "Coral & Navy: navy anchor, coral and sunshine yellow energy, for the playful event types.",
    bg: "#FFFDF5", // Clean Cream (shared core neutral)
    surface: "#FFFFFF",
    primary: "#102A43", // Navy
    primaryDeep: "#081E34", // Deep Navy
    accent: "#FF5F57", // Coral
    accentDeep: "#E0434A", // Deep Coral
    accentBright: "#FFD23F", // Sunshine Yellow - secondary accent
    gold: "#D9A928", // Warm Gold (shared bridge color across both palettes)
    goldDeep: GOLD_TEXT,
    ink: "#17211D", // Ink (shared)
    line: "#E8E1D6", // Warm Taupe (shared)
    muted: tintHex("#17211D", 0.35),
    photos: emptyPhotos(),
  },
  {
    id: "village-sage",
    name: "It Takes a Village: Sage",
    description: "A celebration honoring the people who will love them the most.",
    bg: "#FCFBF5",
    surface: "#FFFFFF",
    primary: "#6B7A5E",
    primaryDeep: "#4E5A44",
    accent: "#C77B4E",
    gold: "#C9A227",
    goldDeep: "#7A5A10",
    ink: "#3A342A",
    line: "#EEEADF",
    muted: "#716A56",
    photos: emptyPhotos(),
  },
  {
    id: "village-boho",
    name: "It Takes a Village: Boho",
    description: "Because this little one is already so loved.",
    bg: "#FDFBF6",
    surface: "#FFFFFF",
    primary: "#5A6B4C",
    primaryDeep: "#3F4937",
    accent: "#C1523A",
    gold: "#C9A227",
    goldDeep: "#7A5A10",
    ink: "#3A342A",
    line: "#EEEADF",
    muted: "#716A56",
    photos: emptyPhotos(),
  },
  {
    id: "carnival-baby",
    name: "Carnival Baby",
    description: "Bright, bold and playful, for your little masquerader.",
    bg: "#FFFAF7",
    surface: "#FFFFFF",
    primary: "#7A8A54",
    primaryDeep: "#5F6B3F",
    accent: "#E24E7A",
    gold: "#C9A227",
    goldDeep: "#7A5A10",
    ink: "#3A2A2A",
    line: "#F6E7E3",
    muted: "#785F5F",
    photos: emptyPhotos(),
  },
  {
    id: "sunday-best",
    name: "Sunday Best",
    description: "Good people. Good food. Good memories.",
    bg: "#FDFAF5",
    surface: "#FFFFFF",
    primary: "#7A2530",
    primaryDeep: "#5C1B22",
    accent: "#6B7A5E",
    gold: "#C9A227",
    goldDeep: "#7A5A10",
    ink: "#362420",
    line: "#F1E6DB",
    muted: "#726157",
    photos: emptyPhotos(),
  },
  {
    id: "sparkle-navy",
    name: "Never Let Anyone Dull Your Sparkle: Navy",
    description: "A celebration of the people at the center of it all.",
    bg: "#FAFAF7",
    surface: "#FFFFFF",
    primary: "#28407A",
    primaryDeep: "#1B2A4A",
    accent: "#5A6B4C",
    gold: "#C9A227",
    goldDeep: "#7A5A10",
    ink: "#26282E",
    line: "#E9E9E2",
    muted: "#616157",
    photos: emptyPhotos(),
  },
  {
    id: "sparkle-blush",
    name: "Never Let Anyone Dull Your Sparkle: Blush",
    description: "Because their story didn't start with you, but you're the best chapter yet.",
    bg: "#FEF8FA",
    surface: "#FFFFFF",
    primary: "#D9497A",
    primaryDeep: "#B8305F",
    accent: "#5A6B4C",
    gold: "#C9A227",
    goldDeep: "#7A5A10",
    ink: "#3A2A30",
    line: "#F8E9EE",
    muted: "#785F67",
    photos: emptyPhotos(),
  },
];

export const DEFAULT_PALETTE_ID = "signature";
