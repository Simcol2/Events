import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Minus, Plus, X } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useCart } from "../CartContext";
import { usePalette } from "../PaletteContext";
import PhotoCarousel, { normalizePhotos } from "../components/PhotoCarousel";
import DescriptionBody from "../components/ItemDescription";
import { parseItemTags, groupByVariant, sortVariantsByPrice } from "../components/DecorCard";
import SourcingRequestModal from "../components/SourcingRequestModal";
import TableBoxPackages from "../components/TableBoxPackages";
import { rentalUnitPrice } from "../api/_pricing.js";
import {
  ElevatedCard,
  Kicker,
  paperTexture,
  rgba,
} from "../components/EditorialKit";

const MINIMUM = 50;

// A real catalog row (rental_price 50, no browsable category tags, not
// tied to any table_box_category section) so it flows through the same
// authoritative-pricing checkout path as every physical rental, rather
// than being an arbitrary client-side number the backend has to trust.
const DELIVERY_SETUP_ITEM_ID = 572;

// Pulled live from the decor catalogue by items.table_box_category (not a
// separate product list, and not a hand-picked id list either) - any active
// item tagged with one of the `category` values below shows up here
// automatically, so adding a new place card style or a fourth candle option
// in Supabase is enough on its own; nothing here needs to change. A section
// with no tagged items yet quietly disappears rather than showing empty
// tiles, same as always. This list is the single source of truth for which
// table_box_category values are meaningful and what order/copy they get.
const SECTIONS = [
  {
    key: "glassware",
    title: "Choose Your Glassware",
    subtitle: "Because your everyday water glass does not need to attend every function.",
    category: "Glassware",
  },
  {
    key: "plates",
    title: "Choose Your Plates",
    subtitle: "Need them? Add them. Already have perfectly good plates? Keep yours.",
    category: "Plates",
  },
  {
    key: "chargers",
    title: "Choose Your Chargers",
    subtitle: "The easiest way to make the plates you already own look intentional.",
    category: "Chargers",
  },
  {
    key: "placeCards",
    title: "Choose Your Place Cards",
    subtitle: "Tiny detail. Suspiciously effective.",
    category: "Place Cards",
  },
  {
    key: "napkins",
    title: "Choose Your Napkins",
    subtitle: "Colour, texture, and suddenly your table looks like you planned ahead.",
    category: "Napkins",
  },
  {
    key: "cutlery",
    title: "Choose Your Cutlery",
    subtitle: "For when your everyday forks are not invited.",
    category: "Cutlery",
  },
  {
    key: "centerpieces",
    title: "Choose Your Centrepiece",
    subtitle: "Give the middle of the table something to do.",
    category: "Centerpiece",
  },
  {
    key: "cakeStands",
    title: "Choose Your Cake Stand",
    subtitle: "Cakes, cupcakes, treats, or whatever deserves a little height.",
    category: "Cake Stands",
  },
  {
    key: "servingPieces",
    title: "Choose Your Serving Pieces",
    subtitle: "Snacks, fruit and small desserts, served like you meant it.",
    category: "Serving Pieces",
  },
  {
    key: "candles",
    title: "Choose Your Candles",
    subtitle: "Warm lighting fixes an unreasonable number of problems.",
    category: "Candles",
  },
  {
    key: "linens",
    title: "Choose Your Linens",
    subtitle: "Runners, cloths, and the fastest way to change the whole table.",
    category: "Linens",
  },
  {
    key: "garland-lights",
    title: "Choose Your Garland & Lights",
    subtitle: "Holiday atmosphere without storing a forest in your condo afterward.",
    category: "Garland & Lights",
  },
  {
    key: "disposables",
    title: "Choose Your Disposables",
    subtitle: "Pretty enough for the photos. Nobody has to wash them.",
    category: "Disposables",
  },
  {
    key: "helpfulAddOns",
    title: "Helpful Add-Ons",
    subtitle: "The stuff you're very glad someone owns, but absolutely do not need living in your cupboards year-round.",
    category: "Helpful Add-Ons",
  },
];

function money(n) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);
}

// Most of the box is rentals, but a few pieces (the plate sets) are sold
// outright. Both belong in the same builder, so price and cart routing key
// off which one an item actually is rather than assuming rental.
const isRental = (item) => item.rental_price != null;
const unitPrice = (item) => Number(isRental(item) ? item.rental_price : item.purchase_price);
const linePrice = (item, quantity) =>
  (isRental(item) ? rentalUnitPrice(item, quantity) : unitPrice(item)) * quantity;
const hasBulkPrice = (item) => isRental(item) && item.bulk_min_quantity != null && item.bulk_rental_price != null;

function BulkPriceNote({ item, fonts, palette }) {
  if (!hasBulkPrice(item)) return null;
  return (
    <p className="mt-0.5" style={{ ...fonts.bodyFont, color: palette.accent, fontSize: "12px", fontWeight: 600 }}>
      {money(Number(item.bulk_rental_price))} each for {item.bulk_min_quantity}+
    </p>
  );
}

export default function TableBox() {
  const { palette, fonts } = usePalette();
  const { addRental, addToCart, rentalItems } = useCart();

  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [qty, setQty] = useState({});
  const [openSection, setOpenSection] = useState(SECTIONS[0].key);
  // Opening a category collapses whichever one was open above it, which
  // pulls the clicked header up and off screen. Once the new layout is in
  // place, bring that header back to the top of the viewport.
  const sectionRefs = useRef({});
  const scrollToSectionRef = useRef(null);
  useLayoutEffect(() => {
    const key = scrollToSectionRef.current;
    if (!key) return;
    scrollToSectionRef.current = null;
    sectionRefs.current[key]?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [openSection]);
  const [justAdded, setJustAdded] = useState(false);
  const [openProduct, setOpenProduct] = useState(null);
  const [deliverySetup, setDeliverySetup] = useState(false);
  const [showSourcingModal, setShowSourcingModal] = useState(false);
  // Which variant is showing for each variant_group tile - e.g. which guest
  // count of the Blush and Gold Plate Set. Keyed by the group's key (the
  // variant_group string), valued with the selected row's item id.
  const [selectedVariant, setSelectedVariant] = useState({});

  // Pulls in pricing for whatever is already sitting in the cart's rental
  // lines too, not just items tagged for this page - the $50 minimum check
  // below needs the combined total, and a rental added from the Decor page
  // (which may not carry a table_box_category at all) still counts toward it.
  const cartRentalIds = useMemo(() => rentalItems.map((item) => item.id), [rentalItems]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!supabase) {
        setLoadError("Rental catalogue is unavailable right now. Please try again shortly.");
        setLoading(false);
        return;
      }
      const categories = SECTIONS.map((s) => s.category);
      const [byCategory, byCartId, deliveryItemRow] = await Promise.all([
        supabase.from("items").select("*").in("table_box_category", categories),
        cartRentalIds.length
          ? supabase.from("items").select("*").in("id", cartRentalIds)
          : Promise.resolve({ data: [], error: null }),
        supabase.from("items").select("*").eq("id", DELIVERY_SETUP_ITEM_ID).maybeSingle(),
      ]);
      if (ignore) return;
      if (byCategory.error || byCartId.error) {
        setLoadError("Rental catalogue is unavailable right now. Please try again shortly.");
      } else {
        const merged = new Map();
        for (const item of [...(byCategory.data || []), ...(byCartId.data || [])]) {
          merged.set(item.id, item);
        }
        if (deliveryItemRow.data) merged.set(deliveryItemRow.data.id, deliveryItemRow.data);
        setCatalogItems(Array.from(merged.values()));
      }
      setLoading(false);
    }
    load();
    return () => {
      ignore = true;
    };
  }, [cartRentalIds]);

  const byId = useMemo(
    () => Object.fromEntries(catalogItems.map((item) => [item.id, item])),
    [catalogItems]
  );

  const sections = useMemo(
    () =>
      SECTIONS.map((section) => ({
        ...section,
        products: catalogItems.filter(
          (item) =>
            item.table_box_category === section.category &&
            item.active !== false &&
            (item.rental_price != null || item.purchase_price != null)
        ),
      })).filter((section) => section.products.length > 0),
    [catalogItems]
  );

  const allProducts = useMemo(() => sections.flatMap((s) => s.products), [sections]);

  const selected = useMemo(
    () =>
      allProducts
        .filter((p) => (qty[p.id] || 0) > 0)
        .map((p) => ({
          ...p,
          quantity: qty[p.id],
          lineTotal: linePrice(p, qty[p.id]),
        })),
    [allProducts, qty]
  );

  const deliveryItem = byId[DELIVERY_SETUP_ITEM_ID];
  // Delivery only makes sense alongside actual rental pieces, so it never
  // counts toward the $50 rental minimum on its own - it rides along with
  // whatever's already clearing that bar.
  const deliveryFee = deliverySetup && deliveryItem ? Number(deliveryItem.rental_price || 0) : 0;

  const total = selected.reduce((sum, item) => sum + item.lineTotal, 0) + deliveryFee;
  const rentalSubtotal = selected
    .filter(isRental)
    .reduce((sum, item) => sum + item.lineTotal, 0);

  // The $50 minimum is a whole-order rule, not a per-visit one: pieces
  // already sitting in the cart from an earlier trip through this page (or
  // from Decor) count toward it just as much as what's in the box right now.
  const cartRentalTotal = useMemo(
    () =>
      rentalItems.reduce((sum, item) => {
        const catalogItem = byId[item.id];
        if (!catalogItem || catalogItem.rental_price == null) return sum;
        return sum + linePrice(catalogItem, item.quantity);
      }, 0),
    [rentalItems, byId]
  );

  // The $50 floor is a rental minimum, so only rental lines count toward
  // it. A box of nothing but purchased pieces has no minimum to clear.
  const combinedTotal = rentalSubtotal + cartRentalTotal;
  const remaining = Math.max(0, MINIMUM - combinedTotal);
  const canAdd = selected.length > 0 && (rentalSubtotal === 0 || combinedTotal >= MINIMUM);

  const setQuantity = (id, next) => {
    const safe = Math.max(0, Math.floor(Number(next) || 0));
    setQty((current) => ({ ...current, [id]: safe }));
  };

  const handleAdd = () => {
    if (!canAdd) return;
    selected.forEach((item) =>
      isRental(item)
        ? addRental(item.id, null, item.quantity)
        : addToCart(item.id, "catalog", null, item.quantity)
    );
    if (deliveryFee > 0) addRental(DELIVERY_SETUP_ITEM_ID, null, 1);
    setQty({});
    setDeliverySetup(false);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 5000);
  };

  return (
    <main style={paperTexture(palette)}>
      <TableBoxPackages />

      <section
        id="build-your-own-table-box"
        className="mx-auto max-w-6xl px-6 pb-24 sm:px-10 lg:pb-32"
        style={{ scrollMarginTop: "96px" }}
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <Kicker palette={palette} fonts={fonts}>BUILD YOUR BOX</Kicker>
            <h2
              className="mt-3"
              style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "clamp(1.9rem, 3.4vw, 2.6rem)", fontWeight: 630 }}
            >
              Same table. Better decisions.
            </h2>
            <p className="mt-3" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "16px", lineHeight: 1.7 }}>
              You don't need a new dining room. You don't even need new plates.
            </p>
            <p className="mt-2" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "16px", lineHeight: 1.7 }}>
              Start with what you have. Add the pieces that make it feel intentional.
            </p>

            {loading && (
              <p className="mt-10" style={{ ...fonts.bodyFont, color: palette.muted }}>Loading rental pieces...</p>
            )}
            {!loading && loadError && (
              <p className="mt-10" style={{ ...fonts.bodyFont, color: palette.muted }}>{loadError}</p>
            )}

            {!loading && !loadError && (
              <div className="mt-8 space-y-4">
                {sections.map((section, index) => {
                  const sectionCount = section.products.reduce((n, p) => n + (qty[p.id] || 0), 0);
                  const isOpen = openSection === section.key;

                  return (
                      <div
                        key={section.key}
                        ref={(el) => {
                          sectionRefs.current[section.key] = el;
                        }}
                        style={{
                          border: `1px solid ${palette.line}`,
                          borderRadius: "5px",
                          background: palette.surface,
                          scrollMarginTop: "96px",
                        }}
                      >
                        <button
                          onClick={() => {
                            if (!isOpen) scrollToSectionRef.current = section.key;
                            setOpenSection(isOpen ? "" : section.key);
                          }}
                          aria-expanded={isOpen}
                          className="flex w-full items-center gap-4 px-5 py-4 text-left"
                        >
                          <span
                            style={{ ...fonts.displayFont, color: palette.accent, fontSize: "14px", fontWeight: 700 }}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-1">
                            <span className="block" style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "18px", fontWeight: 650 }}>
                              {section.title}
                            </span>
                            <span className="block" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "13px" }}>
                              {section.subtitle}
                            </span>
                          </span>
                          <span
                            className="flex-shrink-0 text-xs font-semibold tracking-[0.1em]"
                            style={{ ...fonts.bodyFont, color: sectionCount ? palette.accent : palette.muted }}
                          >
                            {sectionCount > 0 ? `${sectionCount} selected` : "Optional"}
                          </span>
                          <span style={{ color: palette.primaryDeep, fontSize: "20px", lineHeight: 1 }}>
                            {isOpen ? "−" : "+"}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="grid grid-cols-2 gap-4 border-t px-5 py-5" style={{ borderColor: palette.line }}>
                            {groupByVariant(section.products).map((group) => {
                              const hasVariants = Array.isArray(group.variants) && group.variants.length > 1;
                              const orderedVariants = hasVariants ? sortVariantsByPrice(group.variants) : null;
                              const activeProduct = hasVariants
                                ? byId[selectedVariant[group.key]] || orderedVariants[0]
                                : group.item;
                              const displayName = hasVariants ? group.groupName : activeProduct.name;
                              const count = qty[activeProduct.id] || 0;
                              const photos = normalizePhotos(activeProduct.photos);
                              return (
                                <div
                                  key={group.key}
                                  style={{
                                    border: `1px solid ${count ? palette.accent : palette.line}`,
                                    borderRadius: "5px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => setOpenProduct(activeProduct)}
                                    className="block w-full text-left"
                                    aria-label={`View details for ${displayName}`}
                                  >
                                    <div className="relative aspect-[4/3]" style={{ background: rgba(palette.primary, 0.06) }}>
                                      {photos.length ? (
                                        <PhotoCarousel photos={activeProduct.photos} alt={displayName} className="h-full w-full object-contain" />
                                      ) : (
                                        <div className="flex h-full items-center justify-center">
                                          <span
                                            style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" }}
                                          >
                                            Photo coming soon
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="px-3.5 pt-3.5">
                                      <p style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "15px", fontWeight: 640, lineHeight: 1.2 }}>
                                        {displayName}
                                      </p>
                                      <p className="mt-1" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "13px" }}>
                                        {money(unitPrice(activeProduct))}{" "}
                                        <span>{isRental(activeProduct) ? "/ event" : "to buy"}</span>
                                      </p>
                                      <BulkPriceNote item={activeProduct} fonts={fonts} palette={palette} />
                                    </div>
                                  </button>

                                  <div className="px-3.5 pt-2.5">
                                    {hasVariants && (
                                      <div className="relative">
                                        <select
                                          value={activeProduct.id}
                                          onClick={(e) => e.stopPropagation()}
                                          onChange={(e) =>
                                            setSelectedVariant((current) => ({
                                              ...current,
                                              [group.key]: Number(e.target.value),
                                            }))
                                          }
                                          aria-label={`Choose ${displayName} option`}
                                          className="w-full appearance-none rounded-sm border bg-white pl-2.5 pr-7 py-2 text-xs outline-none"
                                          style={{ ...fonts.bodyFont, borderColor: palette.line, color: palette.ink }}
                                        >
                                          {orderedVariants.map((variant) => {
                                            const label = variant.variant_label || variant.name;
                                            return (
                                              <option key={variant.id} value={variant.id}>
                                                {`${label} (${money(unitPrice(variant))})`}
                                              </option>
                                            );
                                          })}
                                        </select>
                                        <ChevronDown
                                          size={12}
                                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                                          style={{ color: palette.muted }}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  <div className="p-3.5 pt-2.5">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => setQuantity(activeProduct.id, count - 1)}
                                        disabled={count === 0}
                                        aria-label={`Decrease ${displayName} quantity`}
                                        className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-40"
                                        style={{ border: `1px solid ${palette.line}`, color: palette.primaryDeep }}
                                      >
                                        <Minus size={14} />
                                      </button>
                                      <input
                                        type="number"
                                        min="0"
                                        value={count}
                                        onChange={(e) => setQuantity(activeProduct.id, e.target.value)}
                                        aria-label={`${displayName} quantity`}
                                        className="w-12 rounded-sm border text-center text-sm outline-none"
                                        style={{ ...fonts.bodyFont, borderColor: palette.line, color: palette.ink, padding: "4px 0" }}
                                      />
                                      <button
                                        onClick={() => setQuantity(activeProduct.id, count + 1)}
                                        aria-label={`Increase ${displayName} quantity`}
                                        className="flex h-8 w-8 items-center justify-center rounded-full"
                                        style={{ border: `1px solid ${palette.line}`, color: palette.primaryDeep }}
                                      >
                                        <Plus size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <ElevatedCard palette={palette} className="p-6">
              <Kicker palette={palette} fonts={fonts}>YOUR TABLE BOX</Kicker>

              {selected.length === 0 ? (
                <div className="mt-4">
                  <p style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "18px", fontWeight: 650 }}>
                    Nothing yet. Your cupboards win for now.
                  </p>
                  <p className="mt-2" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "14px", lineHeight: 1.6 }}>
                    Use what you already own. Add only the pieces that make the setup better.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {selected.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3">
                      <span style={{ ...fonts.bodyFont, color: palette.ink, fontSize: "14px" }}>
                        {item.quantity} &times; {item.name}
                      </span>
                      <strong style={{ ...fonts.bodyFont, color: palette.primaryDeep, fontSize: "14px", flexShrink: 0 }}>
                        {money(item.lineTotal)}
                      </strong>
                    </div>
                  ))}
                  {deliveryFee > 0 && (
                    <div className="flex items-start justify-between gap-3">
                      <span style={{ ...fonts.bodyFont, color: palette.ink, fontSize: "14px" }}>
                        Delivery + Basic Setup
                      </span>
                      <strong style={{ ...fonts.bodyFont, color: palette.primaryDeep, fontSize: "14px", flexShrink: 0 }}>
                        {money(deliveryFee)}
                      </strong>
                    </div>
                  )}
                </div>
              )}

              <div
                className="mt-5 flex items-center justify-between border-t pt-4"
                style={{ borderColor: palette.line }}
              >
                <span style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "13px", letterSpacing: "0.08em" }}>
                  BOX TOTAL
                </span>
                <strong style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "22px" }}>
                  {money(total)}
                </strong>
              </div>

              {/* The minimum only governs rentals, so a box holding nothing
                  but purchased pieces should not be told it cleared a bar
                  that never applied to it. */}
              <p
                className="mt-3 text-sm font-semibold"
                style={{ ...fonts.bodyFont, color: canAdd ? palette.accent : palette.muted }}
              >
                {rentalSubtotal === 0
                  ? "No rental minimum on pieces you are buying."
                  : canAdd
                    ? "$50 rental minimum reached"
                    : `Add ${money(remaining)} more to reach the $50 rental minimum.`}
              </p>
              {rentalSubtotal > 0 && cartRentalTotal > 0 && (
                <p className="mt-1 text-xs" style={{ ...fonts.bodyFont, color: palette.muted }}>
                  Includes {money(cartRentalTotal)} already in your cart.
                </p>
              )}

              {rentalSubtotal > 0 && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: palette.line }}>
                  <span
                    className="block h-full"
                    style={{ width: `${Math.min(100, (combinedTotal / MINIMUM) * 100)}%`, background: palette.accent }}
                  />
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={!canAdd}
                className="mt-5 w-full rounded-full py-3.5 text-xs font-bold tracking-[0.12em] transition-opacity disabled:opacity-40"
                style={{
                  ...fonts.bodyFont,
                  background: palette.primaryDeep,
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                }}
              >
                ADD BOX TO CART
              </button>
              {!canAdd && selected.length > 0 && (
                <p className="mt-2 text-center text-xs" style={{ ...fonts.bodyFont, color: palette.muted }}>
                  Reach the $50 rental minimum to add your box.
                </p>
              )}
              {justAdded && (
                <p className="mt-2 text-center text-xs font-semibold" style={{ ...fonts.bodyFont, color: palette.accent }}>
                  Added to your cart.
                </p>
              )}

              <p className="mt-4 text-xs leading-5" style={{ ...fonts.bodyFont, color: palette.muted }}>
                Rental availability is confirmed for your selected date at checkout.
              </p>
              <p className="mt-2 text-xs leading-5" style={{ ...fonts.bodyFont, color: palette.muted }}>
                Your standard rental includes pickup the day before your event and return the day
                after.
              </p>
              <p className="mt-2 text-xs leading-5" style={{ ...fonts.bodyFont, color: palette.muted }}>
                Need it longer? Earlier pickup and extended return options are available when you
                choose your rental dates.
              </p>
            </ElevatedCard>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-10 lg:pb-32">
        <div className="grid gap-6 sm:grid-cols-2">
          <ElevatedCard palette={palette} className="p-6 sm:p-7">
            <Kicker palette={palette} fonts={fonts}>CAN'T FIND THE THING?</Kicker>
            <h3
              className="mt-3"
              style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "22px", fontWeight: 640, lineHeight: 1.15 }}
            >
              Let my shopping problem be of benefit to you.
            </h3>
            <p className="mt-3" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "15px", lineHeight: 1.65 }}>
              Send me a photo, a link, or a weirdly specific description. If I can reasonably source
              it and it's something I can use again in the rental collection, I'll try to find it.
            </p>
            <p className="mt-3 font-semibold" style={{ ...fonts.bodyFont, color: palette.accent, fontSize: "13px" }}>
              No sourcing fee. No custom-request charge.
            </p>
            <button
              onClick={() => setShowSourcingModal(true)}
              className="mt-5 rounded-full px-6 py-3 text-xs font-bold tracking-[0.12em]"
              style={{ ...fonts.bodyFont, background: palette.primaryDeep, color: "#FFFFFF", textTransform: "uppercase" }}
            >
              REQUEST THE THING
            </button>
          </ElevatedCard>

          <ElevatedCard palette={palette} className="p-6 sm:p-7">
            <Kicker palette={palette} fonts={fonts}>DELIVERY + SETUP</Kicker>
            <h3
              className="mt-3"
              style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "22px", fontWeight: 640, lineHeight: 1.15 }}
            >
              Don't want to deal with it?
            </h3>
            <p className="mt-3" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "15px", lineHeight: 1.65 }}>
              Add delivery, basic setup and pickup. We'll bring your rental pieces, get the basics
              in place, and come back for them afterward. You host. We handle the boxes.
            </p>
            <p className="mt-3 font-semibold" style={{ ...fonts.bodyFont, color: palette.accent, fontSize: "13px" }}>
              {money(deliveryItem ? Number(deliveryItem.rental_price || 0) : 50)} flat, added to your box.
            </p>
            <button
              onClick={() => setDeliverySetup((current) => !current)}
              className="mt-5 rounded-full px-6 py-3 text-xs font-bold tracking-[0.12em]"
              style={{
                ...fonts.bodyFont,
                background: deliverySetup ? "transparent" : palette.primaryDeep,
                color: deliverySetup ? palette.primaryDeep : "#FFFFFF",
                border: deliverySetup ? `1px solid ${palette.primaryDeep}` : "none",
                textTransform: "uppercase",
              }}
            >
              {deliverySetup ? "DELIVERY + SETUP ADDED" : "ADD DELIVERY + SETUP"}
            </button>
          </ElevatedCard>
        </div>
      </section>

      {showSourcingModal && <SourcingRequestModal onClose={() => setShowSourcingModal(false)} />}

      {openProduct && (
        <div
          className="fixed inset-0 z-[170] flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(20,18,12,.72)", backdropFilter: "blur(6px)" }}
          role="dialog"
          aria-modal="true"
          aria-label={openProduct.name}
          onClick={() => setOpenProduct(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl"
            style={{ background: palette.surface, boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}
          >
            <button
              onClick={() => setOpenProduct(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.9)", color: palette.primaryDeep }}
              aria-label="Close"
            >
              <X size={19} />
            </button>

            <div className="relative aspect-[4/3]" style={{ background: rgba(palette.primary, 0.06) }}>
              {normalizePhotos(openProduct.photos).length ? (
                <PhotoCarousel photos={openProduct.photos} alt={openProduct.name} className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    Photo coming soon
                  </span>
                </div>
              )}
            </div>

            <div className="px-6 py-6">
              {parseItemTags(openProduct).length > 0 && (
                <p style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  {parseItemTags(openProduct).join(" · ")}
                </p>
              )}
              <h2 className="mt-1" style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "26px", fontWeight: 640 }}>
                {openProduct.name}
              </h2>

              {openProduct.description && <DescriptionBody text={openProduct.description} />}

              <div className="mt-5 border-t pt-4" style={{ borderColor: palette.line }}>
                <span style={{ ...fonts.bodyFont, color: palette.primaryDeep, fontSize: "16px", fontWeight: 650 }}>
                  {money(unitPrice(openProduct))}{" "}
                  <span style={{ color: palette.muted, fontWeight: 400 }}>
                    {isRental(openProduct) ? "/ event" : "to buy"}
                  </span>
                </span>
                <BulkPriceNote item={openProduct} fonts={fonts} palette={palette} />
                {openProduct.replacement_value && (
                  <p className="mt-2" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "13px" }}>
                    Replacement value: {openProduct.replacement_value}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
