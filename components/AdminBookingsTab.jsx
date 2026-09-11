import React, { useEffect, useState } from "react";
import { adminApi } from "../adminApi";

// Every request that has come in from the site, and the status control
// that drives the review cycle. Moving a booking to Confirmed queues its
// review email for a few days after drop-off; Completed sends it the next
// day; Cancelled pulls any unsent invitation back.
const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

function inviteLabel(invite) {
  if (!invite) return "No review email";
  if (invite.status === "sent") return `Review email sent ${formatDate(invite.sent_at)}`;
  if (invite.status === "completed") return "Review received";
  if (invite.status === "cancelled") return "Review email held";
  return `Review email queued for ${formatDate(invite.scheduled_for)}`;
}

export default function AdminBookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listBookings();
      setBookings(data.bookings || []);
      setInvites(data.invites || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const inviteFor = (booking) =>
    invites.find((i) => i.source_type === booking.kind && i.source_id === booking.id) || null;

  const changeStatus = async (booking, status) => {
    setSavingId(booking.id);
    try {
      await adminApi.updateBookingStatus(booking.id, booking.kind, status);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <p className="font-[Space_Grotesk] text-sm text-[#8C846F]">Loading bookings...</p>;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">Bookings</h2>
        <button
          onClick={load}
          className="font-[Space_Grotesk] text-[11px] font-semibold tracking-[0.1em] text-[#0B4933] underline underline-offset-4"
        >
          REFRESH
        </button>
      </div>

      {error && <p className="mb-4 font-[Space_Grotesk] text-sm text-red-700">{error}</p>}

      {!bookings.length && (
        <p className="font-[Space_Grotesk] text-sm text-[#8C846F]">
          No requests yet. Rental and package requests from the site land here.
        </p>
      )}

      <div className="space-y-3">
        {bookings.map((booking) => {
          const invite = inviteFor(booking);
          return (
            <div key={`${booking.kind}-${booking.id}`} className="rounded-sm border border-[#EAE3D3] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-[Space_Grotesk] text-sm font-semibold text-[#12201A]">
                    {booking.customer_name}
                    <span className="ml-2 font-normal text-[#8C846F]">{booking.customer_email}</span>
                  </p>
                  <p className="mt-1 font-[Space_Grotesk] text-sm text-[#5C5645]">
                    {booking.kind === "package_request"
                      ? `Package request, $${Number(booking.total || 0).toFixed(2)}`
                      : `${booking.item_name || "Item"} x${booking.quantity || 1}`}
                  </p>
                  <p className="mt-1 font-[Space_Grotesk] text-xs text-[#8C846F]">
                    {booking.event_date ? `Event ${formatDate(booking.event_date)}` : "No event date"}
                    {booking.dropoff_date ? ` · Back ${formatDate(booking.dropoff_date)}` : ""}
                    {` · Requested ${formatDate(booking.created_at)}`}
                  </p>
                </div>
                <select
                  value={booking.status}
                  disabled={savingId === booking.id}
                  onChange={(e) => changeStatus(booking, e.target.value)}
                  className="rounded-sm border border-[#D8D0BC] bg-white px-3 py-2 font-[Space_Grotesk] text-sm text-[#12201A] outline-none focus:border-[#0B4933] disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s[0].toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-3 border-t border-[#F0EBDD] pt-3 font-[Space_Grotesk] text-xs text-[#8C846F]">
                {inviteLabel(invite)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
