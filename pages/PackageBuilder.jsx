import React, { useMemo, useState, useEffect, useRef } from "react";
import { Users, X, Package, CalendarDays } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import { useEventDate } from "../EventDateContext";
import { supabase } from "../supabaseClient";
import FeatureCard from "../components/FeatureCard";
import PackageRequestModal from "../components/PackageRequestModal";
import { getEventConfig } from "../eventConfig";
import {
  MAIN_PACKAGE_ITEMS,
  SETUP_ONLY_ITEMS,
  ADDONS,
  KEEPSAKES,
  DIGITAL_ADDON_IDS,
  DEFAULT_GUEST_COUNT,
  SETUP_ADDON_PRICE,
  PLAYFUL_ADDON_IDS,
  PLAYFUL_ADDON_PRICE,
  CENTERPIECE_LARGE_CATALOG_NAME,
  CUSTOM_SERVING_DISH,
  DISPLAYS,
  DISPLAY_SETUP_OPTIONS,
  SERVICE_STYLE_OPTIONS,
  HST_RATE,
  resolvePackageItem,
  resolveKeepsakeName,
} from "../packageContent";

function SectionTitle({ children, palette, fonts }) {
  return (
    <h2 className="text-2xl font-semibold mb-4" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
      {children}
    </h2>
  );
}

function StepNav({ steps, step, setStep, palette, fonts }) {
  const currentIndex = steps.findIndex((s) => s.id === step);
  return (
    <div className="flex flex-wrap items-center gap-3 mb-10">
      {steps.map((s, i) => {
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
            {i < steps.length - 1 && <span className="w-6 h-px" style={{ background: palette.line }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Games and experiences get "VIEW ACTIVITY" on their detail button, decor
// pieces and logistical add-ons get the more generic "VIEW MORE".
const ACTIVITY_TYPE_IDS = new Set([
  "pictureThis",
  "kindnessStation",
  "storybook",
  "babyTrivia",
  "wallPuzzle",
  "timeCapsule",
  "babyNaptimeRelay",
  "priceIsRight",
  "photoChallenge",
  "guessArrival",
]);
function viewMoreLabelFor(id) {
  return ACTIVITY_TYPE_IDS.has(id) ? "VIEW ACTIVITY" : "VIEW MORE";
}

function normalizePhotos(photos) {
  if (!Array.isArray(photos)) return [];
  return photos.map((p) => (typeof p === "string" ? p : p?.url)).filter(Boolean);
}

// Resolves any pool id (or the Custom Serving Dish) to a normalized render
// shape, whatever its source: the live decor catalog (centerpieceLarge
// only), the fixed MAIN_PACKAGE_ITEMS / SETUP_ONLY_ITEMS lists, or an
// ADDONS entry reused as a free-pick pool candidate (nurseryRhyme / Custom
// Art Piece). Returns null if centerpieceLarge can't be found in the live
// catalog yet.
function resolveSetupItem(id, eventTypeId, decorCatalog) {
  if (id === "centerpieceLarge") {
    const item = decorCatalog.find((d) => d.name === CENTERPIECE_LARGE_CATALOG_NAME);
    const fallbackPhotoUrls = (() => {
      const raw = CUSTOM_SERVING_DISH.photos[eventTypeId] ?? CUSTOM_SERVING_DISH.photos.default ?? null;
      return (Array.isArray(raw) ? raw : raw ? [raw] : []).filter(Boolean);
    })();
    if (!item) {
      return {
        id,
        icon: CUSTOM_SERVING_DISH.icon,
        name: CUSTOM_SERVING_DISH.name,
        tagline: CUSTOM_SERVING_DISH.tagline,
        description: CUSTOM_SERVING_DISH.description,
        photoUrls: fallbackPhotoUrls,
        details: CUSTOM_SERVING_DISH.details,
        addonPrice: null,
      };
    }
    return {
      id,
      icon: Package,
      name: item.name,
      tagline: item.size || "",
      description: item.description || CUSTOM_SERVING_DISH.description,
      photoUrls: normalizePhotos(item.photos).length ? normalizePhotos(item.photos) : fallbackPhotoUrls,
      details: CUSTOM_SERVING_DISH.details,
      addonPrice: item.rental_price ?? item.purchase_price ?? SETUP_ADDON_PRICE,
    };
  }
  const staticItem = MAIN_PACKAGE_ITEMS.find((m) => m.id === id) || SETUP_ONLY_ITEMS.find((m) => m.id === id);
  if (staticItem) {
    const resolved = resolvePackageItem(staticItem, eventTypeId);
    return { ...resolved, addonPrice: SETUP_ADDON_PRICE };
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
      addonPrice: addon.price ?? SETUP_ADDON_PRICE,
      details: addon.details,
    };
  }
  return null;
}

export default function PackageBuilder() {
  const { palette, fonts } = usePalette();
  const { eventTypeId, eventType } = useEventType();
  const { hasEventDate, requestEventDate } = useEventDate();
  const eventConfig = useMemo(() => getEventConfig(eventTypeId), [eventTypeId]);
  const poolSteps = useMemo(() => eventConfig.steps.filter((s) => s.type === "pool"), [eventConfig]);

  const [step, setStep] = useState(eventConfig.steps[0].id);
  const [decorCatalog, setDecorCatalog] = useState([]);
  const [notice, setNotice] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Keyed by pool step id (e.g. "playConnect"/"createKeep" for Baby Shower,
  // "experiences" for every other event type) -> array of included ids.
  const [poolSelections, setPoolSelections] = useState({});
  // Flat since ids are unique within one event's active pools - any pool
  // pick beyond its step's chooseCount becomes a paid "Additional Keepsake
  // Experience" here instead.
  const [poolOverflowIds, setPoolOverflowIds] = useState([]);
  // "Want Something Playful?" step picks (+$125 each) - every event type
  // except Baby Shower, which already has games inside Play & Connect.
  const [playfulIds, setPlayfulIds] = useState([]);
  const [servingDishIncluded, setServingDishIncluded] = useState(false);

  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [digitalIds, setDigitalIds] = useState([]);
  const [keepsakeId, setKeepsakeId] = useState(eventConfig.guestGiftDefaultId);
  const [guestCount, setGuestCount] = useState(DEFAULT_GUEST_COUNT);
  const [serviceStyleId, setServiceStyleId] = useState("self");
  const [displayId, setDisplayId] = useState(null);
  const [displaySetupId, setDisplaySetupId] = useState(null);

  // Switching event type mid-build changes the entire pricing/pool shape,
  // so the build resets rather than carrying over selections that may not
  // even exist in the new event's pools.
  const prevEventTypeId = useRef(eventTypeId);
  useEffect(() => {
    if (prevEventTypeId.current === eventTypeId) return;
    prevEventTypeId.current = eventTypeId;
    setStep(eventConfig.steps[0].id);
    setPoolSelections({});
    setPoolOverflowIds([]);
    setPlayfulIds([]);
    setServingDishIncluded(false);
    setSelectedAddonIds([]);
    setDigitalIds([]);
    setKeepsakeId(eventConfig.guestGiftDefaultId);
    setDisplayId(null);
    setDisplaySetupId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTypeId]);

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

  // The event date needs to be on file before anyone starts building, so
  // availability checks against it actually mean something. Prompts once,
  // right away, if it isn't set yet.
  useEffect(() => {
    if (!hasEventDate) requestEventDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  // Clicking an already-selected item removes it. Clicking a new one fills
  // an included slot if there's room; once a step's included slots are
  // full, further items are only added as paid "Additional Keepsake
  // Experience" picks from Make It Yours, not from here - clicking a new
  // one here just shows a notice.
  const makePoolHandler = (poolId, chooseCount) => (id) => {
    const included = poolSelections[poolId] || [];
    if (included.includes(id)) {
      setPoolSelections((prev) => ({ ...prev, [poolId]: prev[poolId].filter((x) => x !== id) }));
      return;
    }
    if (poolOverflowIds.includes(id)) {
      setPoolOverflowIds((prev) => prev.filter((x) => x !== id));
      return;
    }
    if (included.length >= chooseCount) {
      setNotice("Please remove one of your options to add this option.");
      return;
    }
    setPoolSelections((prev) => ({ ...prev, [poolId]: [...included, id] }));
  };
  const togglePoolOverflow = (id) =>
    setPoolOverflowIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const removePoolPick = (id) => {
    for (const poolStep of poolSteps) {
      if ((poolSelections[poolStep.id] || []).includes(id)) {
        setPoolSelections((prev) => ({ ...prev, [poolStep.id]: prev[poolStep.id].filter((x) => x !== id) }));
        return;
      }
    }
    if (poolOverflowIds.includes(id)) setPoolOverflowIds((prev) => prev.filter((x) => x !== id));
  };

  const togglePlayful = (id) =>
    setPlayfulIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

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

  const poolItemsFor = (poolStep) =>
    poolStep.poolIds.map((id) => resolveSetupItem(id, eventTypeId, decorCatalog)).filter(Boolean);

  const allPoolIds = useMemo(() => Array.from(new Set(poolSteps.flatMap((s) => s.poolIds))), [poolSteps]);
  const remainingPoolIds = allPoolIds.filter(
    (id) => !poolSteps.some((s) => (poolSelections[s.id] || []).includes(id)) && !poolOverflowIds.includes(id)
  );

  const hasPictureThis =
    poolSteps.some((s) => (poolSelections[s.id] || []).includes("pictureThis")) || poolOverflowIds.includes("pictureThis");

  const nonDigitalAddons = ADDONS.filter(
    (a) => !DIGITAL_ADDON_IDS.includes(a.id) && a.id !== "nurseryRhyme"
  );
  const digitalAddons = ADDONS.filter((a) => DIGITAL_ADDON_IDS.includes(a.id));

  const poolOverflowTotal = useMemo(
    () =>
      poolOverflowIds.reduce((sum, id) => {
        const resolved = resolveSetupItem(id, eventTypeId, decorCatalog);
        return sum + (resolved?.addonPrice ?? SETUP_ADDON_PRICE);
      }, 0),
    [poolOverflowIds, eventTypeId, decorCatalog]
  );

  const servingDish = useMemo(() => resolveSetupItem("centerpieceLarge", eventTypeId, decorCatalog), [eventTypeId, decorCatalog]);
  const servingDishPrice = servingDishIncluded ? servingDish?.addonPrice ?? 0 : 0;

  const playfulTotal = playfulIds.length * PLAYFUL_ADDON_PRICE;

  const keepsake = KEEPSAKES.find((k) => k.id === keepsakeId) || KEEPSAKES[0];
  const overageGuests = Math.max(0, guestCount - keepsake.includedGuestCount);
  const keepsakePrice = keepsake.upgradePrice + overageGuests * keepsake.overagePricePerGuest;
  const displaySetup = DISPLAY_SETUP_OPTIONS.find((s) => s.id === displaySetupId);
  const displayPrice = displayId && displaySetup ? displaySetup.price : 0;
  const serviceStyle = SERVICE_STYLE_OPTIONS.find((s) => s.id === serviceStyleId) || SERVICE_STYLE_OPTIONS[0];

  const subtotal = useMemo(() => {
    let sum = eventConfig.startingPrice;
    sum += poolOverflowTotal;
    sum += playfulTotal;
    sum += servingDishPrice;
    sum += selectedAddonIds.reduce((s, id) => s + (nonDigitalAddons.find((a) => a.id === id)?.price || 0), 0);
    sum += digitalIds.reduce((s, id) => s + (digitalAddons.find((a) => a.id === id)?.price || 0), 0);
    sum += keepsakePrice;
    sum += displayPrice;
    sum += serviceStyle.price;
    return sum;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventConfig, poolOverflowTotal, playfulTotal, servingDishPrice, selectedAddonIds, digitalIds, keepsakePrice, displayPrice, serviceStyle]);

  const hst = subtotal * HST_RATE;
  const total = subtotal + hst;

  const summaryPicks = [
    ...poolSteps.flatMap((s) => (poolSelections[s.id] || []).map((id) => ({ id, included: true }))),
    ...poolOverflowIds.map((id) => ({ id, included: false })),
  ];

  const steps = eventConfig.steps;
  const stepIndex = steps.findIndex((s) => s.id === step);
  const currentStep = steps[stepIndex] || steps[0];
  const isLastStep = stepIndex === steps.length - 1;
  const goToNextStep = () => {
    if (!isLastStep) setStep(steps[stepIndex + 1].id);
  };
  const displayIncomplete = Boolean(displayId) && !displaySetupId;

  if (!hasEventDate) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6" style={{ background: palette.bg }}>
        <div className="max-w-md text-center">
          <CalendarDays className="mx-auto" size={26} strokeWidth={1.3} style={{ color: palette.gold }} />
          <h1 className="mt-4 text-3xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
            Let's start with your date.
          </h1>
          <p className="mt-3 text-sm leading-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
            We check everything in your package against your event date before you build it, so we need that first.
          </p>
          <button
            onClick={() => requestEventDate()}
            className="mt-6 rounded-full px-8 py-3 text-xs font-semibold tracking-widest text-white"
            style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
          >
            CHOOSE YOUR EVENT DATE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32" style={{ background: palette.bg, color: palette.ink }}>
      <div className="px-6 py-14 text-center" style={{ background: palette.primaryDeep }}>
        <p className="text-xs tracking-[0.3em] font-semibold" style={{ ...fonts.bodyFont, color: palette.gold }}>
          A CURATED {eventType.label.toUpperCase()} EXPERIENCE
        </p>
        <h1 className="mt-2 text-5xl sm:text-6xl font-semibold" style={{ ...fonts.displayFont, color: "#FFFFFF" }}>
          Build My Experience.
        </h1>
        <p className="mt-1 text-2xl italic" style={{ ...fonts.scriptFont, color: palette.accent }}>
          Choose the experiences that fit your celebration, your people, and the memories you want to make.
        </p>
        <p className="mt-4 text-xs tracking-widest" style={{ ...fonts.bodyFont, color: "#FFFFFF99" }}>
          STARTING AT ${eventConfig.startingPrice.toLocaleString()} + HST
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <StepNav steps={steps} step={step} setStep={setStep} palette={palette} fonts={fonts} />

        {currentStep.type === "pool" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>{currentStep.label}</SectionTitle>
            <p className="text-sm mb-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              {currentStep.supportingCopy} {(poolSelections[currentStep.id] || []).length} of {currentStep.chooseCount} selected.
              Want more? Add the rest as an Additional Keepsake Experience in Make It Yours.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {poolItemsFor(currentStep).map((item) => {
                const included = (poolSelections[currentStep.id] || []).includes(item.id);
                const isAddon = poolOverflowIds.includes(item.id);
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
                    onClick={() => makePoolHandler(currentStep.id, currentStep.chooseCount)(item.id)}
                    details={item.details}
                    viewMoreLabel={viewMoreLabelFor(item.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {currentStep.type === "guestGift" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>Choose a Guest Gift</SectionTitle>
            <p className="text-sm mb-5" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Send your guests home with a little something to remember the day by. Every package includes a guest
              gift, upgrade if you'd like something different.
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
                  name={resolveKeepsakeName(k, eventTypeId)}
                  tagline={`${k.tagline} Included for your first ${k.includedGuestCount} guests, then $${k.overagePricePerGuest}/guest after that.`}
                  description={k.description}
                  photoKey={k.id}
                  photoUrl={k.photoUrl}
                  priceLabel={k.upgradePrice > 0 ? `+$${k.upgradePrice}` : "Included"}
                  selected={keepsakeId === k.id}
                  onClick={() => setKeepsakeId(k.id)}
                  details={k.details}
                />
              ))}
            </div>
          </div>
        )}

        {currentStep.type === "addons" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>Make It Yours</SectionTitle>
            <p className="text-sm mb-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Add the little details that make your experience feel like yours: another keepsake experience,
              customization, or a piece for the table.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {servingDish && (
                <FeatureCard
                  key="centerpieceLarge"
                  icon={servingDish.icon}
                  name={servingDish.name}
                  tagline={servingDish.tagline}
                  description={servingDish.description}
                  photoUrls={servingDish.photoUrls}
                  priceLabel={servingDish.addonPrice ? `+$${servingDish.addonPrice}` : undefined}
                  selected={servingDishIncluded}
                  onClick={() => setServingDishIncluded((v) => !v)}
                  details={servingDish.details}
                  viewMoreLabel="VIEW MORE"
                />
              )}
              {remainingPoolIds.map((id) => {
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
                    priceLabel={`Additional Keepsake Experience +$${item.addonPrice}`}
                    selected={poolOverflowIds.includes(id)}
                    onClick={() => togglePoolOverflow(id)}
                    details={item.details}
                    viewMoreLabel={viewMoreLabelFor(id)}
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
                  details={a.details}
                  viewMoreLabel={viewMoreLabelFor(a.id)}
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
                    details={a.details}
                  />
                );
              })}
            </div>
          </div>
        )}

        {currentStep.type === "playful" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>Want Something Playful?</SectionTitle>
            <p className="text-sm mb-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Add a game that gets everyone talking, laughing, and competing. Each playful add-on is +${PLAYFUL_ADDON_PRICE}.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PLAYFUL_ADDON_IDS.map((id) => {
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
                    priceLabel={`+$${PLAYFUL_ADDON_PRICE}`}
                    selected={playfulIds.includes(id)}
                    onClick={() => togglePlayful(id)}
                    details={item.details}
                    viewMoreLabel="VIEW ACTIVITY"
                  />
                );
              })}
            </div>
          </div>
        )}

        {currentStep.type === "service" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>How Involved Do You Want to Be?</SectionTitle>
            <p className="text-sm mb-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Self Setup is for Toronto pickup or Toronto drop-off. Need delivery? Please contact us.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {SERVICE_STYLE_OPTIONS.map((s) => (
                <FeatureCard
                  key={s.id}
                  icon={Package}
                  name={s.label}
                  description={s.description}
                  priceLabel={s.price > 0 ? `+$${s.price}` : "Included"}
                  selected={serviceStyleId === s.id}
                  onClick={() => setServiceStyleId(s.id)}
                />
              ))}
            </div>
          </div>
        )}

        {currentStep.type === "display" && (
          <div>
            <SectionTitle palette={palette} fonts={fonts}>The Memory Display</SectionTitle>
            <p className="text-sm mb-6" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Give the memories a place to shine. No Display is included at no extra charge, this is an optional
              upgrade you can add either way you set up your experience.
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
                  details={d.details}
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
            <SectionTitle palette={palette} fonts={fonts}>Your Experience So Far</SectionTitle>
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
                      onClick={() => removePoolPick(id)}
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

      {notice && (
        <div
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-xs font-semibold tracking-wide text-white shadow-lg"
          style={{ ...fonts.bodyFont, background: palette.ink }}
        >
          {notice}
        </div>
      )}

      {/* Sticky total */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4" style={{ background: palette.surface, borderTop: `1px solid ${palette.line}` }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs tracking-widest" style={{ ...fonts.bodyFont, color: palette.muted }}>
              SUBTOTAL ${subtotal.toLocaleString()} + HST ${hst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <button
            disabled={isLastStep && displayIncomplete}
            onClick={isLastStep ? () => setShowRequestModal(true) : goToNextStep}
            className="px-6 py-3 rounded-full text-xs font-semibold tracking-widest text-white disabled:opacity-30"
            style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
          >
            {isLastStep ? "REQUEST MY EXPERIENCE" : "NEXT"}
          </button>
        </div>
      </div>

      {showRequestModal && (
        <PackageRequestModal
          total={total}
          subtotal={subtotal}
          hst={hst}
          onClose={() => setShowRequestModal(false)}
          summary={{
            eventTypeLabel: eventType.label,
            startingPrice: eventConfig.startingPrice,
            experiences: summaryPicks.map(({ id, included }) => {
              const item = resolveSetupItem(id, eventTypeId, decorCatalog);
              return item ? { name: item.name, included, price: item.addonPrice } : null;
            }).filter(Boolean),
            servingDish: servingDishIncluded && servingDish ? { name: servingDish.name, price: servingDishPrice } : null,
            playful: playfulIds.map((id) => {
              const item = resolveSetupItem(id, eventTypeId, decorCatalog);
              return item ? { name: item.name, price: PLAYFUL_ADDON_PRICE } : null;
            }).filter(Boolean),
            guestGift: { name: resolveKeepsakeName(keepsake, eventTypeId), price: keepsakePrice },
            addons: [
              ...selectedAddonIds.map((id) => {
                const a = nonDigitalAddons.find((x) => x.id === id);
                return a ? { name: a.name, price: a.price } : null;
              }),
              ...digitalIds.map((id) => {
                const a = digitalAddons.find((x) => x.id === id);
                return a ? { name: a.name, price: a.price } : null;
              }),
            ].filter(Boolean),
            serviceStyle: { name: serviceStyle.label, price: serviceStyle.price },
            display: displayId
              ? { name: DISPLAYS.find((d) => d.id === displayId)?.name, setup: displaySetup?.label, price: displayPrice }
              : { name: "No Display", price: 0 },
          }}
        />
      )}
    </div>
  );
}
