import React, { useEffect, useState } from "react";

import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import ValuePropBar from "./components/ValuePropBar";
import EventTypePicker from "./components/EventTypePicker";
import EventDatePicker from "./components/EventDatePicker";
import { EventTypeProvider, useEventType } from "./EventTypeContext";
import { EventDateProvider } from "./EventDateContext";
import { PackageProvider } from "./PackageContext";
import { CartProvider } from "./CartContext";

import Home from "./pages/Home";
import Decor from "./pages/Decor";
import GiftsActivities from "./pages/GiftsActivities";
import HowItWorks from "./pages/HowItWorks";
import PackageBuilder from "./pages/PackageBuilder";
import DisplayOptions from "./pages/DisplayOptions";
import Catering from "./pages/Catering";
import PastEvents from "./pages/PastEvents";

const NAV = [
  { label: "Home", path: "/" },
  { label: "How It Works", path: "/how-it-works" },
  { label: "Decor", path: "/decor" },
  { label: "Gifts & Activities", path: "/gifts-activities" },
  { label: "Catering", path: "/catering" },
  { label: "Build My Experience", path: "/package-builder" },
  { label: "Display Options", path: "/display-options" },
  { label: "Past Events", path: "/past-events" },
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
  // which page they land on first.
  useEffect(() => {
    if (!hasChosen) openPicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = (to) => {
    if (!to) return;
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const page = path.split("?")[0].replace(/\/+$/, "") || "/";

  const routeMap = {
    "/": { component: <Home navigate={navigate} />, current: "home" },
    "/decor": { component: <Decor navigate={navigate} />, current: "decor" },
    "/gifts-activities": { component: <GiftsActivities navigate={navigate} />, current: "gifts-activities" },
    "/catering": { component: <Catering navigate={navigate} />, current: "catering" },
    "/how-it-works": { component: <HowItWorks navigate={navigate} />, current: "how-it-works" },
    "/package-builder": { component: <PackageBuilder navigate={navigate} />, current: "package-builder" },
    "/display-options": { component: <DisplayOptions navigate={navigate} />, current: "display-options" },
    "/past-events": { component: <PastEvents navigate={navigate} />, current: "past-events" },
  };

  const { component, current } = routeMap[page] || routeMap["/"];

  return (
    <>
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
