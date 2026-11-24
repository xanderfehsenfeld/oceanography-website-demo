"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { PickingInfo } from "@deck.gl/core"
import { MapLibreOverlay } from "@deck.gl/maplibre"
import type { Map as MaplibreMap } from "maplibre-gl"

import { IFeature, IPoints } from "@/app/interactive/fetchData"

import { useDeckLayers } from "./useDeckLayers"

const TERRAIN_LAYER_ID = "terrain"

interface IDeckOverlayProps {
  circles: IFeature[]
  allPoints: IPoints[]
  frame: number
  onLoadData?: () => void
  isDark: boolean
  maplibreMap: MaplibreMap
  timeDeltaMS?: number
}

function DeckOverlayComponent({
  circles,
  allPoints,
  frame,
  onLoadData,
  isDark,
  maplibreMap,
  timeDeltaMS = 0,
}: IDeckOverlayProps) {
  const overlayRef = useRef<MapLibreOverlay | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const handleHover = useCallback((_info: { object?: IFeature }) => {
    // hover state drives tooltip only — no React re-render needed
  }, [])

  const handleClick = useCallback((info: { object?: IFeature }) => {
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
    terrainLayerId: TERRAIN_LAYER_ID,
    onHover: handleHover,
    onClick: handleClick,
    timeDeltaMS,
  })

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

  // Mount: create overlay and attach to MapLibre map
  useEffect(() => {
    const overlay = new MapLibreOverlay({ interleaved: true, layers: [] })
    maplibreMap.addControl(overlay)
    overlayRef.current = overlay

    // Signal that deck.gl is ready (one rAF to allow first render)
    const raf = requestAnimationFrame(() => onLoadData?.())

    return () => {
      cancelAnimationFrame(raf)
      maplibreMap.removeControl(overlay)
      overlayRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maplibreMap])

  // Sync layers + tooltip into the overlay on every render
  useEffect(() => {
    overlayRef.current?.setProps({ layers, getTooltip } as any)
  })

  return null
}

export default DeckOverlayComponent
