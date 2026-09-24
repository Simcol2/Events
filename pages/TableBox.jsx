import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Minus, Plus, X } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useCart } from "../CartContext";
import { usePalette } from "../PaletteContext";
import { withBasePath } from "../apiBase";
import PhotoCarousel, { normalizePhotos } from "../components/PhotoCarousel";
import DescriptionBody from "../components/ItemDescription";
import { parseItemTags, groupByVariant, sortVariantsByPrice } from "../components/DecorCard";
import {
  ElevatedCard,
  Kicker,
  Reveal,
  editorialShadow,
  paperTexture,
  rgba,
} from "../components/EditorialKit";

const MINIMUM = 50;

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
    subtitle: "Pick your favourite glass and tell us how many places you're setting.",
    category: "Glassware",
  },
  {
    key: "plates",
    title: "Choose Your Plates",
    subtitle: "Pick the guest count and we will send enough for everyone.",
    category: "Plates",
  },
  {
    key: "chargers",
    title: "Choose Your Chargers",
    subtitle: "Give every place setting a little more polish.",
    category: "Chargers",
  },
  {
    key: "placeCards",
    title: "Choose Your Place Cards",
    subtitle: "Add blank ivory place cards for your table.",
    category: "Place Cards",
  },
  {
    key: "napkins",
    title: "Choose Your Napkins",
    subtitle: "Finish every place setting with a folded napkin.",
    category: "Napkins",
  },
  {
    key: "cutlery",
    title: "Choose Your Cutlery",
    subtitle: "Set the table with a full place setting.",
    category: "Cutlery",
  },
  {
    key: "centerpieces",
    title: "Choose Your Centrepiece",
    subtitle: "Choose the piece that anchors your table.",
    category: "Centerpiece",
  },
  {
    key: "cakeStands",
    title: "Choose Your Cake Stand",
    subtitle: "Add a stand for cakes, cupcakes, or treats.",
    category: "Cake Stands",
  },
  {
    key: "candles",
    title: "Choose Your Candles",
    subtitle: "Finish the table with a little glow.",
    category: "Candles",
  },
  {
    key: "linens",
    title: "Choose Your Linens",
    subtitle: "Dress the table with a runner or cloth.",
    category: "Linens",
  },
  {
    key: "garland-lights",
    title: "Choose Your Garland & Lights",
    subtitle: "Dress the table or the mantle for the holidays.",
    category: "Garland & Lights",
  },
  {
    key: "helpfulAddOns",
    title: "Helpful Add-Ons",
    subtitle: "A few extra pieces that make hosting easier.",
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

export default function TableBox() {
  const { palette, fonts } = usePalette();
  const { addRental, addToCart, rentalItems } = useCart();

  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [qty, setQty] = useState({});
  const [openSection, setOpenSection] = useState(SECTIONS[0].key);
  const [justAdded, setJustAdded] = useState(false);
  const [openProduct, setOpenProduct] = useState(null);
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
      const [byCategory, byCartId] = await Promise.all([
        supabase.from("items").select("*").in("table_box_category", categories),
        cartRentalIds.length
          ? supabase.from("items").select("*").in("id", cartRentalIds)
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (ignore) return;
      if (byCategory.error || byCartId.error) {
        setLoadError("Rental catalogue is unavailable right now. Please try again shortly.");
      } else {
        const merged = new Map();
        for (const item of [...(byCategory.data || []), ...(byCartId.data || [])]) {
          merged.set(item.id, item);
        }
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
          lineTotal: unitPrice(p) * qty[p.id],
        })),
    [allProducts, qty]
  );

  const total = selected.reduce((sum, item) => sum + item.lineTotal, 0);
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
        return sum + Number(catalogItem.rental_price) * item.quantity;
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
    setQty({});
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 5000);
  };

  return (
    <main style={paperTexture(palette)}>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{ width: "420px", height: "420px", right: "-180px", top: "-220px", background: rgba(palette.decorTint, 0.09) }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center sm:px-10 lg:py-28">
          <Kicker palette={palette} fonts={fonts}>HOSTING AT HOME?</Kicker>
          <h1
            className="mt-4"
            style={{
              ...fonts.displayFont,
              color: palette.primaryDeep,
              fontSize: "clamp(3.2rem, 6vw, 6rem)",
              fontWeight: 640,
              lineHeight: 0.98,
              letterSpacing: "-0.04em",
            }}
          >
            Build Your Table Box
          </h1>
          <p
            className="mx-auto mt-7 max-w-2xl"
            style={{ ...fonts.bodyFont, color: palette.ink, fontSize: "17px", lineHeight: 1.75 }}
          >
            Rent only what you need for your next event at home. Choose the pieces you love, set the
            table your way, then return everything when the celebrating is done.
          </p>
          <div
            className="mx-auto mt-7 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2"
            style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "14px" }}
          >
            <span>$50 minimum rental order</span>
            <span aria-hidden="true">&middot;</span>
            <span>Toronto pickup and return</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-6 sm:px-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: "4/3", borderRadius: "5px", boxShadow: editorialShadow, border: `1px solid ${rgba(palette.gold, 0.3)}` }}
          >
            <img
              src={withBasePath("/photos/table-box-before.jpg")}
              alt="A simple home dinner table before rental styling"
              className="h-full w-full object-cover"
            />
            <span
              className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold tracking-[0.16em]"
              style={{ ...fonts.bodyFont, background: "rgba(255,255,255,0.92)", color: palette.primaryDeep }}
            >
              BEFORE
            </span>
          </div>
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: "4/3", borderRadius: "5px", boxShadow: editorialShadow, border: `1px solid ${rgba(palette.gold, 0.3)}` }}
          >
            <img
              src={withBasePath("/photos/table-box-after.jpg")}
              alt="The same home dinner table styled with rental pieces"
              className="h-full w-full object-cover"
            />
            <span
              className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold tracking-[0.16em]"
              style={{ ...fonts.bodyFont, background: "rgba(255,255,255,0.92)", color: palette.primaryDeep }}
            >
              AFTER
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-10 lg:pb-32">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <Kicker palette={palette} fonts={fonts}>BUILD YOUR BOX</Kicker>
            <h2
              className="mt-3"
              style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "clamp(1.9rem, 3.4vw, 2.6rem)", fontWeight: 630 }}
            >
              A few pieces can change the whole table.
            </h2>
            <p className="mt-3" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "16px", lineHeight: 1.7 }}>
              Choose from each collection below. Skip anything you already have at home.
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
                    <Reveal key={section.key} delay={index * 40}>
                      <div style={{ border: `1px solid ${palette.line}`, borderRadius: "5px", background: palette.surface }}>
                        <button
                          onClick={() => setOpenSection(isOpen ? "" : section.key)}
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
                    </Reveal>
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
                    Your box is waiting.
                  </p>
                  <p className="mt-2" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "14px", lineHeight: 1.6 }}>
                    Choose only the pieces your table needs. We won't make you rent twelve napkins because
                    you wanted one cake stand.
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
                Need a longer rental period? Inquire about our week-long pricing.
              </p>
            </ElevatedCard>
          </aside>
        </div>
      </section>

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
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
