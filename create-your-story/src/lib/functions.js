import { supabase } from "../supabaseClient";

// Thin wrapper around supabase.functions.invoke that surfaces the Edge
// Function's own error body (it returns { error: "..." } on failure) instead
// of just a generic "non-2xx" message.
export async function callFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    const message = data?.error ?? error.message ?? "Something went wrong.";
    throw new Error(message);
  }
  return data;
}
