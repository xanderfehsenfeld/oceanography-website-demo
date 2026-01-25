"use client"

import { Theme } from "@radix-ui/themes"
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <Theme>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </Theme>
  )
}
