"use client"

import dynamic from "next/dynamic"

const ObservationsViewer = dynamic(() => import("./ObservationsViewer"), {
  ssr: false,
})

const LazyLoadedViewer = () => <ObservationsViewer />

export default LazyLoadedViewer
