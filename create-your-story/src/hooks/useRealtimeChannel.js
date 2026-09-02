import { useEffect } from "react";
import { supabase } from "../supabaseClient";

// Subscribes to postgres_changes on a table, filtered by event_id, for the
// lifetime of the calling component. `subscriptions` is an array of
// { event, table, onChange } so a single channel can carry more than one
// table (the moderation panel listens to both guest_contributions inserts
// and live_book_pages changes on one channel).
export function useRealtimeChannel(channelName, eventId, subscriptions) {
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase.channel(`${channelName}-${eventId}`);

    for (const sub of subscriptions) {
      channel.on(
        "postgres_changes",
        {
          event: sub.event ?? "*",
          schema: "public",
          table: sub.table,
          filter: `event_id=eq.${eventId}`,
        },
        sub.onChange
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, eventId]);
}
