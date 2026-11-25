import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import "@radix-ui/themes/styles.css"
import "leaflet/dist/leaflet.css"

import MapView from "@/components/map/map-view"

const meta = {
  title: "Components/MapView",
  component: MapView,
  tags: ["autodocs"],
  args: {
    zoom: 9,
    initialLat: 48,
    initialLong: -123,
  },
} satisfies Meta<typeof MapView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
