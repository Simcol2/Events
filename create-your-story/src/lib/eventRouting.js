// Maps an event's current status to the host screen it makes sense to land
// on next, so the Dashboard's "Open" link always drops the host where their
// next action actually is.
export function nextRouteForEvent(event) {
  switch (event.status) {
    case "draft":
    case "skeleton_generating":
    case "skeleton_failed":
      return `/host/events/${event.id}/setup`;
    case "skeleton_ready":
      return `/host/events/${event.id}/skeleton`;
    case "locked":
    case "live":
    case "completed":
      return `/host/events/${event.id}/moderation`;
    case "final_generating":
    case "final_ready":
    case "final_failed":
    case "archived":
      return `/host/events/${event.id}/final`;
    default:
      return `/host/events/${event.id}/setup`;
  }
}
