import React, { useState } from "react";
import { Check, X as XIcon, Plus, ShoppingBag, ChevronDown, ArrowUpRight } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useCart } from "../CartContext";
import CateringRequestModal from "../components/CateringRequestModal";
import {
  HERO,
  STANDARD,
  DIETARY_CHECKLIST,
  RUM_CAKE_STORY,
  ICING_OPTION,
  CATERING_ITEMS,
  GROWN_FOLKS_LOOT_BAGS,
  FULL_CAKE_ORDER,
} from "../cateringContent";

const EMERALD = "#047857";

function ArchFrame({ children, tall = false, palette }) {
  return (
    <div
      className={`relative w-full overflow-hidden ${tall ? "h-[420px] sm:h-[520px]" : "h-[300px]"}`}
      style={{ borderRadius: "999px 999px 12px 12px", background: `${palette.primary}14`, border: `1px solid ${palette.line}` }}
    >
      {children}
    </div>
  );
}

function PhotoComingSoon({ palette, fonts }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <span className="font-[Jost] text-[10px] tracking-[0.2em]" style={{ ...fonts.bodyFont, color: palette.muted }}>
        PHOTO COMING SOON
      </span>
    </div>
  );
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function MenuCard({ item, index, palette, onOrder }) {
  const [size, setSize] = useState(item.sizes[0]?.label || "");

  return (
    <div className="flex flex-col">
      <ArchFrame palette={palette}>
        {item.photoUrl ? (
          <img src={item.photoUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <PhotoComingSoon palette={palette} fonts={{ bodyFont: {} }} />
        )}
      </ArchFrame>

      <p className="mt-5 font-[Jost] text-[10px] font-semibold tracking-[0.25em]" style={{ color: palette.gold }}>
        {`NO. ${String(index + 1).padStart(2, "0")}`}
      </p>
      <h3 className="mt-1 font-['Cormorant_Garamond'] text-3xl font-semibold italic" style={{ color: palette.ink }}>
        {item.name}
      </h3>
      <p className="mt-2 font-[Jost] text-xs italic" style={{ color: palette.accent }}>
        {item.tagline}
      </p>
      <p className="mt-3 font-[Jost] text-sm leading-relaxed" style={{ color: palette.ink }}>
        {item.description}
      </p>

      <div className="mt-5 border-t pt-4" style={{ borderColor: palette.line }}>
        <div className="relative">
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full appearance-none rounded-sm border px-4 py-3 font-[Jost] text-xs font-semibold tracking-[0.1em]"
            style={{ borderColor: palette.line, color: palette.ink, background: palette.surface }}
          >
            {item.sizes.map((s) => (
              <option key={s.label} value={s.label}>
                {s.label.toUpperCase()}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" color={palette.muted} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="font-[Jost] text-[10px] font-semibold tracking-[0.1em]" style={{ color: palette.muted }}>
          PRICING BY REQUEST
        </span>
        <button
          onClick={() => onOrder(item, size)}
          className="flex-shrink-0 rounded-sm px-5 py-3 font-[Jost] text-[10px] font-semibold tracking-[0.16em] text-white"
          style={{ background: EMERALD }}
        >
          REQUEST TO ORDER
        </button>
      </div>
      <p className="mt-3 font-[Jost] text-xs" style={{ color: palette.muted }}>
        {item.sizeNote}
      </p>
    </div>
  );
}

export default function Catering() {
  const { palette, fonts } = usePalette();
  const { addToCart, removeFromCart, isInCart, cartCount } = useCart();
  const [requestItem, setRequestItem] = useState(null);

  const toggleGift = (g) => {
    if (isInCart(g.id, "dessert")) removeFromCart(g.id, "dessert");
    else addToCart(g.id, "dessert");
  };

  return (
    <div style={{ background: palette.bg, color: palette.ink }}>
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: palette.primaryDeep }}>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8" style={{ background: palette.gold }} />
              <p className="font-[Jost] text-[10px] font-semibold tracking-[0.3em]" style={{ color: palette.gold }}>
                {HERO.eyebrow}
              </p>
            </div>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.05] sm:text-6xl" style={{ ...fonts.displayFont, color: "#FFFFFF" }}>
              {HERO.headingLine}
              <br />
              <span style={{ fontStyle: "italic", color: palette.gold }}>{HERO.headingAccent}</span>
            </h1>
            <p className="mt-6 font-[Jost] text-xs font-semibold tracking-[0.14em]" style={{ color: "#FFFFFFB3" }}>
              {HERO.facts.join("  ·  ")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => scrollToId("menu")}
                className="rounded-sm px-7 py-3.5 font-[Jost] text-[11px] font-semibold tracking-[0.18em]"
                style={{ background: palette.gold, color: palette.primaryDeep }}
              >
                VIEW THE MENU
              </button>
              <button
                onClick={() => scrollToId("gifts")}
                className="rounded-sm border px-7 py-3.5 font-[Jost] text-[11px] font-semibold tracking-[0.18em] text-white"
                style={{ borderColor: "#FFFFFF66" }}
              >
                GIFT A CAKE
              </button>
            </div>
          </div>
          <ArchFrame tall palette={palette}>
            {HERO.photoUrl ? (
              <img src={HERO.photoUrl} alt="A Slice of G rum cake" className="h-full w-full object-cover" />
            ) : (
              <PhotoComingSoon palette={palette} fonts={fonts} />
            )}
          </ArchFrame>
        </div>
      </section>

      {/* THE STANDARD */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8" style={{ background: palette.accent }} />
              <p className="font-[Jost] text-[10px] font-semibold tracking-[0.3em]" style={{ color: palette.accent }}>
                {STANDARD.eyebrow}
              </p>
            </div>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.1] sm:text-5xl" style={{ ...fonts.displayFont, color: palette.ink }}>
              {STANDARD.headingLine}
              <br />
              <span style={{ fontStyle: "italic", color: palette.primary }}>{STANDARD.headingAccent}</span>
            </h2>
            <p
              className="mt-6 border-l-2 pl-4 font-['Cormorant_Garamond'] text-xl italic leading-relaxed"
              style={{ borderColor: palette.gold, color: palette.muted }}
            >
              {STANDARD.quote}
            </p>
            <p className="mt-5 font-[Jost] text-sm leading-7" style={{ color: palette.ink }}>
              {STANDARD.body}
            </p>
            <div className="mt-7 space-y-3 border-t pt-6" style={{ borderColor: palette.line }}>
              {DIETARY_CHECKLIST.map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  {item.ok ? (
                    <Check size={16} className="mt-0.5 flex-shrink-0" color={palette.primary} />
                  ) : (
                    <XIcon size={16} className="mt-0.5 flex-shrink-0" color={palette.accent} />
                  )}
                  <p className="font-[Jost] text-sm leading-6" style={{ color: palette.ink }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(STANDARD.photoUrls || [null, null]).map((url, i) => (
              <ArchFrame key={i} palette={palette}>
                {url ? (
                  <img src={url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <PhotoComingSoon palette={palette} fonts={fonts} />
                )}
              </ArchFrame>
            ))}
          </div>
        </div>
      </section>

      {/* MENU */}
      <section id="menu" className="border-t px-5 py-20 sm:px-8" style={{ borderColor: palette.line }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 text-center">
            <p className="font-[Jost] text-[10px] font-semibold tracking-[0.3em]" style={{ color: palette.gold }}>
              THE MENU
            </p>
            <h2 className="mt-2 text-4xl font-semibold" style={{ ...fonts.displayFont, color: palette.ink }}>
              Pick your size, we'll handle the rest.
            </h2>
          </div>

          <div className="mx-auto mb-14 flex max-w-xl flex-col items-center gap-2 rounded-2xl p-6 text-center sm:flex-row sm:justify-between sm:text-left" style={{ background: palette.surface, border: `1px solid ${palette.line}` }}>
            <div>
              <p className="font-[Jost] text-sm font-semibold" style={{ color: palette.ink }}>
                {FULL_CAKE_ORDER.label}
              </p>
              <p className="font-[Jost] text-xs" style={{ color: palette.muted }}>
                {FULL_CAKE_ORDER.description}
              </p>
            </div>
            <a
              href={FULL_CAKE_ORDER.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-shrink-0 items-center gap-1.5 rounded-sm px-5 py-3 font-[Jost] text-[10px] font-semibold tracking-[0.16em] text-white"
              style={{ background: EMERALD }}
            >
              {FULL_CAKE_ORDER.ctaLabel}
              <ArrowUpRight size={13} />
            </a>
          </div>

          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {CATERING_ITEMS.map((item, index) => (
              <MenuCard
                key={item.id}
                item={item}
                index={index}
                palette={palette}
                onOrder={(it, size) => setRequestItem({ name: it.name, sizes: it.sizes, initialSize: size })}
              />
            ))}
          </div>

          <div className="mt-16 rounded-2xl p-7 text-center" style={{ background: palette.surface, border: `1px solid ${palette.line}` }}>
            <h3 className="mb-2 text-xl font-bold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
              {ICING_OPTION.name}
            </h3>
            <p className="mx-auto max-w-2xl font-[Jost] text-sm leading-relaxed" style={{ color: palette.ink }}>
              {ICING_OPTION.description}
            </p>
          </div>
        </div>
      </section>

      {/* GIFTS */}
      <section id="gifts" className="border-t px-5 py-20 sm:px-8" style={{ borderColor: palette.line }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-[Jost] text-[10px] font-semibold tracking-[0.3em]" style={{ color: palette.gold }}>
              GROWN FOLKS LOOT BAGS
            </p>
            <div className="flex items-center gap-2 font-[Jost] text-xs font-semibold tracking-[0.1em]" style={{ color: palette.ink }}>
              <ShoppingBag size={16} />
              CART ({cartCount})
            </div>
          </div>
          <h2 className="mb-8 text-4xl font-semibold" style={{ ...fonts.displayFont, color: palette.ink }}>
            Individually wrapped, ready to gift now.
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {GROWN_FOLKS_LOOT_BAGS.map((g) => {
              const inCart = isInCart(g.id, "dessert");
              return (
                <div key={g.id} className="rounded-2xl p-6" style={{ background: palette.surface, border: `1px solid ${palette.line}` }}>
                  <h3 className="text-xl font-bold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
                    {g.name}
                  </h3>
                  <p className="mb-2 mt-1 font-[Jost] text-xs italic" style={{ color: palette.accent }}>
                    {g.tagline}
                  </p>
                  <p className="mb-4 font-[Jost] text-sm leading-relaxed" style={{ color: palette.ink }}>
                    {g.description}
                  </p>
                  <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: palette.line }}>
                    <span className="font-[Jost] text-sm font-bold" style={{ color: palette.accent }}>
                      ${g.price}
                    </span>
                    <button
                      onClick={() => toggleGift(g)}
                      className="flex items-center gap-1.5 rounded-sm px-4 py-2.5 font-[Jost] text-[10px] font-semibold tracking-[0.14em] text-white"
                      style={{ background: inCart ? palette.ink : EMERALD }}
                    >
                      {inCart ? <Check size={12} /> : <Plus size={12} />}
                      {inCart ? "IN CART" : "ADD TO CART"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NOT ALL RUM CAKES WEAR BLACK */}
      <section className="relative overflow-hidden px-5 py-24 text-center sm:px-8" style={{ background: palette.bg }}>
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[16vw] font-bold leading-none"
          style={{ ...fonts.displayFont, color: palette.line, opacity: 0.6 }}
        >
          {RUM_CAKE_STORY.watermark}
        </span>
        <div className="relative">
          <p className="font-[Jost] text-[10px] font-semibold tracking-[0.3em]" style={{ color: palette.accent }}>
            {RUM_CAKE_STORY.eyebrow}
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-4xl font-semibold leading-[1.15] sm:text-5xl" style={{ ...fonts.displayFont, color: palette.ink }}>
            {RUM_CAKE_STORY.headingLine}{" "}
            <span style={{ fontStyle: "italic", color: palette.gold }}>{RUM_CAKE_STORY.headingAccent}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md font-['Cormorant_Garamond'] text-xl italic" style={{ color: palette.muted }}>
            {RUM_CAKE_STORY.subtitle}
          </p>
          <button
            onClick={() => scrollToId("menu")}
            className="mt-8 rounded-sm px-8 py-4 font-[Jost] text-[11px] font-semibold tracking-[0.2em] text-white"
            style={{ background: EMERALD }}
          >
            {RUM_CAKE_STORY.ctaLabel}
          </button>
        </div>
      </section>

      {requestItem && (
        <CateringRequestModal
          itemName={requestItem.name}
          sizes={requestItem.sizes}
          initialSize={requestItem.initialSize}
          onClose={() => setRequestItem(null)}
        />
      )}
    </div>
  );
}
