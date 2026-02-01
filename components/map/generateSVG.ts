import * as d3 from "d3"
import { LatLng, Map, Point } from "leaflet"

interface IInfo {
  x0: number
  x1: number
  y0: number
  y1: number
  w0: number
  h0: number
  position: LatLng
}

let margin = 8

export function generateMapScale(
  this_info: IInfo,
  parent: d3.Selection<SVGGElement, any, any, any>
) {
  const { position, x0, x1, y0, y1 } = this_info

  if (x0 > x1) throw Error("x0 should be less than x1")
  if (y0 > y1) throw Error("y0 should be less than y1")

  if (this_info.w0 < 0 || this_info.h0 < 0) throw Error()
  // Create an svg with axes specific to a pair of variables, e.g.
  // lon,lat for the map or fld,z for a variable (in the object "this_info").
  // Assigns the svg to id=axid.
  let width = this_info.w0 + 2 * margin
  let height = this_info.h0 + 2 * margin
  // Declare the x (horizontal position) scale.
  const x = d3
    .scaleLinear()
    .domain([this_info.x0, this_info.x1])
    .range([margin, width - margin])
  // Declare the y (vertical position) scale.
  const y = d3
    .scaleLinear()
    .domain([this_info.y0, this_info.y1])
    .range([height - margin, margin])

  // Create the SVG container.
  const svg = parent.append("svg").attr("width", width).attr("height", height)
  // Fix for displaying negative ticklabels
  const formatLocale = d3.formatDefaultLocale({
    minus: "-", // Use the regular hyphen-minus
  } as any)
  // Add the x-axis.

  svg
    .append("g") // NOTE: the svg "g" element groups things together.
    .attr("transform", `translate(${0},${margin})`)
    .attr("class", ".mapScale")

    .call(d3.axisBottom(x).ticks(4).tickFormat(formatLocale.format("d")))
  // Add the y-axis.
  svg
    .append("g")
    .attr("transform", `translate(${margin},${0})`)
    .attr("class", ".mapScale")

    .call(d3.axisRight(y).ticks(4).tickFormat(formatLocale.format("d")))
  return svg
}
