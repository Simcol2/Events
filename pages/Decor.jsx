import React, { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft } from "lucide-react";
import { supabase } from "../supabaseClient";
import SectionHeading from "../components/SectionHeading";
import DecorCard, { parseItemTags } from "../components/DecorCard";
import { normalizePhotos } from "../components/PhotoCarousel";
import DecorDetailModal from "../components/DecorDetailModal";
import RentalRequestModal from "../components/RentalRequestModal";
import { useEventDate } from "../EventDateContext";
import { useEventType } from "../EventTypeContext";
import { TAGS as CATALOG_TAGS } from "../decorTags";

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

// The product categories a customer actually browses by, shown as the
// "CHOOSE A DECOR ITEM" tiles. This is a fixed, explicit list rather than
// "every tag minus a few" so it can never silently pick up a tag it
// shouldn't: Gift Wrap and Stationery belong on the Gifts page (see
// pages/Gifts.jsx), Showers/Baby/Birthdays/Holidays are occasion tags an
// item carries alongside its category rather than a category of their
// own, and Activities was dropped from Decor entirely - every item that
// carried it also carries one of the categories below, so nothing is lost.
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

// "rent" and "purchase" aren't stored tags - they're derived automatically
// from whether rental_price/purchase_price is set, so an item can never
// claim an availability it doesn't actually have a price for.
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

export default function Decor({ navigate }) {
  const { openPickerForBuilder } = useEventType();
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [availability, setAvailability] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [request, setRequest] = useState(null); // { item, requestType } | null
  const [detailItem, setDetailItem] = useState(null);
  const { requestEventDate } = useEventDate();

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
    return () => { cancelled = true; };
  }, []);

  // Nothing shows until a category tile is clicked - that's the whole
  // point of the tile step, so an empty selectedCategory returns no items
  // rather than falling back to "show everything."
  const visible = useMemo(() => {
    if (!selectedCategory) return [];
    const q = normalize(query);
    return items.filter((item) => {
      const tags = itemTags(item);
      if (!tags.includes(selectedCategory)) return false;
      if (availability !== "all" && !tags.includes(availability)) return false;
      const matchesSearch =
        !q || normalize(item.name).includes(q) || normalize(item.description).includes(q);
      return matchesSearch;
    });
  }, [items, selectedCategory, availability, query]);

  // Tile counts count cards, not database rows - the 26 marquee letter
  // rows are one card, so the Marquee tile should say 2 (letters +
  // numbers), not 28. Keeping only the first row seen per variant_group
  // gives an accurate count regardless of which category/search filter is
  // active, since tile counts are always shown against the full catalog.
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

  const selectCategory = (id) => {
    setSelectedCategory(id);
    setAvailability("all");
    setQuery("");
  };

  // Rows sharing a variant_group (e.g. the Large and Small rows for the
  // same candle holders) render as one card with a dropdown instead of a
  // separate card each. Order follows the first variant's position in the
  // already-sorted list, so the page doesn't jump around alphabetically.
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
      // A variant that has photos leads the card, so the default view is
      // never a "photo coming soon" placeholder while another color in the
      // same group has a real picture. Sort is stable, so variants that
      // both have photos (or both don't) keep their existing order.
      const variants = visible
        .filter((i) => i.variant_group?.trim() === key)
        .sort((a, b) => Number(normalizePhotos(b.photos).length > 0) - Number(normalizePhotos(a.photos).length > 0));
      result.push({ key, item: variants[0], variants, groupName: key });
    }
    return result;
  }, [visible]);

  // The event date prompt (if needed) resolves before the rental modal ever
  // opens, so RentalRequestModal can assume it already has one to default
  // pickup/drop-off from.
  const handleRent = async (item) => {
    const date = await requestEventDate();
    if (!date) return;
    setDetailItem(null);
    setRequest({ item, requestType: "rental" });
  };

  const handleBuy = (item) => {
    setDetailItem(null);
    setRequest({ item, requestType: "purchase" });
  };

  return (
    <div>
      <section className="border-b border-[#E4DCC8]">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-20 sm:px-8">
          <SectionHeading
            eyebrow="THE COLLECTION"
            title="Beautiful enough for the room. Meaningful enough for the years after."
            subtitle="Decor supports the experience, it doesn't replace it. Browse the pieces that create a cohesive, beautiful backdrop for the celebration your guests will actually take part in."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-[Jost] text-sm font-semibold tracking-[0.16em] text-[#4E5A44]">CHOOSE A DECOR ITEM</span>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1 font-[Jost] text-sm font-medium tracking-[0.1em] text-[#8C846F] underline underline-offset-4"
            >
              <ChevronLeft size={13} /> ALL CATEGORIES
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectCategory(cat.id)}
                className={`rounded-sm border px-5 py-6 text-center transition-colors ${
                  active ? "border-[#4E5A44] bg-[#4E5A44] text-white" : "border-[#D8D0BC] bg-white text-[#5C5645] hover:border-[#4E5A44]"
                }`}
              >
                <div className="font-[Jost] text-sm font-semibold tracking-[0.1em]">{cat.label.toUpperCase()}</div>
                <div className={`mt-1 font-[Jost] text-sm ${active ? "text-white/80" : "text-[#A69C7E]"}`}>
                  {categoryCounts[cat.id] || 0} {categoryCounts[cat.id] === 1 ? "item" : "items"}
                </div>
              </button>
            );
          })}
        </div>

        {selectedCategory && (
          <div className="mt-10 border-t border-[#E4DCC8] pt-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">
                {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
              </h2>
              <div className="flex gap-2">
                {AVAILABILITY.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAvailability(a.id)}
                    className={`rounded-sm border px-4 py-2 font-[Jost] text-sm font-medium tracking-[0.08em] ${
                      availability === a.id ? "border-[#4E5A44] bg-[#4E5A44] text-white" : "border-[#D8D0BC] text-[#716B5C]"
                    }`}
                  >
                    {a.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-6 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A69C7E]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search this category"
                className="w-full border-b border-[#D8D0BC] bg-transparent py-3 pl-9 pr-3 font-[Jost] text-base text-[#3A342A] outline-none placeholder:text-[#A69C7E] focus:border-[#4E5A44]"
              />
            </div>

            <div className="mt-10">
              {loading && <p className="py-20 text-center font-[Jost] text-base text-[#A69C7E]">Curating the collection…</p>}
              {error && <p className="py-20 text-center font-[Jost] text-base text-red-700">Couldn't load the collection: {error}</p>}
              {!loading && !error && visible.length === 0 && (
                <p className="py-20 text-center font-[Jost] text-base text-[#A69C7E]">Nothing matches yet.</p>
              )}
              <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>
        )}

        {detailItem && !request && (
          <DecorDetailModal
            item={detailItem}
            onClose={() => setDetailItem(null)}
            onRent={handleRent}
            onBuy={handleBuy}
          />
        )}

        {request && (
          <RentalRequestModal
            item={request.item}
            requestType={request.requestType}
            onClose={() => setRequest(null)}
          />
        )}

        <div className="mt-20 border-t border-[#E4DCC8] pt-7 text-center">
          <p className="font-[Jost] text-sm tracking-[0.18em] text-[#8C846F]">
            WANT AN EXPERIENCE YOUR GUESTS BECOME PART OF, NOT JUST A ROOM FULL OF DECOR?
          </p>
          <button onClick={() => openPickerForBuilder()} className="mt-4 border border-[#B8935A] px-6 py-3 font-[Jost] text-sm font-semibold tracking-[0.2em] text-[#4E5A44]">
            BUILD MY EXPERIENCE
          </button>
        </div>
      </section>
    </div>
  );
}
