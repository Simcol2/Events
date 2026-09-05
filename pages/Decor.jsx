import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "../supabaseClient";
import SectionHeading from "../components/SectionHeading";
import DecorCard, { parseItemTags } from "../components/DecorCard";
import DecorDetailModal from "../components/DecorDetailModal";
import RentalRequestModal from "../components/RentalRequestModal";
import { useEventDate } from "../EventDateContext";
import { TAGS as CATALOG_TAGS } from "../decorTags";

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

// "rent" and "purchase" aren't stored tags - they're derived automatically
// from whether rental_price/purchase_price is set, so they're added here
// as filter-only options rather than living in the shared decorTags list
// (which the admin form also uses, where they wouldn't make sense as a
// checkbox).
const TAGS = [...CATALOG_TAGS, { id: "rent", label: "Rent" }, { id: "purchase", label: "Purchase" }];

function itemTags(item) {
  const sheetTags = parseItemTags(item).map(normalize);
  const derived = [];
  if (item.rental_price != null) derived.push("rent");
  if (item.purchase_price != null) derived.push("purchase");
  return [...sheetTags, ...derived];
}

export default function Decor({ navigate }) {
  const [items, setItems] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [gender, setGender] = useState("all");
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

  const visible = useMemo(() => {
    const q = normalize(query);
    return items.filter((item) => {
      const tags = itemTags(item);
      const matchesTags = selectedTags.length === 0 || selectedTags.some((t) => tags.includes(t));
      const matchesGender = gender === "all" || normalize(item.gender) === gender;
      const matchesSearch =
        !q ||
        normalize(item.name).includes(q) ||
        normalize(item.description).includes(q) ||
        tags.some((t) => t.includes(q));
      return matchesTags && matchesGender && matchesSearch;
    });
  }, [items, selectedTags, gender, query]);

  const toggleTag = (id) =>
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

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
      const variants = visible.filter((i) => i.variant_group?.trim() === key);
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
        <div className="flex flex-col gap-5 border-b border-[#E4DCC8] pb-7">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-[Jost] text-xs font-semibold tracking-[0.16em] text-[#4E5A44]">FILTER BY TAG</span>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="font-[Jost] text-xs font-medium tracking-[0.1em] text-[#8C846F] underline underline-offset-4"
                >
                  CLEAR ALL
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
              {TAGS.map((tag) => (
                <label key={tag.id} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                    className="h-3.5 w-3.5 accent-[#4E5A44]"
                  />
                  <span className="font-[Jost] text-xs tracking-[0.04em] text-[#5C5645]">{tag.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["all", "girl", "boy", "neutral"].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-3 py-2 font-[Jost] text-xs font-medium tracking-[0.14em] ${
                  gender === g ? "bg-[#4E5A44] text-white" : "border border-[#D8D0BC] text-[#716B5C]"
                }`}
              >
                {g.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-7 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A69C7E]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the collection"
            className="w-full border-b border-[#D8D0BC] bg-transparent py-3 pl-9 pr-3 font-[Jost] text-base text-[#3A342A] outline-none placeholder:text-[#A69C7E] focus:border-[#4E5A44]"
          />
        </div>

        <div className="mt-10">
          {loading && <p className="py-20 text-center font-[Jost] text-base text-[#A69C7E]">Curating the collection…</p>}
          {error && <p className="py-20 text-center font-[Jost] text-base text-red-700">Couldn't load the collection: {error}</p>}
          {!loading && !error && visible.length === 0 && (
            <p className="py-20 text-center font-[Jost] text-base text-[#A69C7E]">Nothing matches that search yet.</p>
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

        {detailItem && !request && (
          <DecorDetailModal
            item={detailItem}
            onClose={() => setDetailItem(null)}
            onRent={handleRent}
            onBuy={handleBuy}
            navigate={navigate}
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
          <p className="font-[Jost] text-xs tracking-[0.18em] text-[#8C846F]">
            WANT AN EXPERIENCE YOUR GUESTS BECOME PART OF, NOT JUST A ROOM FULL OF DECOR?
          </p>
          <button onClick={() => navigate("/package-builder")} className="mt-4 border border-[#B8935A] px-6 py-3 font-[Jost] text-xs font-semibold tracking-[0.2em] text-[#4E5A44]">
            BUILD MY EXPERIENCE
          </button>
        </div>
      </section>
    </div>
  );
}
