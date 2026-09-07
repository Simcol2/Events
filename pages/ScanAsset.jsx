import React, { useEffect, useState } from "react";
import { Loader2, PackageOpen, AlertTriangle } from "lucide-react";
import { usePalette } from "../PaletteContext";
import { adminApi, getStoredPasscode, storePasscode } from "../adminApi";

// Where a scanned label lands. The QR encodes this page's URL, so the
// phone's built-in camera opens it directly with no scanner app.
//
// Inventory is not public, so the page asks for the same admin passcode as
// the rest of the internal tools and remembers it on that phone. Phase 1
// shows what the asset is and its current state; the check-out and
// check-in actions land here in phase 2.
function getCode() {
  try {
    return (new URLSearchParams(window.location.search).get("c") || "").trim().toUpperCase();
  } catch {
    return "";
  }
}

export default function ScanAsset({ navigate }) {
  const { palette, fonts } = usePalette();
  const code = getCode();
  const [passcode, setPasscode] = useState(() => getStoredPasscode());
  const [entry, setEntry] = useState("");
  const [asset, setAsset] = useState(null);
  const [state, setState] = useState("loading"); // loading | locked | found | missing | error
  const [message, setMessage] = useState("");

  const lookup = async () => {
    if (!getStoredPasscode()) {
      setState("locked");
      return;
    }
    setState("loading");
    try {
      const { assets } = await adminApi.listAssets();
      const match = (assets || []).find((a) => String(a.code).toUpperCase() === code);
      if (!match) {
        setState("missing");
        return;
      }
      setAsset(match);
      setState("found");
    } catch (err) {
      // A wrong passcode comes back as an auth failure, so send them back
      // to the prompt rather than showing a raw error.
      if (/passcode/i.test(err.message)) {
        setState("locked");
        setMessage("That passcode wasn't right.");
        return;
      }
      setState("error");
      setMessage(err.message);
    }
  };

  useEffect(() => {
    if (!code) {
      setState("error");
      setMessage("That label didn't include a code.");
      return;
    }
    lookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, passcode]);

  const shell = (children) => (
    <div className="min-h-screen px-5 py-14 sm:px-8" style={{ background: palette.bg }}>
      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  );

  if (state === "loading") {
    return shell(
      <div className="flex items-center justify-center gap-3 py-24" style={{ color: palette.muted }}>
        <Loader2 size={20} className="animate-spin" />
        <span style={fonts.bodyFont}>Looking up {code}</span>
      </div>
    );
  }

  if (state === "locked") {
    return shell(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          storePasscode(entry.trim());
          setPasscode(entry.trim());
        }}
        className="rounded-sm p-7"
        style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
      >
        <h1 className="text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
          Unlock scanning
        </h1>
        <p className="mt-2 text-base" style={{ ...fonts.bodyFont, color: palette.ink }}>
          Enter your admin passcode once and this phone will remember it.
        </p>
        <input
          type="password"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Passcode"
          className="mt-4 w-full rounded-sm px-3 py-3 text-base outline-none"
          style={{ ...fonts.bodyFont, border: `1px solid ${palette.line}`, background: "#FFFFFF" }}
        />
        {message && (
          <p className="mt-2 text-sm" style={{ ...fonts.bodyFont, color: "#B23B3B" }}>
            {message}
          </p>
        )}
        <button
          type="submit"
          className="mt-4 w-full rounded-sm px-6 py-3.5 text-sm font-semibold tracking-[0.1em] text-white"
          style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
        >
          UNLOCK
        </button>
      </form>
    );
  }

  if (state === "missing" || state === "error") {
    return shell(
      <div
        className="rounded-sm p-7 text-center"
        style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
      >
        <AlertTriangle size={26} className="mx-auto" style={{ color: palette.gold }} />
        <h1 className="mt-4 text-2xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
          {state === "missing" ? "No asset with that code" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-base" style={{ ...fonts.bodyFont, color: palette.ink }}>
          {state === "missing"
            ? `${code} isn't in the register. It may have been deleted, or the label belongs to something else.`
            : message}
        </p>
        <button
          onClick={() => navigate("/admin")}
          className="mt-5 rounded-sm px-6 py-3 text-sm font-semibold tracking-[0.1em] text-white"
          style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
        >
          OPEN ADMIN
        </button>
      </div>
    );
  }

  const statusLabels = { in_stock: "In stock", out: "Out on a rental", held: "Held", retired: "Retired" };

  return shell(
    <div>
      <p className="text-sm font-semibold tracking-[0.28em]" style={{ ...fonts.bodyFont, color: palette.gold }}>
        {asset.code}
      </p>
      <h1 className="mt-2 text-3xl font-semibold" style={{ ...fonts.displayFont, color: palette.primaryDeep }}>
        {asset.label}
      </h1>

      <div
        className="mt-5 rounded-sm p-5"
        style={{ background: palette.surface, border: `1px solid ${palette.line}` }}
      >
        <dl className="grid gap-3">
          {[
            ["Type", asset.kind === "box" ? "Counted box" : "Single asset"],
            ["Status", statusLabels[asset.status] || asset.status],
            ["Catalogue item", asset.item_name || "Not tied to one"],
            ["Delicate", asset.delicate ? "Yes, pack with padding" : "No"],
          ].map(([term, value]) => (
            <div key={term} className="flex items-baseline justify-between gap-4">
              <dt className="text-sm" style={{ ...fonts.bodyFont, color: palette.muted }}>
                {term}
              </dt>
              <dd className="text-right text-base" style={{ ...fonts.bodyFont, color: palette.ink }}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {asset.delicate && (
        <div
          className="mt-4 flex items-start gap-3 rounded-sm p-4"
          style={{ background: "#FBF1DE", border: "1px solid #E0AD5C" }}
        >
          <PackageOpen size={18} style={{ color: "#8A5D14", flex: "none", marginTop: 2 }} />
          <p className="text-sm" style={{ ...fonts.bodyFont, color: "#8A5D14" }}>
            This one is delicate. Pack it with padding, and check the padding comes back.
          </p>
        </div>
      )}

      <p className="mt-6 text-sm leading-relaxed" style={{ ...fonts.bodyFont, color: palette.muted }}>
        Check-out and check-in land here next, with the condition checklist and photos.
      </p>

      <button
        onClick={() => navigate("/admin")}
        className="mt-5 w-full rounded-sm px-6 py-3.5 text-sm font-semibold tracking-[0.1em] text-white"
        style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
      >
        OPEN ADMIN
      </button>
    </div>
  );
}
