// Fixed, buyer-facing tag list for the decor catalog. Shared by the Decor
// page's filter buttons and the admin item form's tag checkboxes, so the
// two can never drift out of sync with each other. `id` is the exact text
// stored in an item's `category` column (comma-separated across multiple
// tags, matched case-insensitively) - kept as plain, readable words so
// whoever fills in a new item can tell what to type without a lookup
// table. `label` is what shows on the site's filter button/admin
// checkbox, which can read a little differently (e.g. "wall/floor" in the
// data, "Wall & Floor" on the button).
//
// "rent" and "purchase" are not stored in `category` - they're derived
// automatically from whether rental_price/purchase_price is set, so they
// can never go stale. See itemTags() in pages/Decor.jsx.
export const TAGS = [
  { id: "table", label: "Table" },
  { id: "wall/floor", label: "Wall & Floor" },
  { id: "keepsakes & gifts", label: "Keepsakes & Gifts" },
  { id: "disposables", label: "Disposables" },
  { id: "stationery", label: "Stationery" },
  { id: "gift wrap", label: "Gift Wrap" },
  { id: "showers", label: "Showers" },
  { id: "baby", label: "Baby" },
  { id: "birthdays/holidays", label: "Birthdays/Holidays" },
  { id: "activities", label: "Activities" },
  { id: "dessert items", label: "Dessert Items" },
];
