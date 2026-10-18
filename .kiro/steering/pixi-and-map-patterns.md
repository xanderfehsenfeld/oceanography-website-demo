# PIXI.js & Map Patterns

## PIXI Version

`pixi.js@7.4.2` — **pinned exactly**. Do not upgrade without auditing all PIXI API usage across the codebase. The v7 API differs significantly from v8.

## Architecture: PIXI inside Leaflet

PIXI is embedded in a Leaflet map via `leaflet-pixi-overlay`. The rendering stack:

```
MapView ("use client")
  └── MapContainer (react-leaflet)
        └── PixiOverlayComponent
              └── L.pixiOverlay(drawCallback, pixiContainer) — Leaflet plugin
                    └── PIXI Renderer renders into Leaflet's overlay pane
```

`PixiOverlayComponent` uses `useMap()` from `react-leaflet` to get the Leaflet map instance. The plugin provides `PixiOverlayUtils` to the draw callback:
- `utils.getRenderer()` — the PIXI `IRenderer`
- `utils.getContainer()` — the root PIXI `Container`
- `utils.latLngToLayerPoint(latLng)` — converts geographic coordinates to PIXI pixel coords
- `utils.getScale()` — current map scale factor
- `utils.getMap()` — the Leaflet map instance

## Coordinate System

PIXI works in projected pixel space. Geographic lat/lng → PIXI x/y via:
```ts
const { x, y } = latLngToLayerPoint([latitude, longitude], zoom)
// zoom is hardcoded at 11 for the projection basis
// note: array order is [lat, lng], but stored as { x: longitude, y: latitude } in properties
```

Sprite scale should be set to `1 / scale / 2` on zoom to keep sprites geographically consistent.

## Module-Level Mutable State

Some PIXI state **must** live at module scope (not React state) because PIXI initialization is imperative and must run only once:

```ts
let prevZoom = 8
let firstDraw = true
```

This pattern is intentional. Add `// @refresh reset` to the top of the file to prevent React Fast Refresh from preserving stale values.

## Custom PIXI Classes

Extend PIXI base classes for domain sprites. Existing classes in `components/map/sprites/`:

### `Drifter extends PIXI.Sprite`
Represents a single ocean drifter point on the map.

Constructor: `new Drifter(renderer, id, line, isDark, linePoints, velocities)`

Key methods:
- `setActive()` — hover state (orange tint, show path at 30% opacity)
- `setInactive()` → calls `resetState()`
- `resetState()` — return to default state (blue/lightskyblue tint, hide path)
- `setSelected()` — click/selection state (orange tint, full opacity, show path at 100%)
- `setLocation(x, y)` — position the sprite and rotate it to face its direction of travel
- `setIsDark(isDark)` — switch light/dark theme colors

### `DrifterPath extends PIXI.Container`
Represents a drifter's trail/path. Contains two child Graphics: `lineGraphic` (solid) and `dottedLineGraphic`.

Key methods:
- `drawVertices()` — draw the path from stored vertex array
- `setDottedLineVisibility(visible)` — toggle dotted line (shown only at zoom > 11)
- `setIsDark(isDark)` — switch line colors
- `lineStyle({ width })` — set line width on both Graphics

### `Reticule extends PIXI.Container`
Circle selection tool rendered on click. Scale inversely proportional to map zoom so the geographic radius stays consistent.

## PIXI Ticker Usage

There are two Ticker instances:

1. **Render ticker** in `PixiOverlayComponent` — drives `renderer.render(container)` at 60fps, handles chunked sprite initialization, and lazy batch line updates:
   ```ts
   ticker.current = new Ticker()
   ticker.current.add(() => renderer.render(container))
   ticker.current.maxFPS = 60
   ticker.current.start()
   ```

2. **Playback ticker** in `usePlayback` hook — drives animation frame advancement using elapsed time:
   ```ts
   const ticker = new Ticker()
   ticker.add(setNextFrame)
   ticker.maxFPS = 1000 / frameLength
   ticker.start()
   // always destroy in effect cleanup:
   return () => { ticker.stop(); ticker.destroy() }
   ```

Always call `ticker.stop()` and `ticker.destroy()` in effect cleanup.

## Batch / Lazy Updates

To avoid blocking the main thread when updating many PIXI objects, use the `lazybatchApply` pattern — process items in chunks of 20 per ticker frame at `UPDATE_PRIORITY.LOW`:

```ts
ticker.current?.add(executeBatch, null, UPDATE_PRIORITY.LOW)
```

Use this pattern when updating all line graphics or sprites on zoom changes.

## Dark/Light Mode in PIXI

PIXI objects do not react to CSS — theme switching must be handled imperatively. Subscribe to `useTheme()` and propagate the `isDark` boolean to all sprites and lines via their `setIsDark()` methods in a `useEffect`:

```ts
const { theme } = useTheme()
useEffect(() => {
  const isDark = theme === "dark"
  circleSprites.current?.forEach((c) => c.setIsDark(isDark))
  lineGraphics.current?.forEach((c) => c.setIsDark(isDark))
}, [theme])
```

Dark mode colors: drifters `"lightskyblue"`, lines `"lime"`. Light mode: `"blue"`, `"darkgreen"`. Selected state: `"orange"` in both themes.

## Event Handling

- Set `container.eventMode = "dynamic"` on the root PIXI container for pointer events
- Set `eventMode = "none"` on containers that should not capture events (path lines)
- Use `onpointerenter`, `onpointerleave`, `onpointerdown` directly on sprites
- The clickable hit area is a `PIXI.Rectangle` computed from map bounds minus the Leaflet control pane height — recalculated on every draw callback

## Type Declarations for `leaflet-pixi-overlay`

The `leaflet-pixi-overlay` package has no types. They are provided via module augmentation in `components/map/leaflet-pixi.d.ts`:

```ts
declare module "leaflet" {
  interface PixiOverlayUtils { ... }
  interface LeafletPixiOverlayDefnition { ... }
  function pixiOverlay(...): LeafletPixiOverlayDefnition
}
```

Always import `leaflet-pixi-overlay` **before** `leaflet` in files that use it.

## PIXI DevTools

These globals are set for PIXI DevTools browser extension support — keep them in `pixi-overlay-component.tsx`:

```ts
globalThis.__PIXI_STAGE__ = container
globalThis.__PIXI_RENDERER__ = renderer
```

## Map Tile Strategy

Two tile options configured in `map-view.tsx`:
- **MapLibre GL** via `@maplibre/maplibre-gl-leaflet` — vector tiles, styled per theme. Configs at `/data/alidade_smooth.json` (dark) and `/data/alidade_smooth_light.json` (light)
- **CartoCDN raster** — legacy fallback

Light/dark tile source is switched on theme change via imperative Leaflet tile layer management.

## `useEffectEvent` Pattern

In `PixiOverlayComponent`, use `useEffectEvent` (React 19) for any callback that reads the latest reactive values but should not cause effects to re-run when those values change:

```ts
const drawCallback = useEffectEvent(function (utils: PixiOverlayUtils) {
  // can safely read `theme`, `circles`, `points` etc. without deps
})
```

This is the correct pattern for PIXI callbacks — do not list PIXI rendering functions in `useEffect` dependency arrays.
