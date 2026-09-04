// Catering menu (bulk/set orders, shown on the Catering page) and the
// individually wrapped dessert-gift versions of the same recipes, sold
// under the "Grown Folks Loot Bags" name. Wording is written to match the
// voice of the business's own cake site: confident, a little cheeky, no
// filler. Every price here is real (not a placeholder), it came straight
// from the business owner.

import rumCakePhoto from "./media/rumcake.jpeg";
import miniCupcakesPhoto from "./media/cakes2.png";
import gRingsPhoto from "./media/cakes.jpeg";

export const HERO = {
  photoUrl: rumCakePhoto,
  eyebrow: "ARTISAN RUM CAKES",
  headingLine: "You've had rum cake.",
  headingAccent: "But not like this.",
  facts: ["MADE WITH LOVE", "SOAKED TO PERFECTION", "SAFE FOR KIDS & WORK"],
};

export const STANDARD = {
  photoUrls: [gRingsPhoto, miniCupcakesPhoto],
  eyebrow: "THE STANDARD",
  headingLine: "Not just a cake.",
  headingAccent: "A flex.",
  quote: "Most rum cakes are fine. This one is the reason people show up early.",
  body: "Every cake is made from scratch, soaked to perfection, and built for people who don't settle. Small batch. Fully handcrafted. Golden in every sense of the word.",
};

// `ok: true` items are things we do. `ok: false` is the one honest limit,
// shown the same way rather than buried in fine print.
export const DIETARY_CHECKLIST = [
  { ok: true, text: "The alcohol bakes out during preparation, trace amounts may remain. Safe for kids and the office." },
  { ok: true, text: "Contains no nuts. Contains eggs, gluten, and dairy." },
  { ok: true, text: "Gluten free available upon request, just inquire for pricing." },
  { ok: false, text: "Dairy free isn't something we can do, that's where we draw the line." },
];

export const RUM_CAKE_STORY = {
  eyebrow: "THE STANDARD",
  headingLine: "Not all rum cakes wear",
  headingAccent: "black.",
  watermark: "GOLDEN",
  subtitle: "Mine is golden. And you'll taste the difference.",
  ctaLabel: "ORDER YOUR CAKE",
};

// Full size cakes are a different product line, ordered directly through
// the business's own storefront rather than through this site.
export const FULL_CAKE_ORDER = {
  label: "Want a full size cake instead?",
  description: "Full rum cakes are ordered directly through A Slice of G.",
  ctaLabel: "ORDER A FULL CAKE",
  url: "https://www.asliceofg.com/shop.html",
};

export const ICING_OPTION = {
  name: "Signature Icing",
  description:
    "Every size rum cake can be dressed up with the same signature icing we use on our G Rings. Want to take it further? Ask for it infused with a hint of rum (alcohol baked out, flavor very much still in) and our island spice blend, steeped for two full weeks before it ever touches a dessert.",
};

// Bulk/set orders for the Catering page. `sizes` are the standard set
// options; anything beyond that is a real conversation, not a fixed price,
// so ordering opens a request instead of guessing a number.
export const CATERING_ITEMS = [
  {
    id: "rumCupcakes",
    name: "Rum Cupcakes",
    tagline: "Full size, full flavor, zero regrets.",
    description:
      "Our signature Gold Rum cupcake at full size, the one people ask us to bring to every single event after the first time they try it. Rich, moist, and dangerously easy to finish two of before you've noticed.",
    photoUrl: rumCakePhoto,
    sizes: [
      { label: "Set of 6" },
      { label: "Set of 12" },
      { label: "Set of 24" },
      { label: "Set of 50" },
    ],
    sizeNote: "Need more than 50? We'll build you a bigger order.",
  },
  {
    id: "miniRumCupcakes",
    name: "Mini Rum Cupcakes",
    tagline: "All the flavor, built for grazing.",
    description:
      "Every bit of the flavor that made our Rum Cupcakes famous, shrunk down into a bite sized version that's made for guests to grab, go, and immediately come back for another.",
    photoUrl: miniCupcakesPhoto,
    sizes: [
      { label: "Set of 24" },
      { label: "Set of 48" },
    ],
    sizeNote: "Need more than 48? We'll build you a bigger order.",
  },
  {
    id: "gRings",
    name: "G Rings",
    tagline: "Half cookie, half cake, all showstopper.",
    description:
      "Loaded with chocolate chips, finished with a brown butter glaze, and filled with a cream cheese center we highly recommend you don't skip. Fair warning, these are big. One G Ring is basically a dessert on its own.",
    photoUrl: gRingsPhoto,
    sizes: [
      { label: "Set of 6" },
      { label: "Set of 12" },
      { label: "Set of 24" },
    ],
    sizeNote: "Need more than 24? We'll build you a bigger order.",
  },
];

// Individually wrapped gift versions, real fixed prices, add to cart ready.
export const GROWN_FOLKS_LOOT_BAGS = [
  {
    id: "rumCupcakeGiftBox",
    name: "Rum Cupcake Gift Box",
    tagline: "The gift that says you actually like someone.",
    description:
      "Three full size Rum Cupcakes, individually gift boxed and vacuum sealed to lock in every bit of freshness. Hand someone this box and watch their whole day improve.",
    price: 15,
  },
  {
    id: "gRingGift",
    name: "G Ring Gift",
    tagline: "One cookie, zero disappointment.",
    description:
      "One G Ring, individually wrapped and ready to gift. This version comes without the cream cheese center, but it still shows up big.",
    price: 10,
  },
];
