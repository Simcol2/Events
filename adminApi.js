// Thin client for the /api/admin-* endpoints. The passcode is kept in
// localStorage (not a real session/cookie - this is a low-stakes internal
// tool, not customer-facing auth) so it only needs to be entered once per
// browser, then sent as a header on every request.
import { API_BASE } from "./apiBase";

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
  // Call sites below write plain "/api/..." paths; rewritten here to the
  // real deployed API_BASE so they still work under the /events prefix.
  const url = path.startsWith("/api") ? `${API_BASE}${path.slice(4)}` : path;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", "X-Admin-Passcode": getStoredPasscode() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const adminApi = {
  listItems: () => request("/api/admin?resource=items").then((d) => (Array.isArray(d.items) ? d.items : [])),
  createItem: (fields) => request("/api/admin?resource=items", { method: "POST", body: fields }).then((d) => d.item),
  updateItem: (id, fields) => request("/api/admin?resource=items", { method: "PUT", body: { id, ...fields } }).then((d) => d.item),
  deleteItem: (id) => request("/api/admin?resource=items", { method: "DELETE", body: { id } }),

  listAssets: () => request("/api/admin?resource=assets"),
  createAssets: (fields) => request("/api/admin?resource=assets", { method: "POST", body: fields }).then((d) => d.assets),
  updateAsset: (id, fields) => request("/api/admin?resource=assets", { method: "PUT", body: { id, ...fields } }).then((d) => d.asset),
  deleteAsset: (id) => request("/api/admin?resource=assets", { method: "DELETE", body: { id } }),

  inventoryScanLookup: ({ code, itemId }) => {
    const params = new URLSearchParams({ resource: "inventory-scan" });
    if (code) params.set("code", code);
    if (itemId) params.set("itemId", String(itemId));
    return request(`/api/admin?${params.toString()}`);
  },
  packQuantity: ({ reservationItemId, quantity }) =>
    request("/api/admin?resource=inventory-scan", {
      method: "POST",
      body: { action: "pack_quantity", reservationItemId, quantity },
    }),

  listBookings: () => request("/api/admin?resource=bookings"),
  updateBookingStatus: (id, kind, status) =>
    request("/api/admin?resource=bookings", { method: "PUT", body: { id, kind, status } }),

  listReviews: () => request("/api/admin?resource=reviews").then((d) => (Array.isArray(d.reviews) ? d.reviews : [])),
  updateReview: (id, fields) => request("/api/admin?resource=reviews", { method: "PUT", body: { id, ...fields } }).then((d) => d.review),
  deleteReview: (id) => request("/api/admin?resource=reviews", { method: "DELETE", body: { id } }),
  updateInvite: (inviteId, fields) => request("/api/admin?resource=reviews", { method: "PUT", body: { inviteId, ...fields } }).then((d) => d.invite),
  sendDueReviewEmails: () => request("/api/send-review-requests", { method: "POST" }),

  listGifts: () => request("/api/admin?resource=gifts").then((d) => (Array.isArray(d.gifts) ? d.gifts : [])),
  createGift: (fields) => request("/api/admin?resource=gifts", { method: "POST", body: fields }).then((d) => d.gift),
  updateGift: (id, fields) => request("/api/admin?resource=gifts", { method: "PUT", body: { id, ...fields } }).then((d) => d.gift),
  deleteGift: (id) => request("/api/admin?resource=gifts", { method: "DELETE", body: { id } }),

  listSquareReservations: () =>
    request("/api/square?resource=admin-reservations").then((d) => (Array.isArray(d.reservations) ? d.reservations : [])),
  updateSquareReservationPickup: (reservationId, pickupAt) =>
    request("/api/square?resource=admin-reservations", { method: "PUT", body: { reservationId, pickupAt } }),
};
