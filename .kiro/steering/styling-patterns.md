# Styling Patterns

## Tailwind CSS v4

This project uses **Tailwind CSS v4** with the new import syntax. Key differences from v3:

- No `tailwind.config.js` — all config lives in `styles/globals.css`
- Import syntax: `@import "tailwindcss"` (not `@tailwind base/components/utilities`)
- Theme tokens defined via `@theme inline { ... }` block
- Plugins registered via `@plugin "@tailwindcss/typography"`
- Custom variants via `@custom-variant dark (&:is(.dark *));`

Do not create a `tailwind.config.js`. Do not use v3 `@tailwind` directives.

## Design Tokens

All semantic color tokens are CSS custom properties using `oklch()` values. They are defined in `:root` (light) and `.dark` (dark), then bridged into Tailwind via `@theme inline`. Always use the semantic token names:

```css
/* Use semantic tokens, not raw colors */
bg-background        /* var(--background) */
text-foreground      /* var(--foreground) */
bg-card              /* var(--card) */
border-border        /* var(--border) */
text-muted-foreground
bg-primary / text-primary-foreground
bg-secondary / text-secondary-foreground
```

Do not hardcode colors like `bg-white` or `bg-gray-900` — always use the semantic tokens so dark mode works automatically.

## Dark Mode Strategy

Class-based dark mode: `.dark` class on `<html>`. Managed by `next-themes` with `attribute="class"`.

The custom Tailwind variant `@custom-variant dark (&:is(.dark *))` handles nested dark mode contexts. In components that force a theme context (like map controls), wrap with the appropriate class:

```tsx
<div className={theme === "dark" ? "" : "dark"}>
  {/* force dark theme for Radix components inside the map */}
</div>
```

Access the current theme via `useTheme()` from `next-themes`.

## Utility Patterns

### `cn()` helper
Use the `cn()` utility from `@/lib/utils` for all conditional class merging:

```ts
import { cn } from "@/lib/utils"
// cn = twMerge(clsx(...inputs))
cn("base-class", condition && "conditional-class", props.className)
```

### `cva` for variants
Use `class-variance-authority` for components with multiple style variants:

```ts
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", outline: "..." },
    size: { sm: "...", md: "...", lg: "..." },
  },
  defaultVariants: { variant: "default", size: "md" },
})
```

### No CSS modules
Components use Tailwind utility classes inline in JSX. No CSS modules are used.

### Scoped CSS files
A few components have companion `.css` files for third-party library overrides that cannot be done with Tailwind:
- `components/map/map-view.css` — Leaflet control overrides
- `components/map/time-controls.css` — Radix UI theme overrides
- `components/video.css`

Use this pattern only when Tailwind utilities genuinely can't reach the target selectors.

## Typography

Prose content uses the `@tailwindcss/typography` plugin. The `.typography` compound class in `styles/globals.css` applies customizations including dark mode prose, code block styling, list markers, image borders, and scroll margin for headings.

Apply `.typography` to MDX content containers. Use the standard `prose` class in simpler contexts.

## Radix UI

Two Radix packages are in use — use them correctly:

- **`@radix-ui/themes`** — higher-level component library: `Skeleton`, `Slider`, `SegmentedControl`, `Button`, `Popover`. Import: `import { Skeleton } from "@radix-ui/themes"`. Requires `@radix-ui/themes/styles.css` imported in `globals.css` (already done globally).
- **`@radix-ui/react-*` primitives** — lower-level unstyled primitives (`react-accordion`, `react-dialog`, `react-tabs`, `react-dropdown-menu`, etc.). Use these when you need full styling control.

Do not mix them for the same component type — pick one.

## Animation

`tailwindcss-animate` and `tw-animate-css` are both available. Use their utility classes for enter/exit animations. `tw-animate-css` is imported globally in `globals.css`.
