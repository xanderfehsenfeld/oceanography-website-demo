"use client"

import { ReactNode } from "react"
import dynamic from "next/dynamic"

const ObservationsViewer = dynamic(() => import("./DriftersPugetSound"), {
  ssr: false,
})

const LazyLoadedViewer = ({ children }: { children: ReactNode }) => (
  <ObservationsViewer>{children}</ObservationsViewer>
)

export default LazyLoadedViewer
