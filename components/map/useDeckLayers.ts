"use client"

import { useMemo } from "react"

import { Layer } from "@deck.gl/core"
import { _TerrainExtension as TerrainExtension } from "@deck.gl/extensions"
import { TerrainLayer } from "@deck.gl/geo-layers"
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers"

import { IFeature, IPoints } from "@/app/interactive/fetchData"
import { getDistanceInMiles } from "@/components/map/map-utils"

const TERRAIN_ID = "terrain"

interface IUseDeckLayersProps {
  circles: IFeature[]
  allPoints: IPoints[]
  frame: number
  selectedId: number | null
  isDark: boolean
  terrainLayerId?: string
  onHover?: (info: { object?: IFeature }) => void
  onClick?: (info: { object?: IFeature }) => void
  timeDeltaMS: number
}

interface IUseDeckLayersResult {
  layers: Layer[]
  velocities: number[][]
}

/**
 * Maps drifter data + UI selection state → a deck.gl Layer array.
 *
 * Returns:
 *   - TerrainLayer  (operation: 'terrain+draw' — elevation source + visible mesh)
 *   - ScatterplotLayer  (drifter dots, terrain-offset so they sit on the sea floor)
 *   - PathLayer  (selected drifter trajectory, only when selectedId !== null)
 *
 * Also returns pre-computed per-drifter velocity arrays (mph, one entry per
 * frame) so the tooltip can display current speed without recomputing.
 */
export const useDeckLayers = ({
  circles,
  allPoints,
  frame,
  selectedId,
  isDark,
  terrainLayerId = TERRAIN_ID,
  onHover,
  onClick,
  timeDeltaMS,
}: IUseDeckLayersProps): IUseDeckLayersResult => {
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? ""
  const elevationData = maptilerKey
    ? `https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key=${maptilerKey}`
    : null

  if (!maptilerKey) {
    console.warn(
      "[useDeckLayers] NEXT_PUBLIC_MAPTILER_KEY is not set — terrain layer disabled"
    )
  }

  // Pre-compute per-drifter speed at every frame (mph).
  // Speed = Haversine distance between consecutive positions / time delta.
  const velocities = useMemo<number[][]>(() => {
    if (allPoints.length < 2 || timeDeltaMS <= 0) return []

    const timeDeltaInHours = timeDeltaMS / 3_600_000
    const drifterCount = allPoints[0].features.length

    return Array.from({ length: drifterCount }, (_, id) =>
      allPoints.map((frame, i) => {
        const prev = allPoints[Math.max(i - 1, 0)]
        const distMiles = getDistanceInMiles(
          frame.features[id].geometry.coordinates as [number, number],
          prev.features[id].geometry.coordinates as [number, number]
        )
        return parseFloat((distMiles / timeDeltaInHours).toFixed(2))
      })
    )
  }, [allPoints, timeDeltaMS])

  const layers = useMemo<Layer[]>(() => {
    const result: Layer[] = []

    // ── 1. Terrain layer ──────────────────────────────────────────────────────
    if (elevationData) {
      result.push(
        new TerrainLayer({
          id: terrainLayerId,
          elevationData,
          elevationDecoder: {
            rScaler: 6553.6,
            gScaler: 25.6,
            bScaler: 0.1,
            offset: -10000,
          },
          // 'terrain+draw' renders the mesh AND registers it as the elevation
          // source that TerrainExtension samples from.
          operation: "terrain+draw",
          color: isDark ? [20, 40, 70, 255] : [100, 150, 190, 255],
          meshMaxError: 4,
        })
      )
    }

    // ── 2. ScatterplotLayer — drifter dots ────────────────────────────────────
    result.push(
      new ScatterplotLayer<IFeature>({
        id: "drifters",
        data: circles,
        getPosition: (d) => d.geometry.coordinates as [number, number],
        getFillColor: (d) => {
          const id = parseInt(d.properties.id)
          if (id === selectedId) return [255, 165, 0, 255] // orange — selected
          return isDark ? [135, 206, 235, 180] : [0, 0, 200, 180]
        },
        getRadius: 1,
        radiusUnits: "pixels",
        radiusMinPixels: 4,
        radiusMaxPixels: 14,
        pickable: true,
        onHover: onHover as any,
        onClick: onClick as any,
        updateTriggers: {
          getFillColor: [selectedId, isDark],
        },
        ...(elevationData
          ? {
              extensions: [new TerrainExtension()],
              terrainDrawMode: "offset",
            }
          : {}),
      })
    )

    // ── 3. PathLayer — selected drifter's full trajectory ─────────────────────
    if (selectedId !== null && allPoints.length > 0) {
      const path = allPoints.map(
        (f) => f.features[selectedId]?.geometry.coordinates as [number, number]
      )

      result.push(
        new PathLayer({
          id: "selected-trail",
          data: [{ path }],
          getPath: (d) => d.path,
          getColor: isDark ? [0, 255, 0, 200] : [0, 100, 0, 200],
          widthMinPixels: 2,
          widthMaxPixels: 8,
          capRounded: true,
          jointRounded: true,
          ...(elevationData
            ? {
                extensions: [new TerrainExtension()],
                terrainDrawMode: "offset",
              }
            : {}),
        })
      )
    }

    return result
  }, [
    circles,
    allPoints,
    selectedId,
    isDark,
    terrainLayerId,
    elevationData,
    onHover,
    onClick,
  ])

  return { layers, velocities }
}
