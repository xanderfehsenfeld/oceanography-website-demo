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
  min,
  max,
}: {
  isHorizontal: boolean
  min: number
  max: number
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // d3.select(ref.current).select("svg").remove()
    // d3.select(ref.current).select("g").remove()

    const boundingDiv = ref.current?.getBoundingClientRect() as DOMRect

    const length = isHorizontal ? boundingDiv.width : boundingDiv?.height

    const scale = d3.scaleLinear().domain([min, max]).range([0, length])

    const container = d3
      .select(ref.current)
      .select("svg")
      .attr(isHorizontal ? "width" : "height", `100%`)
      .attr(isHorizontal ? "height" : "width", `30px`)
      .select("g")
      .attr(
        "transform",
        `translate(${isHorizontal ? 0 : 30},${isHorizontal ? 25 : 0})`
      )
      .attr("class", ".mapScale ")

    if (isHorizontal) {
      container.call(
        d3
          .axisTop(scale)

          .ticks(4) as any
      )
    } else {
      container.call(
        d3
          .axisLeft(scale)

          .ticks(4) as any
      )
    }
  }, [min, max])
  //absolute ${isHorizontal ? "top-0" : "left-0"}
  return (
    <div
      ref={ref}
      className={`z-500 ${isHorizontal ? "h-6 w-full" : "absolute top-[28px] left-0 -ml-3 h-full w-7"} pointer-events-auto hidden md:block`}
    >
      <svg>
        <g></g>
      </svg>
    </div>
  )
}

export default MapScale
