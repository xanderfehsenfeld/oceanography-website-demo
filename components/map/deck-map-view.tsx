"use client"

import { useCallback, useEffect, useRef, useState, ReactNode } from "react"

import type { MapViewState, PickingInfo } from "@deck.gl/core"
import { MapView } from "@deck.gl/core"
import { DeckGL } from "@deck.gl/react"
import { Map as ReactMapGL } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { useTheme } from "next-themes"

import { IFeature, IPoints } from "@/app/interactive/fetchData"

import { useDeckLayers } from "./useDeckLayers"
import "./deck-map-view.css"

interface IDeckMapViewProps {
  initialLat: number
  initialLong: number
  zoom: number
  circles: IFeature[]
  allPoints: IPoints[]
  frame: number
  timeDeltaMS?: number
  onLoadData?: () => void
  controls?: ReactNode
  children?: ReactNode
}

const DEFAULT_VIEW_STATE: MapViewState = {
  longitude: -123,
  latitude: 48,
  zoom: 8,
  pitch: 45,
  bearing: 0,
  maxZoom: 15,
  minZoom: 7,
  maxPitch: 85,
}

function DeckMapView({
  initialLat,
  initialLong,
  zoom,
  circles,
  allPoints,
  frame,
  timeDeltaMS = 0,
  onLoadData,
  controls,
}: IDeckMapViewProps) {
  const { theme } = useTheme()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const loadCalledRef = useRef(false)

  const [initialViewState] = useState<MapViewState>({
    ...DEFAULT_VIEW_STATE,
    longitude: initialLong,
    latitude: initialLat,
    zoom,
  })

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
    isDark: theme === "dark",
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
    <div className="deck-map-view md:h-inherit relative max-h-[80vh] min-h-[80vh] flex-1 md:pl-5">
      <DeckGL
        views={new MapView({ id: "map", controller: true })}
        initialViewState={initialViewState}
        layers={layers}
        getTooltip={getTooltip}
        onClick={handleClick as any}
        getCursor={({ isDragging, isHovering }) =>
          isDragging ? "grabbing" : isHovering ? "pointer" : "grab"
        }
      >
        <ReactMapGL
          mapStyle={
            theme === "dark"
              ? "/data/alidade_smooth.json"
              : "/data/alidade_smooth_light.json"
          }
        />
      </DeckGL>

      {/* Time controls overlaid bottom-left, styled like the old Leaflet control */}
      {controls && <div className="deck-map-controls">{controls}</div>}
    </div>
  )
}

export default DeckMapView
