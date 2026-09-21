// Manually curated "lead with these" ordering for the Decor and Gifts
// catalogue pages (see the Decor + Gifts Conversion Implementation Plan).
// Kept as a small, hand-edited config rather than a database column so the
// ranking is deterministic and never shifts when inventory changes - the
// plan's own acceptance criteria calls this out explicitly.
//
// A Decor entry is either a real Supabase catalog row (kind: "item",
// matched against that row's own `name`, or its `variant_group` when it's
// one of several grouped variants) or a "special" tile for a real product
// that doesn't live in the Supabase items table at all - the three Display
// Wall designs and the Custom Serving Dish, both sourced from
// packageContent.js and sold through their own pages rather than the
// general decor catalog. `key` matches that product's `id` in
// packageContent.js's DISPLAYS array (or CUSTOM_SERVING_DISH.id).
export const FEATURED_DECOR = [
  {
    kind: "special",
    key: "customWallPanelInstallation",
    cta: "displayOptions",
    categoryLabel: "Display Wall",
    priceLabel: "FROM $595",
  },
  {
    kind: "special",
    key: "blackGoldGeometric",
    cta: "displayOptions",
    categoryLabel: "Display Wall",
    priceLabel: "FROM $595",
  },
  {
    kind: "special",
    key: "allOfTheLights",
    cta: "displayOptions",
    categoryLabel: "Display Wall",
    priceLabel: "FROM $595",
  },
  { kind: "item", name: "Likkle Peace, Nuff Blessings Floral Hoop Centerpiece" },
  {
    kind: "special",
    key: "centerpieceLarge",
    cta: "buildExperience",
    categoryLabel: "Tabletop",
    priceLabel: "Priced with your experience",
  },
  { kind: "item", name: "Plastic Vintage Inspired Unbreakable Wine Glasses" },
];

// Gifts featured set are all real, purchasable catalog rows - matched
// against `name` directly (grouped items would match on variant_group the
// same way FEATURED_DECOR does, none of these happen to be grouped).
// An entry can be a plain string (card shows the item's real name) or
// { name, displayName } when the card should read shorter than the
// catalog's own name - the item itself, its URL and every other page it
// appears on (its own detail page, the main Nostalgia Cards grid where it
// sits next to its siblings) keep the real name; only this one card's
// title is swapped.
export const FEATURED_GIFTS = [
  "Lil Roots",
  { name: "Pop Up Nostalgia Card - Proud Family", displayName: "Pop Up Card" },
  "Holiday Treat Box",
  "Birthday Card - Blue",
];
