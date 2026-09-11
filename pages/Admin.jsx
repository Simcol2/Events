import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { adminApi, getStoredPasscode, storePasscode, clearStoredPasscode } from "../adminApi";
import AdminItemForm from "../components/AdminItemForm";
import AdminGiftForm from "../components/AdminGiftForm";
import AdminBookingsTab from "../components/AdminBookingsTab";
import AdminReviewsTab from "../components/AdminReviewsTab";
import AdminAssetsTab from "../components/AdminAssetsTab";

function PasscodeGate({ onUnlocked }) {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChecking(true);
    setError("");
    storePasscode(code);
    try {
      await adminApi.listItems();
      onUnlocked();
    } catch (err) {
      clearStoredPasscode();
      setError("Incorrect passcode.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-5">
      <h1 className="font-['Fraunces'] text-3xl font-semibold text-[#0B4933]">Admin</h1>
      <p className="mt-2 font-[Space_Grotesk] text-sm text-[#8C846F]">Enter the passcode to manage gifts and decor items.</p>
      <form onSubmit={handleSubmit} className="mt-5">
        <input
          type="password"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-sm border border-[#D8D0BC] px-3 py-3 font-[Space_Grotesk] text-sm outline-none focus:border-[#0B4933]"
          placeholder="Passcode"
        />
        {error && <p className="mt-2 font-[Space_Grotesk] text-xs text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={checking || !code}
          className="mt-4 w-full rounded-full bg-[#0B4933] py-3 font-[Space_Grotesk] text-[11px] font-semibold tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checking ? "CHECKING..." : "ENTER"}
        </button>
      </form>
    </div>
  );
}

function ItemsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // item | "new" | null
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .listItems()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async (fields) => {
    setSaving(true);
    try {
      if (editing === "new") await adminApi.createItem(fields);
      else await adminApi.updateItem(editing.id, fields);
      setEditing(null);
      load();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      await adminApi.deleteItem(id);
      setEditing(null);
      load();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-5 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">
          {editing === "new" ? "Add Decor Item" : `Edit: ${editing.name}`}
        </h2>
        <AdminItemForm
          item={editing === "new" ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          onDelete={handleDelete}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">Decor Items</h2>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 rounded-full bg-[#0B4933] px-4 py-2 font-[Space_Grotesk] text-[10px] font-semibold tracking-[0.14em] text-white"
        >
          <Plus size={13} /> ADD ITEM
        </button>
      </div>
      {loading && <p className="font-[Space_Grotesk] text-sm text-[#5A5F54]">Loading...</p>}
      {error && <p className="font-[Space_Grotesk] text-sm text-red-700">{error}</p>}
      <div className="divide-y divide-[#EAE3D3]">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setEditing(item)}
            className="flex w-full items-center justify-between py-3 text-left"
          >
            <div>
              <p className="font-[Space_Grotesk] text-sm font-medium text-[#12201A]">
                {item.name} {!item.active && <span className="text-[#5A5F54]">(inactive)</span>}
              </p>
              <p className="font-[Space_Grotesk] text-xs text-[#8C846F]">{item.category || "No tags"}</p>
            </div>
            <span className="font-[Space_Grotesk] text-[10px] tracking-[0.1em] text-[#8A6A1E]">EDIT</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function GiftsTab() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // gift | "new" | null
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .listGifts()
      .then(setGifts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async (fields) => {
    setSaving(true);
    try {
      if (editing === "new") await adminApi.createGift(fields);
      else await adminApi.updateGift(editing.id, fields);
      setEditing(null);
      load();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      await adminApi.deleteGift(id);
      setEditing(null);
      load();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-5 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">
          {editing === "new" ? "Add Gift" : `Edit: ${editing.name}`}
        </h2>
        <AdminGiftForm
          gift={editing === "new" ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          onDelete={handleDelete}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">Gifts</h2>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 rounded-full bg-[#0B4933] px-4 py-2 font-[Space_Grotesk] text-[10px] font-semibold tracking-[0.14em] text-white"
        >
          <Plus size={13} /> ADD GIFT
        </button>
      </div>
      {loading && <p className="font-[Space_Grotesk] text-sm text-[#5A5F54]">Loading...</p>}
      {error && <p className="font-[Space_Grotesk] text-sm text-red-700">{error}</p>}
      <div className="divide-y divide-[#EAE3D3]">
        {gifts.map((gift) => (
          <button
            key={gift.id}
            onClick={() => setEditing(gift)}
            className="flex w-full items-center justify-between py-3 text-left"
          >
            <div>
              <p className="font-[Space_Grotesk] text-sm font-medium text-[#12201A]">
                {gift.name} {!gift.active && <span className="text-[#5A5F54]">(inactive)</span>}
              </p>
              <p className="font-[Space_Grotesk] text-xs text-[#8C846F]">${gift.price}</p>
            </div>
            <span className="font-[Space_Grotesk] text-[10px] tracking-[0.1em] text-[#8A6A1E]">EDIT</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(() => Boolean(getStoredPasscode()));
  const [tab, setTab] = useState("gifts");

  if (!unlocked) {
    return <PasscodeGate onUnlocked={() => setUnlocked(true)} />;
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-['Fraunces'] text-3xl font-semibold text-[#0B4933]">Admin</h1>
        <button
          onClick={() => {
            clearStoredPasscode();
            setUnlocked(false);
          }}
          className="font-[Space_Grotesk] text-[10px] font-semibold tracking-[0.1em] text-[#8C846F] underline underline-offset-4"
        >
          LOG OUT
        </button>
      </div>

      <div className="mb-8 flex gap-2 border-b border-[#EAE3D3]">
        {[
          { id: "gifts", label: "Gifts" },
          { id: "items", label: "Decor Items" },
          { id: "assets", label: "Assets" },
          { id: "bookings", label: "Bookings" },
          { id: "reviews", label: "Reviews" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 font-[Space_Grotesk] text-xs font-semibold tracking-[0.1em] ${
              tab === t.id ? "border-b-2 border-[#0B4933] text-[#0B4933]" : "text-[#5A5F54]"
            }`}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "gifts" && <GiftsTab />}
      {tab === "items" && <ItemsTab />}
      {tab === "assets" && <AdminAssetsTab />}
      {tab === "bookings" && <AdminBookingsTab />}
      {tab === "reviews" && <AdminReviewsTab />}
    </div>
  );
}
