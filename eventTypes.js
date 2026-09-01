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
    id: "milestoneBirthday",
    label: "1st–3rd Birthday",
    shortLabel: "1st–3rd Birthday",
  },
  {
    id: "birthday",
    label: "Birthday",
    shortLabel: "Birthday",
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

export function getEventTypeLabel(id) {
  return EVENT_TYPES.find((e) => e.id === id)?.label || EVENT_TYPES[0].label;
}
