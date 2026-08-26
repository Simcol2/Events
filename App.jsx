import React, { useEffect, useState } from "react";

import Home from "./pages/Home";
import Decor from "./pages/Decor";
import Activities from "./pages/Activities";
import Collections from "./pages/Collections";

function getPath() {
  return window.location.pathname || "/";
}

export default function App() {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const handlePopState = () => setPath(getPath());

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = (to) => {
    if (!to) return;

    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Keep navigation compatible with the existing page components.
  const page = path.split("?")[0].replace(/\/+$/, "") || "/";

  switch (page) {
    case "/":
      return <Home navigate={navigate} />;

    case "/decor":
      return <Decor navigate={navigate} />;

    case "/activities":
      return <Activities navigate={navigate} />;

    case "/collections":
      return <Collections navigate={navigate} />;

    default:
      return <Home navigate={navigate} />;
  }
}
