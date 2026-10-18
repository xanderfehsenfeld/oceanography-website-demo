import { useEffect, useEffectEvent, useRef, useState } from "react"
import { createPortal } from "react-dom"
import * as d3 from "d3"
import { Map } from "leaflet"

// ─── Layout constants ─────────────────────────────────────────────────────────
//
// Leaflet's control containers have ~10px of internal padding. The action
// buttons are h-11 (44px), so their vertical/horizontal centre sits at
// roughly 10 + 22 = 32px from the map edge. The axis *line* is positioned at
// this value so it visually aligns with the buttons.
const BUTTON_MIDPOINT = 32 // px from the map edge

// Each end of the fullscreen scale is inset by this amount so the horizontal
// and vertical axes don't collide at the corners, and the buttons have
// breathing room.
const CORNER_INSET = 80 // px

// ─── Shared hook ─────────────────────────────────────────────────────────────

function useMapBounds(
  map: Map,
  isHorizontal: boolean
): { min: number; max: number } {
  const [bounds, setBounds] = useState({ min: 0, max: 100 })

  const update = useEffectEvent(() => {
    const b = map.getBounds()
    setBounds(
      isHorizontal
        ? { min: b.getWest(), max: b.getEast() }
        : { min: b.getNorth(), max: b.getSouth() }
    )
  })

  useEffect(() => {
    update()
    map.on("move", update)
    return () => { map.off("move", update) }
  }, [])

  return bounds
}

// ─── NormalMapScale ───────────────────────────────────────────────────────────
//
// Sits outside the MapContainer in the page flow (above/left of the map).
// Behaviour is identical to the original MapScale implementation.

export function NormalMapScale({
  isHorizontal,
  map,
}: {
  isHorizontal: boolean
  map: Map
}) {
  const { min, max } = useMapBounds(map, isHorizontal)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const div = ref.current
    if (!div) return

    const length = isHorizontal
      ? div.getBoundingClientRect().width
      : div.getBoundingClientRect().height

    const scale = d3.scaleLinear().domain([min, max]).range([0, length])

    d3.select(div)
      .select("svg")
      .attr(isHorizontal ? "width" : "height", "100%")
      .attr(isHorizontal ? "height" : "width", "30px")
      .select("g")
      .attr(
        "transform",
        `translate(${isHorizontal ? 0 : 30}, ${isHorizontal ? 25 : 0})`
      )
      .call(
        (isHorizontal
          ? d3.axisTop(scale).ticks(4)
          : d3.axisLeft(scale).ticks(4)) as any
      )
  }, [min, max])

  return (
    <div
      ref={ref}
      style={
        isHorizontal
          ? undefined
          : { position: "absolute", top: 24, left: 0, marginLeft: "-10px" }
      }
      className={`hidden md:block ${isHorizontal ? "h-6 w-full" : "h-full w-7"}`}
    >
      <svg>
        <g></g>
      </svg>
    </div>
  )
}

// ─── FullscreenMapScale ───────────────────────────────────────────────────────
//
// Portalled into map.getContainer() so it lives inside the browser fullscreen
// element. The axis is inset by CORNER_INSET on each end, and the domain values
// shown are back-calculated to match only the visible inset region — not the
// full viewport edge-to-edge range.

export function FullscreenMapScale({
  isHorizontal,
  map,
}: {
  isHorizontal: boolean
  map: Map
}) {
  const { min, max } = useMapBounds(map, isHorizontal)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const div = ref.current
    if (!div) return

    const { width, height } = div.getBoundingClientRect()

    if (isHorizontal) {
      const totalPx = width
      const axisLengthPx = totalPx - CORNER_INSET * 2

      // Back-calculate the lat/lng values that correspond to the inset pixel
      // positions. The full viewport [min, max] spans [0, totalPx] pixels, so:
      //   value at pixel p = min + (max - min) * (p / totalPx)
      const valueAtStart = min + (max - min) * (CORNER_INSET / totalPx)
      const valueAtEnd = min + (max - min) * ((totalPx - CORNER_INSET) / totalPx)

      const scale = d3
        .scaleLinear()
        .domain([valueAtStart, valueAtEnd])
        .range([0, axisLengthPx])

      d3.select(div)
        .select("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .select("g")
        .attr("transform", `translate(${CORNER_INSET}, ${BUTTON_MIDPOINT})`)
        .call(d3.axisBottom(scale).ticks(4) as any)
    } else {
      const totalPx = height
      const axisLengthPx = totalPx - CORNER_INSET * 2

      const valueAtStart = min + (max - min) * (CORNER_INSET / totalPx)
      const valueAtEnd = min + (max - min) * ((totalPx - CORNER_INSET) / totalPx)

      const scale = d3
        .scaleLinear()
        .domain([valueAtStart, valueAtEnd])
        .range([0, axisLengthPx])

      d3.select(div)
        .select("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .select("g")
        .attr("transform", `translate(${BUTTON_MIDPOINT}, ${CORNER_INSET})`)
        .call(d3.axisRight(scale).ticks(4) as any)
    }
  }, [min, max])

  const el = (
    <div
      ref={ref}
      style={
        isHorizontal
          ? {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: BUTTON_MIDPOINT + 24,
              zIndex: 500,
              pointerEvents: "none",
            }
          : {
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: BUTTON_MIDPOINT + 60,
              zIndex: 500,
              pointerEvents: "none",
            }
      }
      className="hidden md:block"
    >
      <svg style={{ overflow: "visible" }}>
        <g></g>
      </svg>
    </div>
  )

  return createPortal(el, map.getContainer())
}

// ─── MapScale (unified export for map-view.tsx) ───────────────────────────────

const MapScale = ({
  isHorizontal,
  map,
  isFullscreen = false,
}: {
  isHorizontal: boolean
  map: Map
  isFullscreen?: boolean
}) => {
  if (isFullscreen) {
    return <FullscreenMapScale isHorizontal={isHorizontal} map={map} />
  }
  return <NormalMapScale isHorizontal={isHorizontal} map={map} />
}

export default MapScale
