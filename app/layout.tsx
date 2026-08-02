import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/providers"
import { GoogleTagManager } from "@next/third-parties/google"

import { Settings } from "@/types/settings"
import { Footer } from "@/components/navigation/footer"
import { Navbar } from "@/components/navigation/navbar"

import "@/styles/globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const baseUrl = Settings.metadataBase

export const metadata: Metadata = {
  title: Settings.title,
  metadataBase: new URL(baseUrl),
  description: Settings.description,
  keywords: Settings.keywords,
  openGraph: {
    type: Settings.openGraph.type,
    url: baseUrl,
    title: Settings.openGraph.title,
    description: Settings.openGraph.description,
    siteName: Settings.openGraph.siteName,
    images: Settings.openGraph.images.map((image) => ({
      ...image,
      url: `${baseUrl}${image.url}`,
    })),
  },

  publisher: Settings.name,
  alternates: {
    canonical: baseUrl,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Server-side prefetch for SWR fallback: commonly-used Puget Sound drifter dataset
  let swrFallback: Record<string, any> | undefined = undefined
  try {
    const tracks = 'PS_tracks.json'
    const times = 'PS_times.json'
    // dynamic import to avoid pulling client-only code; this module is server-safe
    const { prefetchFetchData } = await import('@/app/interactive/prefetchFetchData')
    const data = await prefetchFetchData(tracks, times)
    const key = JSON.stringify(['fetchData', tracks, times])
    swrFallback = { [key]: data }
  } catch (err) {
    // don't block rendering on prefetch errors
    // eslint-disable-next-line no-console
    console.warn('SWR prefetch failed in RootLayout:', err)
  }

  return (
    <html lang="en" suppressHydrationWarning>
      {Settings.gtmconnected && <GoogleTagManager gtmId={Settings.gtm} />}
      <body className={`${inter.variable} font-regular`}>
        <Providers swrFallback={swrFallback}>
          <Navbar />
          <main className="h-auto px-5 sm:px-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
