// A "Complete Look" is a decor item tagged "complete looks" (see
// decorTags.js) whose own catalog row has no price of its own - its page
// (pages/ItemDetail.jsx) instead shows the real catalog items styled
// together in its photo, priced and added to cart as a set. This is the
// one place that says which real items belong to which look, keyed by the
// look's own exact `name` in Supabase. Every name on the right must match
// an existing item's `name` column exactly (case-sensitive) or it's
// silently dropped from the bundle.
export const COMPLETE_LOOK_CONTENTS = {
  "Christmas Mantelpiece Display": [
    "9-Foot Garland",
    "Tall Hurricane Candlestick Holders",
    "Gold Christmas Bows Ribbon",
  ],
};
