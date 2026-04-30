"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

const initialValue = {
  lastEdited: undefined,
  setLastEdited: (lastEdited?: string) => {},
}

export const MetadataContext = createContext<{
  lastEdited?: string
  setLastEdited: (lastEdited?: string) => void
}>(initialValue)

export const SetMetadata = ({ lastEdited }: { lastEdited?: string }) => {
  const { setLastEdited } = useContext(MetadataContext)

  useEffect(() => {
    setLastEdited(lastEdited)
  }, [lastEdited])
  return null
}
export function MetadataProvider({ children }: { children: ReactNode }) {
  const [lastEdited, setLastEdited] = useState<string | undefined>(undefined)

  return (
    <MetadataContext.Provider value={{ lastEdited, setLastEdited }}>
      {children}
    </MetadataContext.Provider>
  )
}
