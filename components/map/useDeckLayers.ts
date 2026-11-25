"use client"

import { useMemo } from "react"

import { Layer, PickingInfo } from "@deck.gl/core"
import { TerrainLayer } from "@deck.gl/geo-layers"
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers"

import { IFeature, IPoints } from "@/app/interactive/fetchData"
import { getDistanceInMiles } from "@/components/map/map-utils"

interface IUseDeckLayersProps {
  circles: IFeature[]
  allPoints: IPoints[]
  frame: number
  selectedId: number | null
  isDark: boolean
  onHover?: (info: PickingInfo<IFeature>) => void
  onClick?: (info: PickingInfo<IFeature>) => void
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
 *   - ScatterplotLayer  (drifter dots)
 *   - PathLayer         (selected drifter trajectory, only when selectedId !== null)
 *
 * Also returns pre-computed per-drifter velocity arrays (mph, one per frame)
 * so the tooltip can display current speed without recomputing on hover.
 */
export const useDeckLayers = ({
  circles,
  allPoints,
  frame,
  selectedId,
  isDark,
  onHover,
  onClick,
  timeDeltaMS,
}: IUseDeckLayersProps): IUseDeckLayersResult => {
  // Pre-compute per-drifter speed at every frame (mph).
  const velocities = useMemo<number[][]>(() => {
    if (allPoints.length < 2 || timeDeltaMS <= 0) return []

    const timeDeltaInHours = timeDeltaMS / 3_600_000
    const drifterCount = allPoints[0].features.length

    return Array.from({ length: drifterCount }, (_, id) =>
      allPoints.map((f, i) => {
        const prev = allPoints[Math.max(i - 1, 0)]
        const distMiles = getDistanceInMiles(
          f.features[id].geometry.coordinates as [number, number],
          prev.features[id].geometry.coordinates as [number, number]
        )
        return parseFloat((distMiles / timeDeltaInHours).toFixed(2))
      })
    )
  }, [allPoints, timeDeltaMS])

  const layers = useMemo<Layer[]>(() => {
    const result: Layer[] = []

    // ── TerrainLayer — bathymetric elevation mesh ───────────────────────────────
    // Renders visual 3D terrain. The MapTiler key gates whether this layer is
    // included at all (no key → flat map, still fully functional).
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? ""
    if (maptilerKey) {
      result.push(
        new TerrainLayer({
          id: "terrain",
          elevationData: `https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key=${maptilerKey}`,
          elevationDecoder: {
            rScaler: 6553.6,
            gScaler: 25.6,
            bScaler: 0.1,
            offset: -10000,
          },
          // No texture — semi-transparent deep blue so the basemap shows
          // through and the terrain reads as the ocean floor under water
          color: isDark ? [12, 28, 48, 160] : [70, 130, 180, 140],
          meshMaxError: 4,
        })
      )
    }

    // ── ScatterplotLayer — drifter dots ───────────────────────────────────────
    // radiusUnits: "meters" so dots shrink/grow naturally with zoom, matching
    // the original PIXI sprite behaviour where scale = 1/mapScale/2.
    // 800m radius ≈ the original dot size at zoom 8 (the default view).
    result.push(
      new ScatterplotLayer<IFeature>({
        id: "drifters",
        data: circles,
        getPosition: (d) => d.geometry.coordinates as [number, number],
        getFillColor: (d) => {
          const id = parseInt(d.properties.id)
          if (id === selectedId) return [255, 165, 0, 255]
          return isDark ? [135, 206, 235, 180] : [0, 0, 200, 180]
        },
        getRadius: 800,
        radiusUnits: "meters",
        // Keep dots readable at all zoom levels
        radiusMinPixels: 3,
        radiusMaxPixels: 20,
        pickable: true,
        onHover: onHover,
        onClick: onClick,
        updateTriggers: {
          getFillColor: [selectedId, isDark],
        },
      })
    )

    // ── PathLayer — selected drifter's full trajectory ────────────────────────
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
          widthUnits: "meters",
          getWidth: 300,
          widthMinPixels: 1,
          widthMaxPixels: 6,
          capRounded: true,
          jointRounded: true,
        })
      )
    }

    return result
  }, [circles, allPoints, selectedId, isDark, onHover, onClick])
  return { layers, velocities }
}
