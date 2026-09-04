# A Slice of G Events — Base44 Dev Notes

## What this is
Vite 6 + React 18 frontend for an event-rentals business (baby showers, first birthdays, Toronto/GTA). No backend server — static SPA with client-side routing via `window.history.pushState`. Tailwind CSS for styling. Uses Google Fonts (Cormorant Garamond, Jost, Parisienne).

## External services
- **Supabase** (`supabaseClient.js`): optional. Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from env. Falls back to `null` gracefully — the app boots and all pages work without it; only the Decor catalog page (`pages/Decor.jsx`) shows a "not connected" message instead of data.

## Running locally
```
docker compose -f docker-compose.base44.yml up -d
```
- Vite dev server on port 5173 (mapped to host 3000), live reload via bind mount.
- `npm install` runs automatically at container start.
- Health check: `curl -sf http://localhost:3000/`

## Key conventions
- Routing is manual (`App.jsx`): `navigate(path)` uses `pushState` + `setPath`. No react-router.
- `EventTypeContext` shows a one-time picker modal asking what the visitor is planning.
- `PaletteContext` provides theme colors.
- Build produces stable asset names (`assets/app.js`, `assets/app.css`) for committed prerendered HTML snapshots in `prerendered/`.
- `vercel.json` rewrites handle SPA routing in production.

## Secrets
Supabase credentials are optional at boot. If provided via the dashboard, they're delivered to `/run/base44/app.env` and enable the Decor catalog page.
