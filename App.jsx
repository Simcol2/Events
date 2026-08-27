import React, { useEffect, useState } from "react";

import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

import Home from "./pages/Home";
import Decor from "./pages/Decor";
import Activities from "./pages/Activities";
import Collections from "./pages/Collections";
import HowItWorks from "./pages/HowItWorks";
import PackageBuilder from "./pages/PackageBuilder";

const NAV = [
  { label: "Home", path: "/" },
  { label: "Decor", path: "/decor" },
  { label: "Activities", path: "/activities" },
  { label: "Collections", path: "/collections" },
  { label: "How It Works", path: "/how-it-works" },
  { label: "Build Your Package", path: "/package-builder" },
];

function getPath() {
  return window.location.pathname || "/";
}

export default function App() {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const handlePopState = () => setPath(getPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
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
    "/activities": { component: <Activities navigate={navigate} />, current: "activities" },
    "/collections": { component: <Collections navigate={navigate} />, current: "collections" },
    "/how-it-works": { component: <HowItWorks navigate={navigate} />, current: "how-it-works" },
    "/package-builder": { component: <PackageBuilder navigate={navigate} />, current: "package-builder" },
  };

  const { component, current } = routeMap[page] || routeMap["/"];

  return (
    <>
      <SiteHeader current={current} navigate={navigate} nav={NAV} />
      {component}
      <SiteFooter navigate={navigate} />
    </>
  );
}
