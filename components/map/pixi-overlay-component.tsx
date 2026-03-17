"use client"

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react"

import "leaflet-pixi-overlay" // Must be called before the 'leaflet' import

import { line } from "d3"
import L, { PixiOverlayUtils } from "leaflet"
import { useTheme } from "next-themes"
import {
  Circle,
  Container,
  FederatedPointerEvent,
  Rectangle,
  Ticker,
  UPDATE_PRIORITY,
} from "pixi.js"
import { useMap } from "react-leaflet"

import { IFeature, IPoints } from "./getPoints"
import { Drifter } from "./sprites/drifter"
import { DrifterPath } from "./sprites/line"
import { Reticule } from "./sprites/reticule"

// @refresh reset

let prevZoom = 8
let firstDraw = true

function addProfiling<FunctionType extends (...args: any[]) => any>(
  f: FunctionType,
  name?: string
): FunctionType {
  return function (...args) {
    console.time(f.name || name)
    const returnValue = f(...args)
    console.timeEnd(f.name || name)
    return returnValue
  } as FunctionType
}

const PixiOverlayComponent = ({
  allPoints: points,
  circles,
  showAllLines,
}: {
  circles: IFeature[]
  allPoints: IPoints[]
  showAllLines?: boolean
}) => {
  const ticker = useRef<Ticker>(null)

  const isIn = useRef<{ [key: string]: boolean }>({})

  const backgroundContainer = useRef<Container>(null)
  const circlesContainer = useRef<Container>(null)

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

  const updateLineLocations = useEffectEvent((scale: number, zoom: number) => {
    const lineWidth = zoom > 10 ? 3 / scale : 3

    //Update drawn lines
    if (zoom > 10 || firstDraw) {
      lineGraphics.current.forEach((line) => {
        line.clear()
        line.lineStyle({ width: lineWidth, color: "green" })
        line.drawVertices()
      })
      backgroundLineGraphics.current.forEach((line) => {
        line.clear()

        line.lineStyle({ width: lineWidth, color: "purple", alpha: 0.3 })
        line.drawVertices()
      })
    }
  })

  useEffect(() => {
    if (circleSprites && isMounted) updateCircleLocations()
  }, [circles])

  const { theme } = useTheme()

  useEffect(() => {
    const isDark = theme === "dark"
    reticule.current?.setIsDark(isDark)
    circleSprites.current?.forEach((c) => c.setIsDark(isDark))
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
        line.lineStyle({
          width: 3,
          color: isBackground ? "magenta" : "green",
        })
        line.visible = isBackground || false

        return line
      })
    }

    const initializeCircles = (
      features: IFeature[],
      visible?: boolean
    ): Drifter[] => {
      return features.map((feature) => {
        const id = parseInt(feature.properties.id)
        const line = lineGraphics.current[id]

        const vertices = points.map((v) => {
          const { longitude, latitude } = v.features[id].properties
          const { x, y } = project([latitude, longitude] as any)

          return { x, y }
        })

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
            this.line.visible = true
          }
        }

        sprite.onpointerleave = function (this: Drifter) {
          if (!isIn.current[id]) {
            this.setInactive()
          }

          // else if (Object.keys(isIn.current).length > 1) {
          //   this.line.visible = false
          // }
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

        if (showAllLines) {
          backgroundLineGraphics.current = initializeLines(points, true)
          container.addChild(...backgroundLineGraphics.current)
        }

        lineGraphics.current = initializeLines(points)

        container.addChild(...lineGraphics.current)

        updateLineLocations(scale, zoom)

        backgroundContainer.current = new Container()
        container.addChild(backgroundContainer.current)

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

        // ticker.current?.addOnce(
        //   () => updateLineLocations(scale, zoom),
        //   null,
        //   UPDATE_PRIORITY.LOW
        // )

        updateLineLocations(scale, zoom)

        const reticuleScale = 1 / scale / 5
        reticule.current?.scale.set(reticuleScale)
      }
      firstDraw = false
      prevZoom = zoom
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

    let myOverlay = L.pixiOverlay(
      addProfiling(drawCallback, "drawCallback"),
      pixiContainer,
      {}
    )
    myOverlay.addTo(leafletMap)

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
