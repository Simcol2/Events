// Single source of truth for everything a search engine reads: per-route
// titles and descriptions, canonical URLs, Open Graph/Twitter cards, and
// the structured data blocks.
//
// Two consumers share this file on purpose, so a page can never drift
// between what a crawler sees and what a visitor sees:
//   1. useSeo() in components/SeoHead.jsx, applied client-side on every
//      in-app navigation (the router is hand-rolled, so nothing else
//      updates <title> when the path changes).
//   2. scripts/prerender.mjs, which stamps the same tags into each static
//      snapshot in prerendered/ - the markup Google, Bing, and every
//      link-preview bot actually index, since none of them run our JS.

export const SITE_URL = "https://asliceofg.com/events";
export const SITE_NAME = "A Slice of G Events";
export const CONTACT_EMAIL = "hello@asliceofgevents.com";

// The service area, written once and reused everywhere it needs to be
// stated: page descriptions, the footer, the structured data below. The
// business is Toronto-based and delivers across the Greater Toronto Area,
// so "Toronto and the GTA" is the phrase customers search and the phrase
// the site should say consistently.
export const SERVICE_AREA_SHORT = "Toronto and the GTA";
export const SERVICE_AREA_LONG = "Toronto and the Greater Toronto Area";

export const SERVICE_CITIES = [
  "Toronto",
  "North York",
  "Scarborough",
  "Etobicoke",
  "Mississauga",
  "Brampton",
  "Vaughan",
  "Markham",
  "Richmond Hill",
  "Oakville",
  "Burlington",
  "Milton",
  "Pickering",
  "Ajax",
  "Whitby",
  "Oshawa",
  "Newmarket",
  "Aurora",
];

// The occasions the business actually serves. Used in copy and in the
// structured data, so the phrasing stays identical in both.
export const OCCASIONS = [
  "baby showers",
  "birthdays",
  "weddings",
  "bridal showers",
  "engagement parties",
  "corporate events",
];

const DEFAULT_DESCRIPTION =
  "Event experience, decor and display wall rentals for baby showers, birthdays, weddings and corporate celebrations across Toronto and the GTA. Delivery, setup and pickup available.";

// Per-route metadata. `title` is written to sit under roughly 60
// characters so Google shows it whole, `description` under roughly 160 for
// the same reason. Every description names both what is rented and where,
// because "event rentals Toronto" is the search that matters more than any
// brand term for a business this size.
export const ROUTE_SEO = {
  "/": {
    title: "Event Rentals in Toronto & the GTA | A Slice of G Events",
    description:
      "Interactive event experiences, decor and display walls available to rent for baby showers, birthdays, weddings and corporate events across Toronto and the GTA.",
    h1: "Rent the experience, keep the memories",
  },
  "/how-it-works": {
    title: "How Our Event Rentals Work | Toronto & GTA",
    description:
      "Choose your date, build your package, and we handle the rest. See how renting event experiences and decor works across Toronto and the Greater Toronto Area.",
  },
  "/experiences": {
    title: "Interactive Event Experiences to Rent | Toronto & GTA",
    description:
      "Guest activities and keepsake experiences available to rent for baby showers, birthdays, weddings and corporate events in Toronto and the GTA.",
  },
  "/decor": {
    title: "Event Decor Rentals in Toronto & the GTA",
    description:
      "Charger plates, wine glasses, centerpieces, arch stands, marquee letters and more, available to rent for weddings, showers, birthdays and parties across Toronto and the GTA.",
  },
  "/display-options": {
    title: "Backdrop & Display Wall Rentals | Toronto & GTA",
    description:
      "Rent arched iridescent, black and gold, grid and marquee light backdrops for baby showers, birthdays and weddings anywhere in Toronto and the GTA.",
  },
  "/rental-guide": {
    title: "Rental Guide, Deposits & Delivery | Toronto & GTA",
    description:
      "Rental minimums, security deposits, delivery, pickup and damage policies for event rentals from A Slice of G Events in Toronto and the GTA.",
  },
  "/birthdays/tutu-twirls-tea": {
    title: "Tutu Twirls Birthday Party | Toronto & GTA",
    description:
      "A styled tutu dress-up and tea party birthday experience with a photo wall, kindness station and time capsule, available for celebrations in Toronto and the GTA.",
  },
  "/milestone-events/baby-shower": {
    title: "Baby Shower Experiences | Toronto & GTA Rentals",
    description:
      "Interactive baby shower experiences, keepsakes and guest gifts guests actually take part in, available to rent for celebrations across Toronto and the GTA.",
  },
  "/gifts": {
    title: "Guest Gifts & Party Favours | Toronto & GTA Events",
    description:
      "Curated guest gifts, favours and keepsake bags for baby showers, birthdays, weddings and corporate celebrations in Toronto and the GTA.",
  },
  "/catering": {
    title: "Rum Cakes & Event Desserts | Toronto & the GTA",
    description:
      "Small batch artisan rum cakes, mini cupcakes and dessert boxes made from scratch for celebrations and corporate gifting across Toronto and the GTA.",
  },
  "/past-events": {
    title: "Past Events Gallery | Toronto & GTA Celebrations",
    description:
      "Photos from real baby showers, birthdays and celebrations styled with A Slice of G Events rentals in Toronto and the Greater Toronto Area.",
  },
  "/about": {
    title: "About A Slice of G Events | Toronto & GTA Rentals",
    description:
      "We build celebrations guests take part in, not just look at. Learn how A Slice of G Events serves hosts across Toronto and the Greater Toronto Area.",
  },
  "/faq": {
    title: "Event Rental FAQ | Toronto & the GTA",
    description:
      "Answers on booking windows, delivery, setup, deposits, damage and cancellations for event rentals in Toronto and the Greater Toronto Area.",
  },
  "/package-builder": {
    title: "Build Your Event Package | Toronto & GTA Rentals",
    description:
      "Pick your date, your experiences, your guest gift and your display, and see your price as you go. Event packages delivered across Toronto and the GTA.",
  },
  "/reviews": {
    title: "Customer Reviews | A Slice of G Events Toronto",
    description:
      "Read reviews and see photos from hosts who rented experiences, decor and display walls from A Slice of G Events across Toronto and the GTA.",
  },

  // Internal and single-use pages. These have no business appearing in
  // search results: /review is a one-time tokenised link from a post-event
  // email, /scan and /admin are staff-only inventory tools.
  "/review": {
    title: "Leave a Review | A Slice of G Events",
    description: "Share how your rental went.",
    noindex: true,
  },
  "/scan": {
    title: "Scan Asset | A Slice of G Events",
    description: "Internal inventory tool.",
    noindex: true,
  },
  "/admin": {
    title: "Admin | A Slice of G Events",
    description: "Internal admin tool.",
    noindex: true,
  },
};

// Routes that belong in sitemap.xml, in the order they should be crawled.
// Derived from ROUTE_SEO rather than typed twice, so adding a public page
// in one place cannot leave it out of the sitemap.
export const INDEXABLE_ROUTES = Object.keys(ROUTE_SEO).filter((r) => !ROUTE_SEO[r].noindex);

// Every catalog item (decor, gift wrap, cards, keepsakes) gets its own
// indexable URL - /decor/<slug> or /gifts/<slug> - instead of living only
// behind a client-side modal with no URL of its own. The slug always ends
// in the anchoring row's numeric id, so the URL stays stable even if the
// name changes later; a renamed item just gets an extra, harmless slug
// variant rather than a broken link. Grouped items (e.g. a candle holder
// sold in two sizes) share one URL keyed off their variant_group label and
// the cheapest variant's id, matching how groupByVariant() already
// collapses them into a single card everywhere else in the app.
export function slugify(text) {
  return (
    String(text || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

export function itemUrlPath(kind, item, groupName) {
  return `/${kind}/${slugify(groupName || item?.name)}-${item?.id}`;
}

// The id is always the last hyphen-separated number in the slug, so this
// works regardless of what the descriptive part of the URL says - a stale
// bookmark or an old search result still resolves to the right item.
export function parseItemIdFromSlug(slug) {
  const match = String(slug || "").match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
}

function absoluteImageUrl(url) {
  if (typeof url !== "string" || !url) return null;
  if (/^https?:\/\//.test(url)) return url;
  if (!url.startsWith("/")) return null;
  // A photo path can arrive either raw from the database ("/photos/x.jpg")
  // or already prefixed with the app's own base path ("/events/photos/x.jpg",
  // e.g. from components/PhotoCarousel.jsx's withBasePath()) - SITE_URL
  // below already ends in "/events", so a pre-prefixed path has to be
  // stripped back to raw first or it doubles up into "/events/events/...".
  const path = url.startsWith("/events/") ? url.slice("/events".length) : url;
  return `${SITE_URL}${path}`;
}

function plainText(text) {
  return String(text || "").replace(/\*\*/g, "").replace(/\s*\n+\s*/g, " ").trim();
}

// `kind` is "decor" (rentable pieces) or "gifts" (purchase-only catalog),
// matching the two catalogue pages and their two URL prefixes.
export function itemSeo({ kind, name, description, photo, path }) {
  const isDecor = kind === "decor";
  const title = `${name} ${isDecor ? "Rental" : "for Sale"} | ${SERVICE_AREA_SHORT} | ${SITE_NAME}`;
  const cleanDescription = plainText(description);
  const description155 =
    (cleanDescription
      ? `${cleanDescription} `
      : `${name}, ${isDecor ? "available to rent" : "available to buy"} `) +
    `${isDecor ? "for events" : "for celebrations"} in ${SERVICE_AREA_LONG}.`;

  return {
    path,
    title,
    description: description155.length > 160 ? `${description155.slice(0, 157)}...` : description155,
    canonical: `${SITE_URL}${path}`,
    image: absoluteImageUrl(photo) || `${SITE_URL}/og-cover.jpg`,
    noindex: false,
  };
}

// schema.org/Product, read by Google Search's rich-result pipeline and by
// Google Merchant Center's own crawl of the landing page a submitted
// product feed points at - both want to see price, currency and stock
// state on the page itself, not just in the feed.
export function productJsonLd({ path, name, description, image, price, inStock }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: plainText(description) || name,
    image: image ? [image] : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}${path}`,
      priceCurrency: "CAD",
      price: price != null ? String(price) : undefined,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}

export function seoForPath(pathname) {
  const clean = (pathname || "/").split("?")[0].replace(/\/+$/, "") || "/";
  const entry = ROUTE_SEO[clean];
  return {
    path: clean,
    title: entry?.title || ROUTE_SEO["/"].title,
    description: entry?.description || DEFAULT_DESCRIPTION,
    canonical: `${SITE_URL}${clean === "/" ? "/" : clean}`,
    noindex: Boolean(entry?.noindex),
  };
}

// Marked-up business identity. Google uses this to build the knowledge
// panel and, more importantly for a rental business, to understand that we
// serve a geographic area rather than sell nationally. `areaServed` is the
// whole point of including it.
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    email: CONTACT_EMAIL,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Toronto",
      addressRegion: "ON",
      addressCountry: "CA",
    },
    areaServed: SERVICE_CITIES.map((city) => ({
      "@type": "City",
      name: city,
      containedInPlace: { "@type": "AdministrativeArea", name: "Greater Toronto Area" },
    })),
    knowsAbout: [
      "event rentals",
      "baby shower rentals",
      "backdrop and display wall rentals",
      "party decor rentals",
      "guest activities and party games",
    ],
    makesOffer: [
      "Event experience rentals",
      "Decor rentals",
      "Display wall and backdrop rentals",
      "Guest gifts and party favours",
      "Rum cakes and event desserts",
    ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#business` },
  };
}

// Breadcrumbs give Google the site's shape and replace the raw URL in the
// search result with a readable path. Every route is one level deep, so
// this is always Home plus the page itself.
export function breadcrumbJsonLd(pathname, titleOverride) {
  const { path, title } = seoForPath(pathname);
  if (path === "/") return null;
  const label = (titleOverride || title).split("|")[0].trim();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: label, item: `${SITE_URL}${path}` },
    ],
  };
}

// Alt text builders. Google reads alt text both for image search (a real
// source of traffic for a visual rental business) and as a relevance
// signal on the page itself, so a product photo should never be labelled
// with the bare product name. Every one of these says what the thing is,
// what you can do with it, and where we serve.
//
// The three verbs are deliberately different because the offers are
// different: decor is rented, gifts and cakes are bought, past-event and
// display photos are shown as work we did.

function withContext(name, phrase, { color, city = "Toronto" } = {}) {
  const label = String(name || "Event item").trim();
  // Don't say "Gold Gold Charger Plates" when the colour is already part
  // of the product name, which it usually is.
  const colored =
    color && !new RegExp(color.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(label)
      ? `${color} ${label}`
      : label;
  return `${colored} ${phrase} in ${city}`;
}

// "Gold Charger Plates available for event rental in Toronto"
export function itemAltText(name, opts = {}) {
  return withContext(name, "available for event rental", opts);
}

// "Lil Roots gift bags available for baby showers and celebrations in Toronto"
export function giftAltText(name, opts = {}) {
  return withContext(name, "available for celebrations and events", opts);
}

// "All Of The Lights display wall available for event rental in Toronto"
export function displayAltText(name, opts = {}) {
  return withContext(name, "display wall available for event rental", opts);
}

// "Baby shower styled by A Slice of G Events in Toronto"
export function eventPhotoAltText(subject, opts = {}) {
  return withContext(subject, "styled by A Slice of G Events", opts);
}
