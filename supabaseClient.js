import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// createClient() throws synchronously if either value is missing, which
// would crash the entire app at import time (App -> Decor -> here) before
// React even renders — not just the Decor page. Fall back to null so a
// missing/misconfigured Supabase env var only breaks the Decor page, which
// already knows how to show a friendly message instead of data.
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
