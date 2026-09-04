import React, { useEffect, useMemo, useState } from "react";
import { Users, X, Package } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import { usePackage } from "../PackageContext";
import { supabase } from "../supabaseClient";
import FeatureCard from "../components/FeatureCard";
import { getItemFlags } from "../components/DecorCard";
import {
  ACTIVITIES,
  ADDONS,
  KEEPSAKES,
  DIGITAL_ADDON_IDS,
  CUSTOM_STORY_BOOK_PRICE,
  MADE_FOR_MEMORIES_PRICE,
  DEFAULT_GUEST_COUNT,
  INCLUDED_GUEST_COUNT,
  PACKAGE_NAME,
  INCLUDED_ACTIVITY_COUNT,
  INCLUDED_DECOR_COUNT,
  ACTIVITY_ADDON_PRICE,
  EXCLUSIVE_ACTIVITY_PAIR,
  DISPLAYS,
  DISPLAY_SETUP_OPTIONS,
  resolvePackageItem,
} from "../packageContent";

const STEPS = [
  { id: "decor", label: "Choose Decor" },
  { id: "activities", label: "Choose Activities" },
  { id: "addons", label: "Select Add-Ons" },
  { id: "digital", label: "Digital Upgrades" },
  { id: "display", label: "Choose a Display" },
];

function SectionTitle({ children, palette, fonts }) {
  return (
    <h2 className="text-2xl font-semibold mb-4" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
      {children}
    </h2>
  );
}

function StepNav({ step, setStep, palette, fonts }) {
  const currentIndex = STEPS.findIndex((s) => s.id === step);
  return (
    <div className="flex flex-wrap items-center gap-3 mb-10">
      {STEPS.map((s, i) => {
        const active = s.id === step;
        const done = i < currentIndex;
        return (
          <React.Fragment key={s.id}>
            <button
              onClick={() => setStep(s.id)}
              className="flex items-center gap-2 text-xs font-semibold tracking-widest"
              style={{ ...fonts.bodyFont, color: active ? palette.primaryDeep : done ? palette.accent : palette.muted }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] flex-shrink-0"
                style={{
                  background: active || done ? palette.accent : "transparent",
                  border: active || done ? "none" : `1px solid ${palette.line}`,
                  color: active || done ? "#FFFFFF" : palette.muted,
                }}
              >
                {i + 1}
              </span>
              {s.label.toUpperCase()}
            </button>
            {i < STEPS.length - 1 && <span className="w-6 h-px" style={{ background: palette.line }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function firstPhoto(photos) {
  if (!Array.isArray(photos) || !photos.length) return null;
  const first = photos[0];
  return typeof first === "string" ? first : first?.url || null;
}

function defaultRequestType(item) {
  const { isRentable, isPurchasable } = getItemFlags(item);
  if (isRentable) return "rental";
  if (isPurchasable) return "purchase";
  return null;
}

export default function PackageBuilder() {
  const { palette, fonts } = usePalette();
  const { eventTypeId, eventType } = useEventType();
  const { items: packageItems, addToPackage, removeFromPackage, isInPackage } = usePackage();

  const [step, setStep] = useState("decor");
  const [decorCatalog, setDecorCatalog] = useState([]);
  const [includedActivityIds, setIncludedActivityIds] = useState([]);
  const [addonActivityIds, setAddonActivityIds] = useState([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [digitalIds, setDigitalIds] = useState([]);
  const [keepsakeId, setKeepsakeId] = useState("readyToPop");
  const [guestCount, setGuestCount] = useState(DEFAULT_GUEST_COUNT);
  const [displayId, setDisplayId] = useState(null);
  const [displaySetupId, setDisplaySetupId] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("items")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (!cancelled && !error) setDecorCatalog(data || []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addedDecor = useMemo(
    () =>
      packageItems
        .map((p) => {
          const item = decorCatalog.find((d) => d.id === p.itemId);
          if (!item) return null;
          const price = p.requestType === "rental" ? item.rental_price : item.purchase_price;
          return { ...p, item, price: price ?? 0 };
        })
        .filter(Boolean),
    [packageItems, decorCatalog]
  );
  const includedDecor = addedDecor.slice(0, INCLUDED_DECOR_COUNT);
  const extraDecor = addedDecor.slice(INCLUDED_DECOR_COUNT);
  const decorOveragePrice = extraDecor.reduce((s, p) => s + p.price, 0);

  // Clicking an activity always selects it somehow: as one of the 3 free
  // included picks if there's room and no exclusivity conflict, otherwise
  // it automatically becomes a paid add-on instead of being blocked.
  const handleActivityClick = (id) => {
    if (includedActivityIds.includes(id)) {
      setIncludedActivityIds((prev) => prev.filter((a) => a !== id));
      return;
    }
    if (addonActivityIds.includes(id)) {
      setAddonActivityIds((prev) => prev.filter((a) => a !== id));
      return;
    }
    const conflict = EXCLUSIVE_ACTIVITY_PAIR.includes(id)
      ? EXCLUSIVE_ACTIVITY_PAIR.find((x) => x !== id)
      : null;
    const blocked =
      includedActivityIds.length >= INCLUDED_ACTIVITY_COUNT || (conflict && includedActivityIds.includes(conflict));
    if (blocked) {
      setAddonActivityIds((prev) => [...prev, id]);
    } else {
      setIncludedActivityIds((prev) => [...prev, id]);
    }
  };

  const toggleAddon = (id) =>
    setSelectedAddonIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  const toggleDigital = (id) =>
    setDigitalIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));

  const selectDisplay = (id) => {
    if (displayId === id) {
      setDisplayId(null);
      setDisplaySetupId(null);
      return;
    }
    setDisplayId(id);
  };

  const toggleDecor = (item) => {
    if (isInPackage(item.id)) {
      removeFromPackage(item.id);
      return;
    }
    const requestType = defaultRequestType(item);
    if (requestType) addToPackage(item.id, requestType);
  };

  const nonDigitalAddons = ADDONS.filter((a) => !DIGITAL_ADDON_IDS.includes(a.id));
  const digitalAddons = ADDONS.filter((a) => DIGITAL_ADDON_IDS.includes(a.id));
  // Story Book Generator is only available as one of the 3 included
  // activities or as the "Custom Story Book" digital upgrade below - never
  // as a generic add-on, so it's left out of this list.
  const remainingActivities = ACTIVITIES.filter(
    (a) => !includedActivityIds.includes(a.id) && !addonActivityIds.includes(a.id) && a.id !== "storybook"
  );
  const hasPictureThis = includedActivityIds.includes("pictureThis") || addonActivityIds.includes("pictureThis");
  const hasStorybook = includedActivityIds.includes("storybook");

  const keepsake = KEEPSAKES.find((k) => k.id === keepsakeId) || KEEPSAKES[0];
  const overageGuests = Math.max(0, guestCount - INCLUDED_GUEST_COUNT);
  const keepsakePrice = keepsake.upgradePrice + overageGuests * keepsake.overagePricePerGuest;
  const displaySetup = DISPLAY_SETUP_OPTIONS.find((s) => s.id === displaySetupId);
  const displayPrice = displayId && displaySetup ? displaySetup.price : 0;

  const total = useMemo(() => {
    let sum = MADE_FOR_MEMORIES_PRICE;
    sum += decorOveragePrice;
    sum += addonActivityIds.length * ACTIVITY_ADDON_PRICE;
    sum += selectedAddonIds.reduce((s, id) => s + (nonDigitalAddons.find((a) => a.id === id)?.price || 0), 0);
    sum += digitalIds.reduce((s, id) => {
      if (id === "customStoryBook") return s + CUSTOM_STORY_BOOK_PRICE;
      return s + (digitalAddons.find((a) => a.id === id)?.price || 0);
    }, 0);
    sum += keepsakePrice;
    sum += displayPrice;
    return sum;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decorOveragePrice, addonActivityIds, selectedAddonIds, digitalIds, keepsakePrice, displayPrice]);

  return (
    <div className="min-h-screen pb-32" style={{ background: palette.bg, color: palette.ink }}>
      <div className="px-6 py-14 text-center" style={{ background: palette.primaryDeep }}>
        <p className="text-xs tracking-[0.3em] font-semibold" style={{ ...fonts.bodyFont, color: palette.gold }}>
          A CURATED {eventType.label.toUpperCase()} EXPERIENCE
        </p>
        <h1 className="mt-2 text-5xl sm:text-6xl font-semibold" style={{ ...fonts.displayFont, color: "#FFFFFF" }}>
          Build Your Package.
        </h1>
        <p className="mt-1 text-2xl italic" style={{ ...fonts.scriptFont, color: palette.accent }}>
          {PACKAGE_NAME}, made your own.
        </p>
        <p className="mt-4 text-xs tracking-widest" style={{ ...fonts.bodyFont, color: "#FFFFFF99" }}>
          BASE PACKAGE ${MADE_FOR_MEMORIES_PRICE} - {INCLUDED_DECOR_COUNT} DECOR PIECES + {INCLUDED_ACTIVITY_COUNT} ACTIVITIES INCLUDED
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <StepNav step={step} setStep={setStep} palette={palette} fonts={fonts} />

        {step === "decor" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>Choose Your Decor</SectionTitle>
            <p className="text-sm mb-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              {includedDecor.length} of {INCLUDED_DECOR_COUNT} included free.{" "}
              {extraDecor.length > 0 && `${extraDecor.length} beyond that at their normal price ($${decorOveragePrice}).`}{" "}
              You can also add pieces directly from the Decor page - anything added there shows up here too.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {decorCatalog.map((item) => {
                const inPkg = isInPackage(item.id);
                const orderIndex = addedDecor.findIndex((p) => p.itemId === item.id);
                const included = inPkg && orderIndex < INCLUDED_DECOR_COUNT;
                const price = addedDecor.find((p) => p.itemId === item.id)?.price;
                return (
                  <FeatureCard
                    key={item.id}
                    icon={Package}
                    name={item.name}
                    tagline={item.size || ""}
                    description={item.description || ""}
                    photoUrl={firstPhoto(item.photos)}
                    priceLabel={inPkg ? (included ? "Included" : `+$${price}`) : defaultRequestType(item) ? `$${price ?? item.rental_price ?? item.purchase_price}` : "Inquire"}
                    selected={inPkg}
                    onClick={() => toggleDecor(item)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {step === "activities" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>Choose Your Activities</SectionTitle>
            <p className="text-sm mb-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              {includedActivityIds.length} of {INCLUDED_ACTIVITY_COUNT} included free. Picture This and the Story
              Book Generator can't both be free picks - choosing both moves the second to a paid add-on
              (+${ACTIVITY_ADDON_PRICE}).
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ACTIVITIES.map((raw) => {
                const activity = resolvePackageItem(raw, eventTypeId);
                const included = includedActivityIds.includes(raw.id);
                const isAddon = addonActivityIds.includes(raw.id);
                return (
                  <FeatureCard
                    key={raw.id}
                    icon={activity.icon}
                    name={activity.name}
                    tagline={activity.tagline}
                    description={activity.description}
                    photoUrls={activity.photoUrls}
                    priceLabel={included ? "Included" : isAddon ? `+$${ACTIVITY_ADDON_PRICE}` : undefined}
                    selected={included || isAddon}
                    onClick={() => handleActivityClick(raw.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {step === "addons" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>Select Add-Ons</SectionTitle>
            <p className="text-sm mb-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Anything from the decor catalog or activities beyond your included picks, plus extras like Voice Notes.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingActivities.map((raw) => {
                const activity = resolvePackageItem(raw, eventTypeId);
                return (
                  <FeatureCard
                    key={raw.id}
                    icon={activity.icon}
                    name={activity.name}
                    tagline={activity.tagline}
                    description={activity.description}
                    photoUrls={activity.photoUrls}
                    priceLabel={`+$${ACTIVITY_ADDON_PRICE}`}
                    selected={addonActivityIds.includes(raw.id)}
                    onClick={() => handleActivityClick(raw.id)}
                  />
                );
              })}
              {nonDigitalAddons.map((a) => (
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
        )}

        {step === "digital" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>Upgrade Your Digital Experience</SectionTitle>
            <p className="text-sm mb-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Tech extras, not included anywhere else in the package.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {digitalAddons.map((a) => {
                const disabled = a.id === "pictureThisDigitalAlbum" && !hasPictureThis;
                return (
                  <FeatureCard
                    key={a.id}
                    icon={a.icon}
                    name={a.name}
                    tagline={disabled ? "Add Picture This first to unlock this upgrade." : a.tagline}
                    description={a.description}
                    photoKey={a.id}
                    photoUrl={a.photoUrl}
                    fit={a.fit}
                    priceLabel={`+$${a.price}`}
                    selected={digitalIds.includes(a.id)}
                    onClick={disabled ? undefined : () => toggleDigital(a.id)}
                  />
                );
              })}
              {!hasStorybook && (
                <FeatureCard
                  icon={ACTIVITIES.find((a) => a.id === "storybook")?.icon}
                  name="Custom Story Book"
                  tagline="Didn't pick this as one of your 3 included activities? Add it here instead."
                  description={resolvePackageItem(ACTIVITIES.find((a) => a.id === "storybook"), eventTypeId).description}
                  priceLabel={`+$${CUSTOM_STORY_BOOK_PRICE}`}
                  selected={digitalIds.includes("customStoryBook")}
                  onClick={() => toggleDigital("customStoryBook")}
                />
              )}
            </div>
          </div>
        )}

        {step === "display" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>Choose a Display</SectionTitle>
            <p className="text-sm mb-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Give your celebration a showstopper backdrop. This is an add-on to any package, same price either way,
              you just pick the setup that fits below.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {DISPLAYS.map((d) => (
                <FeatureCard
                  key={d.id}
                  icon={d.icon}
                  name={d.name}
                  tagline={d.tagline}
                  description={d.description}
                  photoUrl={d.photoUrl}
                  selected={displayId === d.id}
                  onClick={() => selectDisplay(d.id)}
                />
              ))}
            </div>
            {displayId && (
              <>
                <p className="text-sm mb-4 font-semibold" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
                  Setup option
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  {DISPLAY_SETUP_OPTIONS.map((s) => (
                    <FeatureCard
                      key={s.id}
                      icon={Package}
                      name={s.label}
                      description={s.description}
                      priceLabel={`$${s.price}`}
                      selected={displaySetupId === s.id}
                      onClick={() => setDisplaySetupId(s.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Guest keepsake + guest count - always available regardless of step */}
        <div className="mt-14">
          <SectionTitle palette={palette} fonts={fonts}>Choose Your Guest Keepsake</SectionTitle>
          <p className="text-sm mb-5" style={{ ...fonts.bodyFont, color: palette.muted }}>
            The first {INCLUDED_GUEST_COUNT} guests are included with Ready to Pop at no extra charge. Upgrading to
            Lil Roots for those same {INCLUDED_GUEST_COUNT} guests is a flat +${KEEPSAKES.find((k) => k.id === "lilRoots")?.upgradePrice}.
            Beyond {INCLUDED_GUEST_COUNT} guests, it's ${KEEPSAKES.find((k) => k.id === "readyToPop")?.overagePricePerGuest}/guest for Ready to
            Pop or ${KEEPSAKES.find((k) => k.id === "lilRoots")?.overagePricePerGuest}/guest for Lil Roots.
          </p>
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
                priceLabel={k.upgradePrice > 0 ? `+$${k.upgradePrice}` : "Included"}
                selected={keepsakeId === k.id}
                onClick={() => setKeepsakeId(k.id)}
              />
            ))}
          </div>
        </div>

        {addedDecor.length > 0 && (
          <div className="mt-14">
            <SectionTitle palette={palette} fonts={fonts}>Your Package So Far</SectionTitle>
            <div className="space-y-3">
              {addedDecor.map((p, i) => (
                <div
                  key={p.itemId}
                  className="flex items-center justify-between rounded-xl p-4"
                  style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
                      {p.item.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ ...fonts.bodyFont, color: palette.muted }}>
                      {i < INCLUDED_DECOR_COUNT ? "Included" : `+$${p.price}`} · {p.requestType === "rental" ? "Rent" : "Purchase"}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromPackage(p.itemId)}
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ color: palette.muted }}
                    aria-label={`Remove ${p.item.name}`}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky total */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4" style={{ background: palette.surface, borderTop: `1px solid ${palette.line}` }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs tracking-widest" style={{ ...fonts.bodyFont, color: palette.muted }}>YOUR TOTAL</p>
            <p className="text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>${total.toLocaleString()}</p>
          </div>
          <button
            disabled={Boolean(displayId) && !displaySetupId}
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
