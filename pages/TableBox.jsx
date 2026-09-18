import React, { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useCart } from "../CartContext";
import { usePalette } from "../PaletteContext";
import { withBasePath } from "../apiBase";
import PhotoCarousel, { normalizePhotos } from "../components/PhotoCarousel";
import {
  ElevatedCard,
  Kicker,
  Reveal,
  editorialShadow,
  paperTexture,
  rgba,
} from "../components/EditorialKit";

const MINIMUM = 50;

// Hand-picked from the real decor catalogue (not a separate product list) -
// each section only shows items that actually resolve with an active,
// rented price, so a section quietly disappears rather than showing empty
// tiles if an item's price or active flag ever changes.
const SECTIONS = [
  {
    key: "glassware",
    title: "Choose Your Glassware",
    subtitle: "Pick your favourite glass and tell us how many places you're setting.",
    itemIds: [449, 435, 447],
  },
  {
    key: "chargers",
    title: "Choose Your Chargers",
    subtitle: "Give every place setting a little more polish.",
    itemIds: [8],
  },
  {
    key: "centerpieces",
    title: "Choose Your Centrepiece",
    subtitle: "Choose the piece that anchors your table.",
    itemIds: [506, 507, 508, 509, 445, 491],
  },
  {
    key: "candles",
    title: "Choose Your Candles",
    subtitle: "Finish the table with a little glow.",
    itemIds: [310, 481, 456],
  },
  {
    key: "garland-lights",
    title: "Choose Your Garland & Lights",
    subtitle: "Dress the table or the mantle for the holidays.",
    itemIds: [497, 498],
  },
];

function money(n) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);
}

export default function TableBox() {
  const { palette, fonts } = usePalette();
  const { addRental, rentalItems } = useCart();

  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [qty, setQty] = useState({});
  const [openSection, setOpenSection] = useState(SECTIONS[0].key);
  const [justAdded, setJustAdded] = useState(false);

  // Pulls in pricing for whatever is already sitting in the cart's rental
  // lines too, not just this page's curated section ids - the $50 minimum
  // check below needs the combined total, and a rental added from the
  // Decor page (outside this curated list) still counts toward it.
  const cartRentalIds = useMemo(() => rentalItems.map((item) => item.id), [rentalItems]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!supabase) {
        setLoadError("Rental catalogue is unavailable right now. Please try again shortly.");
        setLoading(false);
        return;
      }
      const ids = Array.from(new Set([...SECTIONS.flatMap((s) => s.itemIds), ...cartRentalIds]));
      const { data, error } = await supabase.from("items").select("*").in("id", ids);
      if (ignore) return;
      if (error) {
        setLoadError("Rental catalogue is unavailable right now. Please try again shortly.");
      } else {
        setCatalogItems(data || []);
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
        products: section.itemIds
          .map((id) => byId[id])
          .filter((item) => item && item.active !== false && item.rental_price != null),
      })).filter((section) => section.products.length > 0),
    [byId]
  );

  const allProducts = useMemo(() => sections.flatMap((s) => s.products), [sections]);

  const selected = useMemo(
    () =>
      allProducts
        .filter((p) => (qty[p.id] || 0) > 0)
        .map((p) => ({
          ...p,
          quantity: qty[p.id],
          lineTotal: Number(p.rental_price) * qty[p.id],
        })),
    [allProducts, qty]
  );

  const total = selected.reduce((sum, item) => sum + item.lineTotal, 0);

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

  const combinedTotal = total + cartRentalTotal;
  const remaining = Math.max(0, MINIMUM - combinedTotal);
  const canAdd = combinedTotal >= MINIMUM && selected.length > 0;

  const setQuantity = (id, next) => {
    const safe = Math.max(0, Math.floor(Number(next) || 0));
    setQty((current) => ({ ...current, [id]: safe }));
  };

  const handleAdd = () => {
    if (!canAdd) return;
    selected.forEach((item) => addRental(item.id, null, item.quantity));
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
                            {section.products.map((product) => {
                              const count = qty[product.id] || 0;
                              const photos = normalizePhotos(product.photos);
                              return (
                                <div
                                  key={product.id}
                                  style={{
                                    border: `1px solid ${count ? palette.accent : palette.line}`,
                                    borderRadius: "5px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div className="relative aspect-[4/3]" style={{ background: rgba(palette.primary, 0.06) }}>
                                    {photos.length ? (
                                      <PhotoCarousel photos={product.photos} alt={product.name} className="h-full w-full object-cover" />
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
                                  <div className="p-3.5">
                                    <p style={{ ...fonts.displayFont, color: palette.primaryDeep, fontSize: "15px", fontWeight: 640, lineHeight: 1.2 }}>
                                      {product.name}
                                    </p>
                                    <p className="mt-1" style={{ ...fonts.bodyFont, color: palette.muted, fontSize: "13px" }}>
                                      {money(Number(product.rental_price))} <span>/ each</span>
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                      <button
                                        onClick={() => setQuantity(product.id, count - 1)}
                                        disabled={count === 0}
                                        aria-label={`Decrease ${product.name} quantity`}
                                        className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-40"
                                        style={{ border: `1px solid ${palette.line}`, color: palette.primaryDeep }}
                                      >
                                        <Minus size={14} />
                                      </button>
                                      <input
                                        type="number"
                                        min="0"
                                        value={count}
                                        onChange={(e) => setQuantity(product.id, e.target.value)}
                                        aria-label={`${product.name} quantity`}
                                        className="w-12 rounded-sm border text-center text-sm outline-none"
                                        style={{ ...fonts.bodyFont, borderColor: palette.line, color: palette.ink, padding: "4px 0" }}
                                      />
                                      <button
                                        onClick={() => setQuantity(product.id, count + 1)}
                                        aria-label={`Increase ${product.name} quantity`}
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

              <p
                className="mt-3 text-sm font-semibold"
                style={{ ...fonts.bodyFont, color: canAdd ? palette.accent : palette.muted }}
              >
                {canAdd ? "$50 minimum reached" : `Add ${money(remaining)} more to reach the $50 rental minimum.`}
              </p>
              {cartRentalTotal > 0 && (
                <p className="mt-1 text-xs" style={{ ...fonts.bodyFont, color: palette.muted }}>
                  Includes {money(cartRentalTotal)} already in your cart.
                </p>
              )}

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: palette.line }}>
                <span
                  className="block h-full"
                  style={{ width: `${Math.min(100, (combinedTotal / MINIMUM) * 100)}%`, background: palette.accent }}
                />
              </div>

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
              {!canAdd && (
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
    </main>
  );
}
