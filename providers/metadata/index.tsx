"use client"

import { createContext, ReactNode } from "react"

export const MetadataContext = createContext<{ lastEdited?: string }>({
  lastEdited: undefined,
})

export function MetadataProvider({ children }: { children: ReactNode }) {
  return (
    <MetadataContext.Provider value={{ lastEdited: undefined }}>
      {children}
    </MetadataContext.Provider>
  )
}
