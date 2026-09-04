import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "../supabaseClient";
import SectionHeading from "../components/SectionHeading";
import DecorCard from "../components/DecorCard";
import RentalRequestModal from "../components/RentalRequestModal";
import { useEventDate } from "../EventDateContext";

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

// Fixed buyer-facing categories - replaces whatever ad hoc text happens to
// be in the sheet's category column. `id` is the exact text typed into the
// sheet's category column (matched case-insensitively, see normalize()
// above and the check constraint in supabase/decor_rental_setup.sql) -
// kept as plain, readable words on purpose so whoever fills in a new sheet
// row can tell what to type without a lookup table. `label` is what shows
// on the site's filter button, which can read a little differently.
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "table", label: "Table" },
  { id: "wall/floor", label: "Wall & Floor" },
  { id: "keepsakes & gifts", label: "Keepsakes & Gifts" },
  { id: "disposables", label: "Disposables" },
  { id: "stationery", label: "Stationery" },
  { id: "gift wrap", label: "Gift Wrap" },
];

export default function Decor({ navigate }) {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [request, setRequest] = useState(null); // { item, requestType } | null
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
        .order("category", { ascending: true })
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
      const matchesCategory = category === "all" || normalize(item.category) === category;
      const matchesGender = gender === "all" || normalize(item.gender) === gender;
      const matchesSearch =
        !q ||
        normalize(item.name).includes(q) ||
        normalize(item.description).includes(q) ||
        normalize(item.category).includes(q);
      return matchesCategory && matchesGender && matchesSearch;
    });
  }, [items, category, gender, query]);

  // The event date prompt (if needed) resolves before the rental modal ever
  // opens, so RentalRequestModal can assume it already has one to default
  // pickup/drop-off from.
  const handleRent = async (item) => {
    const date = await requestEventDate();
    if (!date) return;
    setRequest({ item, requestType: "rental" });
  };

  const handleBuy = (item) => setRequest({ item, requestType: "purchase" });

  return (
    <div>
      <section className="border-b border-[#E4DCC8]">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-20 sm:px-8">
          <SectionHeading
            eyebrow="THE COLLECTION"
            title="Decor worth remembering."
            subtitle="Browse the pieces available for your celebration. Every item is selected to add something to the overall feeling, not just fill a table."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-4 border-b border-[#E4DCC8] pb-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`border-b pb-2 font-[Jost] text-[10px] font-semibold tracking-[0.16em] transition ${
                  category === cat.id ? "border-[#B8935A] text-[#4E5A44]" : "border-transparent text-[#8C846F] hover:text-[#4E5A44]"
                }`}
              >
                {cat.label.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {["all", "girl", "boy", "neutral"].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-3 py-2 font-[Jost] text-[9px] font-medium tracking-[0.14em] ${
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
            className="w-full border-b border-[#D8D0BC] bg-transparent py-3 pl-9 pr-3 font-[Jost] text-sm text-[#3A342A] outline-none placeholder:text-[#A69C7E] focus:border-[#4E5A44]"
          />
        </div>

        <div className="mt-10">
          {loading && <p className="py-20 text-center font-[Jost] text-sm text-[#A69C7E]">Curating the collection…</p>}
          {error && <p className="py-20 text-center font-[Jost] text-sm text-red-700">Couldn't load the collection: {error}</p>}
          {!loading && !error && visible.length === 0 && (
            <p className="py-20 text-center font-[Jost] text-sm text-[#A69C7E]">Nothing matches that search yet.</p>
          )}
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <DecorCard key={item.id} item={item} onRent={handleRent} onBuy={handleBuy} />
            ))}
          </div>
        </div>

        {request && (
          <RentalRequestModal
            item={request.item}
            requestType={request.requestType}
            onClose={() => setRequest(null)}
          />
        )}

        <div className="mt-20 border-t border-[#E4DCC8] pt-7 text-center">
          <p className="font-[Jost] text-[10px] tracking-[0.18em] text-[#8C846F]">
            WANT TO BUILD A PACKAGE AROUND THESE PIECES?
          </p>
          <button onClick={() => navigate("/package-builder")} className="mt-4 border border-[#B8935A] px-6 py-3 font-[Jost] text-[10px] font-semibold tracking-[0.2em] text-[#4E5A44]">
            BUILD YOUR PACKAGE
          </button>
        </div>
      </section>
    </div>
  );
}
