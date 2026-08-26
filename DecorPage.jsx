import React, { useEffect, useMemo, useState } from "react";
import { Leaf, Search, SlidersHorizontal } from "lucide-react";
import { supabase } from "./supabaseClient.js";
import {
  SAGE, SAGE_DEEP, GOLD, CREAM, INK, LINE, MUTED, displayFont, bodyFont, ensureFonts
} from "./theme.js";

function firstPhoto(photos) {
  if (!Array.isArray(photos) || !photos.length) return null;
  const first = photos[0];
  return typeof first === "string" ? first : first?.url || null;
}

function Divider() {
  return (
    <div className="flex items-center gap-3 justify-center my-5">
      <span className="h-px w-12" style={{ background: GOLD }} />
      <Leaf size={14} color={GOLD} />
      <span className="h-px w-12" style={{ background: GOLD }} />
    </div>
  );
}

export default function DecorPage() {
  ensureFonts();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("items")
        .select("id,name,category,description,photos,quantity_owned,rental_price,inventory_type,active,gender,size")
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

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))],
    [items]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const categoryMatch = category === "all" || item.category === category;
      const genderMatch = gender === "all" || item.gender === gender;
      const searchMatch =
        !q ||
        [item.name, item.category, item.description, item.size]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      return categoryMatch && genderMatch && searchMatch;
    });
  }, [items, category, gender, search]);

  return (
    <main className="min-h-screen" style={{ background: CREAM, color: INK }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <header className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs tracking-[0.35em] font-medium" style={{ ...bodyFont, color: GOLD }}>THE COLLECTION</p>
          <h1 className="text-5xl sm:text-6xl font-semibold -mt-1" style={{ ...displayFont, color: SAGE_DEEP }}>
            Our Decor
          </h1>
          <Divider />
          <p className="text-2xl" style={{ fontFamily: "'Parisienne', cursive" }}>
            Beautiful pieces, ready for your celebration.
          </p>
          <p className="mt-4 text-sm leading-6" style={{ ...bodyFont, color: MUTED }}>
            Browse the pieces available to build your event. Availability is confirmed when you choose your date.
          </p>
        </header>

        <div className="bg-white border rounded-sm p-4 mb-8 grid sm:grid-cols-[1fr_auto_auto] gap-3" style={{ borderColor: LINE }}>
          <div className="flex items-center gap-2 border px-3 py-2 rounded-sm" style={{ borderColor: LINE }}>
            <Search size={16} color={MUTED} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search the collection"
              className="w-full outline-none text-sm"
              style={bodyFont}
            />
          </div>

          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded-sm px-3 py-2 text-sm outline-none" style={{ ...bodyFont, borderColor: LINE }}>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value === "all" ? "All categories" : value}
              </option>
            ))}
          </select>

          <select value={gender} onChange={(e) => setGender(e.target.value)} className="border rounded-sm px-3 py-2 text-sm outline-none" style={{ ...bodyFont, borderColor: LINE }}>
            <option value="all">All styles</option>
            <option value="neutral">Neutral</option>
            <option value="girl">Girl</option>
            <option value="boy">Boy</option>
          </select>
        </div>

        {loading && (
          <p className="text-center py-16 text-sm" style={{ ...bodyFont, color: MUTED }}>Loading the collection...</p>
        )}

        {error && (
          <div className="bg-white border rounded-sm p-6 text-sm" style={{ borderColor: "#D9B5A8", color: "#7B4D42" }}>
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <SlidersHorizontal className="mx-auto mb-3" size={22} color={GOLD} />
            <p className="text-lg" style={{ ...displayFont, color: SAGE_DEEP }}>Nothing matches your search.</p>
          </div>
        )}

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const photo = firstPhoto(item.photos);
            return (
              <article key={item.id} className="bg-white border rounded-sm overflow-hidden" style={{ borderColor: LINE }}>
                <div className="aspect-[4/3] bg-[#F3EEE2] flex items-center justify-center overflow-hidden">
                  {photo ? (
                    <img src={photo} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center px-6">
                      <Leaf size={22} className="mx-auto mb-2" color={GOLD} />
                      <span className="text-xs tracking-[0.12em]" style={{ ...bodyFont, color: MUTED }}>PHOTO COMING SOON</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[10px] tracking-[0.2em] uppercase" style={{ ...bodyFont, color: GOLD }}>
                    {item.category || "Decor"}
                  </p>
                  <h2 className="text-2xl font-semibold mt-1" style={{ ...displayFont, color: SAGE_DEEP }}>
                    {item.name}
                  </h2>
                  {item.description && (
                    <p className="text-sm leading-6 mt-2" style={{ ...bodyFont, color: "#6B6453" }}>{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {item.gender && (
                      <span className="px-2.5 py-1 rounded-full text-[11px]" style={{ background: "#F1F4EC", color: SAGE_DEEP }}>
                        {item.gender}
                      </span>
                    )}
                    {item.size && (
                      <span className="px-2.5 py-1 rounded-full text-[11px]" style={{ background: "#F7F2E7", color: "#7C6A45" }}>
                        {item.size}
                      </span>
                    )}
                  </div>
                  {item.rental_price != null && (
                    <p className="mt-4 text-sm font-medium" style={{ ...bodyFont, color: GOLD }}>
                      ${Number(item.rental_price).toFixed(2)} CAD
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
