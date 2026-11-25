"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { MapView } from "@deck.gl/core"
import type { PickingInfo } from "@deck.gl/core"
import { DeckGL } from "@deck.gl/react"
import { Map as LeafletMap } from "leaflet"

import { IFeature, IPoints } from "@/app/interactive/fetchData"

import { useDeckLayers } from "./useDeckLayers"

interface IDeckOverlayProps {
  circles: IFeature[]
  allPoints: IPoints[]
  frame: number
  onLoadData?: () => void
  isDark: boolean
  timeDeltaMS?: number
  /** The Leaflet Map instance — used to sync the deck.gl viewport. */
  leafletMap: LeafletMap
}

/** Read the current Leaflet viewport as a deck.gl MapView viewState. */
function getLeafletViewState(map: LeafletMap) {
  const center = map.getCenter()
  return {
    longitude: center.lng,
    latitude: center.lat,
    zoom: map.getZoom(),
    bearing: 0,
    pitch: 0,
  }
}

function DeckOverlayComponent({
  circles,
  allPoints,
  frame,
  onLoadData,
  isDark,
  timeDeltaMS = 0,
  leafletMap,
}: IDeckOverlayProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [viewState, setViewState] = useState(() =>
    getLeafletViewState(leafletMap)
  )
  const loadCalledRef = useRef(false)

  // Keep deck.gl viewport in sync with Leaflet camera
  useEffect(() => {
    const sync = () => setViewState(getLeafletViewState(leafletMap))
    leafletMap.on("move", sync)
    leafletMap.on("zoom", sync)
    return () => {
      leafletMap.off("move", sync)
      leafletMap.off("zoom", sync)
    }
  }, [leafletMap])

  const handleClick = useCallback((info: PickingInfo<IFeature>) => {
    if (!info.object) {
      setSelectedId(null)
      return
    }
    const id = parseInt(info.object.properties.id)
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  const { layers, velocities } = useDeckLayers({
    circles,
    allPoints,
    frame,
    selectedId,
    isDark,
    onClick: handleClick,
    timeDeltaMS,
  })

  // Signal ready on first render with actual drifter data
  useEffect(() => {
    if (!loadCalledRef.current && circles.length > 0) {
      loadCalledRef.current = true
      onLoadData?.()
    }
  }, [circles.length, onLoadData])

  const getTooltip = useCallback(
    ({ object }: PickingInfo<IFeature>) => {
      if (!object) return null
      const id = parseInt(object.properties.id)
      const speed = velocities[id]?.[frame] ?? 0
      return {
        html: `<p style="margin:0">ID: ${id} &middot; Speed: ${speed} mph</p>`,
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          fontSize: "12px",
          padding: "4px 8px",
          borderRadius: "4px",
          border: "1px solid var(--border)",
          pointerEvents: "none",
        },
      }
    },
    [velocities, frame]
  )

  return (
    <DeckGL
      views={new MapView({ id: "map" })}
      viewState={viewState}
      layers={layers}
      getTooltip={getTooltip}
      onClick={handleClick as any}
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        zIndex: "400",
        pointerEvents: "none",
      }}
      getCursor={({ isDragging, isHovering }) =>
        isDragging ? "grabbing" : isHovering ? "pointer" : "default"
      }
    />
  )
}

export default DeckOverlayComponent
