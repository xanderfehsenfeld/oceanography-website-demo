# Project Overview

This is an oceanography visualization website built at the University of Washington. It renders real-time drifter forecast data on an interactive Leaflet map using PIXI.js for WebGL-accelerated sprite rendering.

## Stack

- **Next.js 16.1.1** (App Router, Turbopack dev server) — pinned
- **React 19** with `useEffectEvent` (stable in React 19)
- **TypeScript 5.9** — `strict: true`, `moduleResolution: "bundler"`
- **PIXI.js 7.4.2** — pinned exactly; do not upgrade without auditing all PIXI API usage
- **Leaflet 1.9 + react-leaflet 5.0.0-rc.2** — map container; PIXI embedded via `leaflet-pixi-overlay`
- **Tailwind CSS v4** — `@import "tailwindcss"` syntax, no `tailwind.config.js`; config is in `styles/globals.css` via `@theme inline`
- **Radix UI Themes + primitives** — `@radix-ui/themes` for Skeleton/Slider/SegmentedControl; individual `@radix-ui/react-*` primitives for accordion, dialog, tabs, etc.
- **SWR 2** — all client-side data fetching; global config in `providers/swr/index.tsx`
- **Vitest 4 + Testing Library + MSW 2** — tests
- **Storybook 10 (`@storybook/nextjs-vite`)** — component stories in `stories/`
- **pnpm 10, Node ^22**

## Domain

Raw forecast data is `Track[]` (arrays of x/y coordinate sequences per drifter). The pipeline is:

1. `fetchData()` / `fetchPoints()` — fetch from proxied API routes (`/api/liveocean-web/`, `/api/forecast/drifters/`)
2. `getPoints()` — converts `Track[]` → `IPoints[]` (GeoJSON FeatureCollection array, one per time step)
3. Catmull-Rom spline interpolation produces 10× more time steps for smooth playback
4. `IPoints[]` is indexed by a frame/slider value to get the current time step's feature set
5. PIXI sprites are positioned by converting GeoJSON lat/lng → projected pixel coords via `latLngToLayerPoint`

Dataset filenames (hardcoded in feature components): `PS_tracks.json`/`PS_times.json` (Puget Sound), `wgh0_tracks.json`/`wgh0_times.json` (Willapa & Grays).

## Key API Rewrites

- `/api/liveocean-web/:file` → `https://s3.kopah.uw.edu/liveocean-web/:file`
- `/api/forecast/drifters/:file` → Google Cloud Run service
