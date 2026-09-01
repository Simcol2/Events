import React, { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import FeatureCard from "../components/FeatureCard";
import {
  MAIN_PACKAGE_ITEMS,
  ADDONS,
  KEEPSAKES,
  MADE_FOR_MEMORIES_PRICE,
  DEFAULT_GUEST_COUNT,
  PACKAGE_NAME,
  resolvePackageItem,
} from "../packageContent";

function SectionTitle({ children, palette, fonts }) {
  return (
    <h2 className="text-2xl font-semibold mb-4" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
      {children}
    </h2>
  );
}

export default function PackageBuilder() {
  const { palette, fonts } = usePalette();
  const { eventTypeId, eventType } = useEventType();
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [keepsakeId, setKeepsakeId] = useState(null);
  const [guestCount, setGuestCount] = useState(DEFAULT_GUEST_COUNT);

  const toggleAddon = (id) =>
    setSelectedAddonIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  const resolvedItems = useMemo(
    () => MAIN_PACKAGE_ITEMS.map((item) => resolvePackageItem(item, eventTypeId)),
    [eventTypeId]
  );

  const total = useMemo(() => {
    let sum = MADE_FOR_MEMORIES_PRICE;
    sum += selectedAddonIds.reduce((s, id) => s + (ADDONS.find((a) => a.id === id)?.price || 0), 0);
    const keepsake = KEEPSAKES.find((k) => k.id === keepsakeId);
    if (keepsake) sum += keepsake.pricePerGuest * guestCount;
    return sum;
  }, [selectedAddonIds, keepsakeId, guestCount]);

  return (
    <div className="min-h-screen pb-32" style={{ background: palette.bg, color: palette.ink }}>
      <div className="px-6 py-14 text-center" style={{ background: palette.primaryDeep }}>
        <p className="text-xs tracking-[0.3em] font-semibold" style={{ ...fonts.bodyFont, color: palette.gold }}>
          A CURATED {eventType.label.toUpperCase()} EXPERIENCE
        </p>
        <h1 className="mt-2 text-5xl sm:text-6xl font-semibold" style={{ ...fonts.displayFont, color: "#FFFFFF" }}>
          {PACKAGE_NAME}.
        </h1>
        <p className="mt-1 text-2xl italic" style={{ ...fonts.scriptFont, color: palette.accent }}>
          saved forever.
        </p>
        <p className="mt-4 text-xs tracking-widest" style={{ ...fonts.bodyFont, color: "#FFFFFF99" }}>
          DESIGNED FOR UP TO {DEFAULT_GUEST_COUNT} GUESTS
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Fixed package — always included */}
        <div className="mb-14 rounded-2xl p-6" style={{ background: palette.surface, border: `2px solid ${palette.accent}` }}>
          <p className="text-xs font-semibold tracking-widest" style={{ ...fonts.bodyFont, color: palette.accent }}>
            THE {PACKAGE_NAME.toUpperCase()} PACKAGE
          </p>
          <p className="text-3xl font-semibold mt-2" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
            ${MADE_FOR_MEMORIES_PRICE}
          </p>
          <p className="text-sm mt-3 leading-relaxed max-w-2xl" style={{ ...fonts.bodyFont, color: palette.ink }}>
            The seven signature pieces below, included every time. Add any upgrades below to make it your own.
          </p>
        </div>

        <div className="mb-14">
          <SectionTitle palette={palette} fonts={fonts}>What's Included</SectionTitle>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resolvedItems.map((item) => (
              <FeatureCard
                key={item.id}
                icon={item.icon}
                name={item.name}
                tagline={item.tagline}
                description={item.description}
                photoKey={item.id}
                photoUrl={item.photoUrl}
                priceLabel="Included"
              />
            ))}
          </div>
        </div>

        {/* Add-ons — build your own */}
        <div className="mb-14">
          <SectionTitle palette={palette} fonts={fonts}>Build Your Own: Add Any Upgrades</SectionTitle>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADDONS.map((a) => (
              <FeatureCard
                key={a.id}
                icon={a.icon}
                name={a.name}
                tagline={a.tagline}
                description={a.description}
                photoKey={a.id}
                photoUrl={a.photoUrl}
                fit={a.fit}
                priceLabel={`+$${a.price}`}
                selected={selectedAddonIds.includes(a.id)}
                onClick={() => toggleAddon(a.id)}
              />
            ))}
          </div>
        </div>

        {/* Guest keepsake + guest count */}
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
                photoUrl={k.photoUrl}
                priceLabel={`$${k.pricePerGuest}/guest`}
                selected={keepsakeId === k.id}
                onClick={() => setKeepsakeId(k.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky total */}
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
    </div>
  );
}
