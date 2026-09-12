import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, Search, Sparkles } from "lucide-react";
import { supabase } from "../supabaseClient";
import DecorCard, { parseItemTags } from "../components/DecorCard";
import { normalizePhotos } from "../components/PhotoCarousel";
import DecorDetailModal from "../components/DecorDetailModal";
import RentalDatesModal from "../components/RentalDatesModal";
import { rentalDatesValid } from "../components/RentalDateFields";
import { useCart } from "../CartContext";
import { useEventType } from "../EventTypeContext";
import { usePalette } from "../PaletteContext";
import { TAGS as CATALOG_TAGS } from "../decorTags";
import {
  ElevatedCard,
  JewelBand,
  Kicker,
  PageHero,
  PrimaryButton,
  Reveal,
  SectionIntro,
  paperTexture,
  rgba,
} from "../components/EditorialKit";

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

const DECOR_CATEGORY_IDS = [
  "table",
  "wall/floor",
  "equipment",
  "marquee letters & numbers",
  "keepsakes & gifts",
  "disposables",
  "dessert items",
];

const CATEGORIES = CATALOG_TAGS.filter((t) => DECOR_CATEGORY_IDS.includes(t.id));

const AVAILABILITY = [
  { id: "all", label: "All" },
  { id: "rent", label: "Rent" },
  { id: "purchase", label: "Purchase" },
];

function itemTags(item) {
  const sheetTags = parseItemTags(item).map(normalize);
  const derived = [];
  if (item.rental_price != null) derived.push("rent");
  if (item.purchase_price != null) derived.push("purchase");
  return [...sheetTags, ...derived];
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export default function Decor() {
  const { palette, fonts } = usePalette();
  const { openPickerForBuilder } = useEventType();
  const { addToCart, addRental, rentalDates } = useCart();

  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [availability, setAvailability] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailItem, setDetailItem] = useState(null);
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [pendingRentItem, setPendingRentItem] = useState(null);
  const [rentalNotice, setRentalNotice] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const datesReady = rentalDatesValid(rentalDates);

  useEffect(() => {
    if (!supabase) {
      setError("The decor catalog isn't connected yet. Check back soon.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("active", true)
        .order("name", { ascending: true });

      if (cancelled) return;
      if (error) setError(error.message);
      else setItems(data || []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    if (!selectedCategory) return [];
    const q = normalize(query);

    return items.filter((item) => {
      const tags = itemTags(item);
      if (!tags.includes(selectedCategory)) return false;
      if (availability !== "all" && !tags.includes(availability)) return false;

      return (
        !q ||
        normalize(item.name).includes(q) ||
        normalize(item.description).includes(q)
      );
    });
  }, [items, selectedCategory, availability, query]);

  const cardUnits = useMemo(() => {
    const seen = new Set();
    const result = [];

    for (const item of items) {
      const key = item.variant_group?.trim();
      if (key) {
        if (seen.has(key)) continue;
        seen.add(key);
      }
      result.push(item);
    }

    return result;
  }, [items]);

  const categoryCounts = useMemo(() => {
    const counts = {};

    for (const unit of cardUnits) {
      const tags = itemTags(unit);
      for (const cat of CATEGORIES) {
        if (tags.includes(cat.id)) counts[cat.id] = (counts[cat.id] || 0) + 1;
      }
    }

    return counts;
  }, [cardUnits]);

  const groupedVisible = useMemo(() => {
    const seen = new Set();
    const result = [];

    for (const item of visible) {
      const key = item.variant_group?.trim();

      if (!key) {
        result.push({ key: item.id, item, variants: null });
        continue;
      }

      if (seen.has(key)) continue;
      seen.add(key);

      const variants = visible
        .filter((i) => i.variant_group?.trim() === key)
        .sort(
          (a, b) =>
            Number(normalizePhotos(b.photos).length > 0) -
            Number(normalizePhotos(a.photos).length > 0)
        );

      result.push({ key, item: variants[0], variants, groupName: key });
    }

    return result;
  }, [visible]);

  const selectCategory = (id) => {
    setSelectedCategory(id);
    setAvailability("all");
    setQuery("");
  };

  const attemptAddRental = async (item, dates) => {
    setRentalNotice("");

    if (!supabase) {
      addRental(item.id);
      return;
    }

    setCheckingAvailability(true);
    const { data, error: availabilityError } = await supabase.rpc("get_reservation_item_availability", {
      p_item_id: Number(item.id),
      p_pickup: dates.pickup,
      p_dropoff: dates.dropoff,
    });
    setCheckingAvailability(false);

    if (availabilityError || Number(data || 0) < 1) {
      setRentalNotice(`${item.name} isn't available for ${formatDate(dates.pickup)} to ${formatDate(dates.dropoff)}.`);
      return;
    }

    addRental(item.id);
  };

  const handleRent = async (item) => {
    setDetailItem(null);
    if (!datesReady) {
      setPendingRentItem(item);
      setShowDatesModal(true);
      return;
    }
    await attemptAddRental(item, rentalDates);
  };

  const handleBuy = (item) => {
    setDetailItem(null);
    addToCart(item.id, "catalog");
  };

  const handleDatesSaved = async (savedDates) => {
    setShowDatesModal(false);
    if (pendingRentItem) {
      const item = pendingRentItem;
      setPendingRentItem(null);
      await attemptAddRental(item, savedDates);
    }
  };

  return (
    <main style={{ background: palette.bg, color: palette.ink }}>
      <PageHero
        eyebrow="THE RENTAL COLLECTION"
        title="The pieces that make the room feel intentional."
        script="Pretty, useful and very much invited."
        body="Browse decor, tabletop pieces, statement items and event details available to rent or purchase. The collection is designed to support the experience without becoming a room full of stuff nobody touches."
        palette={palette}
        fonts={fonts}
        align="center"
      />

      <JewelBand palette={palette} style={{ padding: "72px 24px" }}>
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="START HERE"
            title="What are you looking for?"
            body="Choose a category first, then narrow it down by rent or purchase. Because scrolling through every object humanity has ever put on a party table is not a user experience."
            palette={palette}
            fonts={fonts}
            light
          />

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.map((cat, i) => {
              const active = selectedCategory === cat.id;

              return (
                <Reveal key={cat.id} delay={i * 45}>
                  <button
                    type="button"
                    onClick={() => selectCategory(cat.id)}
                    className="group h-full w-full text-left"
                  >
                    <ElevatedCard
                      palette={palette}
                      className="h-full p-6 transition-transform group-hover:-translate-y-1"
                      style={{
                        background: active ? palette.gold : palette.surface,
                        borderColor: active ? palette.gold : rgba(palette.gold, 0.26),
                      }}
                    >
                      <span
                        style={{
                          ...fonts.bodyFont,
                          color: active ? palette.primaryDeep : palette.goldDeep,
                          fontSize: "11px",
                          fontWeight: 800,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <h3
                        className="mt-5"
                        style={{
                          ...fonts.displayFont,
                          color: palette.primaryDeep,
                          fontSize: "1.55rem",
                          fontWeight: 700,
                          lineHeight: 1.05,
                        }}
                      >
                        {cat.label}
                      </h3>

                      <p
                        className="mt-2"
                        style={{
                          ...fonts.bodyFont,
                          color: active ? palette.primaryDeep : palette.muted,
                          fontSize: "13px",
                        }}
                      >
                        {categoryCounts[cat.id] || 0}{" "}
                        {categoryCounts[cat.id] === 1 ? "item" : "items"}
                      </p>
                    </ElevatedCard>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </JewelBand>

      <section style={{ ...paperTexture(palette), padding: "82px 24px 100px" }}>
        <div className="mx-auto max-w-7xl">
          {!selectedCategory ? (
            <div className="mx-auto max-w-3xl text-center">
              <Sparkles className="mx-auto" size={20} color={palette.goldDeep} />
              <h2
                className="mt-5"
                style={{
                  ...fonts.displayFont,
                  color: palette.primaryDeep,
                  fontSize: "clamp(2.4rem, 4.5vw, 4rem)",
                  lineHeight: 1,
                  fontWeight: 630,
                }}
              >
                Pick a category above to open the collection.
              </h2>
              <p
                className="mx-auto mt-5 max-w-xl text-base leading-7"
                style={{ ...fonts.bodyFont, color: palette.muted }}
              >
                You will see live availability options, rental and purchase choices, photos and item details inside each category.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="mb-5 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em]"
                    style={{ ...fonts.bodyFont, color: palette.goldDeep, textTransform: "uppercase" }}
                  >
                    <ChevronLeft size={14} />
                    All categories
                  </button>

                  <Kicker palette={palette} fonts={fonts}>BROWSE THE COLLECTION</Kicker>
                  <h2
                    className="mt-3"
                    style={{
                      ...fonts.displayFont,
                      color: palette.primaryDeep,
                      fontSize: "clamp(2.5rem, 4.6vw, 4.2rem)",
                      lineHeight: 1,
                      fontWeight: 630,
                    }}
                  >
                    {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {AVAILABILITY.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAvailability(a.id)}
                      className="rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.08em]"
                      style={{
                        ...fonts.bodyFont,
                        background: availability === a.id ? palette.primaryDeep : palette.surface,
                        color: availability === a.id ? "#FFFFFF" : palette.primaryDeep,
                        border: `1px solid ${availability === a.id ? palette.primaryDeep : palette.line}`,
                        textTransform: "uppercase",
                      }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <ElevatedCard palette={palette} className="max-w-lg flex-1 px-5">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-0 top-1/2 -translate-y-1/2"
                      color={palette.muted}
                    />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search this category"
                      className="w-full bg-transparent py-4 pl-7 pr-3 text-base outline-none"
                      style={{ ...fonts.bodyFont, color: palette.ink }}
                    />
                  </div>
                </ElevatedCard>

                <button
                  type="button"
                  onClick={() => setShowDatesModal(true)}
                  className="flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold"
                  style={{
                    ...fonts.bodyFont,
                    background: palette.surface,
                    border: `1px solid ${datesReady ? palette.primaryDeep : palette.line}`,
                    color: palette.primaryDeep,
                  }}
                >
                  <CalendarDays size={15} color={palette.goldDeep} />
                  {datesReady
                    ? `Renting ${formatDate(rentalDates.pickup)} – ${formatDate(rentalDates.dropoff)} · Change`
                    : "Set your rental dates"}
                </button>
              </div>

              {checkingAvailability && (
                <p className="mt-4 text-sm" style={{ ...fonts.bodyFont, color: palette.muted }}>
                  Checking availability for your dates...
                </p>
              )}

              {rentalNotice && (
                <p
                  className="mt-4 rounded-sm px-4 py-3 text-sm"
                  style={{ ...fonts.bodyFont, background: rgba("#B8305F", 0.08), color: "#8A3142" }}
                >
                  {rentalNotice}
                </p>
              )}

              <div className="mt-12">
                {loading && (
                  <p className="py-20 text-center text-base" style={{ ...fonts.bodyFont, color: palette.muted }}>
                    Curating the collection...
                  </p>
                )}

                {error && (
                  <p className="py-20 text-center text-base text-red-700" style={fonts.bodyFont}>
                    Couldn't load the collection: {error}
                  </p>
                )}

                {!loading && !error && visible.length === 0 && (
                  <p className="py-20 text-center text-base" style={{ ...fonts.bodyFont, color: palette.muted }}>
                    Nothing matches yet.
                  </p>
                )}

                <div className="grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedVisible.map((entry) => (
                    <DecorCard
                      key={entry.key}
                      item={entry.item}
                      variants={entry.variants}
                      groupName={entry.groupName}
                      onRent={handleRent}
                      onBuy={handleBuy}
                      onOpenDetail={setDetailItem}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <div
            className="mt-20 border-t pt-12 text-center"
            style={{ borderColor: rgba(palette.gold, 0.35) }}
          >
            <Kicker palette={palette} fonts={fonts}>WANT MORE THAN THE PIECES?</Kicker>
            <h2
              className="mx-auto mt-4 max-w-3xl"
              style={{
                ...fonts.displayFont,
                color: palette.primaryDeep,
                fontSize: "clamp(2.4rem, 4.6vw, 4rem)",
                lineHeight: 1,
                fontWeight: 630,
              }}
            >
              Build an experience your guests actually become part of.
            </h2>
            <div className="mt-7">
              <PrimaryButton onClick={() => openPickerForBuilder()} palette={palette} fonts={fonts}>
                Build my experience
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      {detailItem && (
        <DecorDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onRent={handleRent}
          onBuy={handleBuy}
        />
      )}

      {showDatesModal && (
        <RentalDatesModal
          onClose={() => {
            setShowDatesModal(false);
            setPendingRentItem(null);
          }}
          onSaved={handleDatesSaved}
        />
      )}
    </main>
  );
}
