import React, { useMemo } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { useEventType } from "../EventTypeContext";
import { getEventConfig } from "../eventConfig";
import { resolveExperienceItem, PLAYFUL_ADDON_IDS, PLAYFUL_ADDON_PRICE } from "../packageContent";

function ExperienceCard({ item, palette, fonts }) {
  const Icon = item.icon;
  return (
    <div className="rounded-xl p-6 shadow-sm" style={{ background: palette.surface, border: `1px solid ${palette.line}` }}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: `${palette.accent}1F` }}>
          <Icon size={19} color={palette.accent} strokeWidth={1.8} />
        </div>
        <h3 className="text-lg font-bold leading-tight" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
          {item.name}
        </h3>
      </div>
      <p className="mt-2 text-sm italic" style={{ ...fonts.bodyFont, color: palette.gold }}>
        {item.tagline}
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ ...fonts.bodyFont, color: palette.ink }}>
        {item.description}
      </p>
    </div>
  );
}

// Section 33: not a rental catalogue - groups by the selected event type's
// actual builder pools, using the same eventConfig/resolveExperienceItem
// source of truth the Package Builder itself reads from.
export default function Experiences({ navigate }) {
  const { palette, fonts } = usePalette();
  const { eventTypeId, eventType } = useEventType();
  const eventConfig = useMemo(() => getEventConfig(eventTypeId), [eventTypeId]);
  const poolSteps = useMemo(() => eventConfig.steps.filter((s) => s.type === "pool"), [eventConfig]);
  const hasPlayfulStep = eventConfig.steps.some((s) => s.type === "playful");

  return (
    <div className="min-h-screen" style={{ background: palette.bg, color: palette.ink }}>
      <div className="relative overflow-hidden px-6 py-20 text-center" style={{ background: palette.primaryDeep }}>
        <Sparkles className="absolute top-8 right-10 opacity-60" size={22} color={palette.gold} />
        <p className="text-xs font-semibold tracking-[0.3em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
          EXPERIENCES
        </p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-bold" style={{ ...fonts.displayFont, color: "#FFFFFF" }}>
          Experiences made for the people who came to celebrate you.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base sm:text-lg" style={{ ...fonts.bodyFont, color: "#FFFFFFCC" }}>
          Choose your event to see the experiences designed for your celebration. Right now you're browsing for a{" "}
          {eventType.label.toLowerCase()}.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        {poolSteps.map((poolStep) => (
          <div key={poolStep.id} className="mb-16">
            <h2 className="text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
              {poolStep.label}
            </h2>
            <p className="mt-1 mb-6 text-sm" style={{ ...fonts.bodyFont, color: palette.muted }}>
              {poolStep.supportingCopy}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {poolStep.poolIds.map((id) => {
                const item = resolveExperienceItem(id, eventTypeId);
                if (!item) return null;
                return <ExperienceCard key={id} item={item} palette={palette} fonts={fonts} />;
              })}
            </div>
          </div>
        ))}

        {hasPlayfulStep && (
          <div className="mb-16">
            <h2 className="text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
              Want Something Playful?
            </h2>
            <p className="mt-1 mb-6 text-sm" style={{ ...fonts.bodyFont, color: palette.muted }}>
              Add a game that gets everyone talking, laughing, and competing. Each playful add-on is +${PLAYFUL_ADDON_PRICE}.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PLAYFUL_ADDON_IDS.map((id) => {
                const item = resolveExperienceItem(id, eventTypeId);
                if (!item) return null;
                return <ExperienceCard key={id} item={item} palette={palette} fonts={fonts} />;
              })}
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/package-builder")}
            className="inline-flex items-center gap-3 rounded-sm px-8 py-4 text-sm font-semibold tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
          >
            BUILD MY EXPERIENCE <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
