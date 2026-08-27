import React, { useState, useMemo } from "react";
import { Check, Users } from "lucide-react";
import { usePalette } from "../PaletteContext";
import PhotoSlot from "../components/PhotoSlot";

// Pricing model, reverse-engineered from the flyer to match its numbers exactly:
// Essentials = $795 flat. Its three add-ons, bought individually, are $350 / $300 / $100.
// "It Lasts Forever" bundles all three add-ons at a bundle price of $1,295 total
// (not the sum of Essentials + individual add-on prices — the flyer's own numbers
// only reconcile if the bundle carries a built-in discount over buying separately).
// Guest keepsake is added on top of either path, per guest.
const ESSENTIALS_PRICE = 795;
const FULL_EXPERIENCE_PRICE = 1295; // bundle price, add-ons included, before keepsakes
const DEFAULT_GUEST_COUNT = 30;

const ADDONS = [
  { id: "photoWall", name: "Photo Wall / Feature Wall Installation", price: 350, photoKey: "photoWall" },
  { id: "voiceNotes", name: "Voice Notes", price: 300, photoKey: "voiceNotes" },
  { id: "digitalAlbum", name: "Digital Memory Album", price: 100, photoKey: "digitalAlbum" },
];

const ESSENTIALS_FEATURES = [
  { id: "guessArrival", name: "Guess the Arrival Website", photoKey: "guessArrival" },
  { id: "pictureThis", name: "Picture This Installation & Keepsake", photoKey: "pictureThis" },
  { id: "ohBabyCenterpiece", name: "Oh Baby Centerpiece", photoKey: "ohBabyCenterpiece" },
  { id: "babyTrivia", name: "Baby Trivia Card Pack", photoKey: "babyTrivia" },
  { id: "nurseryRhyme", name: "Custom Nursery Rhyme Framed Artwork", photoKey: "nurseryRhyme" },
  { id: "welcomeSign", name: "Welcome Sign", photoKey: "welcomeSign" },
];

const KEEPSAKES = [
  { id: "ready-to-pop", name: "Ready to Pop", pricePerGuest: 10, photoKey: "readyToPop" },
  { id: "lil-roots", name: "Lil Roots", pricePerGuest: 15, photoKey: "lilRoots" },
];

function SectionTitle({ children, palette, fonts }) {
  return (
    <h2 className="text-2xl font-semibold mb-4" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
      {children}
    </h2>
  );
}

export default function PackageBuilder() {
  const { palette, fonts } = usePalette();
  const [tier, setTier] = useState(null); // "essentials" | "full"
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [keepsakeId, setKeepsakeId] = useState(null);
  const [guestCount, setGuestCount] = useState(DEFAULT_GUEST_COUNT);

  const toggleAddon = (id) =>
    setSelectedAddonIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  const total = useMemo(() => {
    let sum = 0;
    if (tier === "essentials") {
      sum += ESSENTIALS_PRICE;
      sum += selectedAddonIds.reduce((s, id) => s + (ADDONS.find((a) => a.id === id)?.price || 0), 0);
    } else if (tier === "full") {
      sum += FULL_EXPERIENCE_PRICE;
    }
    const keepsake = KEEPSAKES.find((k) => k.id === keepsakeId);
    if (keepsake) sum += keepsake.pricePerGuest * guestCount;
    return sum;
  }, [tier, selectedAddonIds, keepsakeId, guestCount]);

  const cardStyle = (active) => ({
    background: palette.surface,
    border: active ? `2px solid ${palette.accent}` : `1px solid ${palette.line}`,
  });

  return (
    <div className="min-h-screen pb-32" style={{ background: palette.bg, color: palette.ink }}>
      <div className="px-6 py-14 text-center" style={{ background: palette.primaryDeep }}>
        <p className="text-xs tracking-[0.3em] font-semibold" style={{ ...fonts.bodyFont, color: palette.gold }}>
          A CURATED BABY SHOWER EXPERIENCE
        </p>
        <h1 className="mt-2 text-5xl sm:text-6xl font-semibold" style={{ ...fonts.displayFont, color: "#FFFFFF" }}>
          Made for memories.
        </h1>
        <p className="mt-1 text-2xl italic" style={{ ...fonts.scriptFont, color: palette.accent }}>
          saved forever.
        </p>
        <p className="mt-4 text-xs tracking-widest" style={{ ...fonts.bodyFont, color: "#FFFFFF99" }}>
          DESIGNED FOR UP TO 30 GUESTS
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Tier selection */}
        <SectionTitle palette={palette} fonts={fonts}>Choose Your Experience</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <button onClick={() => setTier("essentials")} className="text-left rounded-sm p-6" style={cardStyle(tier === "essentials")}>
            <p className="text-xs font-semibold tracking-widest" style={{ ...fonts.bodyFont, color: palette.accent }}>THE ESSENTIALS</p>
            <p className="text-xs mt-0.5" style={{ ...fonts.bodyFont, color: palette.muted }}>The core experience</p>
            <p className="text-3xl font-semibold mt-2" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>${ESSENTIALS_PRICE}</p>
            <p className="text-xs mt-3" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Includes the Guess the Arrival website, Picture This installation, Oh Baby Centerpiece, Baby Trivia, custom nursery rhyme artwork, and welcome sign. Add any extras below.
            </p>
          </button>
          <button onClick={() => setTier("full")} className="text-left rounded-sm p-6" style={cardStyle(tier === "full")}>
            <p className="text-xs font-semibold tracking-widest" style={{ ...fonts.bodyFont, color: palette.accent }}>IT LASTS FOREVER</p>
            <p className="text-xs mt-0.5" style={{ ...fonts.bodyFont, color: palette.muted }}>The complete experience</p>
            <p className="text-3xl font-semibold mt-2" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>${FULL_EXPERIENCE_PRICE}</p>
            <p className="text-xs mt-3" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Everything in the Essentials, plus a Photo Wall installation, Voice Notes, and a Digital Memory Album — bundled in.
            </p>
          </button>
        </div>

        {/* Essentials feature gallery */}
        {tier && (
          <div className="mb-12">
            <SectionTitle palette={palette} fonts={fonts}>What's Included</SectionTitle>
            <div className="grid sm:grid-cols-3 gap-4">
              {ESSENTIALS_FEATURES.map((f) => (
                <div key={f.id} className="rounded-sm overflow-hidden" style={{ border: `1px solid ${palette.line}`, background: palette.surface }}>
                  <PhotoSlot photoKey={f.photoKey} label={f.name} />
                  <p className="text-xs font-medium p-3" style={{ ...fonts.bodyFont, color: palette.ink }}>{f.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons — only offered when building from Essentials, since Full already bundles them */}
        {tier === "essentials" && (
          <div className="mb-12">
            <SectionTitle palette={palette} fonts={fonts}>Add Any Extras</SectionTitle>
            <div className="grid sm:grid-cols-3 gap-4">
              {ADDONS.map((a) => {
                const active = selectedAddonIds.includes(a.id);
                return (
                  <button key={a.id} onClick={() => toggleAddon(a.id)} className="text-left rounded-sm overflow-hidden" style={cardStyle(active)}>
                    <PhotoSlot photoKey={a.photoKey} label={a.name} />
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ ...fonts.bodyFont, color: palette.ink }}>{a.name}</span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ ...fonts.bodyFont, color: palette.accent }}>
                        {active && <Check size={13} />} +${a.price}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tier === "full" && (
          <div className="mb-12">
            <SectionTitle palette={palette} fonts={fonts}>Bundled In</SectionTitle>
            <div className="grid sm:grid-cols-3 gap-4">
              {ADDONS.map((a) => (
                <div key={a.id} className="rounded-sm overflow-hidden" style={{ border: `1px solid ${palette.line}`, background: palette.surface }}>
                  <PhotoSlot photoKey={a.photoKey} label={a.name} />
                  <div className="p-3 flex items-center gap-1.5">
                    <Check size={13} color={palette.accent} />
                    <span className="text-xs font-medium" style={{ ...fonts.bodyFont, color: palette.ink }}>{a.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guest keepsake + guest count */}
        {tier && (
          <div className="mb-12">
            <SectionTitle palette={palette} fonts={fonts}>Choose Your Guest Keepsake</SectionTitle>
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} color={palette.muted} />
              <label className="text-xs" style={{ ...fonts.bodyFont, color: palette.muted }}>Guest count</label>
              <input
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 px-2 py-1 rounded-sm text-sm"
                style={{ ...fonts.bodyFont, border: `1px solid ${palette.line}`, color: palette.ink }}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {KEEPSAKES.map((k) => {
                const active = keepsakeId === k.id;
                return (
                  <button key={k.id} onClick={() => setKeepsakeId(k.id)} className="text-left rounded-sm overflow-hidden" style={cardStyle(active)}>
                    <PhotoSlot photoKey={k.photoKey} label={k.name} />
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ ...fonts.bodyFont, color: palette.ink }}>{k.name}</span>
                      <span className="text-xs font-semibold" style={{ ...fonts.bodyFont, color: palette.accent }}>
                        ${k.pricePerGuest}/guest
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky total */}
      {tier && (
        <div className="fixed bottom-0 left-0 right-0 px-6 py-4" style={{ background: palette.surface, borderTop: `1px solid ${palette.line}` }}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-widest" style={{ ...fonts.bodyFont, color: palette.muted }}>YOUR TOTAL</p>
              <p className="text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>${total.toLocaleString()}</p>
            </div>
            <button
              disabled={!keepsakeId}
              className="px-6 py-3 rounded-full text-xs font-semibold tracking-widest text-white disabled:opacity-30"
              style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
            >
              CONTINUE TO DATE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
