"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"

import "leaflet-pixi-overlay" // Must be called before the 'leaflet' import

import L, { PixiOverlayUtils } from "leaflet"
import { useTheme } from "next-themes"
import {
  Circle,
  Container,
  FederatedPointerEvent,
  IPointData,
  Rectangle,
  Ticker,
  UPDATE_PRIORITY,
} from "pixi.js"
import { useMap } from "react-leaflet"

import { IFeature, IPoints } from "@/app/interactive/fetchData"

import { Drifter } from "./sprites/drifter"
import { DrifterPath } from "./sprites/line"
import { Reticule } from "./sprites/reticule"

// @refresh reset

let prevZoom = 8
let firstDraw = true

const PixiOverlayComponent = ({
  allPoints: points,
  circles,
  showAllLines,
  onLoadData,
}: {
  circles: IFeature[]
  allPoints?: IPoints[]
  showAllLines?: boolean
  onLoadData?: () => void
}) => {
  const ticker = useRef<Ticker>(null)

  const isIn = useRef<{ [key: string]: boolean }>({})

  const backgroundContainer = useRef<Container>(null)
  const circlesContainer = useRef<Container>(null)
  const linesContainer = useRef<Container>(null)

  const lineGraphics = useRef<DrifterPath[]>([])

  const reticule = useRef<Reticule>(null)

  const circleSprites = useRef<Drifter[]>([])

  const backgroundLineGraphics = useRef<DrifterPath[]>([])

  const leafletMap = useMap()

  const [isMounted, setIsMounted] = useState(false)

  const latLngToLayerPoint = useEffectEvent(function (
    latLng: [number, number]
  ) {
    const zoom = 11
    var projectedPoint = leafletMap.project(L.latLng(latLng), zoom)
    return projectedPoint
  })

  const updateCircleLocations = useEffectEvent((scale?: number) => {
    circleSprites.current.forEach((circle) => {
      const feature = circles[circle.id]
      const { longitude, latitude } = feature.properties
      const { x, y } = latLngToLayerPoint([latitude, longitude] as any)

      circle?.setLocation(x, y)
      if (scale && circle) circle.scale.set(1 / scale / 2)
    })
  })

  const lazybatchApply = useEffectEvent(
    (
      items: DrifterPath[],
      callback: (item: DrifterPath) => void,
      index = 0,
      batchSize = 20
    ) => {
      let currentIndex = index

      const executeBatch = () => {
        const batch = items.slice(currentIndex, currentIndex + batchSize)
        if (batch.length > 0) {
          batch.map(callback)
        } else {
          ticker.current?.remove(executeBatch)
        }

        currentIndex += batchSize
      }

      //remove the last one if it exists
      ticker.current?.remove(executeBatch)
      ticker.current?.add(executeBatch, null, UPDATE_PRIORITY.LOW)
    }
  )

  const updateLineBoldness = useEffectEvent((scale: number, zoom: number) => {
    const lineWidth = zoom > 10 ? 2 / scale : 3
    console.log("zoom", zoom)
    const showArrowHeads = false

    lazybatchApply(
      lineGraphics.current.concat(backgroundLineGraphics.current),
      (v) => v.setArrowHeadVisibility(showArrowHeads)
    )
    //Update drawn lines
    if (zoom > 10 || firstDraw) {
      lazybatchApply(lineGraphics.current, (line) => {
        line.clear()

        line.lineStyle({
          width: lineWidth,
        })

        line.drawVertices()
      })

      lazybatchApply(backgroundLineGraphics.current, (line) => {
        line.clear()

        line.lineStyle({ width: lineWidth, alpha: 0.3 })
        line.lineGraphic.tint = "magenta"
        line.drawVertices()
      })
    }
  })

  useEffect(() => {
    //draw new frame with renderer
    if (circleSprites && isMounted) updateCircleLocations()
  }, [circles])

  const { theme } = useTheme()

  useEffect(() => {
    const isDark = theme === "dark"
    reticule.current?.setIsDark(isDark)
    circleSprites.current?.forEach((c) => c.setIsDark(isDark))

    lineGraphics.current?.forEach((c) => c.setIsDark(isDark))
    backgroundLineGraphics.current?.forEach((c) => c.setIsDark(isDark))
  }, [theme])

  const drawCallback = useEffectEvent(function (utils: PixiOverlayUtils) {
    let map = utils.getMap()
    let zoom = map.getZoom()
    var renderer = utils.getRenderer()

    const initializeLines = (
      points: IPoints[],
      isBackground?: boolean
    ): DrifterPath[] => {
      return points[0].features.map((feature, id) => {
        const vertices = points.map((v) => {
          const { longitude, latitude } = v.features[id].properties
          const { x, y } = latLngToLayerPoint([latitude, longitude] as any)

          return { x, y }
        })
        const line = new DrifterPath(vertices, renderer, isBackground)
        line.eventMode = "none"

        let color

        if (isBackground) {
          color = "magenta"
        } else {
          color = theme === "dark" ? "lime" : "darkgreen"
        }

        line.lineStyle({
          width: 3,
        })
        line.lineGraphic.tint = color
        line.visible = isBackground || false

        return line
      })
    }

    const initializeCircles = (
      features: IFeature[],
      visible: boolean
    ): Drifter[] => {
      return features.map((feature) => {
        const id = parseInt(feature.properties.id)
        const line = lineGraphics.current[id]

        let vertices: IPointData[] = []
        if (points) {
          vertices = points.map((v) => {
            const { longitude, latitude } = v.features[id].properties
            const { x, y } = project([latitude, longitude] as any)

            return { x, y }
          })
        }

        const sprite = new Drifter(
          renderer,
          id,
          line,
          theme === "dark",
          vertices
        )

        sprite.visible = visible || false

        sprite.onpointerenter = function (this: Drifter) {
          if (!isIn.current[id]) {
            this.setActive()
          } else {
            if (this.line) this.line.visible = true
          }
        }

        sprite.onpointerleave = function (this: Drifter) {
          if (!isIn.current[id]) {
            this.setInactive()
          }
        }

        sprite.onpointerdown = function (
          this: Drifter,
          event: FederatedPointerEvent
        ) {
          //   //show as selected
          circleSprites.current.forEach((circle) => circle.resetState())
          isIn.current = {
            [id]: true,
          }
          this.setSelected()
          event.stopImmediatePropagation()
          event.stopPropagation()
          event.preventDefault()
        }

        return sprite
      })
    }

    if (map) {
      var container = utils.getContainer()
      var project = utils.latLngToLayerPoint
      var scale = utils.getScale() || 1

      if (firstDraw) {
        ticker.current = new Ticker()

        ticker.current.add(() => {
          renderer.render(container)
        })
        ticker.current.maxFPS = 60
        ticker.current.start()

        container.eventMode = "dynamic"

        linesContainer.current = new Container()
        linesContainer.current.eventMode = "none"

        if (showAllLines && points) {
          backgroundLineGraphics.current = initializeLines(points, true)
          linesContainer.current.addChild(...backgroundLineGraphics.current)
        }

        //Initialize the drifter paths

        if (points) {
          lineGraphics.current = initializeLines(points)

          linesContainer.current.addChild(...lineGraphics.current)
        }
        updateLineBoldness(scale, zoom)

        container.addChild(linesContainer.current)

        //Initialize overlaid selection tool
        backgroundContainer.current = new Container()

        container.addChild(backgroundContainer.current)

        //Initialize the drifters
        circlesContainer.current = new Container()

        container.addChild(circlesContainer.current)

        const chunkSize = 20
        function popInData() {
          const alreadyAddedCircles = circleSprites.current.length
          const circlesToPopIn = circles.slice(
            alreadyAddedCircles,
            alreadyAddedCircles + chunkSize
          )

          if (circlesToPopIn.length) {
            const newCircles = initializeCircles(circlesToPopIn, true)
            circleSprites.current = circleSprites.current.concat(newCircles)
            circlesContainer.current?.addChild(...newCircles)
          } else {
            onLoadData?.()
            ticker.current?.remove(popInData)
          }
        }

        ticker.current.add(popInData)

        reticule.current = new Reticule(renderer)
        backgroundContainer.current.addChild(reticule.current)

        backgroundContainer.current.onpointerleave = () => {
          reticule.current?.hide()
        }

        const moveReticuleToEvent = (e: FederatedPointerEvent) => {
          if (backgroundContainer.current) {
            const localPositionToParent = e.getLocalPosition(
              backgroundContainer.current.parent
            )

            //show the reticule
            reticule.current?.show()

            reticule.current?.setTranslate(
              localPositionToParent.x,
              localPositionToParent.y
            )
          }
        }

        backgroundContainer.current.onpointerdown = (
          e: FederatedPointerEvent
        ) => {
          moveReticuleToEvent(e)
        }

        backgroundContainer.current.onpointerup = (
          e: FederatedPointerEvent
        ) => {
          if (reticule.current) {
            moveReticuleToEvent(e)
            const { x, y, scale } = reticule.current

            const reticuleCircle = new Circle(x, y, scale.x * 500)
            const anyCirclesAreSelected = circleSprites.current.some(
              (circle, id) => {
                const isSelected = reticuleCircle.contains(circle.x, circle.y)

                return isSelected
              }
            )

            if (anyCirclesAreSelected) {
              circleSprites.current.forEach((circle, id) => {
                const isSelected = reticuleCircle.contains(circle.x, circle.y)
                isIn.current[id] = isSelected

                if (isSelected) {
                  circle.setSelected()
                } else {
                  circle.resetState()
                }
              })
            }
          }
        }

        backgroundContainer.current.ontouchend = () => {
          reticule.current?.hide()
        }

        backgroundContainer.current.onpointerleave = () => {
          // console.log("leave")

          reticule.current?.hide()
        }

        backgroundContainer.current.onmousemove = (
          e: FederatedPointerEvent
        ) => {
          // console.log(e.target)

          moveReticuleToEvent(e)
        }
      }

      if (backgroundContainer.current) {
        console.log("draw background")
        //redraw the background container for capturing clicks
        const bounds = map.getBounds()

        const northWest = project(bounds.getNorthWest())

        const southEastBound = bounds.getSouthEast()

        const southEast = project(southEastBound)

        const overlaidControlPane = document.getElementsByClassName(
          "leaflet-bottom leaflet-left"
        )[0]
        const boundingDiv = overlaidControlPane.getBoundingClientRect()
        const controlPaneHeight = boundingDiv.height

        const mapHeight = map.getSize().y
        const heightMultiplier = (mapHeight - controlPaneHeight) / mapHeight

        const clickableArea = new Rectangle(
          northWest.x,
          northWest.y,
          Math.abs(northWest.x - southEast.x),
          Math.abs(northWest.y - southEast.y) * heightMultiplier
        )

        // select .leaflet-bottom.leaflet-left
        // get height
        // translate to "map"
        // subtract from original

        backgroundContainer.current.hitArea = clickableArea
        backgroundContainer.current.eventMode = "static"
      }

      if (firstDraw || prevZoom !== zoom) {
        // @ts-ignore
        globalThis.__PIXI_STAGE__ = container
        // @ts-ignore
        globalThis.__PIXI_RENDERER__ = renderer

        //update the drifters

        //Change the scale of the circles for improve zoom
        updateCircleLocations(Math.max(scale, 1))

        updateLineBoldness(scale, zoom)

        const reticuleScale = 1 / scale / 5
        reticule.current?.scale.set(reticuleScale)
      }
      firstDraw = false
      prevZoom = zoom

      renderer.render(container)
    }
  })
  const disablePixiInteraction = useEffectEvent(() => {
    if (backgroundContainer.current) {
      backgroundContainer.current.eventMode = "none"
      reticule.current?.hide()
    }
  })

  const enablePixiInteraction = useEffectEvent(() => {
    if (backgroundContainer.current) {
      backgroundContainer.current.eventMode = "static"
      reticule.current?.show()
    }
  })

  useEffect(() => {
    console.log("create application")
    let pixiContainer = new Container()
    firstDraw = true
    setIsMounted(true)

    let myOverlay = L.pixiOverlay(drawCallback, pixiContainer, {})
    myOverlay.addTo(leafletMap)
    setTimeout(updateCircleLocations, 50)

    leafletMap.on("zoomstart", disablePixiInteraction)
    leafletMap.on("zoomend", enablePixiInteraction)
    leafletMap.on("movestart", disablePixiInteraction)
    leafletMap.on("moveend", enablePixiInteraction)

    return () => {
      setIsMounted(false)
      console.log("destroy")
      ticker.current?.destroy()

      myOverlay.removeFrom(leafletMap)
      myOverlay.remove()
      pixiContainer.removeAllListeners()

      pixiContainer.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      })
    }
  }, [])

  return <></>
}

export default PixiOverlayComponent
