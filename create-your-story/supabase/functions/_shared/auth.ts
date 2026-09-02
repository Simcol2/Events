import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// A request-scoped client authenticated as the caller (forwards their JWT),
// used only to answer "who is this and do they own this event" via RLS —
// never used for the privileged writes themselves.
export function getUserClient(req: Request): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
}

// Bypasses RLS entirely (service_role). Every write that isn't a guest's own
// anon insert goes through this client, inside an Edge Function, so secrets
// and cross-row business rules never depend on client-side trust.
export function getServiceClient(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

// Confirms the caller is signed in and owns the given event, using the
// caller's own JWT so RLS does the actual access check. Returns the caller's
// user id (for moderated_by) and the event row.
export async function requireEventOwner(req: Request, eventId: string) {
  const userClient = getUserClient(req);
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) throw new AuthError("Not signed in", 401);

  const { data: event, error: eventError } = await userClient
    .from("cys_events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError || !event) throw new AuthError("Event not found or not owned by this user", 403);

  return { user, event };
}
