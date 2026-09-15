import React from "react";
import { Check, Circle } from "lucide-react";

function SummaryGroup({ label, items, emptyText, palette, fonts }) {
  return (
    <div className="py-4">
      <p
        className="text-[11px] font-bold tracking-[0.16em]"
        style={{
          ...fonts.bodyFont,
          color: palette.muted,
        }}
      >
        {label.toUpperCase()}
      </p>

      <div className="mt-2 space-y-2">
        {items?.length ? (
          items.map((item) => (
            <div key={`${label}-${item.id || item.name}`} className="flex items-start gap-2">
              <Check size={14} className="mt-1 flex-shrink-0" style={{ color: palette.accent }} />

              <span
                className="text-sm leading-5"
                style={{
                  ...fonts.bodyFont,
                  color: palette.ink,
                }}
              >
                {item.name}
                {item.price > 0 && <span style={{ color: palette.muted }}> +${item.price}</span>}
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-2">
            <Circle size={11} style={{ color: palette.line }} />
            <span
              className="text-sm"
              style={{
                ...fonts.bodyFont,
                color: palette.muted,
              }}
            >
              {emptyText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BabyShowerBuilderSummary({
  basePrice,
  currentTotal,
  playSelections = [],
  keepSelections = [],
  guestGift,
  addons = [],
  display,
  service,
  palette,
  fonts,
}) {
  return (
    <aside className="lg:sticky lg:top-28">
      <div
        className="overflow-hidden rounded-[1.5rem]"
        style={{
          background: palette.surface,
          border: `1px solid ${palette.line}`,
          boxShadow: "0 18px 60px rgba(30, 30, 30, 0.08)",
        }}
      >
        <div
          className="p-6"
          style={{
            background: palette.primaryDeep,
          }}
        >
          <p
            className="text-xs font-bold tracking-[0.18em]"
            style={{
              ...fonts.bodyFont,
              color: "rgba(255,255,255,0.68)",
            }}
          >
            YOUR BABY SHOWER EXPERIENCE
          </p>

          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p
                className="text-sm"
                style={{
                  ...fonts.bodyFont,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Current total
              </p>

              <p className="text-4xl font-semibold text-white" style={fonts.displayFont}>
                ${currentTotal.toLocaleString()}
              </p>
            </div>

            <p
              className="pb-1 text-xs"
              style={{
                ...fonts.bodyFont,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Base ${basePrice.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="divide-y px-6" style={{ borderColor: palette.line }}>
          <SummaryGroup label="Play & Connect" items={playSelections} emptyText="Choose 2" palette={palette} fonts={fonts} />

          <SummaryGroup label="Create & Keep" items={keepSelections} emptyText="Choose 3" palette={palette} fonts={fonts} />

          <SummaryGroup
            label="Guest Gift"
            items={guestGift ? [guestGift] : []}
            emptyText="Choose your guest gift"
            palette={palette}
            fonts={fonts}
          />

          <SummaryGroup label="Optional Extras" items={addons} emptyText="Nothing added" palette={palette} fonts={fonts} />

          <SummaryGroup
            label="Display"
            items={Array.isArray(display) ? display : display ? [display] : []}
            emptyText="Not selected yet"
            palette={palette}
            fonts={fonts}
          />

          <SummaryGroup
            label="Setup & Styling"
            items={service ? [service] : []}
            emptyText="Not selected yet"
            palette={palette}
            fonts={fonts}
          />
        </div>
      </div>
    </aside>
  );
}
