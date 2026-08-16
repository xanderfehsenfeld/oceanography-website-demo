import { ThemeProvider } from "@/providers/theme"

import { MetadataProvider } from "./metadata"
import SwrProviderClient from "./swr"

export const Providers: React.FC<{ children: React.ReactNode; swrFallback?: Record<string, any> }> = ({
  children,
  swrFallback,
}) => {
  return (
    <MetadataProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SwrProviderClient fallback={swrFallback}>{children}</SwrProviderClient>
      </ThemeProvider>
    </MetadataProvider>
  )
}
