import React, { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronLeft, Plus, X } from "lucide-react";
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
import { ElevatedCard, PrimaryButton, paperTexture, rgba } from "../components/EditorialKit";

// The routed replacement for the old click-to-open modal: every decor
// piece and every gift/wrap/card item gets a real page at its own URL
// (/decor/<slug> or /gifts/<slug>), so it can be indexed, shared and
// bookmarked on its own, not just glimpsed inside a dialog with no
// address bar footprint. Content and behavior mirror what the modal used
// to show; only the chrome around it changed from an overlay to a page.
export default function ItemDetail({ kind, slug, navigate }) {
  const { palette, fonts } = usePalette();
  const { openPickerForBuilder } = useEventType();
  const { addToCart, isInCart, removeFromCart } = useCart();
  const rental = useRentalFlow();

  const [baseItem, setBaseItem] = useState(null);
  const [variants, setVariants] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);

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
      setSelectedId(sorted[0].id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const catalogKind = kind === "decor" ? "catalog" : "catalog";
  const backPath = kind === "decor" ? "/decor" : "/gifts";
  const backLabel = kind === "decor" ? "All decor" : "All gifts & gift wrap";

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

  return (
    <main style={{ ...paperTexture(palette), color: palette.ink }}>
      <SeoHead path={groupPath} override={seo} productJsonLd={product} />

      <div className="mx-auto max-w-5xl px-5 pt-8 sm:px-8">
        <button
          onClick={() => navigate(backPath)}
          className="inline-flex items-center gap-2 font-[Space_Grotesk] text-xs font-semibold tracking-[0.12em]"
          style={{ color: palette.goldDeep, textTransform: "uppercase" }}
        >
          <ChevronLeft size={14} /> {backLabel}
        </button>
      </div>

      <section className="mx-auto max-w-5xl px-5 pb-24 pt-6 sm:px-8">
        <ElevatedCard palette={palette} className="grid grid-cols-1 overflow-hidden sm:grid-cols-2">
          <div className="relative aspect-square" style={{ background: rgba(palette.primary, 0.06) }}>
            {photos.length ? (
              <img
                src={photos[activePhoto] || photos[0]}
                alt={itemAltText(displayName, { color: colorOptions[0] })}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-[Space_Grotesk] text-sm tracking-[0.2em]" style={{ color: palette.muted }}>
                  PHOTO COMING SOON
                </span>
              </div>
            )}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3 sm:absolute sm:bottom-0 sm:left-0 sm:right-0">
                {photos.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePhoto(i)}
                    className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm"
                    style={{
                      border: i === activePhoto ? `2px solid ${palette.primaryDeep}` : "2px solid #FFFFFF",
                      opacity: i === activePhoto ? 1 : 0.75,
                    }}
                    aria-label={`View photo ${i + 1}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {isCompleteLook && lookItems.length > 0 && (
            <div className="border-b p-4 sm:col-span-2 sm:border-b-0 sm:border-t" style={{ borderColor: palette.line }}>
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

          <div className="px-6 py-8 sm:px-8">
            <div
              className="font-[Space_Grotesk] text-sm font-medium uppercase tracking-[0.18em]"
              style={{ color: palette.muted }}
            >
              {tags.length ? tags.join(" · ") : kind === "decor" ? "Decor" : "Gifts"}
            </div>
            <h1 className="mt-1 font-['Fraunces'] text-3xl font-semibold" style={{ color: palette.primaryDeep }}>
              {displayName}
            </h1>

            {hasVariants && (
              <div className="relative mt-3 max-w-xs">
                <select
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    setActivePhoto(0);
                    navigate(itemUrlPath(kind, baseItem, baseItem.variant_group));
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
                Color: {colorOptions[0]}
              </div>
            ) : null}
            {active.size && (
              <div className="mt-2 font-[Space_Grotesk] text-sm" style={{ color: palette.muted }}>{active.size}</div>
            )}

            {baseItem.description && <DescriptionBody text={baseItem.description} />}

            {baseItem.condition_notes && (
              <p className="mt-3 font-[Space_Grotesk] text-sm leading-6" style={{ color: palette.muted }}>
                {baseItem.condition_notes}
              </p>
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
            <div className="mt-6 space-y-3 border-t pt-5" style={{ borderColor: palette.line }}>
              {isPurchasable && (
                <div className="flex items-center justify-between">
                  <span className="font-[Space_Grotesk] text-base font-medium" style={{ color: palette.goldDeep }}>
                    BUY ${active.purchase_price}
                  </span>
                  {outOfStock ? (
                    <span className="font-[Space_Grotesk] text-sm tracking-[0.08em]" style={{ color: palette.muted }}>
                      UNAVAILABLE
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        inPurchaseCart ? removeFromCart(active.id, "catalog") : addToCart(active.id, "catalog")
                      }
                      className="flex items-center gap-2 rounded-full px-5 py-2.5 font-[Space_Grotesk] text-sm font-semibold tracking-[0.16em]"
                      style={{
                        background: inPurchaseCart ? "transparent" : palette.primaryDeep,
                        color: inPurchaseCart ? palette.primaryDeep : "#FFFFFF",
                        border: `1px solid ${palette.primaryDeep}`,
                      }}
                    >
                      {inPurchaseCart ? <Check size={14} /> : <Plus size={14} />}
                      {inPurchaseCart ? "IN CART" : "ADD TO CART"}
                    </button>
                  )}
                </div>
              )}

              {isPurchasable && !outOfStock && !active.made_to_order && active.quantity_owned != null && (
                <p className="font-[Space_Grotesk] text-sm" style={{ color: palette.muted }}>
                  {Math.max(0, active.quantity_owned - (active.quantity_out_of_service || 0))} available
                </p>
              )}

              {isRentable && !outOfStock && (
                <div className="flex items-center justify-between">
                  <span className="font-[Space_Grotesk] text-base font-medium" style={{ color: palette.goldDeep }}>
                    RENT ${active.rental_price} / EVENT
                  </span>
                  <button
                    onClick={() => (inRentalCart ? removeFromCart(active.id, "rental") : rental.handleRent(active))}
                    className="flex items-center gap-2 rounded-full px-5 py-2.5 font-[Space_Grotesk] text-sm font-semibold tracking-[0.16em]"
                    style={{
                      background: inRentalCart ? palette.primaryDeep : "transparent",
                      color: inRentalCart ? "#FFFFFF" : palette.primaryDeep,
                      border: `1px solid ${palette.primaryDeep}`,
                    }}
                  >
                    {inRentalCart ? <Check size={14} /> : <Plus size={14} />}
                    {inRentalCart ? "IN CART" : "ADD TO CART"}
                  </button>
                </div>
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
          </div>
        </ElevatedCard>
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
