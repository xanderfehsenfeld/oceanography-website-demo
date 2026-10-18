# Testing & Storybook

## Test Framework

**Vitest 4** with `@testing-library/react`, `jsdom`, and **MSW 2** for HTTP mocking.

```ts
import { describe, expect, test, it, beforeEach, afterEach, beforeAll, afterAll, vi } from "vitest"
```

Always import explicitly from `"vitest"` — do not rely on globals.

## Test File Locations

Tests live in `__tests__/` subdirectories co-located with the source they test:

```
app/
  interactive/
    __tests__/
      fetchData.test.ts       ← tests for fetchData.ts
    drifters/
      __tests__/
        usePlayback.test.ts   ← tests for usePlayback.ts
      pugetsound/
        __tests__/
          DriftersPugetSound.test.tsx
  __tests__/
    page.test.tsx
lib/
  __tests__/
    ...
```

Name test files after the source file: `fetchData.ts` → `fetchData.test.ts`, `DriftersPugetSound.tsx` → `DriftersPugetSound.test.tsx`.

## MSW Pattern for HTTP Mocking

```ts
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

const handlers = [
  http.get("/api/forecast/drifters/*", () =>
    HttpResponse.json(sampleLiveoceanResponse)
  ),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

Mock data lives in `app/mock/` as JSON files (e.g., `sampleLiveoceanResponse.json`). Import with `import data from "@/app/mock/sampleLiveoceanResponse.json"`.

## Testing Custom Hooks

Use `renderHook` from `@testing-library/react`. For time-dependent hooks (like `usePlayback` which uses PIXI `Ticker`), use fake timers:

```ts
vi.useFakeTimers()
const { result } = renderHook(() => usePlayback(1, 100))
vi.advanceTimersByTime(500)
// assert result.current
vi.useRealTimers()
```

## Testing Components

For components with heavy dependencies (Leaflet, PIXI, SWR), mock at the module level:

```ts
vi.mock(import("@/components/map/client-map-view"), () => ({
  default: () => <div data-testid="mock-map" />,
}))
```

Use `@testing-library/react` `render` and standard queries (`getByText`, `findByText`, etc.).

## vitest.config.mts Notes

- `@vitejs/plugin-react` for JSX transform
- `tsconfigPaths: true` — `@/` alias works in tests
- `environment: "jsdom"`
- `restoreMocks: true` — mocks are restored after each test automatically
- MDX file changes trigger docs test re-runs via `watchTriggerPatterns`

## Running Tests

```bash
pnpm run test          # watch mode
pnpm run test -- --run # single run (CI)
```

---

## Storybook

**Storybook 10** with `@storybook/nextjs-vite` (Vite-based, not Webpack).

### Story File Location

All stories live in `stories/` at the project root — **not** co-located with components:

```
stories/
  Button.stories.tsx
  TimeControls.stories.tsx
  MapView.stories.tsx
  PixiOverlay.stories.tsx
  PixiElements.stories.tsx
  PixiDecorator.tsx        ← shared utility, not a story file
```

### Story File Pattern

```ts
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Components/ComponentName",   // group/name hierarchy
  component: TheComponent,
  tags: ["autodocs"],                  // auto-generate docs page
  args: {
    // default args shared by all stories
  },
} satisfies Meta<typeof TheComponent>  // use `satisfies`, not `as`

export default meta
type Story = StoryObj<typeof meta>

export const DefaultState: Story = {
  args: {
    // story-specific overrides
  },
}
```

Use `satisfies Meta<typeof Component>` — not `as Meta<typeof Component>`.

### PIXI Stories

For stories that test PIXI sprites in isolation (without Leaflet), use `PixiDecorator`:

```tsx
// PixiDecorator creates a PIXI Application, provides the renderer to a callback
import PixiDecorator from "./PixiDecorator"

const meta = {
  title: "Components/PixiElements",
  component: PixiDecorator,
  tags: ["autodocs"],
} satisfies Meta<typeof PixiDecorator>

export const MyDrifterStory: Story = {
  args: {
    width: 300,
    height: 300,
    child: (renderer) => {
      const drifter = new Drifter(renderer, ...)
      const container = new Container()
      container.addChild(drifter)
      return container
    },
  },
}
```

For stories involving a full Leaflet map, use a `MapContainer` decorator with `zoomControl: false` and `dragging: false` to prevent interaction issues.

### CSS in Stories

Import required CSS directly in story files when needed:
```ts
import "leaflet/dist/leaflet.css"
import "@/components/map/map-view.css"
// @radix-ui/themes/styles.css is imported globally in preview.tsx
```

### Global Decorator

All stories are wrapped in `Inter` font and `ThemeProvider` (defined in `.storybook/preview.tsx`). Stories do not need to set up their own theme provider.

A11y addon is configured in "todo" mode — violations appear in the UI but do not fail builds.

### Running Storybook

```bash
pnpm run storybook      # dev server on port 6006
pnpm run build-storybook # static build
```
