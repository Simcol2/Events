import React, { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { withBasePath } from "../apiBase";
import SeoHead from "../components/SeoHead";
import { ElevatedCard, Kicker } from "../components/EditorialKit";
import TableBoxPackageConfigurator from "../components/TableBoxPackageConfigurator";
import { cents, money, photoUrl, splitComponents, useTableBoxPackages } from "../components/tableBoxPackageData";
import { estimateSecurityDepositCents } from "../depositTiers";
import {
  SERVICE_AREA_LONG,
  SITE_URL,
  faqJsonLd,
  tableBoxPackageAltText,
  tableBoxPackageJsonLd,
  tableBoxPackagePath,
  tableBoxPackageSeo,
} from "../seo";

// One page per pre-built Table Box (/table-box/<slug>), so each box can be
// found, shared and bookmarked on its own instead of only living inside the
// pop-up on the Table Box page. The options, price and Add to Cart are the
// same component the pop-up uses; everything else here is plain, crawlable
// page text built from the box's own data, so it can never disagree with
// what the box actually contains or costs.

function joinList(items, conjunction = "and") {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${conjunction} ${items[items.length - 1]}`;
}

const pieceText = (component) => `${component.quantity} ${component.label || component.item_name}`;

// A plain left-click follows the in-app router; anything else (new tab,
// copy link, crawlers) uses the real href.
function linkTo(navigate, path) {
  return {
    href: withBasePath(path),
    onClick: (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(path);
    },
  };
}

export default function TableBoxPackage({ slug, navigate }) {
  const { palette, fonts } = usePalette();
  const { packages, addons, deliveryItem, error, loaded } = useTableBoxPackages();
  const [addedName, setAddedName] = useState("");

  const path = tableBoxPackagePath(slug);
  const pkg = packages.find((row) => row.slug === slug) || null;

  const details = useMemo(() => {
    if (!pkg) return null;
    const { fixed, groups } = splitComponents(pkg.components);
    const fixedPieces = fixed.map(pieceText);
    const choiceGroups = groups.map((group) => ({
      key: group.key,
      label: group.label,
      options: group.options.map((option) => option.label || option.item_name),
    }));
    const choiceSentences = choiceGroups.map(
      (group) => `${group.label.toLowerCase()}: ${joinList(group.options, "or")}`
    );
    const price = money(pkg.rental_price);
    const deposit = money(estimateSecurityDepositCents(cents(pkg.rental_price)) / 100);
    const deliveryPrice = deliveryItem ? money(deliveryItem.rental_price) : null;
    const addonList = addons.map((addon) => `${addon.add_on_label || addon.name} (+${money(addon.rental_price)})`);

    const includedAnswer =
      `The ${pkg.name} Table Box includes ${joinList(fixedPieces)}` +
      (choiceGroups.length
        ? `, plus your choice of ${joinList(choiceGroups.map((group) => group.label.toLowerCase()))}.`
        : ".");

    const faqs = [
      {
        q: `How many guests does the ${pkg.name} Table Box serve?`,
        a: `The ${pkg.name} Table Box is set for ${pkg.guest_count} guests. ${pkg.blurb}`,
      },
      { q: `What is included in the ${pkg.name} Table Box?`, a: includedAnswer },
      ...(choiceSentences.length
        ? [
            {
              q: `Can I choose the details of my ${pkg.name} Table Box?`,
              a: `Yes. Before you add the box to your cart you can choose your ${choiceSentences.join("; ")}.`,
            },
          ]
        : []),
      {
        q: `How much does it cost to rent the ${pkg.name} Table Box?`,
        a:
          `The package rental is ${price} for the whole box.` +
          (addonList.length ? ` Optional add-ons are priced separately: ${joinList(addonList)}.` : "") +
          (deliveryPrice ? ` Delivery and basic setup is ${deliveryPrice} flat.` : "") +
          ` A refundable security deposit is collected separately from the rental total.`,
      },
      {
        q: "Is there a security deposit?",
        a:
          `Yes. Every rental has a refundable security deposit that is separate from the rental price. ` +
          `It is released within 48 hours after your items are returned and inspected, provided there are no applicable damage or missing-item charges. ` +
          `For this box on its own the deposit is about ${deposit}; the final amount is based on your full rental total.`,
      },
      {
        q: "Do you offer pickup, return and delivery?",
        a:
          `Pickup and return are available in Toronto, and your booking confirmation includes the instructions.` +
          (deliveryPrice
            ? ` You can also add Delivery + Basic Setup for ${deliveryPrice} flat: we bring the pieces, get the basics in place and collect them afterward. Delivery depends on your order and location, so contact us for delivery requests.`
            : " Contact us for delivery requests."),
      },
      {
        q: "How long do I have the Table Box?",
        a: "Your standard rental includes pickup the day before your event and return the day after. Earlier pickup or extended return days are $5 per additional day and are shown before you pay.",
      },
      {
        q: "Can I add holiday pieces or other rentals to my order?",
        a:
          (addonList.length
            ? `Yes. You can add holiday pieces to the ${pkg.name} Table Box on this page: ${joinList(addonList)}. `
            : "") +
          "You can also add other Table Box pieces or décor rentals to the same cart.",
      },
    ];

    return { fixedPieces, choiceGroups, choiceSentences, price, faqs };
  }, [pkg, addons, deliveryItem]);

  const seo = useMemo(() => {
    if (!pkg) return null;
    return tableBoxPackageSeo({
      slug,
      name: pkg.name,
      guestCount: pkg.guest_count,
      blurb: pkg.blurb,
      photo: pkg.image_url,
      price: pkg.rental_price,
    });
  }, [pkg, slug]);

  const product = useMemo(() => {
    if (!pkg || !seo) return null;
    const fixed = splitComponents(pkg.components).fixed;
    return tableBoxPackageJsonLd({
      slug,
      name: pkg.name,
      guestCount: pkg.guest_count,
      description: seo.description,
      image: seo.image,
      price: pkg.rental_price,
      fixedPieces: fixed.map((component) => ({ quantity: component.quantity, name: component.label || component.item_name })),
      inStock: true,
    });
  }, [pkg, seo, slug]);

  const extraJsonLd = useMemo(() => (details ? [faqJsonLd(details.faqs)] : undefined), [details]);

  const notFoundSeo = useMemo(
    () => ({
      title: "Table Box Not Found | A Slice of G Events",
      description: "That Table Box is not available. Browse the current Table Box rentals in Toronto and the GTA.",
      canonical: `${SITE_URL}${path}`,
      noindex: true,
    }),
    [path]
  );

  const pageStyle = { background: "#FDFDFB", color: palette.ink };
  const displayHeading = (size) => ({
    ...fonts.displayFont,
    color: palette.primaryDeep,
    fontSize: size,
    fontWeight: 650,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
  });
  const bodyText = { ...fonts.bodyFont, color: palette.muted, fontSize: "15px", lineHeight: 1.7 };

  const backLink = (
    <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
      <a
        {...linkTo(navigate, "/table-box")}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]"
        style={{ ...fonts.bodyFont, color: palette.goldDeep }}
      >
        <ChevronLeft size={14} /> Table Box
      </a>
    </div>
  );

  if (!loaded) {
    return (
      <main style={{ ...pageStyle, minHeight: "60vh" }}>
        <SeoHead path={path} />
        {backLink}
        <p className="mx-auto max-w-6xl px-5 py-16 sm:px-8" style={bodyText}>
          Loading this Table Box...
        </p>
      </main>
    );
  }

  if (!pkg) {
    return (
      <main style={{ ...pageStyle, minHeight: "60vh" }}>
        <SeoHead path={path} override={notFoundSeo} />
        {backLink}
        <div className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8">
          <h1 style={displayHeading("clamp(2rem, 4vw, 2.75rem)")}>We couldn't find that Table Box.</h1>
          <p className="mt-3" style={bodyText}>
            {error || "It may have been retired or renamed."}
          </p>
          <a
            {...linkTo(navigate, "/table-box")}
            className="mt-6 inline-flex rounded-full border px-6 py-3 text-xs font-bold tracking-[0.12em]"
            style={{ ...fonts.bodyFont, borderColor: palette.primaryDeep, color: palette.primaryDeep }}
          >
            SEE ALL TABLE BOXES
          </a>
        </div>
      </main>
    );
  }

  const otherPackages = packages.filter((row) => row.slug !== slug);

  return (
    <main style={pageStyle}>
      <SeoHead path={path} override={seo} productJsonLd={product} extraJsonLd={extraJsonLd} />
      {backLink}

      <article className="mx-auto max-w-6xl px-5 pb-24 pt-6 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          <div>
            <img
              src={photoUrl(pkg.image_url)}
              alt={tableBoxPackageAltText(pkg.name, pkg.guest_count)}
              className="aspect-[4/3] w-full rounded-2xl object-cover"
              style={{ boxShadow: "0 2px 4px rgba(24,43,35,0.06), 0 16px 36px rgba(24,43,35,0.16)" }}
            />
          </div>

          <div>
            <Kicker palette={palette} fonts={fonts}>
              PRE-BUILT TABLE BOX · {pkg.guest_count} GUESTS
            </Kicker>
            <h1 className="mt-3" style={displayHeading("clamp(2.25rem, 5vw, 3.5rem)")}>
              {pkg.name} Table Box
            </h1>
            <p className="mt-3" style={bodyText}>
              {`The ${pkg.name} Table Box is a ready-made table setting for ${pkg.guest_count} guests, available to rent for ${details.price} in ${SERVICE_AREA_LONG}. ${pkg.blurb} It includes ${joinList(details.fixedPieces)}${
                details.choiceGroups.length
                  ? `, plus your choice of ${joinList(details.choiceGroups.map((group) => group.label.toLowerCase()))}.`
                  : "."
              }`}
            </p>

            <TableBoxPackageConfigurator
              pkg={pkg}
              addons={addons}
              deliveryItem={deliveryItem}
              onAdded={(added) => setAddedName(added.name)}
            />

            {addedName && (
              <p
                role="status"
                className="mt-4 rounded-lg border px-4 py-3"
                style={{ ...fonts.bodyFont, borderColor: palette.accent, color: palette.primaryDeep, fontSize: "14px" }}
              >
                {addedName} was added to your cart.{" "}
                <a {...linkTo(navigate, "/table-box")} className="underline">
                  Keep browsing Table Box
                </a>
              </p>
            )}
          </div>
        </div>

        <section className="mt-16" aria-labelledby="package-included">
          <h2 id="package-included" style={displayHeading("clamp(1.6rem, 3vw, 2.25rem)")}>
            Everything in the {pkg.name} Table Box
          </h2>
          <ul className="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-2" style={{ ...bodyText, color: palette.ink }}>
            {details.fixedPieces.map((piece) => (
              <li key={piece}>{piece}</li>
            ))}
          </ul>
          {details.choiceGroups.length > 0 && (
            <>
              <h3 className="mt-8" style={displayHeading("1.25rem")}>
                Choose your details
              </h3>
              <ul className="mt-3 space-y-2" style={bodyText}>
                {details.choiceGroups.map((group) => (
                  <li key={group.key}>
                    <strong style={{ color: palette.ink }}>{group.label}:</strong> {joinList(group.options, "or")}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="mt-16" aria-labelledby="package-how">
          <h2 id="package-how" style={displayHeading("clamp(1.6rem, 3vw, 2.25rem)")}>
            How renting the {pkg.name} Table Box works
          </h2>
          <ol className="mt-5 list-decimal space-y-2 pl-5" style={bodyText}>
            <li>Choose your options above and add the box to your cart.</li>
            <li>Pick your rental dates. Availability is confirmed for your selected date at checkout.</li>
            <li>
              Pick up and return in Toronto, or add Delivery + Basic Setup{deliveryItem ? ` for ${money(deliveryItem.rental_price)} flat` : ""}.
            </li>
            <li>Host your event, then return everything the day after.</li>
          </ol>
        </section>

        <section className="mt-16" aria-labelledby="package-faq">
          <h2 id="package-faq" style={displayHeading("clamp(1.6rem, 3vw, 2.25rem)")}>
            {pkg.name} Table Box: common questions
          </h2>
          <div className="mt-5 grid gap-4">
            {details.faqs.map((faq) => (
              <ElevatedCard key={faq.q} palette={palette} className="p-5 sm:p-6">
                <h3 style={displayHeading("1.15rem")}>{faq.q}</h3>
                <p className="mt-2" style={bodyText}>
                  {faq.a}
                </p>
              </ElevatedCard>
            ))}
          </div>
        </section>

        <nav className="mt-16" aria-label="More Table Box rentals">
          <h2 style={displayHeading("clamp(1.4rem, 2.6vw, 1.9rem)")}>More ways to host at home</h2>
          <ul className="mt-4 space-y-2" style={{ ...fonts.bodyFont, fontSize: "15px" }}>
            {otherPackages.map((other) => (
              <li key={other.id}>
                <a
                  {...linkTo(navigate, tableBoxPackagePath(other.slug))}
                  className="underline"
                  style={{ color: palette.primaryDeep, fontWeight: 600 }}
                >
                  {other.name} Table Box: a table setting for {other.guest_count} guests
                </a>
              </li>
            ))}
            <li>
              <a {...linkTo(navigate, "/table-box")} className="underline" style={{ color: palette.primaryDeep, fontWeight: 600 }}>
                Build your own Table Box
              </a>
            </li>
            <li>
              <a {...linkTo(navigate, "/decor")} className="underline" style={{ color: palette.primaryDeep, fontWeight: 600 }}>
                Browse event decor rentals
              </a>
            </li>
            <li>
              <a {...linkTo(navigate, "/rental-guide")} className="underline" style={{ color: palette.primaryDeep, fontWeight: 600 }}>
                Read the rental guide: deposits, pickup and delivery
              </a>
            </li>
          </ul>
        </nav>
      </article>
    </main>
  );
}
