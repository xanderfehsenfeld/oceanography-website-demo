"use client"

import React from "react"
import { SWRConfig } from "swr"
import { fetchData } from "@/app/interactive/fetchData"

export default function SwrProviderClient({
  children,
  fallback,
}: React.PropsWithChildren<{ fallback?: Record<string, any> }>) {
  const fetcher = async (key: any) => {
    if (Array.isArray(key) && key[0] === "fetchData") {
      const [, tracksFilename, timesFilename] = key
      return fetchData(tracksFilename, timesFilename)
    }

    const res = await fetch(String(key))
    return res.json()
  }

  return (
    <SWRConfig
      value={{
        fallback,
        fetcher,
        revalidateOnFocus: false,
      }}
    >
      {children}
    </SWRConfig>
  )
}
