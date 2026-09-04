import React, { useMemo, useState, useEffect } from "react";
import { Users, X, Package } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import { supabase } from "../supabaseClient";
import FeatureCard from "../components/FeatureCard";
import {
  MAIN_PACKAGE_ITEMS,
  SETUP_ONLY_ITEMS,
  ADDONS,
  KEEPSAKES,
  DIGITAL_ADDON_IDS,
  CUSTOM_STORY_BOOK_PRICE,
  MADE_FOR_MEMORIES_PRICE,
  DEFAULT_GUEST_COUNT,
  PACKAGE_NAME,
  SETUP_STEP_1_IDS,
  SETUP_STEP_2_IDS,
  SETUP_INCLUDED_COUNT,
  SETUP_ADDON_PRICE,
  SETUP_ADDON_PRICE_OVERRIDES,
  CENTERPIECE_LARGE_CATALOG_NAME,
  DISPLAYS,
  DISPLAY_SETUP_OPTIONS,
  resolvePackageItem,
} from "../packageContent";

const STEPS = [
  { id: "setup1", label: "Choose Your Setup" },
  { id: "setup2", label: "Choose More Setup" },
  { id: "guestGift", label: "Choose a Guest Gift" },
  { id: "addons", label: "Select Add-Ons" },
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

function normalizePhotos(photos) {
  if (!Array.isArray(photos)) return [];
  return photos.map((p) => (typeof p === "string" ? p : p?.url)).filter(Boolean);
}

// Resolves any Setup pool id to a normalized render shape, whatever its
// source: the live decor catalog (centerpieceLarge only), the fixed
// MAIN_PACKAGE_ITEMS / SETUP_ONLY_ITEMS lists, or an ADDONS entry reused
// as a free-pick candidate (guessArrival, nurseryRhyme). Returns null if
// centerpieceLarge can't be found in the live catalog yet.
function resolveSetupItem(id, eventTypeId, decorCatalog) {
  if (id === "centerpieceLarge") {
    const item = decorCatalog.find((d) => d.name === CENTERPIECE_LARGE_CATALOG_NAME);
    if (!item) return null;
    return {
      id,
      icon: Package,
      name: item.name,
      tagline: item.size || "",
      description: item.description || "",
      photoUrls: normalizePhotos(item.photos),
      addonPrice: item.rental_price ?? item.purchase_price ?? SETUP_ADDON_PRICE,
    };
  }
  const staticItem = MAIN_PACKAGE_ITEMS.find((m) => m.id === id) || SETUP_ONLY_ITEMS.find((m) => m.id === id);
  if (staticItem) {
    const resolved = resolvePackageItem(staticItem, eventTypeId);
    return { ...resolved, addonPrice: SETUP_ADDON_PRICE_OVERRIDES[id] ?? SETUP_ADDON_PRICE };
  }
  const addon = ADDONS.find((a) => a.id === id);
  if (addon) {
    return {
      id,
      icon: addon.icon,
      name: addon.name,
      tagline: addon.tagline,
      description: addon.description,
      photoUrls: addon.photoUrl ? [addon.photoUrl] : [],
      addonPrice: SETUP_ADDON_PRICE_OVERRIDES[id] ?? addon.price ?? SETUP_ADDON_PRICE,
    };
  }
  return null;
}

export default function PackageBuilder() {
  const { palette, fonts } = usePalette();
  const { eventTypeId, eventType } = useEventType();

  const [step, setStep] = useState("setup1");
  const [decorCatalog, setDecorCatalog] = useState([]);

  // One shared array for any Setup pool item bought as a paid add-on,
  // whichever step it was clicked from - keeps an item from ever being
  // offered twice once it's accounted for.
  const [setupIncludedIds1, setSetupIncludedIds1] = useState([]);
  const [setupIncludedIds2, setSetupIncludedIds2] = useState([]);
  const [setupAddonIds, setSetupAddonIds] = useState([]);

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
      .then(({ data, error }) => {
        if (!cancelled && !error) setDecorCatalog(data || []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Clicking a Setup item always selects it somehow: as one of that step's
  // 3 free included picks if there's room, otherwise it automatically
  // becomes a paid add-on instead of being blocked.
  const makeSetupHandler = (includedIds, setIncludedIds) => (id) => {
    if (includedIds.includes(id)) {
      setIncludedIds((prev) => prev.filter((x) => x !== id));
      return;
    }
    if (setupAddonIds.includes(id)) {
      setSetupAddonIds((prev) => prev.filter((x) => x !== id));
      return;
    }
    if (includedIds.length >= SETUP_INCLUDED_COUNT) {
      setSetupAddonIds((prev) => [...prev, id]);
    } else {
      setIncludedIds((prev) => [...prev, id]);
    }
  };
  const handleSetup1Click = makeSetupHandler(setupIncludedIds1, setSetupIncludedIds1);
  const handleSetup2Click = makeSetupHandler(setupIncludedIds2, setSetupIncludedIds2);
  const toggleSetupAddon = (id) =>
    setSetupAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const removeSetupPick = (id) => {
    if (setupIncludedIds1.includes(id)) return setSetupIncludedIds1((prev) => prev.filter((x) => x !== id));
    if (setupIncludedIds2.includes(id)) return setSetupIncludedIds2((prev) => prev.filter((x) => x !== id));
    if (setupAddonIds.includes(id)) return setSetupAddonIds((prev) => prev.filter((x) => x !== id));
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

  const step1Items = useMemo(
    () => SETUP_STEP_1_IDS.map((id) => resolveSetupItem(id, eventTypeId, decorCatalog)).filter(Boolean),
    [eventTypeId, decorCatalog]
  );
  const step2Items = useMemo(
    () =>
      SETUP_STEP_2_IDS.filter((id) => !setupIncludedIds1.includes(id) && !setupAddonIds.includes(id))
        .map((id) => resolveSetupItem(id, eventTypeId, decorCatalog))
        .filter(Boolean),
    [eventTypeId, decorCatalog, setupIncludedIds1, setupAddonIds]
  );
  const allSetupIds = useMemo(
    () => Array.from(new Set([...SETUP_STEP_1_IDS, ...SETUP_STEP_2_IDS])),
    []
  );
  const remainingSetupIds = allSetupIds.filter(
    (id) => !setupIncludedIds1.includes(id) && !setupIncludedIds2.includes(id) && !setupAddonIds.includes(id)
  );

  const hasPictureThis = setupIncludedIds1.includes("pictureThis") || setupAddonIds.includes("pictureThis");

  const nonDigitalAddons = ADDONS.filter(
    (a) => !DIGITAL_ADDON_IDS.includes(a.id) && a.id !== "guessArrival" && a.id !== "nurseryRhyme"
  );
  const digitalAddons = ADDONS.filter((a) => DIGITAL_ADDON_IDS.includes(a.id));

  const setupOverageTotal = useMemo(
    () =>
      setupAddonIds.reduce((sum, id) => {
        const resolved = resolveSetupItem(id, eventTypeId, decorCatalog);
        return sum + (resolved?.addonPrice ?? SETUP_ADDON_PRICE);
      }, 0),
    [setupAddonIds, eventTypeId, decorCatalog]
  );

  const keepsake = KEEPSAKES.find((k) => k.id === keepsakeId) || KEEPSAKES[0];
  const overageGuests = Math.max(0, guestCount - keepsake.includedGuestCount);
  const keepsakePrice = keepsake.upgradePrice + overageGuests * keepsake.overagePricePerGuest;
  const displaySetup = DISPLAY_SETUP_OPTIONS.find((s) => s.id === displaySetupId);
  const displayPrice = displayId && displaySetup ? displaySetup.price : 0;

  const total = useMemo(() => {
    let sum = MADE_FOR_MEMORIES_PRICE;
    sum += setupOverageTotal;
    sum += selectedAddonIds.reduce((s, id) => s + (nonDigitalAddons.find((a) => a.id === id)?.price || 0), 0);
    sum += digitalIds.reduce((s, id) => {
      if (id === "customStoryBook") return s + CUSTOM_STORY_BOOK_PRICE;
      return s + (digitalAddons.find((a) => a.id === id)?.price || 0);
    }, 0);
    sum += keepsakePrice;
    sum += displayPrice;
    return sum;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupOverageTotal, selectedAddonIds, digitalIds, keepsakePrice, displayPrice]);

  const storybookItem = MAIN_PACKAGE_ITEMS.find((m) => m.id === "storybook");

  const summaryPicks = [
    ...setupIncludedIds1.map((id) => ({ id, included: true })),
    ...setupIncludedIds2.map((id) => ({ id, included: true })),
    ...setupAddonIds.map((id) => ({ id, included: false })),
  ];

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
          BASE PACKAGE ${MADE_FOR_MEMORIES_PRICE} - {SETUP_INCLUDED_COUNT} + {SETUP_INCLUDED_COUNT} SETUP PIECES INCLUDED
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <StepNav step={step} setStep={setStep} palette={palette} fonts={fonts} />

        {step === "setup1" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>Choose Your Setup</SectionTitle>
            <p className="text-sm mb-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              {setupIncludedIds1.length} of {SETUP_INCLUDED_COUNT} included free. Anything beyond that becomes a paid
              add-on at its own price.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {step1Items.map((item) => {
                const included = setupIncludedIds1.includes(item.id);
                const isAddon = setupAddonIds.includes(item.id);
                return (
                  <FeatureCard
                    key={item.id}
                    icon={item.icon}
                    name={item.name}
                    tagline={item.tagline}
                    description={item.description}
                    photoUrls={item.photoUrls}
                    priceLabel={included ? "Included" : isAddon ? `+$${item.addonPrice}` : undefined}
                    selected={included || isAddon}
                    onClick={() => handleSetup1Click(item.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {step === "setup2" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>Choose More Setup</SectionTitle>
            <p className="text-sm mb-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              {setupIncludedIds2.length} of {SETUP_INCLUDED_COUNT} included free. Anything you already picked in Step
              1 won't show up here again.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {step2Items.map((item) => {
                const included = setupIncludedIds2.includes(item.id);
                const isAddon = setupAddonIds.includes(item.id);
                return (
                  <FeatureCard
                    key={item.id}
                    icon={item.icon}
                    name={item.name}
                    tagline={item.tagline}
                    description={item.description}
                    photoUrls={item.photoUrls}
                    priceLabel={included ? "Included" : isAddon ? `+$${item.addonPrice}` : undefined}
                    selected={included || isAddon}
                    onClick={() => handleSetup2Click(item.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {step === "guestGift" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>Choose a Guest Gift</SectionTitle>
            <p className="text-sm mb-5" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Every package includes a guest gift. Each option has its own included guest count, guests beyond that
              are billed per guest.
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {KEEPSAKES.map((k) => (
                <FeatureCard
                  key={k.id}
                  icon={k.icon}
                  name={k.name}
                  tagline={`${k.tagline} Included for your first ${k.includedGuestCount} guests, then $${k.overagePricePerGuest}/guest after that.`}
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
        )}

        {step === "addons" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>Select Add-Ons</SectionTitle>
            <p className="text-sm mb-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Anything from Setup beyond your included picks, plus extras like Voice Notes and the Digital Photo
              Album.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingSetupIds.map((id) => {
                const item = resolveSetupItem(id, eventTypeId, decorCatalog);
                if (!item) return null;
                return (
                  <FeatureCard
                    key={id}
                    icon={item.icon}
                    name={item.name}
                    tagline={item.tagline}
                    description={item.description}
                    photoUrls={item.photoUrls}
                    priceLabel={`+$${item.addonPrice}`}
                    selected={setupAddonIds.includes(id)}
                    onClick={() => toggleSetupAddon(id)}
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
              {storybookItem && (
                <FeatureCard
                  icon={storybookItem.icon}
                  name="Custom Story Book"
                  tagline="Every guest contributes a page to a keepsake storybook."
                  description={resolvePackageItem(storybookItem, eventTypeId).description}
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

        {summaryPicks.length > 0 && (
          <div className="mt-14">
            <SectionTitle palette={palette} fonts={fonts}>Your Package So Far</SectionTitle>
            <div className="space-y-3">
              {summaryPicks.map(({ id, included }) => {
                const item = resolveSetupItem(id, eventTypeId, decorCatalog);
                if (!item) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between rounded-xl p-4"
                    style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ ...fonts.bodyFont, color: palette.primaryDeep }}>
                        {item.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ ...fonts.bodyFont, color: palette.muted }}>
                        {included ? "Included" : `+$${item.addonPrice}`}
                      </p>
                    </div>
                    <button
                      onClick={() => removeSetupPick(id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ color: palette.muted }}
                      aria-label={`Remove ${item.name}`}
                    >
                      <X size={15} />
                    </button>
                  </div>
                );
              })}
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
