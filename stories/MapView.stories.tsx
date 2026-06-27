import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { fn } from "storybook/test"

import "@radix-ui/themes/styles.css"

import MapView from "@/components/map/map-view"
import { IPoints } from "@/app/interactive/fetchData"

import points from "./sample-points.json"

const typedPoints = points as IPoints[]

const initialZoomLevel = 12
const initialLat = 46.48
const initialLong = -124.1

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Components/MapView",
  component: MapView,

  parameters: {},
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],

  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
  args: {
    zoom: initialZoomLevel,
    circles: typedPoints[7].features,
    allPoints: typedPoints,
    initialLat,
    initialLong,

    // showAllLines
  },
} satisfies Meta<typeof MapView>

export default meta
type Story = StoryObj<typeof meta>

export const MapViewComponent: Story = {
  args: {
    zoom: initialZoomLevel,
    circles: typedPoints[7].features,
    allPoints: typedPoints,
    initialLat,
    initialLong,
  },
}

export const ShowLines: Story = {
  args: {
    zoom: initialZoomLevel,
    showAllLines: true,
    circles: typedPoints[7].features,
    allPoints: typedPoints,
    initialLat,
    initialLong,
  },
}

const singleDrifterData: IPoints[] = [
  {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          latitude: initialLat,
          longitude: initialLong,
          id: "0",
        },
        geometry: {
          type: "Point",
          coordinates: [initialLong, initialLat],
        },
      },
    ],
  },
]

export const Drifter: Story = {
  args: {
    zoom: initialZoomLevel,
    circles: singleDrifterData[0].features,
    initialLat,
    initialLong,
  },
}
