import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getServiceClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server environment variables are not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function requireClient(req) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (!token) {
    const error = new Error("Authentication required.");
    error.statusCode = 401;
    throw error;
  }

  const supabase = getServiceClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  const user = userData?.user;

  if (userError || !user?.id || !user?.email) {
    const error = new Error("Your sign-in has expired. Please sign in again.");
    error.statusCode = 401;
    throw error;
  }

  const normalizedEmail = user.email.trim().toLowerCase();

  let { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (customerError) throw customerError;

  if (!customer) {
    const { data: emailCustomer, error: emailLookupError } = await supabase
      .from("customers")
      .select("*")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (emailLookupError) throw emailLookupError;

    if (emailCustomer) {
      const { data: linked, error: linkError } = await supabase
        .from("customers")
        .update({ user_id: user.id })
        .eq("id", emailCustomer.id)
        .select("*")
        .single();

      if (linkError) throw linkError;
      customer = linked;
    } else {
      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        normalizedEmail.split("@")[0];

      const { data: created, error: createError } = await supabase
        .from("customers")
        .insert({
          name: displayName,
          email: normalizedEmail,
          user_id: user.id,
        })
        .select("*")
        .single();

      if (createError) throw createError;
      customer = created;
    }
  }

  return { supabase, user, customer };
}

export function handleApiError(res, error) {
  const status = error?.statusCode || 500;
  if (status >= 500) console.error(error);
  return res.status(status).json({ error: error?.message || "Something went wrong." });
}
