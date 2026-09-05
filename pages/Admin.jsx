import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { adminApi, getStoredPasscode, storePasscode, clearStoredPasscode } from "../adminApi";
import AdminItemForm from "../components/AdminItemForm";
import AdminGiftForm from "../components/AdminGiftForm";

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
      <h1 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-[#4E5A44]">Admin</h1>
      <p className="mt-2 font-[Jost] text-sm text-[#8C846F]">Enter the passcode to manage gifts and decor items.</p>
      <form onSubmit={handleSubmit} className="mt-5">
        <input
          type="password"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-sm border border-[#D8D0BC] px-3 py-3 font-[Jost] text-sm outline-none focus:border-[#4E5A44]"
          placeholder="Passcode"
        />
        {error && <p className="mt-2 font-[Jost] text-xs text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={checking || !code}
          className="mt-4 w-full rounded-full bg-[#4E5A44] py-3 font-[Jost] text-[11px] font-semibold tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:opacity-50"
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
        <h2 className="mb-5 font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">
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
        <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">Decor Items</h2>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 rounded-full bg-[#4E5A44] px-4 py-2 font-[Jost] text-[10px] font-semibold tracking-[0.14em] text-white"
        >
          <Plus size={13} /> ADD ITEM
        </button>
      </div>
      {loading && <p className="font-[Jost] text-sm text-[#A69C7E]">Loading...</p>}
      {error && <p className="font-[Jost] text-sm text-red-700">{error}</p>}
      <div className="divide-y divide-[#E4DCC8]">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setEditing(item)}
            className="flex w-full items-center justify-between py-3 text-left"
          >
            <div>
              <p className="font-[Jost] text-sm font-medium text-[#3A342A]">
                {item.name} {!item.active && <span className="text-[#A69C7E]">(inactive)</span>}
              </p>
              <p className="font-[Jost] text-xs text-[#8C846F]">{item.category || "No tags"}</p>
            </div>
            <span className="font-[Jost] text-[10px] tracking-[0.1em] text-[#B8935A]">EDIT</span>
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
        <h2 className="mb-5 font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">
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
        <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#4E5A44]">Gifts</h2>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 rounded-full bg-[#4E5A44] px-4 py-2 font-[Jost] text-[10px] font-semibold tracking-[0.14em] text-white"
        >
          <Plus size={13} /> ADD GIFT
        </button>
      </div>
      {loading && <p className="font-[Jost] text-sm text-[#A69C7E]">Loading...</p>}
      {error && <p className="font-[Jost] text-sm text-red-700">{error}</p>}
      <div className="divide-y divide-[#E4DCC8]">
        {gifts.map((gift) => (
          <button
            key={gift.id}
            onClick={() => setEditing(gift)}
            className="flex w-full items-center justify-between py-3 text-left"
          >
            <div>
              <p className="font-[Jost] text-sm font-medium text-[#3A342A]">
                {gift.name} {!gift.active && <span className="text-[#A69C7E]">(inactive)</span>}
              </p>
              <p className="font-[Jost] text-xs text-[#8C846F]">${gift.price}</p>
            </div>
            <span className="font-[Jost] text-[10px] tracking-[0.1em] text-[#B8935A]">EDIT</span>
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
        <h1 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-[#4E5A44]">Admin</h1>
        <button
          onClick={() => {
            clearStoredPasscode();
            setUnlocked(false);
          }}
          className="font-[Jost] text-[10px] font-semibold tracking-[0.1em] text-[#8C846F] underline underline-offset-4"
        >
          LOG OUT
        </button>
      </div>

      <div className="mb-8 flex gap-2 border-b border-[#E4DCC8]">
        {[
          { id: "gifts", label: "Gifts" },
          { id: "items", label: "Decor Items" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 font-[Jost] text-xs font-semibold tracking-[0.1em] ${
              tab === t.id ? "border-b-2 border-[#4E5A44] text-[#4E5A44]" : "text-[#A69C7E]"
            }`}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "gifts" ? <GiftsTab /> : <ItemsTab />}
    </div>
  );
}
