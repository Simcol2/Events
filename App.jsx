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

import Home from "./pages/Home";
import Decor from "./pages/Decor";
import Activities from "./pages/Activities";
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

// Nav order and the "primary CTA should be visually dominant" rule both
// come from the Master Plan's navigation section - Catering and Display
// Options stay live routes (linked from the footer and the Package
// Builder's Memory Display step) without competing for top-level nav space.
const NAV = [
  { label: "Home", path: "/" },
  { label: "How It Works", path: "/how-it-works" },
  { label: "Experiences", path: "/experiences" },
  {
    label: "Decor",
    path: "/decor",
    children: [
      { label: "Decor Collection", path: "/decor" },
      { label: "Display Walls", path: "/display-options" },
    ],
  },
  { label: "Rental Guide", path: "/rental-guide" },
  { label: "Activities", path: "/activities" },
  { label: "Gifts", path: "/gifts" },
  { label: "Catering", path: "/catering" },
  { label: "Past Events", path: "/past-events" },
  { label: "About", path: "/about" },
  { label: "Build My Experience", path: "/package-builder", cta: true },
];

function getPath() {
  return window.location.pathname || "/";
}

function AppRoutes() {
  const [path, setPath] = useState(getPath);
  const { hasChosen, openPicker } = useEventType();

  useEffect(() => {
    const handlePopState = () => setPath(getPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Ask what the visitor is planning right away, once ever, regardless of
  // which page they land on first. The one exception is the review link
  // from a post-rental email: that visitor is here to finish one task, and
  // asking them what they are shopping for first would be tone deaf.
  useEffect(() => {
    if (!hasChosen && !/^\/(review|scan)/.test(getPath())) openPicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = (to) => {
    if (!to) return;
    window.history.pushState({}, "", to);
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

  const routeMap = {
    "/": { component: <Home navigate={navigate} />, current: "home" },
    "/decor": { component: <Decor navigate={navigate} />, current: "decor" },
    "/activities": { component: <Activities navigate={navigate} />, current: "activities" },
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
    "/reviews": { component: <Reviews navigate={navigate} />, current: "reviews" },
    "/review": { component: <LeaveReview navigate={navigate} />, current: "review" },
    "/scan": { component: <ScanAsset navigate={navigate} />, current: "scan" },
  };

  const { component, current } = routeMap[page] || routeMap["/"];

  return (
    <>
      <SeoHead path={page} />
      <SiteHeader current={current} navigate={navigate} nav={NAV} />
      <ValuePropBar />
      {component}
      <SiteFooter navigate={navigate} />
      <EventTypePicker />
      <EventDatePicker />
    </>
  );
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
