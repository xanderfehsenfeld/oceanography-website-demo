import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { IFeature, IPoints } from "@/app/interactive/fetchData"

import { useDeckLayers } from "../useDeckLayers"

const makeFeature = (id: number, lng = -122.4, lat = 47.6): IFeature => ({
  type: "Feature",
  properties: { id: id.toString(), latitude: lat, longitude: lng },
  geometry: { type: "Point", coordinates: [lng, lat] },
})

const makeFrame = (coords: [number, number][]): IPoints => ({
  type: "FeatureCollection",
  features: coords.map(([lng, lat], i) => makeFeature(i, lng, lat)),
})

const FRAME_A = makeFrame([
  [-122.4, 47.6],
  [-122.5, 47.7],
])
const FRAME_B = makeFrame([
  [-122.41, 47.61],
  [-122.51, 47.71],
])

const ALL_POINTS: IPoints[] = [FRAME_A, FRAME_B]
const CIRCLES = FRAME_A.features

const BASE_PROPS = {
  circles: CIRCLES,
  allPoints: ALL_POINTS,
  frame: 0,
  selectedId: null as number | null,
  isDark: false,
  timeDeltaMS: 3_600_000,
}

// NEXT_PUBLIC_MAPTILER_KEY is not set in the test env, so TerrainLayer is skipped.
// The count assertions below reflect that (1 ScatterplotLayer, no TerrainLayer).

describe("useDeckLayers", () => {
  it("returns 1 layer (ScatterplotLayer only) when no key and no selection", () => {
    const { result } = renderHook(() => useDeckLayers(BASE_PROPS))
    expect(result.current.layers).toHaveLength(1)
    expect(result.current.layers[0].id).toBe("drifters")
  })

  it("returns 2 layers (ScatterplotLayer + PathLayer) when selectedId is set", () => {
    const { result } = renderHook(() =>
      useDeckLayers({ ...BASE_PROPS, selectedId: 0 })
    )
    expect(result.current.layers).toHaveLength(2)
    const ids = result.current.layers.map((l) => l.id)
    expect(ids).toContain("drifters")
    expect(ids).toContain("selected-trail")
  })

  it("returns PathLayer whose path has length equal to allPoints.length", () => {
    const { result } = renderHook(() =>
      useDeckLayers({ ...BASE_PROPS, selectedId: 1 })
    )
    const pathLayer = result.current.layers.find(
      (l) => l.id === "selected-trail"
    )
    expect(pathLayer).toBeDefined()
    const data = (pathLayer as any).props.data as { path: unknown[] }[]
    expect(data[0].path).toHaveLength(ALL_POINTS.length)
  })

  it("computes velocities array with correct dimensions", () => {
    const { result } = renderHook(() => useDeckLayers(BASE_PROPS))
    const { velocities } = result.current
    expect(velocities).toHaveLength(CIRCLES.length)
    expect(velocities[0]).toHaveLength(ALL_POINTS.length)
  })

  it("returns empty velocities when allPoints has fewer than 2 frames", () => {
    const { result } = renderHook(() =>
      useDeckLayers({ ...BASE_PROPS, allPoints: [FRAME_A] })
    )
    expect(result.current.velocities).toHaveLength(0)
  })
})
