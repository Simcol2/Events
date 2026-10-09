import React, { useEffect, useState } from "react";

import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import SeoHead from "./components/SeoHead";
import ValuePropBar from "./components/ValuePropBar";
import EventTypePicker from "./components/EventTypePicker";
import EventDatePicker from "./components/EventDatePicker";
import { EventTypeProvider, useEventType } from "./EventTypeContext";
import { EventDateProvider } from "./EventDateContext";
import { PackageProvider } from "./PackageContext";
import { CartProvider } from "./CartContext";
import { usePalette } from "./PaletteContext";
import { buildPageColorKey } from "./pageColors";
import { BASE_PATH } from "./apiBase";

import Home from "./pages/Home";
import Decor from "./pages/Decor";
import TableBox from "./pages/TableBox";
import TableBoxPackage from "./pages/TableBoxPackage";
import Gifts from "./pages/Gifts";
import HowItWorks from "./pages/HowItWorks";
import Experiences from "./pages/Experiences";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import PackageBuilder from "./pages/PackageBuilder";
import DisplayOptions from "./pages/DisplayOptions";
import Catering from "./pages/Catering";
import PastEvents from "./pages/PastEvents";
import RentalGuide from "./pages/RentalGuide";
import Reviews from "./pages/Reviews";
import LeaveReview from "./pages/LeaveReview";
import ScanAsset from "./pages/ScanAsset";
import Admin from "./pages/Admin";
import TutuTwirlsTea from "./pages/TutuTwirlsTea";
import BabyShower from "./pages/BabyShower";
import ClientPortal from "./pages/ClientPortal";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import ItemDetail from "./pages/ItemDetail";
import CartLauncher from "./components/CartLauncher";

// Nav order and the "primary CTA should be visually dominant" rule both
// come from the Master Plan's navigation section - Catering and Display
// Options stay live routes (linked from the footer and the Package
// Builder's Memory Display step) without competing for top-level nav space.
const NAV = [
  { label: "Home", path: "/" },
  {
    label: "The Must Knows",
    path: "/about",
    children: [
      { label: "About Us", path: "/about" },
      { label: "Rental Guide", path: "/rental-guide" },
      { label: "FAQ", path: "/faq" },
    ],
  },
  {
    label: "Milestone Events",
    path: "/package-builder",
    opensPicker: true,
    children: [
      { label: "Baby Shower", path: "/milestone-events/baby-shower", eventTypeId: "babyShower" },
      { label: "Engagement Shower", path: "/package-builder", eventTypeId: "engagement" },
      { label: "Tutu Twirls", path: "/birthdays/tutu-twirls-tea", eventTypeId: "tutuTwirlsTea" },
      { label: "Milestone Birthdays", path: "/package-builder", eventTypeId: "birthday" },
    ],
  },
  {
    label: "Decor and Gifts",
    path: "/decor",
    children: [
      { label: "Decor Collection", path: "/decor" },
      { label: "Display Walls", path: "/display-options" },
      { label: "Gifts & Gift Wrap", path: "/gifts" },
      { label: "Table Box", path: "/table-box" },
    ],
  },
  { label: "Experiences", path: "/experiences" },
  { label: "Catering", path: "/catering" },
  { label: "Past Events", path: "/past-events" },
  { label: "Client Portal", path: "/client", cta: true, ctaColor: "coral" },
  { label: "Build My Experience", path: "/package-builder", cta: true, opensPicker: true },
];

// The site is deployed under asliceofg.com/rentals (a rewrite on the rum
// cake business's main domain proxies /events/* here, see apiBase.js), so
// every route the rest of the app works with stays a plain unprefixed path
// (e.g. "/decor") and only these two functions - the router's boundary
// with the real browser URL - know about the prefix. Nothing else in the
// app (NAV, navigate() call sites, routeMap) needs to change.
function getPath() {
  const raw = window.location.pathname || "/";
  if (!BASE_PATH) return raw;
  if (raw === BASE_PATH) return "/";
  if (raw.startsWith(`${BASE_PATH}/`)) return raw.slice(BASE_PATH.length);
  return raw;
}

function AppRoutes() {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const handlePopState = () => setPath(getPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to) => {
    if (!to) return;
    const target = to === "/" ? BASE_PATH || "/" : `${BASE_PATH}${to}`;
    window.history.pushState({}, "", target);
    setPath(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const page = path.split("?")[0].replace(/\/+$/, "") || "/";

  // G Events checkout is a stand-alone payment surface, not a Rentals page.
  // CartLauncher mounts the dedicated G Events modal from the checkout URL.
  // Keep the cart provider (in App) but omit every Rentals nav, banner, footer
  // and catalogue element behind the checkout.
  if (page === "/g-events-checkout") {
    return (
      <main className="min-h-screen bg-[#FAF7F0] text-[#0B4933]">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A17920]">A Slice of G · Events</p>
          <h1 className="mt-3 font-serif text-3xl">Your Event Reservation</h1>
          <p className="mt-3 text-sm">Review your event booking and payment details.</p>
          <a className="mt-6 underline underline-offset-4" href="/events">Return to Events</a>
        </div>
        <CartLauncher />
      </main>
    );
  }

  // Internal tool, not a customer-facing page - skip the nav/footer/event
  // picker chrome entirely rather than routing it through routeMap below.
  if (page === "/admin") {
    return (
      <>
        <SeoHead path={page} />
        <Admin />
      </>
    );
  }

  // Every decor piece and every gift/wrap/card item gets its own real page
  // at /decor/<slug> or /gifts/<slug> instead of only existing inside a
  // click-to-open modal with no URL of its own - the catalogue's two
  // fixed routes stay in routeMap below, but anything after one more
  // slash is a specific item, resolved dynamically rather than added to
  // that fixed map one row at a time. ItemDetail renders its own SeoHead
  // once the item loads (its title/description can't be known ahead of
  // time the way a fixed route's can), so this returns before the
  // generic `<SeoHead path={page} />` below ever runs for these routes.
  const itemMatch = page.match(/^\/(decor|gifts)\/([^/]+)$/);
  if (itemMatch) {
    const [, kind, slug] = itemMatch;
    return (
      <>
        <PaletteRouteSync current={kind} />
        <SiteHeader current={kind} navigate={navigate} nav={NAV} emerald />
        <ValuePropBar />
        <ItemDetail kind={kind} slug={slug} navigate={navigate} />
        <SiteFooter navigate={navigate} />
        <EventTypePicker navigate={navigate} />
        <EventDatePicker />
        <CartLauncher />
      </>
    );
  }

  // Each pre-built Table Box has its own page at /table-box/<slug> (see
  // pages/TableBoxPackage.jsx), so it can be indexed and shared on its own.
  // The metadata for the two current boxes lives in seo.js's ROUTE_SEO.
  const packageMatch = page.match(/^\/table-box\/([^/]+)$/);
  if (packageMatch) {
    return (
      <>
        <PaletteRouteSync current="table-box" />
        <SiteHeader current="table-box" navigate={navigate} nav={NAV} />
        <ValuePropBar />
        <TableBoxPackage slug={packageMatch[1]} navigate={navigate} />
        <SiteFooter navigate={navigate} />
        <EventTypePicker navigate={navigate} />
        <EventDatePicker />
        <CartLauncher />
      </>
    );
  }

  const routeMap = {
    "/": { component: <Home navigate={navigate} />, current: "home" },
    "/g-events-checkout": { component: <div className="min-h-screen bg-[#FAF7F0] px-4 py-32 text-center"><h1 className="font-serif text-3xl text-[#0B4933]">A Slice of G Event Checkout</h1><p className="mt-3 text-[#0B4933]">Review your reservation in the checkout window.</p><a className="mt-6 inline-block underline" href="/events">Back to Events</a></div>, current: "g-events-checkout" },
    "/decor": { component: <Decor navigate={navigate} />, current: "decor" },
    "/table-box": { component: <TableBox navigate={navigate} />, current: "table-box" },
    "/gifts": { component: <Gifts navigate={navigate} />, current: "gifts" },
    "/catering": { component: <Catering navigate={navigate} />, current: "catering" },
    "/how-it-works": { component: <HowItWorks navigate={navigate} />, current: "how-it-works" },
    "/experiences": { component: <Experiences navigate={navigate} />, current: "experiences" },
    "/about": { component: <About navigate={navigate} />, current: "about" },
    "/faq": { component: <FAQ navigate={navigate} />, current: "faq" },
    "/package-builder": { component: <PackageBuilder navigate={navigate} />, current: "package-builder" },
    "/display-options": { component: <DisplayOptions navigate={navigate} />, current: "display-options" },
    "/past-events": { component: <PastEvents navigate={navigate} />, current: "past-events" },
    "/rental-guide": { component: <RentalGuide navigate={navigate} />, current: "rental-guide" },
    "/birthdays/tutu-twirls-tea": { component: <TutuTwirlsTea navigate={navigate} />, current: "birthdays" },
    "/milestone-events/baby-shower": { component: <BabyShower navigate={navigate} />, current: "milestone-events" },
    "/reviews": { component: <Reviews navigate={navigate} />, current: "reviews" },
    "/review": { component: <LeaveReview navigate={navigate} />, current: "review" },
    "/scan": { component: <ScanAsset navigate={navigate} />, current: "scan" },
    "/client": { component: <ClientPortal navigate={navigate} />, current: "client" },
    "/checkout-success": { component: <CheckoutSuccess navigate={navigate} />, current: "checkout-success" },
  };

  const { component, current } = routeMap[page] || routeMap["/"];

  return (
    <>
      <SeoHead path={page} />
      <PaletteRouteSync current={current} />
      {/* ASG_TABLE_BOX_HERO_NAV_GLASS_V1: emerald Table Box header */}
      <SiteHeader current={current} navigate={navigate} nav={NAV} integrated={current === "table-box"} emerald={current === "table-box"} />
      <ValuePropBar integrated={current === "table-box"} />
      {component}
      <SiteFooter navigate={navigate} className={current === "table-box" ? "mt-0" : undefined} />
      <EventTypePicker navigate={navigate} />
      <EventDatePicker />
      <CartLauncher />
    </>
  );
}

// The site's color system (see pageColors.js) is assigned per page, not per
// visitor choice - each page has its own dominant/secondary/accent colors
// so the same handful of brand colors recur recognizably without forcing
// every color into every page. Package Builder is the one exception: its
// own content already varies by the selected event type, so its colors
// follow that instead of the fixed per-route assignment.
function PaletteRouteSync({ current }) {
  const { eventTypeId } = useEventType();
  const { colorKey, setColorKey } = usePalette();

  useEffect(() => {
    const target = buildPageColorKey(current, eventTypeId);
    if (target !== colorKey) setColorKey(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, eventTypeId]);

  return null;
}

export default function App() {
  return (
    <EventTypeProvider>
      <EventDateProvider>
        <PackageProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </PackageProvider>
      </EventDateProvider>
    </EventTypeProvider>
  );
}
