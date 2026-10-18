"use client"
 
import {
  ReactPortal,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"

import "leaflet-pixi-overlay" // Must be called before the 'leaflet' import

import L, { PixiOverlayUtils } from "leaflet"
import { useTheme } from "next-themes"
import {
  Circle,
  Container,
  FederatedPointerEvent,
  IPoint,
  IPointData,
  Point,
  Rectangle,
  Ticker,
  UPDATE_PRIORITY,
} from "pixi.js"
import { useMap } from "react-leaflet"

import { IFeature, IPoints } from "@/app/interactive/fetchData"

import { Tooltip } from "../ui/tooltip"
import {
  getDistanceInMiles,
  getReticuleRadiusInMiles,
  pixelToLatLng,
} from "./map-utils"
import { Drifter } from "./sprites/drifter"
import { DASH_PATTERN, DrifterPath } from "./sprites/line"
import { RETICULE_BASE_RADIUS, Reticule } from "./sprites/reticule"

// @refresh reset

let prevZoom = 8
let firstDraw = true

const PixiOverlayComponent = ({
  allPoints: points,
  circles,
  showAllLines,
  onLoadData,
  frame = 0,
  timeDeltaMS = 0,
  isPlaying = false,
}: {
  circles: IFeature[]
  allPoints?: IPoints[]
  showAllLines?: boolean
  onLoadData?: () => void
  frame?: number
  timeDeltaMS?: number
  isPlaying?: boolean
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

  // Whether the marching-ants ticker callback is currently attached
  const dashAnimationActive = useRef<boolean>(false)
  // Rolling index into the lines array for batched dotted-line redraws
  const dashBatchIndex = useRef(0)
  // Last known zoom, used to recompute animation state when isPlaying changes
  const currentZoom = useRef<number>(prevZoom)

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

  // Animation is active only when paused AND sufficiently zoomed in.
  // Computed from props + current zoom; used to gate the ticker and layer state.
  const shouldAnimate = useEffectEvent(() => {
    return !isPlaying && currentZoom.current > 11
  })

  // Notify all lines of the current animation state so they can sync their layers.
  const applyAnimatingState = useEffectEvent((animating: boolean) => {
    const allLines = lineGraphics.current.concat(backgroundLineGraphics.current)
    for (const line of allLines) {
      line.setAnimating(animating)
    }
  })

  // Marching-ants ticker callback.
  // Uses ticker.deltaMS (real elapsed ms) so apparent speed is
  // framerate-independent regardless of how many lines are visible.
  // Runs at LOW priority so it doesn't compete with rendering or interaction.
  const DASH_BATCH_SIZE = 10

  const dashAnimationTick = useEffectEvent(() => {
    // Use elapsedMS (raw wall-clock ms) rather than deltaMS (which is scaled
    // by ticker.speed) so animation speed is truly framerate-independent.
    const elapsedMS = ticker.current?.elapsedMS ?? 16

    // Only animate visible lines — skips all the hidden ones for free
    const visibleLines = lineGraphics.current
      .concat(backgroundLineGraphics.current)
      .filter((l) => l.visible && l.dottedLineGraphic.visible)

    if (visibleLines.length === 0) return

    // 12 px/sec gives a slow, readable flow
    const DASH_SPEED_PPS = 12
    const advance = (DASH_SPEED_PPS * elapsedMS) / 1000
    const newOffset =
      (visibleLines[0].dashOffset + advance) %
      (DASH_PATTERN[0] + DASH_PATTERN[1])

    for (const line of visibleLines) {
      line.dashOffset = newOffset
    }

    // Redraw only a rolling batch this frame — limits geometry rebuild cost
    const start = dashBatchIndex.current % visibleLines.length
    const end = Math.min(start + DASH_BATCH_SIZE, visibleLines.length)
    for (let i = start; i < end; i++) {
      visibleLines[i].drawDottedVertices()
    }
    dashBatchIndex.current = end >= visibleLines.length ? 0 : end
  })

  const startDashAnimation = useEffectEvent(() => {
    if (!dashAnimationActive.current && ticker.current) {
      ticker.current.add(dashAnimationTick, null, UPDATE_PRIORITY.LOW)
      dashAnimationActive.current = true
    }
  })

  const stopDashAnimation = useEffectEvent(() => {
    if (dashAnimationActive.current && ticker.current) {
      ticker.current.remove(dashAnimationTick)
      dashAnimationActive.current = false
    }
  })

  const updateLineBoldness = useEffectEvent((scale: number, zoom: number) => {
    currentZoom.current = zoom
    const lineWidth = zoom > 10 ? 2 / scale : 3
    const showDottedLine = zoom > 11
    const animating = !isPlaying && showDottedLine

    lazybatchApply(
      lineGraphics.current.concat(backgroundLineGraphics.current),
      (v) => v.setDottedLineVisibility(showDottedLine)
    )

    // Tell all lines about the combined animation state
    applyAnimatingState(animating)

    // Start or stop the marching-ants ticker
    if (animating) {
      startDashAnimation()
    } else {
      stopDashAnimation()
    }

    //Update drawn lines
    if (zoom > 10 || firstDraw) {
      lazybatchApply(lineGraphics.current, (line) => {
        line.clear()
        line.lineStyle({ width: lineWidth })
        line.drawVertices()
        if (animating) line.drawDottedVertices()
      })

      lazybatchApply(backgroundLineGraphics.current, (line) => {
        line.clear()
        line.lineStyle({ width: lineWidth, alpha: 0.3 })
        line.lineGraphic.tint = theme === "dark" ? "magenta" : "purple"
        line.drawVertices()
        if (animating) line.drawDottedVertices()
      })
    }
  })

  useEffect(() => {
    //draw new frame with renderer
    if (circleSprites && isMounted) updateCircleLocations()
  }, [circles])

  // When playback starts/stops, update animation state immediately
  useEffect(() => {
    if (!isMounted) return
    const animating = !isPlaying && currentZoom.current > 11
    applyAnimatingState(animating)
    if (animating) {
      startDashAnimation()
    } else {
      stopDashAnimation()
    }
  }, [isPlaying])

  const { theme } = useTheme()

  useEffect(() => {
    const isDark = theme === "dark"
    reticule.current?.setIsDark(isDark)
    circleSprites.current?.forEach((c) => c.setIsDark(isDark))

    lineGraphics.current?.forEach((c) => c.setIsDark(isDark))
    backgroundLineGraphics.current?.forEach((c) => c.setIsDark(isDark))
  }, [theme])

  const [tooltipLocation, setTooltipLocation] = useState({ x: 100, y: 100 })
  const [activeDrifter, setActiveDrifter] = useState<Drifter | undefined>(
    undefined
  )

  const onDrifterHover = useCallback(
    function (this: Drifter) {
      const drifter = this
      if (backgroundContainer.current)
        setTooltipLocation(
          // backgroundContainer.current.toGlobal({ x: this.x, y: this.y })
          drifter.toGlobal({ x: 0, y: 0 })
        )

      setActiveDrifter(drifter)

      if (!isIn.current[drifter.id]) {
        drifter.setActive()
      } else {
        // Already selected — re-apply selected style so dotted layer stays correct
        drifter.setSelected()
      }

      this.onpointerenter = onDrifterHover
    },

    [frame]
  )

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
        const timeDeltaInHours = timeDeltaMS / 3600000

        const velocities = points?.map((v, i) => {
          const distanceTraveledInMiles = getDistanceInMiles(
            v.features[id].geometry.coordinates,
            points[Math.max(i - 1, 0)].features[id].geometry.coordinates
          )

          return parseFloat(
            (distanceTraveledInMiles / timeDeltaInHours).toFixed(2)
          )
        })
        const sprite = new Drifter(
          renderer,
          id,
          line,
          theme === "dark",
          vertices,
          velocities || []
        )

        sprite.visible = visible || false

        sprite.onpointerenter = onDrifterHover

        sprite.onpointerleave = function (this: Drifter) {
          if (!isIn.current[id]) {
            this.setInactive()
          }

          setTooltipLocation(
            // backgroundContainer.current.toGlobal({ x: this.x, y: this.y })
            { x: -1000, y: -1000 }
          )
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
      // utils.layerPointToLatLng

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

            // Update lat/lng crosshair labels
            const { lat, lng } = pixelToLatLng(leafletMap, localPositionToParent)
            reticule.current?.setLatLng(lat, lng)

            // Update distance scale label based on current reticule radius
            if (reticule.current) {
              const pixelRadius = reticule.current.scale.x * RETICULE_BASE_RADIUS
              const miles = getReticuleRadiusInMiles(
                leafletMap,
                localPositionToParent,
                pixelRadius
              )
              reticule.current.setRadiusInMiles(miles)
            }
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
          reticule.current?.hide()
        }

        backgroundContainer.current.onmousemove = (
          e: FederatedPointerEvent
        ) => {
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
        updateCircleLocations(Math.max(scale * 2, 1))
        // updateCircleLocations(1)

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

  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let pixiContainer = new Container()
    firstDraw = true
    setIsMounted(true)

    const myOverlay = L.pixiOverlay(drawCallback, pixiContainer, {})

    myOverlay.addTo(leafletMap)
    setTimeout(updateCircleLocations, 50)

    leafletMap.on("zoomstart", disablePixiInteraction)
    leafletMap.on("zoomend", enablePixiInteraction)
    leafletMap.on("movestart", disablePixiInteraction)
    leafletMap.on("moveend", enablePixiInteraction)

    mapContainer.current = document.getElementsByClassName(
      "leaflet-pixi-overlay"
    )?.[0] as HTMLDivElement

    return () => {
      setIsMounted(false)

      // Stop dash animation before destroying the ticker
      if (dashAnimationActive.current && ticker.current) {
        ticker.current.remove(dashAnimationTick)
        dashAnimationActive.current = false
      }

      ticker.current?.destroy()
      ticker.current = null

      myOverlay.removeFrom(leafletMap)
      myOverlay.remove()
      pixiContainer.removeAllListeners()

      pixiContainer.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      })

      // Null out all PIXI refs so effects that run after cleanup (e.g. the
      // theme effect in React Strict Mode's double-invoke cycle) don't call
      // methods on destroyed objects.
      reticule.current = null
      circleSprites.current = []
      lineGraphics.current = []
      backgroundLineGraphics.current = []
      backgroundContainer.current = null
      circlesContainer.current = null
      linesContainer.current = null
    }
  }, [])

  // const overlay =

  return mapContainer.current
    ? createPortal(
        <Tooltip x={tooltipLocation.x} y={tooltipLocation.y}>
          <p className="rt-Text rt-r-size-1 rt-TooltipText">
            id: {activeDrifter?.id} , speed: {activeDrifter?.velocities[frame]}{" "}
            mph, frame: {frame}/{points?.length}
          </p>
        </Tooltip>,

        mapContainer.current as HTMLDivElement
      )
    : null
}

export default PixiOverlayComponent
