import type { Meta, StoryObj } from "@storybook/nextjs-vite"

// import "@radix-ui/themes/styles.css"

import "leaflet/dist/leaflet.css"

// import { fn } from "storybook/test"

import { getPoints, IPoints, Track } from "@/app/interactive/fetchData"

import "@/components/map/map-view.css"

import { Container, IRenderer } from "pixi.js"

import { Drifter } from "@/components/map/sprites/drifter"
import { DrifterPath } from "@/components/map/sprites/line"

import PixiDecorator from "./PixiDecorator"

const initialZoomLevel = 12
const initialLat = 150
const initialLong = 100

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Components/PixiDecorator",
  component: PixiDecorator,

  parameters: {},
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
} satisfies Meta<typeof PixiDecorator>

export default meta
type Story = StoryObj<typeof meta>

const pointData: Track[] = [
  {
    x: [initialLong, initialLong + 100, initialLong + 100, initialLong + 50],
    y: [initialLat, initialLat + 100, initialLat + 50, initialLat - 100],
  },
]

const singleDrifterData: IPoints[] = getPoints(pointData)

const convertDrifterDataToVertices = (data: IPoints[]) => {
  return data.map((v) => {
    const { longitude, latitude } = v.features[0].properties

    return { x: longitude, y: latitude }
  })
}

const vertices = convertDrifterDataToVertices(singleDrifterData)

const getLine = (
  renderer: IRenderer,
  vertices: {
    x: number
    y: number
  }[],
  isDark: boolean
) => {
  const line = new DrifterPath(vertices, renderer)

  line.lineStyle({
    width: 6,
  })

  const color = "darkgreen"
  line.lineGraphics.tint = color
  line.dottedLineGraphic.tint = color
  line.visible = true

  line.setIsDark(isDark)

  line.drawVertices()

  return line
}

export const LightSelectedDrifter: Story = {
  args: {
    width: 300,
    height: 300,
    child: (renderer) => {
      const line = getLine(renderer, vertices, false)
      const drifter = new Drifter(renderer, 0, line, false, vertices)
      const { latitude, longitude } =
        singleDrifterData[20].features[0].properties

      drifter.setTransform(longitude, latitude)
      drifter.setSelected()

      const container = new Container()

      container.addChild(line)
      container.addChild(drifter)
      return container
    },
  },
}

export const DarkSelectedDrifter: Story = {
  args: {
    width: 300,
    height: 300,
    child: (renderer) => {
      const line = getLine(renderer, vertices, true)
      const drifter = new Drifter(renderer, 0, line, false, vertices)
      const { latitude, longitude } =
        singleDrifterData[20].features[0].properties

      drifter.setTransform(longitude, latitude)
      drifter.setSelected()

      const container = new Container()

      container.addChild(line)
      container.addChild(drifter)
      return container
    },
  },
}

const morePointData = getPoints([
  {
    x: [
      initialLong,
      initialLong + 100,
      initialLong + 100,
      initialLong + 50,
      initialLong + 25,
      initialLong + 75,
      initialLong + 200,
      initialLong - 50,
    ],
    y: [
      initialLat,
      initialLat + 100,
      initialLat + 50,
      initialLat - 100,
      initialLat - 120,
      initialLat - 150,
      initialLat - 100,
      initialLat + 350,
    ],
  },
])

export const DarkDrifterPath: Story = {
  args: {
    width: 500,
    height: 500,
    child: (renderer) => {
      const line = getLine(
        renderer,
        convertDrifterDataToVertices(morePointData),
        true
      )

      line.setFrame(40)

      return line
    },
  },
}
