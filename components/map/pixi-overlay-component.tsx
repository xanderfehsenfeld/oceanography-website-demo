"use client"

import { useEffect, useEffectEvent } from "react"

import "leaflet-pixi-overlay" // Must be called before the 'leaflet' import

import L, { PixiOverlayUtils } from "leaflet"
import {
  Circle,
  Container,
  FederatedPointerEvent,
  Graphics,
  Point,
  Rectangle,
  Sprite,
  Ticker,
} from "pixi.js"
import { useMap } from "react-leaflet"

import { getPoints, IFeature, IPoints } from "./getPoints"
import tracks from "./PS_tracks.json"
import { Drifter } from "./sprites/drifter"
import { Reticule } from "./sprites/reticule"

const points = getPoints(tracks as any)

let prevZoom = 8
let firstDraw = true

let circles: Drifter[]
let lines: Graphics[]

let isIn: { [key: string]: boolean } = {}

const backgroundContainer = new Graphics()
backgroundContainer.eventMode = "dynamic"

let reticule: Reticule

const PixiOverlayComponent = () => {
  const leafletMap = useMap()

  const drawCallback = useEffectEvent(function (utils: PixiOverlayUtils) {
    let map = utils.getMap()
    let zoom = map.getZoom()
    var renderer = utils.getRenderer()

    const initializeLines = (points: IPoints[]): Graphics[] => {
      return points[0].features.map((feature, id) => {
        const line = new Graphics()
        line.eventMode = "none"
        line.lineStyle({ width: 3, color: "green" })
        line.visible = false

        return line
      })
    }

    const initializeCircles = (features: IFeature[]): Drifter[] => {
      return features.map((feature, id) => {
        const line = lines[id]
        const sprite = new Drifter(renderer, line)

        sprite.onpointerenter = function (this: Drifter) {
          if (!isIn[id]) {
            this.setActive()
          } else {
            this.line.visible = true
          }
        }

        sprite.onpointerleave = function (this: Drifter) {
          if (!isIn[id]) {
            this.setInactive()
          } else {
            this.line.visible = false
          }
        }

        sprite.onpointerdown = function (
          this: Drifter,
          event: FederatedPointerEvent
        ) {
          //   //show as selected
          circles.forEach((circle) => circle.resetState())
          isIn = {
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
        container.addChild(backgroundContainer)
        container.eventMode = "dynamic"

        // container.onpointerdown = () => {
        //   console.log("clicked main container");
        // };

        reticule = new Reticule(renderer)
        container.addChild(reticule)

        lines = initializeLines(points)

        container.addChild(...lines)

        circles = initializeCircles(points[0].features)
        container.addChild(...circles)

        backgroundContainer.onpointerleave = () => {
          reticule.hide()
        }

        backgroundContainer.onpointerdown = () => {
          circles.forEach((circle, id) => {
            const reticuleCircle = new Circle(
              reticule.x,
              reticule.y,
              reticule.scale.x * 500
            )

            const isSelected = reticuleCircle.contains(circle.x, circle.y)
            isIn[id] = isSelected

            if (isSelected) {
              circle.setSelected()
              circle.line.visible = false
            } else {
              circle.resetState()
            }
          })
        }

        backgroundContainer.onpointermove = (e: FederatedPointerEvent) => {
          const localPositionToParent = e.getLocalPosition(
            backgroundContainer.parent
          )

          //show the reticule
          reticule.show()

          reticule.setTranslate(
            localPositionToParent.x,
            localPositionToParent.y
          )
        }

        const ticker = Ticker.shared.add(() => {
          renderer.render(container)
        })
        ticker.maxFPS = 60
      }

      //redraw the background container for capturing clicks
      const bounds = map.getBounds()

      const northWest = project(bounds.getNorthWest())

      const southEast = project(bounds.getSouthEast())
      backgroundContainer.clear()

      const clickableArea = new Rectangle(
        northWest.x,
        northWest.y,
        Math.abs(northWest.x - southEast.x),
        Math.abs(northWest.y - southEast.y)
      )
      backgroundContainer.hitArea = clickableArea
      backgroundContainer.eventMode = "static"
      backgroundContainer.endFill()

      if (firstDraw || prevZoom !== zoom) {
        //Update drawn lines
        lines.forEach((line, id) => {
          line.clear()
          line.eventMode = "none"

          line.lineStyle({ width: 3 / scale, color: "green" })

          points.forEach((v, frame) => {
            const { longitude, latitude } = v.features[id].properties
            const { x, y } = project([latitude, longitude] as any)
            if (frame === 0) {
              line.moveTo(x, y)
            } else {
              line.lineTo(x, y)
            }
          })
        })

        points[0].features.forEach((feature, id) => {
          const { longitude, latitude } = feature.properties
          const { x, y } = project([latitude, longitude] as any)
          const circle = circles[id]

          circle.setTranslate(x, y)
        })

        reticule.scale.set(1 / scale / 10)
      }
      firstDraw = false
      prevZoom = zoom

      renderer.render(container)
    }
  })

  useEffect(() => {
    let pixiContainer = new Container()

    let myOverlay = L.pixiOverlay(drawCallback, pixiContainer, {})
    firstDraw = true
    if (leafletMap) {
      myOverlay.addTo(leafletMap)
    }

    return () => {
      pixiContainer.removeAllListeners()
      leafletMap.off()
      myOverlay.removeFrom(leafletMap)
      myOverlay.remove()
    }
  }, [leafletMap])

  return <></>
}

export default PixiOverlayComponent
