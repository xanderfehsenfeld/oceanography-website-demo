import type { Meta, StoryObj } from "@storybook/nextjs-vite"

// import "@radix-ui/themes/styles.css"

import "leaflet/dist/leaflet.css"

import { MapContainer } from "react-leaflet"

// import { fn } from "storybook/test"

import { MapLibreTileLayer } from "@/components/map/map-libre-tile-layer"
import PixiOverlayComponent from "@/components/map/pixi-overlay-component"
import { getPoints, IPoints, Track } from "@/app/interactive/fetchData"

import "@/components/map/map-view.css"

import { expect } from "storybook/test"

const initialZoomLevel = 12
const initialLat = 46.48
const initialLong = -124.1

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Components/PixiOverlayComponent",
  component: PixiOverlayComponent,

  parameters: {},
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],

  decorators: [
    (Story: any) => (
      <div className="relative block h-125 max-h-125 w-auto">
        <MapContainer
          id={"map"}
          center={[initialLat, initialLong + 0.05]}
          zoom={initialZoomLevel}
          maxZoom={15}
          minZoom={7}
          zoomControl={false}
          doubleClickZoom={false}
          dragging={false}
          boxZoom={false}
          scrollWheelZoom={false}
          touchZoom={false}
          className="not-prose relative z-10 h-full min-h-[50vh] w-full"
        >
          <Story />
        </MapContainer>
      </div>
    ),
  ],
} satisfies Meta<typeof PixiOverlayComponent>

export default meta
type Story = StoryObj<typeof meta>

const pointData: Track[] = [
  {
    x: [initialLong, initialLong + 0.05, initialLong + 0.1, initialLong + 0.05],
    y: [initialLat, initialLat + 0.05, initialLat + 0.05, initialLat - 0.05],
  },
]

const singleDrifterData: IPoints[] = getPoints(pointData)

export const Drifter: Story = {
  args: {
    circles: singleDrifterData[20].features,
    allPoints: singleDrifterData,
  },
}
