import { render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { IFeature, IPoints } from "@/app/interactive/fetchData"

// Mock deck.gl maplibre overlay
const mockSetProps = vi.fn()
const mockMapLibreOverlay = vi.fn().mockImplementation(function (this: any) {
  this.setProps = mockSetProps
})

vi.mock("@deck.gl/maplibre", () => ({
  MapLibreOverlay: mockMapLibreOverlay,
}))

// Mock useDeckLayers to avoid deck.gl WebGL initialisation in jsdom
vi.mock("../useDeckLayers", () => ({
  useDeckLayers: () => ({ layers: [], velocities: [] }),
}))

// Import after mocks are established
const { default: DeckOverlayComponent } = await import(
  "../deck-overlay-component"
)

const makeFeature = (id: number): IFeature => ({
  type: "Feature",
  properties: { id: id.toString(), latitude: 47.6, longitude: -122.4 },
  geometry: { type: "Point", coordinates: [-122.4, 47.6] },
})

const makeFrame = (): IPoints => ({
  type: "FeatureCollection",
  features: [makeFeature(0), makeFeature(1)],
})

const makeMaplibreMap = () => ({
  addControl: vi.fn(),
  removeControl: vi.fn(),
  // loaded() returns true so the overlay attaches synchronously in tests
  loaded: vi.fn().mockReturnValue(true),
  once: vi.fn(),
})

const BASE_PROPS = {
  circles: [makeFeature(0), makeFeature(1)],
  allPoints: [makeFrame(), makeFrame()],
  frame: 0,
  isDark: false,
  timeDeltaMS: 3_600_000,
}

describe("DeckOverlayComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("calls addControl on mount", () => {
    const map = makeMaplibreMap() as any
    render(<DeckOverlayComponent {...BASE_PROPS} maplibreMap={map} />)
    expect(map.addControl).toHaveBeenCalledOnce()
    expect(mockMapLibreOverlay).toHaveBeenCalledWith({
      interleaved: true,
      layers: [],
    })
  })

  it("calls removeControl on unmount", () => {
    const map = makeMaplibreMap() as any
    const { unmount } = render(
      <DeckOverlayComponent {...BASE_PROPS} maplibreMap={map} />
    )
    unmount()
    expect(map.removeControl).toHaveBeenCalledOnce()
  })

  it("calls onLoadData after mount", async () => {
    const map = makeMaplibreMap() as any
    const onLoadData = vi.fn()
    render(
      <DeckOverlayComponent
        {...BASE_PROPS}
        maplibreMap={map}
        onLoadData={onLoadData}
      />
    )
    // onLoadData is called in a rAF — flush with fake timers
    await vi.waitFor(() => expect(onLoadData).toHaveBeenCalledOnce())
  })

  it("calls setProps after render", () => {
    const map = makeMaplibreMap() as any
    render(<DeckOverlayComponent {...BASE_PROPS} maplibreMap={map} />)
    expect(mockSetProps).toHaveBeenCalled()
  })
})
