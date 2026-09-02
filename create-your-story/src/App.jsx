import React, { useEffect, useState } from "react";
import { matchRoute } from "./lib/routeMatch";
import RequireAuth from "./components/RequireAuth";

import Login from "./pages/host/Login";
import Dashboard from "./pages/host/Dashboard";
import EventSetup from "./pages/host/EventSetup";
import SkeletonReview from "./pages/host/SkeletonReview";
import ModerationPanel from "./pages/host/ModerationPanel";
import FinalBook from "./pages/host/FinalBook";
import GuestSubmit from "./pages/guest/GuestSubmit";
import LiveScreen from "./pages/live/LiveScreen";
import BookViewer from "./pages/book/BookViewer";

function getPath() {
  return window.location.pathname || "/";
}

// Ordered most-specific-first is not required here since patterns don't
// overlap, but keep dynamic segments after static ones for readability.
const ROUTES = [
  { pattern: "/", Component: Login, protected: false },
  { pattern: "/host", Component: Dashboard, protected: true },
  { pattern: "/host/events/:eventId/setup", Component: EventSetup, protected: true },
  { pattern: "/host/events/:eventId/skeleton", Component: SkeletonReview, protected: true },
  { pattern: "/host/events/:eventId/moderation", Component: ModerationPanel, protected: true },
  { pattern: "/host/events/:eventId/final", Component: FinalBook, protected: true },
  { pattern: "/g/:eventCode", Component: GuestSubmit, protected: false },
  { pattern: "/live/:eventCode", Component: LiveScreen, protected: false },
  { pattern: "/book/:eventCode", Component: BookViewer, protected: false },
];

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
    window.scrollTo({ top: 0 });
  };

  const cleanPath = path.split("?")[0].replace(/\/+$/, "") || "/";

  for (const route of ROUTES) {
    const params = matchRoute(route.pattern, cleanPath);
    if (params) {
      const page = <route.Component navigate={navigate} params={params} />;
      return route.protected ? <RequireAuth navigate={navigate}>{page}</RequireAuth> : page;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-stone-500">
      Page not found.
    </div>
  );
}
