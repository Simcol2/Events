// The app is deployed under asliceofg.com/events - the browser-side
// counterpart of this constant is apiBase.js's BASE_PATH (derived from
// Vite's `base` in vite.config.js). Any redirect URL a serverless function
// builds back into this app (Stripe success/cancel URLs, Supabase auth
// return URLs) needs this prefix too, or the visitor lands on the rum cake
// business's domain space instead of back in this app.
export const BASE_PATH = "/events";
