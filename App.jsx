import React, { useEffect } from "react";
import { Home, Palette, Sparkles, CalendarDays } from "lucide-react";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import HomePage from "./pages/Home";
import DecorPage from "./pages/Decor";
import ActivitiesPage from "./pages/Activities";
import RentalBooking from "./rental-kit-booking-v5.jsx";
import { ensureFonts } from "./theme";

function pathPage() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/decor") return "decor";
  if (path === "/activities") return "activities";
  if (path === "/reservations" || path === "/book") return "reservations";
  return "home";
}

export default function App() {
  const [page, setPage] = React.useState(pathPage());

  useEffect(() => {
    ensureFonts();
    const onPop = () => setPage(pathPage());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setPage(pathPage());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nav = [
    { label: "Home", path: "/", icon: Home },
    { label: "Decor", path: "/decor", icon: Palette },
    { label: "Activities", path: "/activities", icon: Sparkles },
    { label: "Reservations", path: "/reservations", icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6ED] text-[#3A342A]">
      <SiteHeader current={page} navigate={navigate} nav={nav} />
      <main>
        {page === "home" && <HomePage navigate={navigate} />}
        {page === "decor" && <DecorPage navigate={navigate} />}
        {page === "activities" && <ActivitiesPage navigate={navigate} />}
        {page === "reservations" && <RentalBooking />}
      </main>
      <SiteFooter navigate={navigate} />
    </div>
  );
}
