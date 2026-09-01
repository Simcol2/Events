// Central palette registry. Every page/component that needs color should
// read from usePalette() (see PaletteContext.jsx) rather than hardcoding
// hex values — that's what makes the site-wide toggle actually work.
//
// `photos` is a placeholder object per palette. Once real photos exist for
// a given palette + feature combination, drop the URL in here (or wire this
// up to Supabase storage later) — PhotoSlot.jsx already knows how to render
// whichever is present and fall back to a placeholder otherwise.

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
    description: "Our signature look: sage, coral and gold.",
    // A brighter read of the flyer's own dark-green/coral/gold — same DNA,
    // lifted out of near-black so it works as a default site theme.
    bg: "#FAF6ED",
    surface: "#FFFFFF",
    primary: "#1F5C3D",
    primaryDeep: "#154A31",
    accent: "#F0684B",
    gold: "#D9A441",
    ink: "#2E2A22",
    line: "#E7DFC8",
    muted: "#9C927A",
    photos: emptyPhotos(),
  },
  {
    id: "village-sage",
    name: "It Takes a Village: Sage",
    description: "A celebration honoring the people who will love them the most.",
    bg: "#F7F3E8",
    surface: "#FFFFFF",
    primary: "#6B7A5E",
    primaryDeep: "#4E5A44",
    accent: "#C77B4E",
    gold: "#C9A227",
    ink: "#3A342A",
    line: "#E4DCC8",
    muted: "#A69C7E",
    photos: emptyPhotos(),
  },
  {
    id: "village-boho",
    name: "It Takes a Village: Boho",
    description: "Because this little one is already so loved.",
    bg: "#F3EEE2",
    surface: "#FFFFFF",
    primary: "#5A6B4C",
    primaryDeep: "#3F4937",
    accent: "#C1523A",
    gold: "#C9A227",
    ink: "#3A342A",
    line: "#E4DCC8",
    muted: "#A69C7E",
    photos: emptyPhotos(),
  },
  {
    id: "carnival-baby",
    name: "Carnival Baby",
    description: "Bright, bold and playful, for your little masquerader.",
    bg: "#FFF6F2",
    surface: "#FFFFFF",
    primary: "#7A8A54",
    primaryDeep: "#5F6B3F",
    accent: "#E24E7A",
    gold: "#C9A227",
    ink: "#3A2A2A",
    line: "#F0DCD8",
    muted: "#B08C8C",
    photos: emptyPhotos(),
  },
  {
    id: "sunday-best",
    name: "Sunday Best",
    description: "Good people. Good food. Good memories.",
    bg: "#FBF3EC",
    surface: "#FFFFFF",
    primary: "#7A2530",
    primaryDeep: "#5C1B22",
    accent: "#6B7A5E",
    gold: "#C9A227",
    ink: "#362420",
    line: "#E8D9CC",
    muted: "#A88F80",
    photos: emptyPhotos(),
  },
  {
    id: "sparkle-navy",
    name: "Never Let Anyone Dull Your Sparkle: Navy",
    description: "A celebration of the people at the center of it all.",
    bg: "#F5F5EF",
    surface: "#FFFFFF",
    primary: "#28407A",
    primaryDeep: "#1B2A4A",
    accent: "#5A6B4C",
    gold: "#C9A227",
    ink: "#26282E",
    line: "#DCDCD0",
    muted: "#8E8E80",
    photos: emptyPhotos(),
  },
  {
    id: "sparkle-blush",
    name: "Never Let Anyone Dull Your Sparkle: Blush",
    description: "Because their story didn't start with you, but you're the best chapter yet.",
    bg: "#FDF3F6",
    surface: "#FFFFFF",
    primary: "#D9497A",
    primaryDeep: "#B8305F",
    accent: "#5A6B4C",
    gold: "#C9A227",
    ink: "#3A2A30",
    line: "#F0DCE4",
    muted: "#B08C98",
    photos: emptyPhotos(),
  },
];

export const DEFAULT_PALETTE_ID = "signature";
