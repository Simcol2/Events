// Thin client for the /api/admin-* endpoints. The passcode is kept in
// localStorage (not a real session/cookie - this is a low-stakes internal
// tool, not customer-facing auth) so it only needs to be entered once per
// browser, then sent as a header on every request.
const PASSCODE_KEY = "asliceofg-admin-passcode";

export function getStoredPasscode() {
  try {
    return localStorage.getItem(PASSCODE_KEY) || "";
  } catch {
    return "";
  }
}

export function storePasscode(code) {
  try {
    localStorage.setItem(PASSCODE_KEY, code);
  } catch {
    // Ignore - worst case the user re-enters it next time.
  }
}

export function clearStoredPasscode() {
  try {
    localStorage.removeItem(PASSCODE_KEY);
  } catch {
    // Ignore.
  }
}

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json", "X-Admin-Passcode": getStoredPasscode() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const adminApi = {
  listItems: () => request("/api/admin-items").then((d) => (Array.isArray(d.items) ? d.items : [])),
  createItem: (fields) => request("/api/admin-items", { method: "POST", body: fields }).then((d) => d.item),
  updateItem: (id, fields) => request("/api/admin-items", { method: "PUT", body: { id, ...fields } }).then((d) => d.item),
  deleteItem: (id) => request("/api/admin-items", { method: "DELETE", body: { id } }),

  listGifts: () => request("/api/admin-gifts").then((d) => (Array.isArray(d.gifts) ? d.gifts : [])),
  createGift: (fields) => request("/api/admin-gifts", { method: "POST", body: fields }).then((d) => d.gift),
  updateGift: (id, fields) => request("/api/admin-gifts", { method: "PUT", body: { id, ...fields } }).then((d) => d.gift),
  deleteGift: (id) => request("/api/admin-gifts", { method: "DELETE", body: { id } }),
};
