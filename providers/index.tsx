import { ThemeProvider } from "@/providers/theme"

import { ViewTransitions } from "@/lib/transition"

import { MetadataProvider } from "./metadata"

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <MetadataProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ViewTransitions>{children}</ViewTransitions>
      </ThemeProvider>
    </MetadataProvider>
  )
}
