"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, X, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { SAGE, SAGE_DEEP, GOLD, CREAM, INK, LINE, MUTED, displayFont, bodyFont, ensureFonts } from "../lib/theme";

const EMPTY_FORM = {
  name: "",
  category: "",
  description: "",
  photos: "", // comma-separated URLs in the form, converted to a JSON array on save
  quantity_owned: 1,
  rental_price: 0,
  inventory_type: "",
  condition_notes: "",
  active: true,
};

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="text-xs tracking-[0.15em] font-medium block mb-1.5" style={{ ...bodyFont, color: GOLD }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle = {
  ...bodyFont,
  width: "100%",
  border: `1px solid ${LINE}`,
  background: "#FFFFFF",
  color: INK,
  borderRadius: "2px",
  padding: "10px 12px",
  fontSize: "14px",
  outline: "none",
};

export default function AdminItemManager() {
  ensureFonts();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });
    if (error) setError(error.message);
    else setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      category: item.category || "",
      description: item.description || "",
      photos: Array.isArray(item.photos)
        ? item.photos.map((p) => (typeof p === "string" ? p : p?.url || "")).join(", ")
        : "",
      quantity_owned: item.quantity_owned ?? 1,
      rental_price: item.rental_price ?? 0,
      inventory_type: item.inventory_type || "",
      condition_notes: item.condition_notes || "",
      active: item.active ?? true,
    });
  }

  function startNew() {
    setEditingId("new");
    setForm(EMPTY_FORM);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    setSaving(true);
    const photosArray = form.photos
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      photos: photosArray,
      quantity_owned: Number(form.quantity_owned),
      rental_price: Number(form.rental_price),
      inventory_type: form.inventory_type,
      condition_notes: form.condition_notes,
      active: form.active,
    };

    let result;
    if (editingId === "new") {
      result = await supabase.from("items").insert(payload);
    } else {
      result = await supabase.from("items").update(payload).eq("id", editingId);
    }

    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    cancelEdit();
    fetchItems();
  }

  async function handleRetire(id) {
    // Soft-delete: flips `active` to false rather than removing the row, since
    // past reservation_items may still reference this item's history.
    const { error } = await supabase.from("items").update({ active: false }).eq("id", id);
    if (error) setError(error.message);
    else fetchItems();
  }

  return (
    <div className="min-h-screen" style={{ background: CREAM, color: INK }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold" style={{ ...displayFont, color: SAGE_DEEP }}>
            Inventory Admin
          </h1>
          {editingId === null && (
            <button
              onClick={startNew}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-white"
              style={{ ...bodyFont, background: SAGE }}
            >
              <Plus size={14} /> Add Item
            </button>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-sm p-3 mb-8" style={{ background: "#FBF1E4", border: "1px solid #E8CFA0" }}>
          <AlertTriangle size={16} color="#B8935A" className="flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed" style={{ ...bodyFont, color: "#8A6B3A" }}>
            This page has no login screen yet — anyone with the URL can add or edit items. Don't link to it publicly, and put real access control on it (a password gate at minimum) before this goes further than your own testing.
          </p>
        </div>

        {error && (
          <p className="text-sm mb-4" style={{ ...bodyFont, color: "#B85C5C" }}>
            {error}
          </p>
        )}

        {/* Add/edit form */}
        {editingId !== null && (
          <div className="rounded-sm p-6 mb-8" style={{ background: "#FFFFFF", border: `1px solid ${LINE}` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ ...displayFont, color: SAGE_DEEP }}>
              {editingId === "new" ? "New Item" : "Edit Item"}
            </h2>

            <div className="grid grid-cols-2 gap-x-4">
              <Field label="Name">
                <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Category">
                <input style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. centerpieces, tableclothes" />
              </Field>
            </div>

            <Field label="Description">
              <textarea style={{ ...inputStyle, minHeight: "70px" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>

            <Field label="Photo URLs (comma-separated)">
              <input style={inputStyle} value={form.photos} onChange={(e) => setForm({ ...form, photos: e.target.value })} placeholder="https://.../photo1.jpg, https://.../photo2.jpg" />
            </Field>

            <div className="grid grid-cols-2 gap-x-4">
              <Field label="Quantity Owned">
                <input type="number" style={inputStyle} value={form.quantity_owned} onChange={(e) => setForm({ ...form, quantity_owned: e.target.value })} />
              </Field>
              <Field label="Rental Price (per event)">
                <input type="number" step="0.01" style={inputStyle} value={form.rental_price} onChange={(e) => setForm({ ...form, rental_price: e.target.value })} />
              </Field>
            </div>

            <Field label="Inventory Type">
              <input style={inputStyle} value={form.inventory_type} onChange={(e) => setForm({ ...form, inventory_type: e.target.value })} />
            </Field>

            <Field label="Condition Notes">
              <textarea style={{ ...inputStyle, minHeight: "50px" }} value={form.condition_notes} onChange={(e) => setForm({ ...form, condition_notes: e.target.value })} />
            </Field>

            <label className="flex items-center gap-2 mb-6">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <span className="text-sm" style={{ ...bodyFont, color: INK }}>Active (visible in the public catalog)</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-medium text-white disabled:opacity-40"
                style={{ ...bodyFont, background: SAGE }}
              >
                <Save size={14} /> {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-medium"
                style={{ ...bodyFont, border: `1px solid ${LINE}`, color: MUTED }}
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Item list */}
        {loading ? (
          <p className="text-sm" style={{ ...bodyFont, color: MUTED }}>Loading inventory…</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-sm px-4 py-3"
                style={{ background: "#FFFFFF", border: `1px solid ${LINE}`, opacity: item.active ? 1 : 0.5 }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ ...bodyFont, color: SAGE_DEEP }}>
                    {item.name} {!item.active && <span className="text-xs font-normal">(retired)</span>}
                  </p>
                  <p className="text-xs capitalize" style={{ ...bodyFont, color: MUTED }}>
                    {item.category} · {item.quantity_owned} owned · ${item.rental_price}/event
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => startEdit(item)} className="text-xs font-medium underline" style={{ ...bodyFont, color: SAGE }}>
                    Edit
                  </button>
                  {item.active && (
                    <button onClick={() => handleRetire(item.id)} className="text-xs" style={{ ...bodyFont, color: "#B85C5C" }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
