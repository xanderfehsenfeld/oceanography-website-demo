import { render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { IFeature, IPoints } from "@/app/interactive/fetchData"

// Mock @deck.gl/react's DeckGL component — jsdom has no WebGL
vi.mock("@deck.gl/react", () => ({
  DeckGL: () => <div data-testid="mock-deckgl" />,
}))

// Mock useDeckLayers to avoid constructing real deck.gl layers in jsdom
vi.mock("../useDeckLayers", () => ({
  useDeckLayers: () => ({ layers: [], velocities: [] }),
}))

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

const makeLeafletMap = () =>
  ({
    getCenter: () => ({ lat: 47.6, lng: -122.4 }),
    getZoom: () => 8,
    on: vi.fn(),
    off: vi.fn(),
  }) as any

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

  it("renders a DeckGL overlay", () => {
    const map = makeLeafletMap()
    const { getByTestId } = render(
      <DeckOverlayComponent {...BASE_PROPS} leafletMap={map} />
    )
    expect(getByTestId("mock-deckgl")).toBeDefined()
  })

  it("subscribes to Leaflet move/zoom events to sync the viewport", () => {
    const map = makeLeafletMap()
    render(<DeckOverlayComponent {...BASE_PROPS} leafletMap={map} />)
    expect(map.on).toHaveBeenCalledWith("move", expect.any(Function))
    expect(map.on).toHaveBeenCalledWith("zoom", expect.any(Function))
  })

  it("calls onLoadData after mount when data is present", async () => {
    const map = makeLeafletMap()
    const onLoadData = vi.fn()
    render(
      <DeckOverlayComponent
        {...BASE_PROPS}
        leafletMap={map}
        onLoadData={onLoadData}
      />
    )
    await waitFor(() => expect(onLoadData).toHaveBeenCalledOnce())
  })

  it("DeckGL renders even when circles is empty", () => {
    const map = makeLeafletMap()
    const { getAllByTestId } = render(
      <DeckOverlayComponent
        {...BASE_PROPS}
        circles={[]}
        leafletMap={map}
      />
    )
    expect(getAllByTestId("mock-deckgl").length).toBeGreaterThan(0)
  })
})
