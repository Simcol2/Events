// Shared by every /api/admin-* route. These endpoints use the Supabase
// service role key (bypasses RLS entirely), so they must never be
// reachable without the passcode check below - unlike every other
// Supabase access in this app, which goes through the public anon key
// and real RLS policies.
import { createClient } from "@supabase/supabase-js";

export function requireAdmin(req, res) {
  const passcode = req.headers["x-admin-passcode"];
  if (!process.env.ADMIN_PASSCODE) {
    res.status(500).json({ error: "ADMIN_PASSCODE is not configured on the server" });
    return false;
  }
  if (!passcode || passcode !== process.env.ADMIN_PASSCODE) {
    res.status(401).json({ error: "Incorrect passcode" });
    return false;
  }
  return true;
}

export function adminSupabase() {
  return createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}
