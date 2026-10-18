# Data Fetching Patterns

## Architecture

Data flows through three layers:

1. **API routes / rewrites** — `next.config.mjs` proxies external backends to avoid CORS:
   - `/api/liveocean-web/:file` → UW S3 bucket (static track/time JSON files)
   - `/api/forecast/drifters/:file` — Google Cloud Run (live forecast endpoint)

2. **Fetch functions** in `app/interactive/fetchData.ts` — pure async functions that hit the API routes
3. **`useFetchData` hook** — wraps fetch functions with SWR for caching and loading state

## SWR Pattern

Always wrap data fetching in a `useSWR` call via `useFetchData`:

```ts
// useFetchData.ts
export const fetchDataKey = (tracksFilename: string, timesFilename: string) =>
  ['fetchData', tracksFilename, timesFilename] as const

export const useFetchData = (tracksFilename: string, timesFilename: string) => {
  const { data, isLoading } = useSWR(
    fetchDataKey(tracksFilename, timesFilename),
    ([_key, tracks, times]) => fetchData(tracks, times)
  )
  return { points: data?.points ?? [], times: data?.times ?? [], isLoading }
}
```

Key format is a tuple `['fetchData', ...args]` — the string prefix lets the global SWR fetcher dispatch correctly. Export `fetchDataKey` from both the hook and the server-side prefetch module so the keys always match.

## Server-Side Prefetch

For data needed immediately on first load (like Puget Sound drifters), prefetch on the server in the root layout:

```ts
// In app/layout.tsx (server component)
const swrFallback = await prefetchFetchData('PS_tracks.json', 'PS_times.json')
// Pass to <Providers swrFallback={swrFallback}> which populates the SWR cache
```

This eliminates the loading state on first render for the primary dataset.

## Fetch Function Conventions

```ts
// For combined track+time data (live forecast)
export const fetchData = async (
  tracksFilename: string,
  timesFilename: string
): Promise<IMapDataProps> => { ... }

// For static files with long cache TTL
export const fetchPoints = async (filename: string) => {
  const response = await fetch(`/api/liveocean-web/${filename}`, {
    cache: "force-cache",
    next: { revalidate: 3600 },
  })
  ...
}
```

Use `cache: "force-cache"` and `next: { revalidate: 3600 }` for static reference data. Do not add cache headers to live forecast requests.

## Service Worker Offload

`fetchData` attempts to offload Catmull-Rom interpolation to a service worker at `/sw.js` using `MessageChannel`. This is a progressive enhancement — always provide the main-thread fallback:

```ts
// Attempt SW offload
if (typeof window !== "undefined" && 'serviceWorker' in navigator) {
  try {
    // ... MessageChannel communication ...
    if (workerResult?.points && workerResult?.times) return workerResult
  } catch (err) {
    console.warn('Service worker interpolation failed, falling back:', err)
  }
}
// Fallback: main-thread interpolation
```

## Domain Types

Core types in `app/interactive/fetchData.ts` and `app/interactive/drifters/pugetsound/types.ts`:

```ts
// Raw forecast data from API
interface Track { x: number[]; y: number[] }  // x=longitude arrays, y=latitude arrays

// Processed: one FeatureCollection per time step
interface IPoints {
  type: "FeatureCollection"
  features: IFeature[]
}

interface IFeature {
  type: "Feature"
  properties: IProperties  // { latitude, longitude, id: string }
  geometry: { type: "Point"; coordinates: [number, number] }  // [longitude, latitude]
}

// What useFetchData returns
interface IMapDataProps {
  points: IPoints[]
  times: string[]  // formatted time strings e.g. "Jan 11, 2026, 4:00 PM"
}
```

GeoJSON `coordinates` follow the standard `[longitude, latitude]` order. The `id` field in properties is a string — `parseInt()` when needed as a number.

## Loading States

Always track two loading phases separately:
- `isLoadingTracks` — SWR data not yet available
- `isLoadingRender` — PIXI sprites not yet initialized (driven by `onLoadData` callback)
- Combined: `const isLoading = isLoadingTracks || isLoadingRender`

Show `<Skeleton loading={isLoading}>` from `@radix-ui/themes` on time display and controls. Pause playback while loading (`setPlaybackSpeed(0)`), auto-start when ready.

## Time Data

Time strings from the API look like `"01/11/2026 - 04PM PST"`. The parsing/interpolation pipeline:
1. Normalize the string (replace separators, add `:00`, strip timezone)
2. Parse with `new Date(normalized)`
3. Interpolate using `d3.interpolateDate` (produces 10× more steps)
4. Format with `Intl.DateTimeFormat` in `"America/Los_Angeles"` timezone

Always display times in the `America/Los_Angeles` timezone.

## SWR Global Config

SWR global config is in `providers/swr/index.tsx`:
- `revalidateOnFocus: false` — prevents unnecessary refetches on window focus
- Custom fetcher that reads the `'fetchData'` key prefix to call the right function

Do not configure SWR fetcher options per-call. Use the global config.
