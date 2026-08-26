import React, { useEffect, useState } from "react";
import RentalBooking from "../rental-kit-booking-v5.jsx";
import DecorPage from "../DecorPage.jsx";
import ActivitiesPage from "../ActivitiesPage.jsx";

function getPath() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path || "/";
}

function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}

function Nav() {
  const links = [
    { label: "Reservations", path: "/" },
    { label: "Decor", path: "/decor" },
    { label: "Activities", path: "/activities" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-[#FAF6ED]/95 backdrop-blur-sm" style={{ borderColor: "#E4DCC8" }}>
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-sm tracking-[0.18em] font-medium whitespace-nowrap"
          style={{ fontFamily: "'Jost', sans-serif", color: "#4E5A44" }}
        >
          A SLICE OF G EVENTS
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const active = getPath() === link.path;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="px-3 py-2 text-xs tracking-[0.12em] rounded-full transition-colors"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  color: active ? "#4E5A44" : "#8A8268",
                  background: active ? "#F1F4EC" : "transparent",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const [path, setPath] = useState(getPath());

  useEffect(() => {
    const onPopState = () => setPath(getPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  let page;
  if (path === "/decor") page = <DecorPage />;
  else if (path === "/activities") page = <ActivitiesPage />;
  else page = <RentalBooking />;

  return (
    <div>
      <Nav />
      {page}
    </div>
  );
}
