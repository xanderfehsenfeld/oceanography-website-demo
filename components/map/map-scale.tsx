import { useEffect, useRef } from "react"
import * as d3 from "d3"

const MapScale = ({
  min,
  max,
  isHorizontal,
}: {
  min: number
  max: number
  isHorizontal: boolean
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
  }, [min, max, isHorizontal])

  return (
    <div
      ref={ref}
      className={`absolute ${isHorizontal ? "top-0" : "left-0"} z-500 ${isHorizontal ? "h-5 w-full" : "h-full w-5"}`}
    >
      <svg>
        <g></g>
      </svg>
    </div>
  )
}

export default MapScale
