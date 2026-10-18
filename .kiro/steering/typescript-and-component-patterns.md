# TypeScript & Component Patterns

## TypeScript Conventions

### Types vs interfaces
- Use `interface` for object shapes that describe data or props: `interface IFeature`, `interface IMapDataProps`
- Use `type` for unions, derived types, and aliases: `type Paths = { ... } | { spacer: true }`, `type TimesResponse = TimesData[]`
- Prefix interfaces with `I` when they describe data/domain objects (existing convention: `IPoints`, `IFeature`, `IProperties`, `IMapDataProps`, `IDataFileNames`)
- Do **not** create a separate `Props` type alias unless the type is reused. Inline props directly on function params:
  ```ts
  const MyComponent = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => { ... }
  ```
- Use `satisfies` for Storybook meta objects: `} satisfies Meta<typeof MyComponent>`
- Use `React.FC<{ children: React.ReactNode }>` in provider-style components
- Use generics where applicable: `memoize<T extends (...args: any[]) => any>`, `chunkArray<T>(array: T[], chunkSize: number): T[][]`
- Type narrowing guards: `function isRoute(node: Paths): node is Extract<Paths, { href: string }>`
- Use `ComponentProps<typeof Link>` or `ComponentProps<"button">` to extend HTML element props

### Path alias
`@/*` maps to the project root. Use it for all imports that cross feature/layer boundaries. Use relative imports only within the same feature folder.

## Component Patterns

### Server vs client
- Pages (`page.tsx`, `layout.tsx`) are `async` server components by default — no `"use client"` directive
- Any component that uses browser APIs, React hooks with side effects, Leaflet, or PIXI **must** start with `"use client"`
- The canonical pattern for browser-only features:
  ```
  page.tsx (server) → FeatureComponent.tsx ("use client") → ClientMapView (dynamic import, ssr: false)
  ```
- Use `next/dynamic` with `{ ssr: false }` for anything that imports Leaflet or PIXI:
  ```ts
  const MapView = dynamic(() => import("./map-view"), { ssr: false })
  ```

### File naming
| Location | Convention | Example |
|---|---|---|
| `components/` | `kebab-case.tsx` | `client-map-view.tsx`, `time-controls.tsx` |
| Feature component co-located with route | `PascalCase.tsx` | `DriftersPugetSound.tsx` |
| Hooks | `camelCase.ts` | `usePlayback.ts`, `useFetchData.ts` |
| Utilities / data functions | `camelCase.ts` | `fetchData.ts`, `interpolate.ts` |
| Next.js reserved files | lowercase | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |
| Stories | `PascalCase.stories.tsx` in `stories/` | `TimeControls.stories.tsx` |
| Tests | `camelCase.test.ts` / `PascalCase.test.tsx` in `__tests__/` | `usePlayback.test.ts` |

### Exports
- Default exports for pages, layouts, and major feature components
- Named exports for UI primitives, hooks, and utility functions
- No barrel `index.ts` re-exports. Import directly from the specific file.
- Exception: `providers/index.tsx` and `providers/swr/index.tsx` use `index` as the main file (idiomatic for provider modules)

### Component composition
- Feature components accept `children` for content co-location with the route:
  ```tsx
  // page.tsx
  <DriftersPugetSound>
    <h3>About this visualization...</h3>
  </DriftersPugetSound>
  ```
- Map controls are passed via a `controls` prop on `ClientMapView` to inject React UI into the Leaflet control layer via `createPortal`

### `// @refresh reset`
Add this comment to the top of any file that holds module-level mutable PIXI state (`let firstDraw = true`, `let prevZoom = 8`). This prevents React Fast Refresh from preserving stale PIXI state across HMR updates.

## State Management

No global state library. Use:

| Pattern | Use case |
|---|---|
| `useState` | UI state: playback speed, slider value, loading flags, tooltip position |
| `useRef` | PIXI objects, containers, sprite arrays — anything imperative and non-reactive |
| `useSWR` | Server data fetching — always wrap in a custom hook (`useFetchData`) |
| `useEffectEvent` | Capturing latest values in PIXI callbacks without re-running effects — React 19 API |
| `useTheme()` | Dark/light mode from `next-themes` |
| Context | Minimal — only `ThemeProvider`, `MetadataProvider`, `SWRConfig` |

### PIXI objects in refs
PIXI objects (`Ticker`, `Container`, `Sprite`, `Graphics`) are **always** stored in `useRef`, never in `useState`. They are imperative and mutated directly — React should not re-render when they change.

### SWR key convention
Keys use a tuple format with a string prefix for the SWR fetcher to dispatch on:
```ts
useSWR(['fetchData', tracksFilename, timesFilename], fetcher)
```
Export a `fetchDataKey()` function from both the hook and the prefetch module so server and client use the same key.

## Import Order

Prettier enforces this order (do not fight it — `pnpm run format` will reorder):
1. Node built-ins
2. _(blank line)_
3. `react` / `react/*`
4. `next` / `next/*`
5. Third-party modules
6. _(blank line)_
7. `@/types/*`, `@/config/*`, `@/lib/*`, `@/hooks/*`, `@/components/ui/*`, `@/components/*`
8. `@/app/*`
9. _(blank line)_
10. Relative `./` imports

CSS imports go with the group that makes sense (third-party CSS with third-party, local CSS with relative).

## Formatting Rules (Prettier)

- No semicolons (`semi: false`)
- Double quotes (`singleQuote: false`)
- 2-space indent (`tabWidth: 2`)
- Trailing commas in objects/arrays but not function params (`trailingComma: "es5"`)
- Arrow function params always parenthesized (`arrowParens: "always"`)
- LF line endings

Run `pnpm run format` to auto-fix. Run `pnpm run lint` to check ESLint.
