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
  { label: "About", path: "/about" },
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
  { label: "Rental Guide", path: "/rental-guide" },
  { label: "FAQ", path: "/faq" },
  { label: "Catering", path: "/catering" },
  { label: "Past Events", path: "/past-events" },
  { label: "Client Portal", path: "/client" },
  {
    label: "Celebrating You",
    path: "/package-builder",
    opensPicker: true,
    children: [
      { label: "Just Because", path: "/package-builder", eventTypeId: "specialMoment" },
    ],
  },
  { label: "Build My Experience", path: "/package-builder", cta: true, opensPicker: true },
];

// The site is deployed under asliceofg.com/events (a rewrite on the rum
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
        <SiteHeader current={kind} navigate={navigate} nav={NAV} />
        <ValuePropBar />
        <ItemDetail kind={kind} slug={slug} navigate={navigate} />
        <SiteFooter navigate={navigate} />
        <EventTypePicker navigate={navigate} />
        <EventDatePicker />
        <CartLauncher />
      </>
    );
  }

  const routeMap = {
    "/": { component: <Home navigate={navigate} />, current: "home" },
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
      <SiteHeader current={current} navigate={navigate} nav={NAV} />
      <ValuePropBar />
      {component}
      <SiteFooter navigate={navigate} />
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
