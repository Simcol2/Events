import React, { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Minus, PackageCheck, Ruler, Layers, Plus, X } from "lucide-react";
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

            {!isCompleteLook && <div className="mt-6 border-t pt-4" style={{ borderColor: palette.line }}>
              <div className="flex justify-around gap-3 text-center">
                {[
                  ...(isRentable ? [{ Icon: PackageCheck, label: "Rental", value: "Per event" }] : []),
                  ...(active.size ? [{ Icon: Ruler, label: "Size", value: active.size }] : []),
                  ...(active.material ? [{ Icon: Layers, label: "Material", value: active.material }] : []),
                ].map(({ Icon, label, value }) => <div key={label} className="max-w-[140px] flex-1">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border" style={{ color: palette.goldDeep, borderColor: palette.goldDeep }}><Icon size={25} strokeWidth={1.3} /></div>
                  <p className="mt-2 font-[Space_Grotesk] text-[10px] uppercase tracking-[0.12em]">{label}<br />{value}</p>
                </div>)}
              </div>
              {(active.size || active.material) && <div className="mt-5 grid gap-4 rounded-lg bg-[#F1EDE7] p-4 sm:grid-cols-2">
                {active.size && <div className="flex gap-3"><Ruler className="shrink-0" color={palette.goldDeep} /><div className="text-sm"><p className="mb-1 text-[10px] font-semibold uppercase tracking-widest">Dimensions / size</p>{active.size}</div></div>}
                {active.material && <div className="flex gap-3"><Layers className="shrink-0" color={palette.goldDeep} /><div className="text-sm"><p className="mb-1 text-[10px] font-semibold uppercase tracking-widest">Material</p>{active.material}</div></div>}
              </div>}
            </div>}

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
              {!outOfStock && (isRentable || isPurchasable) && <div className="flex items-center justify-end gap-2">
                <span className="mr-2 text-xs uppercase tracking-widest">Quantity</span>
                <div className="flex items-center rounded border" style={{ borderColor: palette.line }}>
                  <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 disabled:opacity-30"><Minus size={16} /></button>
                  <input aria-label="Quantity" type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.floor(Number(event.target.value) || 1)))} className="w-12 bg-transparent text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                  <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((q) => q + 1)} className="p-3"><Plus size={16} /></button>
                </div>
              </div>}
              {outOfStock && <p className="text-sm uppercase tracking-widest">Currently unavailable</p>}
              {[...(isRentable ? [{ type: "rental", price: active.rental_price, label: "Rental / per event", inCart: inRentalCart }] : []), ...(isPurchasable ? [{ type: "catalog", price: active.purchase_price, label: "Purchase", inCart: inPurchaseCart }] : [])].map((offer) => (
                <div key={offer.type} className="flex flex-wrap items-center justify-between gap-4">
                  <div style={{ color: "#E50062" }}><div className="font-['Fraunces'] text-5xl leading-none">${Number(offer.price).toLocaleString("en-CA", { minimumFractionDigits: Number(offer.price) % 1 ? 2 : 0, maximumFractionDigits: 2 })}</div><div className="mt-1 text-[10px] uppercase tracking-[0.15em]">{offer.label}</div></div>
                  {!outOfStock && <button type="button" disabled={rental.checkingAvailability}
                    onClick={() => offer.type === "rental" ? rental.handleRent(active, quantity) : addToCart(active.id, "catalog", null, quantity)}
                    className="min-h-14 flex-1 rounded-md px-5 py-4 font-[Space_Grotesk] text-xs font-semibold tracking-[0.14em] text-white disabled:opacity-50 sm:flex-none" style={{ background: "#E50062" }}>
                    {rental.checkingAvailability && offer.type === "rental" ? "CHECKING…" : offer.type === "rental" ? "ADD TO RENTAL" : "ADD TO CART"}
                  </button>}
                  {offer.inCart && <p role="status" className="flex w-full items-center gap-2 text-sm" style={{ color: palette.primaryDeep }}><Check size={16} /> In your cart <button type="button" className="ml-auto underline" onClick={() => removeFromCart(active.id, offer.type)}>Remove</button></p>}
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

            <div className="mt-6 border-t pt-2" style={{ borderColor: palette.line }}>
              <div role="tablist" aria-label="Product information" className="flex border-b" style={{ borderColor: palette.line }}>
                {["Details", ...(active.care_instructions ? ["Care"] : [])].map((tab) => <button key={tab} type="button" role="tab" id={`product-tab-${tab}`} aria-controls="product-tab-panel" aria-selected={detailTab === tab} onClick={() => setDetailTab(tab)} className="border-b-2 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: detailTab === tab ? "#E50062" : palette.ink, borderColor: detailTab === tab ? "#E50062" : "transparent" }}>{tab}</button>)}
              </div>
              <div role="tabpanel" id="product-tab-panel" aria-labelledby={`product-tab-${detailTab}`} className="py-4 text-sm leading-6">
                {detailTab === "Care" ? <DescriptionBody text={active.care_instructions} /> : <>
                  {active.condition_notes && <p>{active.condition_notes}</p>}
                  {active.size && <p>Size: {active.size}</p>}
                  {active.replacement_value && <p>Replacement value: {active.replacement_value}</p>}
                  {isRentable && <p>Select your event dates to check availability for your chosen quantity.</p>}
                  {!active.size && !active.condition_notes && !active.replacement_value && !isRentable && <p>{displayName}</p>}
                </>}
              </div>
            </div>
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
