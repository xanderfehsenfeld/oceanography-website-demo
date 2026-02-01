import {
  PureComponent,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react"
import * as d3 from "d3"
import { LeafletEvent, Map } from "leaflet"

const MapScale = ({
  isHorizontal,
  map,
}: {
  isHorizontal: boolean
  map: Map
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const updateMapScale = useEffectEvent(() => {
    // d3.select(ref.current).select("svg").remove()
    // d3.select(ref.current).select("g").remove()

    const bounds = map.getBounds()

    const min = isHorizontal ? bounds.getWest() : bounds.getSouth()
    const max = isHorizontal ? bounds.getEast() : bounds.getNorth()

    const boundingDiv = ref.current?.getBoundingClientRect() as DOMRect

    const length = isHorizontal ? boundingDiv.width : boundingDiv?.height

    const scale = d3.scaleLinear().domain([min, max]).range([0, length])

    const container = d3
      .select(ref.current)
      .select("svg")
      .attr(isHorizontal ? "width" : "height", `${length}px`)
      .select("g")
      .attr("transform", `translate(${0},${0})`)
      .attr("class", ".mapScale")

    if (isHorizontal) {
      container.call(
        d3
          .axisBottom(scale)

          .ticks(4) as any
      )
    } else {
      container.call(
        d3
          .axisRight(scale)

          .ticks(4) as any
      )
    }
  })

  useEffect(() => {
    map.on("move", updateMapScale)
    updateMapScale()
  }, [])

  return (
    <div
      ref={ref}
      className={`absolute ${isHorizontal ? "top-0" : "left-0"} z-500 ${isHorizontal ? "h-5 w-full" : "h-full w-5"} pointer-events-auto`}
    >
      <svg>
        <g></g>
      </svg>
    </div>
  )
}

export default MapScale
