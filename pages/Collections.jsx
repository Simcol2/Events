import React from "react";
import { ArrowRight, Leaf } from "lucide-react";
import { SAGE, SAGE_DEEP, GOLD, CREAM, INK, LINE, MUTED, displayFont, scriptFont, bodyFont, ensureFonts } from "../theme";

// Pulled from the six theme boards. Swap the `palette` hex values for exact
// brand codes if/when you lock those in — these are close reads off the
// reference images, not confirmed hex values.
const COLLECTIONS = [
  {
    id: "village-sage",
    name: "It Takes a Village",
    variant: "Sage Neutral",
    tagline: "A celebration honoring the people who will love them the most.",
    palette: ["#6B7A5E", "#C77B4E", "#F3EEE2", "#4E5A44"],
  },
  {
    id: "village-boho",
    name: "It Takes a Village",
    variant: "Boho Rainbow",
    tagline: "Because this little one is already so loved.",
    palette: ["#3F4937", "#8B9A7A", "#C1523A", "#C9A227", "#F3EEE2", "#6B4A2E"],
  },
  {
    id: "carnival-baby",
    name: "Carnival Baby",
    variant: "Mini Masquerader",
    tagline: "Coming soon: your little masquerader's shower.",
    palette: ["#E24E7A", "#F2A6B8", "#C9A227", "#5F6B3F", "#F3EEE2"],
  },
  {
    id: "sunday-best",
    name: "Sunday Best",
    variant: "Classic",
    tagline: "Good people. Good food. Good memories.",
    palette: ["#5C1B22", "#C9A227", "#4E5A44", "#F3EEE2"],
  },
  {
    id: "sparkle-navy",
    name: "Never Let Anyone Dull Your Sparkle",
    variant: "Navy & Green",
    tagline: "A celebration of the people becoming parents.",
    palette: ["#1B2A4A", "#3F4937", "#C9A227", "#F3EEE2"],
  },
  {
    id: "sparkle-blush",
    name: "Never Let Anyone Dull Your Sparkle",
    variant: "Blush & Gold",
    tagline: "Because their story didn't start with you — but you're the best chapter yet.",
    palette: ["#D9497A", "#3F4937", "#C9A227", "#F3EEE2"],
  },
];

function Divider() {
  return (
    <div className="flex items-center gap-3 justify-center my-4">
      <span className="h-px w-10" style={{ background: GOLD }} />
      <Leaf size={14} color={GOLD} />
      <span className="h-px w-10" style={{ background: GOLD }} />
    </div>
  );
}

export default function Collections({ navigate }) {
  ensureFonts();
  return (
    <div className="min-h-screen" style={{ background: CREAM, color: INK }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <header className="text-center mb-14">
          <p className="text-xs tracking-[0.35em] font-medium" style={{ ...bodyFont, color: GOLD }}>THE</p>
          <h1 className="text-6xl font-semibold tracking-tight -mt-1" style={{ ...displayFont, color: SAGE_DEEP }}>
            Collections
          </h1>
          <Divider />
          <p className="italic text-2xl" style={scriptFont}>Celebrations with a story to tell.</p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7" style={{ ...bodyFont, color: "#716B5C" }}>
            Not a theme. A story, told through decor, activities, and a digital experience built
            entirely around your people.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate("/reservations")}
              className="text-left rounded-sm p-6 transition-all flex flex-col"
              style={{ background: "#FFFFFF", border: `1px solid ${LINE}` }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = LINE)}
            >
              <div className="flex gap-1.5 mb-5">
                {c.palette.map((hex, i) => (
                  <span key={i} className="w-6 h-6 rounded-full" style={{ background: hex, border: "2px solid white", boxShadow: `0 0 0 1px ${LINE}` }} />
                ))}
              </div>
              <h2 className="text-2xl font-semibold leading-tight" style={{ ...displayFont, color: SAGE_DEEP }}>
                {c.name}
              </h2>
              <p className="text-xs tracking-widest font-medium mt-1" style={{ ...bodyFont, color: GOLD }}>
                {c.variant.toUpperCase()}
              </p>
              <p className="text-sm italic mt-3 flex-1" style={{ ...bodyFont, color: "#8A8268" }}>
                {c.tagline}
              </p>
              <div className="mt-6 flex items-center gap-2 text-[11px] font-semibold tracking-[0.15em]" style={{ ...bodyFont, color: SAGE }}>
                VIEW COLLECTION <ArrowRight size={13} />
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-sm mb-4" style={{ ...bodyFont, color: MUTED }}>
            Don't see your story here yet?
          </p>
          <button
            onClick={() => navigate("/reservations")}
            className="px-7 py-3.5 text-[10px] font-semibold tracking-[0.2em] text-white"
            style={{ ...bodyFont, background: SAGE }}
          >
            BUILD YOUR OWN
          </button>
        </div>
      </div>
    </div>
  );
}
