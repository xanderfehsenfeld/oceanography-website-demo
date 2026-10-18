
# Adding New Features

Use this guide when scaffolding a new interactive visualization (drifter dataset, observations viewer, etc.).

## Checklist for a New Interactive Map Feature

### 1. Route & File Structure

Create a new sub-route under `app/interactive/`:

```
app/interactive/<featurename>/
  page.tsx                     ← server component; renders the feature component with content as children
  <FeatureName>.tsx            ← "use client" feature component (PascalCase)
  types.ts                     ← domain types specific to this feature
  __tests__/
    <FeatureName>.test.tsx
```

If the feature has dataset variants (like `pugetsound` vs `willapaandgrays`):
```
app/interactive/<featurename>/
  <variant>/
    page.tsx
    <FeatureName><Variant>.tsx
    types.ts
    __tests__/
```

### 2. Feature Component Template

```tsx
"use client"

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { Skeleton } from "@radix-ui/themes"
import { useTheme } from "next-themes"

import ClientMapView from "@/components/map/client-map-view"
import TimeControls from "@/components/map/time-controls"

import { useFetchData } from "../../useFetchData"
import { usePlayback } from "../usePlayback"
import { IDataFileNames } from "./types"

const initialZoomLevel = 8  // adjust per region
const initialLat = 48       // adjust per region
const initialLong = -123    // adjust per region

export const dataFilenames: IDataFileNames = {
  tracks: "XX_tracks.json",
  times: "XX_times.json",
}

function FeatureName({ children }: { children: ReactNode }) {
  const { isLoading: isLoadingTracks, times, points } = useFetchData(
    dataFilenames.tracks,
    dataFilenames.times
  )

  const [playbackSpeed, setPlaybackSpeed] = useState(0)
  const maxSliderValue = points.length - 1

  const [sliderValue, setSliderValue] = usePlayback(playbackSpeed, maxSliderValue, 4)
  const [isLoadingRender, setIsLoadingRender] = useState(true)

  const isLoading = isLoadingTracks || isLoadingRender

  useEffect(() => {
    if (isLoading) {
      setPlaybackSpeed(0)
      setSliderValue(0)
    } else {
      setPlaybackSpeed(1)
    }
  }, [isLoading])

  const timeDeltaMS = useMemo(() => {
    const start = new Date(times[0])
    const end = new Date(times[1])
    return end.getTime() - start.getTime()
  }, [times])

  const { theme } = useTheme()

  return (
    <div className="gap-4 lg:flex">
      <ClientMapView
        frame={sliderValue}
        timeDeltaMS={timeDeltaMS}
        onLoadData={() => setIsLoadingRender(false)}
        initialLat={initialLat}
        initialLong={initialLong}
        zoom={initialZoomLevel}
        circles={points[sliderValue]?.features || []}
        allPoints={points}
        controls={
          <div className={theme === "dark" ? "" : "dark"}>
            <div className="flex flex-col gap-2 border bg-background p-4 pb-6">
              <div className="typography">
                <Skeleton loading={isLoading}>
                  <h3>Time Slider: {times[sliderValue]}</h3>
                </Skeleton>
              </div>
              <TimeControls
                isLoading={isLoading}
                value={sliderValue}
                onPlaybackChange={setPlaybackSpeed}
                maxSliderValue={maxSliderValue}
                onSliderChange={(v) => {
                  setPlaybackSpeed(0)
                  setSliderValue(v)
                }}
                playbackSpeed={playbackSpeed}
              />
            </div>
          </div>
        }
      />
      <div className="flex-1 gap-2">{children}</div>
    </div>
  )
}

export default FeatureName
```

### 3. Page Template (server component)

```tsx
// page.tsx — no "use client"
import FeatureName from "./FeatureName"

export default function Page() {
  return (
    <FeatureName>
      <h3>About this visualization</h3>
      <p>Description of the dataset and what it shows.</p>
    </FeatureName>
  )
}
```

### 4. Adding a New PIXI Sprite Type

Extend the appropriate PIXI base class in `components/map/sprites/`:
- Extend `PIXI.Sprite` for point sprites
- Extend `PIXI.Container` for grouped/composite objects

Follow the `Drifter` and `DrifterPath` class structure: constructor receives `renderer` + domain data, imperative state methods (`setActive`, `setSelected`, `resetState`, `setIsDark`).

### 5. Storybook Story

Add a story in `stories/<FeatureName>.stories.tsx`. For PIXI-only components, use `PixiDecorator`. For full map components, use a `MapContainer` decorator.

### 6. Types File

```ts
// types.ts
export interface IDataFileNames {
  tracks: string
  times: string
}

// add feature-specific types here
```

## Adding a New UI Component

Place in `components/`:
- `kebab-case.tsx` for general components
- `components/ui/` for primitive/shadcn-style components

Export named from primitives, default from larger feature components. Add a Storybook story.

## Adding MDX Content

Add `.mdx` files to `contents/`. They are picked up by the docs route at `app/docs/[[...slug]]/page.tsx`. The pre-commit hook regenerates `public/search-data/documents.json` on every commit — no manual step needed.
