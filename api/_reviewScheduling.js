// Shared by the admin booking routes. Decides when a review invitation
// should go out and makes sure a booking only ever has one live one.
//
// Two triggers, matching how bookings actually get handled:
//   confirm  - the booking is on the calendar, so the ask is queued for a
//              few days after the pieces come back.
//   complete - the rental is done and marked by hand, so the ask goes out
//              the next day while the event is still fresh.
//
// A booking that is confirmed and later marked complete keeps its single
// invitation and just has the date pulled forward, rather than emailing
// the same customer twice.

const DAYS_AFTER_DROPOFF = 3;
const DAYS_AFTER_COMPLETE = 1;

function addDays(date, days) {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function scheduledDateFor({ mode, dropoffDate, eventDate }) {
  const now = new Date();
  if (mode === "complete") return addDays(now, DAYS_AFTER_COMPLETE);

  const anchor = dropoffDate || eventDate;
  if (!anchor) return addDays(now, DAYS_AFTER_DROPOFF);

  const parsed = new Date(`${anchor}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return addDays(now, DAYS_AFTER_DROPOFF);

  const target = addDays(parsed, DAYS_AFTER_DROPOFF);
  // A booking entered after the fact should not queue an email in the past.
  return target > now ? target : addDays(now, DAYS_AFTER_COMPLETE);
}

// Creates or reschedules the invitation for one booking. Returns the row,
// or null when there is nothing to send to.
export async function upsertReviewRequest(supabase, booking) {
  const { sourceType, sourceId, customerName, customerEmail, eventDate, dropoffDate, mode } = booking;
  if (!customerEmail || !customerName) return null;

  const scheduledFor = scheduledDateFor({ mode, dropoffDate, eventDate }).toISOString();

  const { data: existing } = await supabase
    .from("review_requests")
    .select("id, status")
    .eq("source_type", sourceType)
    .eq("source_id", sourceId)
    .maybeSingle();

  if (existing) {
    // Once it has gone out or been answered, leave it alone. A cancelled
    // one stays cancelled unless someone reactivates it deliberately.
    if (existing.status !== "scheduled") return existing;
    const { data } = await supabase
      .from("review_requests")
      .update({ scheduled_for: scheduledFor })
      .eq("id", existing.id)
      .select()
      .single();
    return data;
  }

  const { data } = await supabase
    .from("review_requests")
    .insert({
      source_type: sourceType,
      source_id: sourceId,
      customer_name: customerName,
      customer_email: customerEmail,
      event_date: eventDate || null,
      scheduled_for: scheduledFor,
    })
    .select()
    .single();
  return data;
}
