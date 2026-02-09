import { useEffect } from "react"
import { LatLng, Popup } from "leaflet"
import {
  autoDetectRenderer,
  Color,
  Container,
  EventBoundary,
  Graphics,
  Point,
  Sprite,
} from "pixi.js"
import { useMap } from "react-leaflet"

import { Callback, pixiOverlay } from "./pixi-overlay"

function removeElementsByClass(className: string) {
  const elements = document.getElementsByClassName(className)
  while (elements.length > 0) {
    elements[0]?.parentNode?.removeChild(elements[0])
  }
}

export const PixiOverlayComponent = () => {
  const map = useMap()

  let frame: number | null = null
  let firstDraw = true
  let prevZoom: number

  const markerLatLng = new LatLng(48, -122.5)
  const marker = new Sprite()
  // marker.popup = new Popup({ className: "pixi-popup" })
  //   .setLatLng(markerLatLng)
  //   .setContent("<b>Hello world!</b><br>I am a popup.")
  //   .openOn(map)

  const polygonLatLngs: [number, number][] = [
    [48.5, -123.5],
    [48.5, -121.5],
    [47, -121.5],
    [47, -121],
  ]
  let projectedPolygon

  const circleCenter = new LatLng(48.5, -123)
  let projectedCenter
  let circleRadius = 500

  const triangle = new Graphics()
  // triangle.popup = new Popup()
  //   .setLatLng([51.5095, -0.063])
  //   .setContent("I am a polygon.")
  const circle = new Graphics()
  // circle.popup = new Popup()
  //   .setLatLng(circleCenter)
  //   .setContent("I am a circle.")
  ;[marker, triangle, circle].forEach((geo) => {
    geo.interactive = true
    geo.cursor = "pointer"
  })

  const doubleBuffering =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

  useEffect(() => {
    const pixiContainer = new Container()

    const rectangle = new Graphics()
      .rect(50, 50, 100, 100)
      .fill(0xff0000)
      .circle(200, 200, 50)
      .stroke({ color: 0x00ff00, width: 5 })
      .moveTo(300, 300)
      .lineTo(400, 400)

    pixiContainer.addChild(circle)

    const draw = (utils: Callback) => {
      if (frame) {
        cancelAnimationFrame(frame)
        frame = null
      }

      const zoom = utils.getMap().getZoom()
      const container = utils.getContainer()
      const renderer = utils.getRenderer()
      const project = utils.getMap().latLngToLayerPoint
      const scale = utils.getScale(zoom)

      if (firstDraw) {
        console.log("first draw")
        const boundary = new EventBoundary(container)
        map.on("click", (e) => {
          // not really nice but much better than before
          // good starting point for improvements
          const interaction = renderer.events
          const pointerEvent = e.originalEvent
          const pixiPoint = new Point()
          // get global click position in pixiPoint:
          interaction.mapPositionToPoint(
            pixiPoint,
            pointerEvent.clientX,
            pointerEvent.clientY
          )

          console.log(pixiPoint.x, pixiPoint.y)
          // get what is below the click if any:
          const target = boundary.hitTest(pixiPoint.x, pixiPoint.y)
          if (target && target.popup) {
            target.popup.openOn(map)
          }
        })
        // const markerCoords = project(markerLatLng)
        // marker.x = markerCoords.x
        // marker.y = markerCoords.y
        // marker.anchor.set(0.5, 1)
        // marker.scale.set(1 / scale)
        // marker.currentScale = 1 / scale

        // projectedPolygon = polygonLatLngs.map((coords) =>
        //   project(new LatLng(...coords))
        // )

        projectedCenter = project(circleCenter)
        circleRadius = circleRadius / scale
      }
      if (firstDraw || prevZoom !== zoom) {
        // marker.currentScale = marker.scale.x
        // marker.targetScale = 1 / scale

        // triangle.clear()

        // triangle.setStrokeStyle({
        //   width: 3 / scale,
        //   color: 0x3388ff,
        //   alpha: 1,
        // })
        // triangle.fill({
        //   color: 0x3388ff,
        //   alpha: 0.2,
        // })
        // triangle.x = projectedPolygon[0].x
        // triangle.y = projectedPolygon[0].y
        // projectedPolygon.forEach((coords, index) => {
        //   if (index == 0) triangle.moveTo(0, 0)
        //   else triangle.lineTo(coords.x - triangle.x, coords.y - triangle.y)
        // })

        circle.clear()

        circle.setStrokeStyle({
          width: 3 / scale,
          color: 0xff0000,
          alpha: 1,
        })

        circle.fill({ color: 0xff0033, alpha: 0.5 })
        circle.x = projectedCenter.x
        circle.y = projectedCenter.y

        console.log(projectedCenter)

        circle.circle(0, 0, circleRadius)
      }

      const duration = 100
      let start: number
      const animate: FrameRequestCallback = (timestamp) => {
        if (start === null) start = timestamp
        const progress = timestamp - start
        let lambda = progress / duration
        if (lambda > 1) lambda = 1
        lambda = lambda * (0.4 + lambda * (2.2 + lambda * -1.6))
        marker.scale.set(
          marker.currentScale +
            lambda * (marker.targetScale - marker.currentScale)
        )
        renderer.render(container)
        if (progress < duration) {
          frame = requestAnimationFrame(animate)
        }
      }

      if (!firstDraw && prevZoom !== zoom) {
        start = null
        frame = requestAnimationFrame(animate)
      }

      firstDraw = false
      prevZoom = zoom
      renderer.render(container)
    }

    const overlay = autoDetectRenderer({
      preference: "webgpu", // or 'webgl'
      background: new Color("rgba(255,0,0,0)"),
      backgroundAlpha: 1,
    }).then((renderer) => {
      console.log(renderer)
      const pixi = pixiOverlay(draw, pixiContainer, renderer, null)

      pixi.addTo(map)

      return pixi
    })

    return () => {
      removeElementsByClass("leaflet-pixi-overlay")
    }
  }, [])

  return <></>
}
