// The five event types a visitor can be planning for. Every package item's
// copy/photo can vary per type (see packageContent.js's resolvePackageItem).
// "babyShower" is the fallback used before a choice is made and for any
// content without an explicit override — it matches the business's primary
// specialization.

export const EVENT_TYPES = [
  {
    id: "babyShower",
    label: "Baby Shower",
    shortLabel: "Baby Shower",
  },
  {
    id: "engagement",
    label: "Engagement Party",
    shortLabel: "Engagement",
  },
  {
    id: "birthday",
    label: "Milestone Birthdays",
    shortLabel: "Milestone Birthdays",
  },
  {
    id: "tutuTwirlsTea",
    label: "Tutu Twirls",
    shortLabel: "Tutu Twirls",
  },
  {
    id: "holiday",
    label: "Holiday Event",
    shortLabel: "Holiday",
  },
  {
    id: "specialMoment",
    label: "Special Moment",
    shortLabel: "Special Moment",
  },
];

export const DEFAULT_EVENT_TYPE_ID = "babyShower";

// Which brand palette (see palettes.js) goes live site-wide while a given
// event type is selected. "signature" (Emerald & Fuchsia) is the
// sophisticated/default family; "playful-navy" (Navy & Coral) is the
// brighter, more playful family for the kid- and celebration-forward
// types. An id with no entry here falls back to the default palette.
export const EVENT_TYPE_PALETTE_MAP = {
  babyShower: "signature",
  engagement: "signature",
  birthday: "playful-navy",
  tutuTwirlsTea: "playful-navy",
  holiday: "playful-navy",
  specialMoment: "playful-navy",
};

export function getEventTypeLabel(id) {
  return EVENT_TYPES.find((e) => e.id === id)?.label || EVENT_TYPES[0].label;
}
