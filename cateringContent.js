// Catering menu (bulk/set orders, shown on the Catering page) and the
// individually wrapped dessert-gift versions of the same recipes, sold
// under the "Grown Folks Loot Bags" name and featured on the Gifts page.
// Every price here is real (not a placeholder) - it came straight from
// the business owner.

export const DIETARY_NOTE =
  "Every dessert on this menu is nut free. They're made with gluten, eggs, and dairy. Need gluten free? We've got you, just inquire for pricing. The one thing we can't do is dairy free, that's where we have to draw the line.";

export const ALCOHOL_NOTE =
  "The alcohol bakes out in the oven, so what's left behind is pure flavor, not proof. Trace amounts may remain.";

export const RUM_CAKE_STORY = {
  heading: "Not All Rum Cakes Wear Black",
  body: "These are not your traditional rum cakes. Traditional Jamaican Gold Rum cakes, reinvented as a cupcake you'll want to hoard for yourself. Think vanilla meets butter meets rum meets clouds, that's how fluffy and delicious they are. It's impossible to eat just one.",
};

export const ICING_OPTION = {
  name: "Signature Icing",
  description:
    "Every size rum cake can be dressed up with the same signature icing we use on our G Rings. Want to take it further? Ask for it infused with a hint of rum (alcohol baked out, flavor very much still in) and our island spice blend, steeped for two full weeks before it ever touches a dessert.",
};

// Bulk/set orders for the Catering page. `sizes` are the standard set
// options; anything beyond that is a real conversation, not a fixed price,
// so it says "inquire" rather than guessing a number.
export const CATERING_ITEMS = [
  {
    id: "rumCupcakes",
    name: "Rum Cupcakes",
    tagline: "Full size, full flavor, zero regrets.",
    description:
      "Our signature Gold Rum cupcake at full size, the one people ask us to bring to every single event after the first time they try it. Rich, moist, and dangerously easy to finish two of before you've noticed.",
    sizes: [
      { label: "Set of 6", inquire: true },
      { label: "Set of 12", inquire: true },
      { label: "Set of 24", inquire: true },
      { label: "Set of 50", inquire: true },
    ],
    sizeNote: "Need more than 50? Inquire for larger orders.",
  },
  {
    id: "miniRumCupcakes",
    name: "Mini Rum Cupcakes",
    tagline: "All the flavor, built for grazing.",
    description:
      "Every bit of the flavor that made our Rum Cupcakes famous, shrunk down into a bite sized version that's made for guests to grab, go, and immediately come back for another.",
    sizes: [
      { label: "Set of 24", inquire: true },
      { label: "Set of 48", inquire: true },
    ],
    sizeNote: "Need more than 48? Inquire for larger orders.",
  },
  {
    id: "gRings",
    name: "G Rings",
    tagline: "Half cookie, half cake, all showstopper.",
    description:
      "Loaded with chocolate chips, finished with a brown butter glaze, and filled with a cream cheese center we highly recommend you don't skip. Fair warning, these are big. One G Ring is basically a dessert on its own.",
    sizes: [
      { label: "Set of 6", inquire: true },
      { label: "Set of 12", inquire: true },
      { label: "Set of 24", inquire: true },
    ],
    sizeNote: "Need more than 24? Inquire for larger orders.",
  },
];

// Individually wrapped gift versions, featured on the Gifts page under the
// Grown Folks Loot Bags name.
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
