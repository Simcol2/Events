import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Minus,
  PackageOpen,
  Plus,
} from "lucide-react";
import { usePalette } from "../PaletteContext";
// Where a scanned label lands; the QR encodes this page's URL so the
// phone's own camera opens it. Two label types:
//   ?c=ASG-0001  an individual asset or transport box (shows its details)
//   ?i=123       a quantity product QR (pick the booking, enter how many
//                are being packed, saved to reservation_items.quantity_packed)
// Inventory is internal, so it asks for the admin passcode once per phone.
import {
  adminApi,
  getStoredPasscode,
  storePasscode,
} from "../adminApi";

function getScanTarget() {
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      code: (params.get("c") || "").trim().toUpperCase(),
      itemId: Number(params.get("i") || 0),
    };
  } catch {
    return { code: "", itemId: 0 };
  }
}

function formatDate(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(`${value}T12:00:00`));
  } catch {
    return value;
  }
}

function ReservationChoice({ line, active, onClick, palette, fonts }) {
  const reservation = line.reservation || {};
  const required = Number(line.quantity || 0);
  const packed = Number(line.quantity_packed || 0);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border p-4 text-left transition"
      style={{
        borderColor: active ? palette.primaryDeep : palette.line,
        background: active ? "#F2F7F3" : palette.surface,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-sm font-semibold"
            style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
          >
            {reservation.booking_number || `Reservation #${reservation.id}`}
          </p>
          <p
            className="mt-1 text-xs"
            style={{ ...fonts.bodyFont, color: palette.muted }}
          >
            {reservation.customer?.name || reservation.customer?.email || "Customer"}
            {reservation.event_date ? ` · ${formatDate(reservation.event_date)}` : ""}
          </p>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em]"
          style={{
            ...fonts.bodyFont,
            background: "#ECF3EC",
            color: "#3F6B45",
          }}
        >
          {String(reservation.status || "").replaceAll("_", " ").toUpperCase()}
        </span>
      </div>

      <div
        className="mt-3 flex gap-5 text-xs"
        style={{ ...fonts.bodyFont, color: palette.ink }}
      >
        <span>Required: <strong>{required}</strong></span>
        <span>Packed: <strong>{packed}</strong></span>
      </div>
    </button>
  );
}

export default function ScanAsset({ navigate }) {
  const { palette, fonts } = usePalette();
  const target = getScanTarget();

  const [passcode, setPasscode] = useState(() => getStoredPasscode());
  const [entry, setEntry] = useState("");
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    if (!getStoredPasscode()) {
      setState("locked");
      return;
    }

    if (!target.code && !target.itemId) {
      setState("error");
      setMessage("That QR code did not include an item or asset identifier.");
      return;
    }

    setState("loading");

    try {
      const result = await adminApi.inventoryScanLookup(target);
      setData(result);

      const firstLine = result.reservationLines?.[0] || null;
      if (firstLine) {
        setSelectedLineId(firstLine.id);
        setQuantity(Number(firstLine.quantity_packed || firstLine.quantity || 0));
      }

      setState("found");
      setMessage("");
    } catch (err) {
      if (/passcode/i.test(err.message)) {
        setState("locked");
        setMessage("That passcode wasn't right.");
        return;
      }

      if (/not found/i.test(err.message)) {
        setState("error");
        setMessage(
          target.code
            ? `${target.code} isn't in the register. It may have been deleted, or the label belongs to something else.`
            : "That product isn't in the catalogue any more."
        );
        return;
      }

      setState("error");
      setMessage(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.code, target.itemId, passcode]);

  const selectedLine = useMemo(
    () =>
      (data?.reservationLines || []).find(
        (line) => String(line.id) === String(selectedLineId)
      ) || null,
    [data, selectedLineId]
  );

  const chooseLine = (line) => {
    setSelectedLineId(line.id);
    setQuantity(Number(line.quantity_packed || line.quantity || 0));
    setSaved(false);
  };

  const packQuantity = async () => {
    if (!selectedLine) return;

    setSaving(true);
    setSaved(false);

    try {
      await adminApi.packQuantity({
        reservationItemId: selectedLine.id,
        quantity,
      });

      setSaved(true);
      await load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const shell = (children) => (
    <div
      className="min-h-screen px-5 py-10 sm:px-8"
      style={{ background: palette.bg }}
    >
      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  );

  if (state === "loading") {
    return shell(
      <div
        className="flex items-center justify-center gap-3 py-24"
        style={{ color: palette.muted }}
      >
        <Loader2 size={20} className="animate-spin" />
        <span style={fonts.bodyFont}>Looking it up…</span>
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
        className="rounded-xl p-7"
        style={{
          background: palette.surface,
          border: `1px solid ${palette.line}`,
        }}
      >
        <h1
          className="text-2xl font-semibold"
          style={{ ...fonts.displayFont, color: palette.primaryDeep }}
        >
          Unlock scanning
        </h1>

        <p
          className="mt-2 text-base"
          style={{ ...fonts.bodyFont, color: palette.ink }}
        >
          Enter your admin passcode once and this phone will remember it.
        </p>

        <input
          type="password"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Passcode"
          className="mt-4 w-full rounded-lg px-3 py-3 text-base outline-none"
          style={{
            ...fonts.bodyFont,
            border: `1px solid ${palette.line}`,
            background: "#FFFFFF",
          }}
        />

        {message && (
          <p className="mt-2 text-sm" style={{ ...fonts.bodyFont, color: "#B23B3B" }}>
            {message}
          </p>
        )}

        <button
          type="submit"
          className="mt-4 w-full rounded-full px-6 py-3.5 text-sm font-semibold tracking-[0.1em] text-white"
          style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
        >
          UNLOCK
        </button>
      </form>
    );
  }

  if (state === "error") {
    return shell(
      <div
        className="rounded-xl p-7 text-center"
        style={{
          background: palette.surface,
          border: `1px solid ${palette.line}`,
        }}
      >
        <AlertTriangle
          size={26}
          className="mx-auto"
          style={{ color: palette.goldDeep }}
        />

        <h1
          className="mt-4 text-2xl font-semibold"
          style={{ ...fonts.displayFont, color: palette.primaryDeep }}
        >
          Something went wrong
        </h1>

        <p
          className="mt-2 text-base"
          style={{ ...fonts.bodyFont, color: palette.ink }}
        >
          {message}
        </p>

        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="mt-5 rounded-full px-6 py-3 text-sm font-semibold tracking-[0.1em] text-white"
          style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
        >
          OPEN ADMIN
        </button>
      </div>
    );
  }

  const item = data?.item;
  const asset = data?.asset;
  const quantityTracked = data?.scanType === "item" && item?.tracking_mode === "quantity";

  return shell(
    <div>
      <p
        className="text-xs font-semibold tracking-[0.22em]"
        style={{ ...fonts.bodyFont, color: palette.goldDeep }}
      >
        {quantityTracked
          ? `ASG-I-${String(item.id).padStart(4, "0")}`
          : asset?.code || "INVENTORY"}
      </p>

      <h1
        className="mt-2 text-3xl font-semibold"
        style={{ ...fonts.displayFont, color: palette.primaryDeep }}
      >
        {item?.name || asset?.label || "Inventory item"}
      </h1>

      {quantityTracked && (
        <>
          <div
            className="mt-5 rounded-xl p-5"
            style={{
              background: palette.surface,
              border: `1px solid ${palette.line}`,
            }}
          >
            <dl className="grid gap-3">
              {[
                ["Tracking", "Quantity"],
                ["Owned", item.quantity_owned ?? 0],
                ["Out of service", item.quantity_out_of_service ?? 0],
                [
                  "Usable now",
                  Math.max(
                    0,
                    Number(item.quantity_owned || 0) -
                      Number(item.quantity_out_of_service || 0)
                  ),
                ],
              ].map(([term, value]) => (
                <div
                  key={term}
                  className="flex items-baseline justify-between gap-4"
                >
                  <dt
                    className="text-sm"
                    style={{ ...fonts.bodyFont, color: palette.muted }}
                  >
                    {term}
                  </dt>
                  <dd
                    className="text-right text-base"
                    style={{ ...fonts.bodyFont, color: palette.ink }}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <h2
            className="mt-7 text-xl font-semibold"
            style={{ ...fonts.displayFont, color: palette.primaryDeep }}
          >
            Which rental are you packing?
          </h2>

          {!data.reservationLines?.length ? (
            <div
              className="mt-3 rounded-xl p-4"
              style={{
                background: "#FBF1DE",
                border: "1px solid #E0AD5C",
              }}
            >
              <p
                className="text-sm"
                style={{ ...fonts.bodyFont, color: "#8A5D14" }}
              >
                There are no active reservations currently requiring this item.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {data.reservationLines.map((line) => (
                <ReservationChoice
                  key={line.id}
                  line={line}
                  active={String(line.id) === String(selectedLineId)}
                  onClick={() => chooseLine(line)}
                  palette={palette}
                  fonts={fonts}
                />
              ))}
            </div>
          )}

          {selectedLine && (
            <div
              className="mt-5 rounded-xl p-5"
              style={{
                background: palette.surface,
                border: `1px solid ${palette.line}`,
              }}
            >
              <p
                className="text-sm font-semibold"
                style={{ ...fonts.bodyFont, color: palette.primaryDeep }}
              >
                How many are you packing?
              </p>

              <p
                className="mt-1 text-xs"
                style={{ ...fonts.bodyFont, color: palette.muted }}
              >
                This rental requires {selectedLine.quantity}.
              </p>

              <div className="mt-5 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-full border"
                  style={{
                    borderColor: palette.line,
                    color: palette.primaryDeep,
                  }}
                >
                  <Minus size={20} />
                </button>

                <strong
                  className="min-w-[54px] text-center text-4xl"
                  style={{ ...fonts.displayFont, color: palette.primaryDeep }}
                >
                  {quantity}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(Number(selectedLine.quantity || 0), q + 1)
                    )
                  }
                  className="flex h-12 w-12 items-center justify-center rounded-full border"
                  style={{
                    borderColor: palette.line,
                    color: palette.primaryDeep,
                  }}
                >
                  <Plus size={20} />
                </button>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={packQuantity}
                className="mt-5 w-full rounded-full px-6 py-3.5 text-sm font-semibold tracking-[0.08em] text-white disabled:opacity-50"
                style={{ ...fonts.bodyFont, background: palette.primaryDeep }}
              >
                {saving ? "SAVING..." : `CONFIRM ${quantity} PACKED`}
              </button>

              {saved && (
                <div
                  className="mt-3 flex items-center justify-center gap-2 text-sm"
                  style={{ ...fonts.bodyFont, color: "#3F6B45" }}
                >
                  <CheckCircle2 size={17} />
                  Packing quantity saved.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!quantityTracked && (
        <>
          <div
            className="mt-5 rounded-xl p-5"
            style={{
              background: palette.surface,
              border: `1px solid ${palette.line}`,
            }}
          >
            <dl className="grid gap-3">
              {[
                ["Type", data?.scanType === "container" ? "Transport box" : "Serialized asset"],
                ["Status", { available: "Available", out: "Out on a rental", cleaning: "Cleaning", repair: "Repair", missing: "Missing", retired: "Retired" }[asset?.status] || asset?.status || "Unknown"],
                ["Catalogue item", item?.name || "Not tied to one"],
                ["Delicate", asset?.delicate ? "Yes, pack with padding" : "No"],
              ].map(([term, value]) => (
                <div key={term} className="flex items-baseline justify-between gap-4">
                  <dt
                    className="text-sm"
                    style={{ ...fonts.bodyFont, color: palette.muted }}
                  >
                    {term}
                  </dt>
                  <dd
                    className="text-right text-base capitalize"
                    style={{ ...fonts.bodyFont, color: palette.ink }}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {asset?.delicate && (
            <div
              className="mt-4 flex items-start gap-3 rounded-xl p-4"
              style={{
                background: "#FBF1DE",
                border: "1px solid #E0AD5C",
              }}
            >
              <PackageOpen
                size={18}
                style={{ color: "#8A5D14", flex: "none", marginTop: 2 }}
              />
              <p
                className="text-sm"
                style={{ ...fonts.bodyFont, color: "#8A5D14" }}
              >
                This one is delicate. Pack it with padding, and check the padding comes back.
              </p>
            </div>
          )}
        </>
      )}

      {message && state === "found" && (
        <p className="mt-4 text-sm text-red-700" style={fonts.bodyFont}>
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={() => navigate("/admin")}
        className="mt-6 w-full rounded-full border px-6 py-3.5 text-sm font-semibold tracking-[0.1em]"
        style={{
          ...fonts.bodyFont,
          borderColor: palette.primaryDeep,
          color: palette.primaryDeep,
        }}
      >
        OPEN ADMIN
      </button>
    </div>
  );
}
