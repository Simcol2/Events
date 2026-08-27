import React, { useState, useMemo } from "react";
import { Check, Users } from "lucide-react";
import { usePalette } from "../PaletteContext";
import FeatureCard from "../components/FeatureCard";
import { ESSENTIALS_FEATURES, ADDONS, KEEPSAKES } from "../packageContent";

// Pricing model, matching the flyer's numbers exactly. Essentials is $795
// flat. Its three add-ons, bought individually, are $350, $300, and $100.
// It Lasts Forever bundles all three add-ons at a flat bundle price of
// $1,295 total (before keepsakes), which is what makes the flyer's own
// $1,595 to $1,745 range reconcile with a $10 versus $15 per guest keepsake
// across 30 guests. Guest keepsake cost is added on top either way.
const ESSENTIALS_PRICE = 795;
const FULL_EXPERIENCE_PRICE = 1295;
const DEFAULT_GUEST_COUNT = 30;

function SectionTitle({ children, palette, fonts }) {
  return (
    <h2 className="text-2xl font-semibold mb-4" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
      {children}
    </h2>
  );
}

export default function PackageBuilder() {
  const { palette, fonts } = usePalette();
  const [tier, setTier] = useState(null);
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

  const tierCardStyle = (active) => ({
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

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Tier selection */}
        <SectionTitle palette={palette} fonts={fonts}>Choose Your Experience</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4 mb-14">
          <button onClick={() => setTier("essentials")} className="text-left rounded-xl p-6" style={tierCardStyle(tier === "essentials")}>
            <p className="text-xs font-semibold tracking-widest" style={{ ...fonts.bodyFont, color: palette.accent }}>THE ESSENTIALS</p>
            <p className="text-sm mt-0.5" style={{ ...fonts.bodyFont, color: palette.muted }}>The core experience</p>
            <p className="text-3xl font-semibold mt-2" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>${ESSENTIALS_PRICE}</p>
            <p className="text-sm mt-3 leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
              All seven signature features below, ready to add any extras that make it even more special.
            </p>
          </button>
          <button onClick={() => setTier("full")} className="text-left rounded-xl p-6" style={tierCardStyle(tier === "full")}>
            <p className="text-xs font-semibold tracking-widest" style={{ ...fonts.bodyFont, color: palette.accent }}>IT LASTS FOREVER</p>
            <p className="text-sm mt-0.5" style={{ ...fonts.bodyFont, color: palette.muted }}>The complete experience</p>
            <p className="text-3xl font-semibold mt-2" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>${FULL_EXPERIENCE_PRICE}</p>
            <p className="text-sm mt-3 leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
              Everything in the Essentials, plus the Photo Wall, Voice Notes, and Digital Memory Album, all bundled in.
            </p>
          </button>
        </div>

        {/* Essentials feature gallery */}
        {tier && (
          <div className="mb-14">
            <SectionTitle palette={palette} fonts={fonts}>What's Included</SectionTitle>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ESSENTIALS_FEATURES.map((f) => (
                <FeatureCard
                  key={f.id}
                  icon={f.icon}
                  name={f.name}
                  tagline={f.tagline}
                  description={f.description}
                  photoKey={f.id}
                  photoUrl={f.photoUrl}
                />
              ))}
            </div>
          </div>
        )}

        {/* Add-ons, only offered when building from Essentials since Full already bundles them */}
        {tier === "essentials" && (
          <div className="mb-14">
            <SectionTitle palette={palette} fonts={fonts}>Add Any Extras</SectionTitle>
            <div className="grid sm:grid-cols-3 gap-6">
              {ADDONS.map((a) => (
                <FeatureCard
                  key={a.id}
                  icon={a.icon}
                  name={a.name}
                  tagline={a.tagline}
                  description={a.description}
                  photoKey={a.id}
                  priceLabel={`+$${a.price}`}
                  selected={selectedAddonIds.includes(a.id)}
                  onClick={() => toggleAddon(a.id)}
                />
              ))}
            </div>
          </div>
        )}

        {tier === "full" && (
          <div className="mb-14">
            <SectionTitle palette={palette} fonts={fonts}>Bundled In</SectionTitle>
            <div className="grid sm:grid-cols-3 gap-6">
              {ADDONS.map((a) => (
                <FeatureCard
                  key={a.id}
                  icon={a.icon}
                  name={a.name}
                  tagline={a.tagline}
                  description={a.description}
                  photoKey={a.id}
                  priceLabel="Included"
                />
              ))}
            </div>
          </div>
        )}

        {/* Guest keepsake + guest count */}
        {tier && (
          <div className="mb-14">
            <SectionTitle palette={palette} fonts={fonts}>Choose Your Guest Keepsake</SectionTitle>
            <div className="flex items-center gap-2 mb-5">
              <Users size={16} color={palette.muted} />
              <label className="text-sm" style={{ ...fonts.bodyFont, color: palette.muted }}>Guest count</label>
              <input
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 px-2 py-1 rounded-sm text-sm"
                style={{ ...fonts.bodyFont, border: `1px solid ${palette.line}`, color: palette.ink }}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {KEEPSAKES.map((k) => (
                <FeatureCard
                  key={k.id}
                  icon={k.icon}
                  name={k.name}
                  tagline={k.tagline}
                  description={k.description}
                  photoKey={k.id}
                  priceLabel={`$${k.pricePerGuest}/guest`}
                  selected={keepsakeId === k.id}
                  onClick={() => setKeepsakeId(k.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky total */}
      {tier && (
        <div className="fixed bottom-0 left-0 right-0 px-6 py-4" style={{ background: palette.surface, borderTop: `1px solid ${palette.line}` }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs tracking-widest" style={{ ...fonts.bodyFont, color: palette.muted }}>YOUR TOTAL</p>
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
