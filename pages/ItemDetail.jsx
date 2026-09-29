import React, { useEffect, useState } from "react";
import {
  Box,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers,
  Lightbulb,
  Minus,
  Plus,
  RotateCcw,
  Ruler,
  ShieldCheck,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import {
  getItemFlags,
  isDecorCatalogItem,
  isGiftCatalogItem,
  parseColorOptions,
  parseItemTags,
  sortVariantsByPrice,
} from "../components/DecorCard";
import { normalizePhotos as photoList } from "../components/PhotoCarousel";
import DescriptionBody from "../components/ItemDescription";
import RentalDatesModal from "../components/RentalDatesModal";
import { useRentalFlow, formatRentalDate } from "../useRentalFlow";
import { COMPLETE_LOOK_CONTENTS } from "../completeLooks";
import SeoHead from "../components/SeoHead";
import { useEventType } from "../EventTypeContext";
import { useCart } from "../CartContext";
import { usePalette } from "../PaletteContext";
import { itemAltText, itemSeo, itemUrlPath, parseItemIdFromSlug, productJsonLd } from "../seo";
import { paperTexture, rgba } from "../components/EditorialKit";

function featureIconFor(label = "") {
  const value = String(label).toLowerCase();
  if (value.includes("oven") || value.includes("heat") || value.includes("hot")) return Flame;
  if (value.includes("durable") || value.includes("finish") || value.includes("sturdy")) return ShieldCheck;
  if (value.includes("serve") || value.includes("table") || value.includes("dinner")) return Utensils;
  if (value.includes("rotate") || value.includes("spinning")) return RotateCcw;
  if (value.includes("size") || value.includes("dimension")) return Ruler;
  if (value.includes("material") || value.includes("layer")) return Layers;
  return Sparkles;
}

function splitContentLines(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(/\n+/)
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}

// The routed replacement for the old click-to-open modal: every decor
// piece and every gift/wrap/card item gets a real page at its own URL
// (/decor/<slug> or /gifts/<slug>), so it can be indexed, shared and
// bookmarked on its own, not just glimpsed inside a dialog with no
// address bar footprint. Content and behavior mirror what the modal used
// to show; only the chrome around it changed from an overlay to a page.
export default function ItemDetail({ kind, slug, navigate }) {
  const { palette } = usePalette();
  const { openPickerForBuilder } = useEventType();
  const { addToCart, isInCart, removeFromCart } = useCart();
  const rental = useRentalFlow();

  const [baseItem, setBaseItem] = useState(null);
  const [variants, setVariants] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [detailTab, setDetailTab] = useState("Details");
  const [pairedItems, setPairedItems] = useState([]);

  const id = parseItemIdFromSlug(slug);

  useEffect(() => {
    if (!supabase || !id) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data: row } = await supabase.from("items").select("*").eq("id", id).eq("active", true).maybeSingle();
      if (cancelled) return;

      if (!row) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const group = row.variant_group?.trim();
      if (!group) {
        setVariants(null);
        setBaseItem(row);
        setSelectedId(row.id);
        setLoading(false);
        return;
      }

      const { data: siblings } = await supabase
        .from("items")
        .select("*")
        .eq("variant_group", group)
        .eq("active", true);
      if (cancelled) return;

      // A variant_group can span rows that only belong to one of the two
      // catalogues (e.g. a rental-only decor variant sharing a group with
      // a purchase-only gift variant) - narrowed to this page's own kind,
      // matching exactly what Decor.jsx/Gifts.jsx would have grouped
      // together to link here in the first place. Without this, the
      // cheapest variant across the *whole* group could win regardless of
      // whether it even belongs on this page, pointing the canonical URL
      // and the default selection at the wrong item.
      const kindFilter = kind === "decor" ? isDecorCatalogItem : isGiftCatalogItem;
      const inKind = (siblings || []).filter(kindFilter);
      const pool = inKind.length ? inKind : [row];

      const sorted = sortVariantsByPrice(pool);
      setVariants(sorted.length > 1 ? sorted : null);
      setBaseItem(sorted[0]);
      setSelectedId(sorted.some((v) => String(v.id) === String(row.id)) ? row.id : sorted[0].id);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, kind]);

  const hasVariants = Array.isArray(variants) && variants.length > 1;
  const active = hasVariants ? variants.find((v) => String(v.id) === String(selectedId)) || variants[0] : baseItem;
  const colorOptions = active ? parseColorOptions(active) : [];
  const [selectedColor, setSelectedColor] = useState("");
  useEffect(() => {
    setSelectedColor(colorOptions[0] || "");
    setQuantity(1);
    setDetailTab("Details");
    setActivePhoto(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  useEffect(() => {
    const pairWith = Array.isArray(active?.pair_with) ? active.pair_with.filter(Boolean) : [];
    if (!supabase || !pairWith.length) {
      setPairedItems([]);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("items")
        .select("*")
        .in("name", pairWith)
        .eq("active", true);

      if (cancelled) return;
      const ordered = pairWith
        .map((name) => (data || []).find((item) => item.name === name))
        .filter(Boolean);
      setPairedItems(ordered);
    })();

    return () => {
      cancelled = true;
    };
  }, [active?.id]);

  // A "complete look" (see completeLooks.js) is a decor item that stands in
  // for a styled group of real catalog pieces rather than a single
  // rentable/purchasable row of its own - its own rental_price/
  // purchase_price stay blank, and this page shows the real items it's
  // made of, priced and added to cart together, instead of the usual
  // single-item buy/rent panel.
  const isCompleteLook =
    kind === "decor" &&
    !!baseItem &&
    parseItemTags(baseItem).map((t) => t.toLowerCase().trim()).includes("complete looks");

  const [lookItems, setLookItems] = useState([]);
  const [lookLoading, setLookLoading] = useState(false);
  const [lookNotice, setLookNotice] = useState("");
  const [addingLook, setAddingLook] = useState(false);
  const [pendingCompleteLook, setPendingCompleteLook] = useState(false);
  const [openLookItem, setOpenLookItem] = useState(null);

  useEffect(() => {
    if (!isCompleteLook || !supabase) {
      setLookItems([]);
      return;
    }
    const names = COMPLETE_LOOK_CONTENTS[baseItem.name] || [];
    if (!names.length) {
      setLookItems([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setLookLoading(true);
      const { data } = await supabase.from("items").select("*").in("name", names).eq("active", true);
      if (cancelled) return;
      // Keep the order given in COMPLETE_LOOK_CONTENTS rather than
      // whatever order the database happens to return.
      const ordered = names.map((n) => (data || []).find((i) => i.name === n)).filter(Boolean);
      setLookItems(ordered);
      setLookLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleteLook, baseItem?.name]);

  const lookTotal = lookItems.reduce(
    (sum, item) => sum + Number(item.rental_price ?? item.purchase_price ?? 0),
    0
  );

  async function addWholeLookToCart(dates) {
    setLookNotice("");
    setAddingLook(true);
    const unavailable = [];

    for (const item of lookItems) {
      if (item.rental_price != null) {
        if (!supabase) {
          addToCart(item.id, "rental");
          continue;
        }
        const { data, error } = await supabase.rpc("get_reservation_item_availability", {
          p_item_id: Number(item.id),
          p_pickup: dates.pickup,
          p_dropoff: dates.dropoff,
        });
        if (error || Number(data || 0) < 1) {
          unavailable.push(item.name);
          continue;
        }
        addToCart(item.id, "rental");
      } else if (item.purchase_price != null) {
        addToCart(item.id, "catalog");
      }
    }

    setAddingLook(false);
    if (unavailable.length) {
      setLookNotice(
        `${unavailable.join(", ")} ${unavailable.length > 1 ? "aren't" : "isn't"} available for ` +
          `${formatRentalDate(dates.pickup)} – ${formatRentalDate(dates.dropoff)}. The rest of the look was added.`
      );
    }
  }

  function handleAddCompleteLook() {
    if (!rental.datesReady) {
      setPendingCompleteLook(true);
      rental.setShowDatesModal(true);
      return;
    }
    addWholeLookToCart(rental.rentalDates);
  }

  const fromTableBox = new URLSearchParams(window.location.search).get("from") === "table-box";
  const backPath = fromTableBox ? "/table-box" : kind === "decor" ? "/decor" : "/gifts";
  const backLabel = fromTableBox ? "Table Box" : kind === "decor" ? "All decor" : "All gifts & gift wrap";

  if (!supabase || notFound || (!loading && !baseItem)) {
    return (
      <main style={{ ...paperTexture(palette), color: palette.ink, padding: "120px 24px" }}>
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-['Fraunces'] text-3xl font-semibold text-[#0B4933]">We couldn't find that item.</h1>
          <p className="mt-3 font-[Space_Grotesk] text-base text-[#8C846F]">
            It may have sold out or been retired from the catalog.
          </p>
          <button
            onClick={() => navigate(backPath)}
            className="mt-6 inline-flex items-center gap-2 font-[Space_Grotesk] text-sm font-semibold tracking-[0.12em] text-[#0B4933]"
          >
            <ChevronLeft size={14} /> {backLabel.toUpperCase()}
          </button>
        </div>
      </main>
    );
  }

  if (loading || !active) {
    return (
      <main style={{ ...paperTexture(palette), color: palette.ink, padding: "120px 24px" }}>
        <p className="text-center font-[Space_Grotesk] text-base" style={{ color: palette.muted }}>
          Loading...
        </p>
      </main>
    );
  }

  const { tags, outOfStock, isPurchasable, isRentable } = getItemFlags(active);
  const photos = photoList(active.photos);
  const displayName = hasVariants ? baseItem.variant_group : active.name;
  const groupPath = itemUrlPath(kind, baseItem, hasVariants ? baseItem.variant_group : undefined);
  const seo = itemSeo({
    kind,
    name: displayName,
    description: baseItem.description,
    photo: photos[0],
    path: groupPath,
  });
  const product = productJsonLd({
    path: groupPath,
    name: displayName,
    description: baseItem.description,
    image: seo.image,
    price: active.purchase_price ?? active.rental_price,
    inStock: !outOfStock,
  });

  const inPurchaseCart = isInCart(active.id, "catalog");
  const inRentalCart = isInCart(active.id, "rental");
  const featureHighlights = Array.isArray(active.feature_highlights)
    ? active.feature_highlights.filter(Boolean).slice(0, 4)
    : [];
  const detailLines = splitContentLines(active.details || active.condition_notes);
  const productTabs = [
    "Details",
    ...(active.care_instructions ? ["Care"] : []),
    ...(active.ideas ? ["Ideas"] : []),
    ...(pairedItems.length ? ["Pair With"] : []),
    ...(active.replacement_value ? ["Replacement Value"] : []),
  ];

  return (
    <main style={{ background: "#FCFAF7", color: palette.ink }}>
      <SeoHead path={groupPath} override={seo} productJsonLd={product} />

      <div className="mx-auto max-w-[1440px] px-5 pt-8 sm:px-8">
        <button
          onClick={() => navigate(backPath)}
          className="inline-flex items-center gap-2 font-[Space_Grotesk] text-xs font-semibold tracking-[0.12em]"
          style={{ color: palette.goldDeep, textTransform: "uppercase" }}
        >
          <ChevronLeft size={14} /> {backLabel}
        </button>
      </div>

      <section className="mx-auto max-w-[1440px] px-5 pb-24 pt-6 sm:px-8">
        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-11">
          <div className="min-w-0" data-product-gallery>
            <div className="relative aspect-[1.12/1] overflow-hidden" style={{ background: "#F3F0EC" }}>
              {photos.length ? <img src={photos[activePhoto] || photos[0]} alt={itemAltText(displayName, { color: colorOptions[0] })} className="h-full w-full object-contain" /> :
                <div className="flex h-full items-center justify-center text-sm tracking-widest">PHOTO COMING SOON</div>}
              {photos.length > 1 && [-1, 1].map((direction) => (
                <button key={direction} type="button" aria-label={direction < 0 ? "Previous photo" : "Next photo"}
                  onClick={() => setActivePhoto((current) => (current + direction + photos.length) % photos.length)}
                  className={`absolute bottom-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-sm ${direction < 0 ? "left-4" : "right-4"}`}>
                  {direction < 0 ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
              ))}
            </div>
            {photos.length > 1 && <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {photos.map((src, index) => <button key={index} type="button" onClick={() => setActivePhoto(index)} aria-label={`View photo ${index + 1}`} aria-pressed={index === activePhoto}
                className="aspect-[1.15/1] w-[calc((100%-24px)/4)] min-w-[70px] shrink-0 overflow-hidden rounded border-2" style={{ borderColor: index === activePhoto ? "#E50062" : "transparent", background: "#F3F0EC" }}>
                <img src={src} alt="" className="h-full w-full object-contain" />
              </button>)}
            </div>}
          </div>

          <div className="min-w-0 lg:pt-1" data-product-information>
            <div
              className="font-[Space_Grotesk] text-xs font-medium uppercase tracking-[0.18em]"
              style={{ color: "#E50062" }}
            >
              {active.brand || active.table_box_category || tags[0] || (kind === "decor" ? "Rentals" : "Gifts")}
            </div>
            <h1 className="mt-2 font-['Fraunces'] text-4xl font-medium leading-[1.02] sm:text-5xl" style={{ color: "#191713" }}>
              {displayName}
            </h1>

            {hasVariants && (
              <div className="relative mt-3 max-w-xs">
                <select
                  aria-label="Product variant"
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    setActivePhoto(0);

                  }}
                  className="w-full appearance-none rounded-sm border border-[#D9D9D9] bg-white px-3 py-2.5 font-[Space_Grotesk] text-sm text-[#292929] outline-none focus:border-[#0B4933]"
                >
                  {variants.map((v) => {
                    const label = v.variant_label || v.name;
                    const priceLabel = v.rental_price != null ? `$${v.rental_price} / event` : `$${v.purchase_price}`;
                    return (
                      <option key={v.id} value={v.id}>
                        {`${label} (${priceLabel})`}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: palette.muted }}
                />
              </div>
            )}

            {colorOptions.length > 1 ? (
              <div className="mt-1 flex items-center gap-2">
                <span className="font-[Space_Grotesk] text-sm" style={{ color: palette.muted }}>Color:</span>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="rounded-sm border border-[#D9D9D9] bg-white px-2 py-1 font-[Space_Grotesk] text-sm outline-none"
                  style={{ color: palette.primaryDeep }}
                >
                  {colorOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            ) : colorOptions.length === 1 ? (
              <div className="mt-1 font-[Space_Grotesk] text-sm" style={{ color: palette.muted }}>
                {colorOptions[0]}
              </div>
            ) : null}
            {active.size && (
              <div className="mt-2 font-[Space_Grotesk] text-sm" style={{ color: palette.muted }}>{active.size}</div>
            )}

            {(active.description || baseItem.description) && <div className="mt-5"><DescriptionBody text={active.description || baseItem.description} /></div>}

            {baseItem.condition_notes && (
              <p className="mt-3 font-[Space_Grotesk] text-sm leading-6" style={{ color: palette.muted }}>
                {baseItem.condition_notes}
              </p>
            )}

            {!isCompleteLook && (
              <>
                {featureHighlights.length > 0 && (
                  <section
                    className="mt-7 border-y py-6"
                    style={{ borderColor: palette.line }}
                    aria-label="Product highlights"
                  >
                    <div
                      className={`grid gap-5 ${
                        featureHighlights.length >= 4
                          ? "grid-cols-2 sm:grid-cols-4"
                          : featureHighlights.length === 3
                            ? "grid-cols-3"
                            : "grid-cols-2"
                      }`}
                    >
                      {featureHighlights.map((feature) => {
                        const Icon = featureIconFor(feature);
                        return (
                          <div key={feature} className="text-center">
                            <div
                              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border"
                              style={{ borderColor: palette.goldDeep, color: palette.goldDeep }}
                            >
                              <Icon size={26} strokeWidth={1.25} />
                            </div>
                            <p
                              className="mx-auto mt-3 max-w-[120px] font-[Space_Grotesk] text-[10px] font-medium uppercase leading-[1.35] tracking-[0.12em]"
                              style={{ color: palette.ink }}
                            >
                              {feature}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {(active.size || active.material) && (
                  <section
                    className="mt-5 overflow-hidden rounded-lg"
                    style={{ background: "#F2EEE8" }}
                    aria-label="Product specifications"
                  >
                    <div className="hidden sm:grid sm:grid-cols-2">
                      {active.size && (
                        <div className="flex gap-4 px-5 py-5">
                          <Ruler size={27} strokeWidth={1.3} color={palette.goldDeep} className="shrink-0" />
                          <div>
                            <div className="font-[Space_Grotesk] text-[10px] font-semibold uppercase tracking-[0.16em]">
                              Dimensions
                            </div>
                            <div className="mt-1 font-[Space_Grotesk] text-sm leading-5">{active.size}</div>
                          </div>
                        </div>
                      )}
                      {active.material && (
                        <div
                          className="flex gap-4 border-l px-5 py-5"
                          style={{ borderColor: palette.line }}
                        >
                          <Layers size={27} strokeWidth={1.3} color={palette.goldDeep} className="shrink-0" />
                          <div>
                            <div className="font-[Space_Grotesk] text-[10px] font-semibold uppercase tracking-[0.16em]">
                              Material
                            </div>
                            <div className="mt-1 font-[Space_Grotesk] text-sm leading-5">{active.material}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="divide-y sm:hidden">
                      {active.size && (
                        <div className="flex items-center gap-3 px-4 py-4">
                          <Ruler size={22} color={palette.goldDeep} />
                          <div className="flex-1">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.16em]">Dimensions</div>
                            <div className="mt-1 text-sm">{active.size}</div>
                          </div>
                        </div>
                      )}
                      {active.material && (
                        <div className="flex items-center gap-3 px-4 py-4">
                          <Layers size={22} color={palette.goldDeep} />
                          <div className="flex-1">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.16em]">Material</div>
                            <div className="mt-1 text-sm">{active.material}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </>
            )}

            {isCompleteLook ? (
              <div className="mt-6 space-y-3 border-t pt-5" style={{ borderColor: palette.line }}>
                {lookLoading ? (
                  <p className="font-[Space_Grotesk] text-sm" style={{ color: palette.muted }}>
                    Loading this look's pieces...
                  </p>
                ) : lookItems.length ? (
                  <>
                    <ul className="space-y-1.5">
                      {lookItems.map((li) => (
                        <li
                          key={li.id}
                          className="flex items-center justify-between font-[Space_Grotesk] text-sm"
                          style={{ color: palette.ink }}
                        >
                          <span>{li.name}</span>
                          <span style={{ color: palette.goldDeep }}>
                            {li.rental_price != null
                              ? `$${li.rental_price} / event`
                              : li.purchase_price != null
                                ? `$${li.purchase_price}`
                                : "Inquire"}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div
                      className="flex items-center justify-between border-t pt-3"
                      style={{ borderColor: palette.line }}
                    >
                      <span
                        className="font-[Space_Grotesk] text-base font-semibold"
                        style={{ color: palette.primaryDeep }}
                      >
                        TOTAL FOR THIS LOOK
                      </span>
                      <span
                        className="font-[Space_Grotesk] text-base font-semibold"
                        style={{ color: palette.goldDeep }}
                      >
                        ${lookTotal} / event
                      </span>
                    </div>
                    <button
                      onClick={handleAddCompleteLook}
                      disabled={addingLook}
                      className="w-full rounded-full py-3 font-[Space_Grotesk] text-sm font-semibold tracking-[0.16em]"
                      style={{ background: palette.primaryDeep, color: "#FFFFFF" }}
                    >
                      {addingLook ? "ADDING..." : "ADD THE COMPLETE LOOK TO YOUR CART"}
                    </button>
                  </>
                ) : (
                  <p className="font-[Space_Grotesk] text-base" style={{ color: palette.goldDeep }}>
                    Contact us to inquire about this look.
                  </p>
                )}

                {rental.checkingAvailability && (
                  <p className="font-[Space_Grotesk] text-sm" style={{ color: palette.muted }}>
                    Checking availability...
                  </p>
                )}
                {lookNotice && (
                  <p
                    className="rounded-sm px-4 py-3 font-[Space_Grotesk] text-sm"
                    style={{ background: rgba("#B8305F", 0.08), color: "#8A3142" }}
                  >
                    {lookNotice}
                  </p>
                )}
                {rental.datesReady && lookItems.length > 0 && (
                  <p className="font-[Space_Grotesk] text-xs" style={{ color: palette.muted }}>
                    Renting {formatRentalDate(rental.rentalDates.pickup)} – {formatRentalDate(rental.rentalDates.dropoff)}
                  </p>
                )}
              </div>
            ) : (
            <div className="mt-7 space-y-4 border-y py-6" style={{ borderColor: palette.line }}>
              {outOfStock && <p className="text-sm uppercase tracking-widest">Currently unavailable</p>}
              {[...(isRentable ? [{ type: "rental", price: active.rental_price, label: "Rental / per event", inCart: inRentalCart }] : []), ...(isPurchasable ? [{ type: "catalog", price: active.purchase_price, label: "Purchase", inCart: inPurchaseCart }] : [])].map((offer) => (
                <div key={offer.type} className="grid items-end gap-5 lg:grid-cols-[auto_auto_1fr]">
                  <div style={{ color: "#E50062" }}>
                    <div className="font-['Fraunces'] text-5xl leading-none">
                      ${Number(offer.price).toLocaleString("en-CA", { minimumFractionDigits: Number(offer.price) % 1 ? 2 : 0, maximumFractionDigits: 2 })}
                    </div>
                    <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.15em]">{offer.label}</div>
                  </div>
                  {!outOfStock && (
                    <div>
                      <div className="mb-2 font-[Space_Grotesk] text-[10px] font-semibold uppercase tracking-[0.16em]">
                        Quantity
                      </div>
                      <div className="flex h-12 items-center rounded-md border bg-white" style={{ borderColor: palette.line }}>
                        <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-full px-4 disabled:opacity-30"><Minus size={16} /></button>
                        <span className="min-w-10 text-center text-base">{quantity}</span>
                        <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((q) => q + 1)} className="h-full px-4"><Plus size={16} /></button>
                      </div>
                    </div>
                  )}
                  {!outOfStock && <button type="button" disabled={rental.checkingAvailability}
                    onClick={() => offer.type === "rental" ? rental.handleRent(active, quantity) : addToCart(active.id, "catalog", null, quantity)}
                    className="min-h-[58px] w-full rounded-md px-7 py-4 font-[Space_Grotesk] text-xs font-bold uppercase tracking-[0.16em] text-white disabled:opacity-50" style={{ background: "#E50062" }}>
                    {rental.checkingAvailability && offer.type === "rental" ? "CHECKING…" : offer.type === "rental" ? "ADD TO RENTAL" : "ADD TO CART"}
                  </button>}
                  {offer.inCart && <p role="status" className="flex items-center gap-2 text-sm lg:col-span-3" style={{ color: palette.primaryDeep }}><Check size={16} /> In your cart <button type="button" className="ml-auto underline" onClick={() => removeFromCart(active.id, offer.type)}>Remove</button></p>}
                </div>
              ))}

              {isRentable && !outOfStock && active.bulk_rental_price != null && active.bulk_min_quantity != null && (
                <p className="font-[Space_Grotesk] text-sm font-semibold" style={{ color: palette.accent }}>
                  ${active.bulk_rental_price} each when you rent {active.variant_group ? "any " : ""}
                  {active.bulk_min_quantity} or more{active.variant_group ? ", mixed however you like" : ""}
                </p>
              )}

              {!isPurchasable && !isRentable && (
                <p className="font-[Space_Grotesk] text-base" style={{ color: palette.goldDeep }}>
                  Contact us to inquire about this piece.
                </p>
              )}

              {rental.checkingAvailability && (
                <p className="font-[Space_Grotesk] text-sm" style={{ color: palette.muted }}>
                  Checking availability...
                </p>
              )}
              {rental.rentalNotice && (
                <p
                  className="rounded-sm px-4 py-3 font-[Space_Grotesk] text-sm"
                  style={{ background: rgba("#B8305F", 0.08), color: "#8A3142" }}
                >
                  {rental.rentalNotice}
                </p>
              )}
              {rental.datesReady && isRentable && !outOfStock && (
                <p className="font-[Space_Grotesk] text-xs" style={{ color: palette.muted }}>
                  Renting {formatRentalDate(rental.rentalDates.pickup)} – {formatRentalDate(rental.rentalDates.dropoff)}
                </p>
              )}
            </div>
            )}

            <button
              onClick={() => openPickerForBuilder()}
              className="mt-3 w-full border py-3 font-[Space_Grotesk] text-sm font-semibold tracking-[0.2em]"
              style={{ borderColor: palette.goldDeep, color: palette.primaryDeep }}
            >
              BUILD MY EXPERIENCE
            </button>

            <section className="mt-8 border-t" style={{ borderColor: palette.line }}>
              <div
                role="tablist"
                aria-label="Product information"
                className="grid border-b"
                style={{
                  borderColor: palette.line,
                  gridTemplateColumns: `repeat(${productTabs.length}, minmax(0, 1fr))`,
                }}
              >
                {productTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    id={`product-tab-${tab}`}
                    aria-controls={`product-panel-${tab}`}
                    aria-selected={detailTab === tab}
                    onClick={() => setDetailTab(tab)}
                    className="relative px-2 py-4 font-[Space_Grotesk] text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: detailTab === tab ? "#E50062" : palette.ink }}
                  >
                    {tab}
                    {detailTab === tab && (
                      <span className="absolute bottom-[-1px] left-0 h-[2px] w-full" style={{ background: "#E50062" }} />
                    )}
                  </button>
                ))}
              </div>

              <div
                role="tabpanel"
                id={`product-panel-${detailTab}`}
                aria-labelledby={`product-tab-${detailTab}`}
                className="py-6 text-sm leading-6"
              >
                {detailTab === "Details" && (
                  <div>
                    {detailLines.length > 0 ? (
                      <ul className="space-y-2">
                        {detailLines.map((line) => (
                          <li key={line} className="flex gap-3 font-[Space_Grotesk] text-sm leading-6">
                            <span className="mt-[10px] h-1 w-1 shrink-0 rounded-full" style={{ background: palette.goldDeep }} />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <DescriptionBody text={active.description || baseItem.description || displayName} />
                    )}
                  </div>
                )}

                {detailTab === "Care" && (
                  <DescriptionBody text={active.care_instructions} />
                )}

                {detailTab === "Ideas" && (
                  <div className="flex gap-3">
                    <Lightbulb size={20} className="mt-1 shrink-0" color={palette.goldDeep} />
                    <DescriptionBody text={active.ideas} />
                  </div>
                )}

                {detailTab === "Pair With" && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {pairedItems.map((item) => {
                      const pairPhotos = photoList(item.photos);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigate(itemUrlPath(kind, item))}
                          className="group text-left"
                        >
                          <div className="aspect-square overflow-hidden rounded-sm bg-[#F3F0EC]">
                            {pairPhotos[0] ? (
                              <img src={pairPhotos[0]} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                            ) : (
                              <div className="flex h-full items-center justify-center"><Box size={24} color={palette.muted} /></div>
                            )}
                          </div>
                          <div className="mt-2 font-['Fraunces'] text-base font-medium">{item.name}</div>
                          {item.rental_price != null && (
                            <div className="mt-1 font-[Space_Grotesk] text-xs" style={{ color: palette.goldDeep }}>
                              ${item.rental_price} / event
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {detailTab === "Replacement Value" && (
                  <div className="max-w-xl">
                    <div className="font-['Fraunces'] text-4xl font-medium" style={{ color: "#E50062" }}>
                      {active.replacement_value}
                    </div>
                    <p className="mt-3 font-[Space_Grotesk] text-sm leading-6" style={{ color: palette.muted }}>
                      This is the item's replacement value, not the rental price or security deposit.
                      Replacement charges may apply if the item is lost, not returned, or damaged beyond normal rental wear,
                      subject to the rental agreement.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
          {isCompleteLook && lookItems.length > 0 && (
            <div className="border-b p-4 lg:col-span-2 sm:border-b-0 sm:border-t" style={{ borderColor: palette.line }}>
              <div
                className="mb-3 font-[Space_Grotesk] text-xs font-semibold uppercase tracking-[0.14em]"
                style={{ color: palette.muted }}
              >
                This look includes
              </div>
              <div className="flex gap-4 overflow-x-auto">
                {lookItems.map((li) => {
                  const liPhotos = photoList(li.photos);
                  return (
                    <button
                      key={li.id}
                      type="button"
                      onClick={() => setOpenLookItem(li)}
                      className="flex-shrink-0 text-left"
                    >
                      <div
                        className="h-16 w-16 overflow-hidden rounded-sm"
                        style={{ border: `1px solid ${palette.line}` }}
                      >
                        {liPhotos.length ? (
                          <img src={liPhotos[0]} alt={li.name} className="h-full w-full object-cover" />
                        ) : (
                          <div
                            className="flex h-full items-center justify-center"
                            style={{ background: rgba(palette.primary, 0.06) }}
                          >
                            <span className="font-[Space_Grotesk] text-[8px]" style={{ color: palette.muted }}>
                              NO PHOTO
                            </span>
                          </div>
                        )}
                      </div>
                      <div
                        className="mt-1 w-16 truncate font-[Space_Grotesk] text-[10px]"
                        style={{ color: palette.ink }}
                      >
                        {li.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </section>

      {rental.showDatesModal && (
        <RentalDatesModal
          onClose={() => {
            rental.setShowDatesModal(false);
            rental.setPendingRentItem(null);
            setPendingCompleteLook(false);
          }}
          onSaved={(dates) => {
            rental.setShowDatesModal(false);
            if (pendingCompleteLook) {
              setPendingCompleteLook(false);
              addWholeLookToCart(dates);
            } else {
              rental.handleDatesSaved(dates);
            }
          }}
        />
      )}

      {openLookItem && (
        <div
          className="fixed inset-0 z-[190] flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(20,18,12,.72)", backdropFilter: "blur(6px)" }}
          role="dialog"
          aria-modal="true"
          aria-label={openLookItem.name}
          onClick={() => setOpenLookItem(null)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white"
            style={{ boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpenLookItem(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#6B6B6B]"
              aria-label="Close"
            >
              <X size={19} />
            </button>
            {(() => {
              const liPhotos = photoList(openLookItem.photos);
              const liFlags = getItemFlags(openLookItem);
              return (
                <>
                  <div className="relative aspect-square" style={{ background: rgba(palette.primary, 0.06) }}>
                    {liPhotos.length ? (
                      <img
                        src={liPhotos[0]}
                        alt={itemAltText(openLookItem.name)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="font-[Space_Grotesk] text-sm tracking-[0.2em]" style={{ color: palette.muted }}>
                          PHOTO COMING SOON
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-6">
                    <div
                      className="font-[Space_Grotesk] text-xs font-medium uppercase tracking-[0.18em]"
                      style={{ color: palette.muted }}
                    >
                      {liFlags.tags.length ? liFlags.tags.join(" · ") : "Decor"}
                    </div>
                    <h2 className="mt-1 font-['Fraunces'] text-2xl font-semibold" style={{ color: palette.primaryDeep }}>
                      {openLookItem.name}
                    </h2>
                    {openLookItem.description && <DescriptionBody text={openLookItem.description} />}
                    <div className="mt-4 border-t pt-4" style={{ borderColor: palette.line }}>
                      <span className="font-[Space_Grotesk] text-base font-medium" style={{ color: palette.goldDeep }}>
                        {openLookItem.rental_price != null
                          ? `$${openLookItem.rental_price} / event`
                          : openLookItem.purchase_price != null
                            ? `$${openLookItem.purchase_price}`
                            : "Inquire"}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </main>
  );
}
