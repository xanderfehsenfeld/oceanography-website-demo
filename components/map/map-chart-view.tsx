import { ComponentProps, useEffect, useEffectEvent } from "react"
import * as d3 from "d3"

import "./map-chart-view.css"

import { LatLng } from "leaflet"
import { SVGOverlay, useMap } from "react-leaflet"

import MapView from "@/components/map/map-view"

import { getPoints, IFeature, IPoints } from "./getPoints"
import MapScale from "./map-scale"

var map: L.Map

const initialCircleRadius = 3
const defaultZoom = 9

// Use Leaflet to implement a D3 geometric transformation.
// the latLngToLayerPoint is a Leaflet conversion method:
//Returns the map layer point that corresponds to the given geographical
// coordinates (useful for placing overlays on the map).
function projectPoint(this: any, x: number, y: number) {
  var point = map.latLngToLayerPoint(new LatLng(y, x))
  this.stream.point(point.x, point.y)
} //end projectPoint

// this is not needed right now, but for future we may need
// to implement some filtering. This uses the d3 filter function
// featuresdata is an array of point objects

//stream transform. transforms geometry before passing it to
// listener. Can be used in conjunction with d3.geoPath
// to implement the transform.

var transform = d3.geoTransform({
  point: projectPoint,
})

//d3.geoPath translates GeoJSON to SVG path codes.
//essentially a path generator. In this case it's
// a path generator referencing our custom "projection"
// which is the Leaflet method latLngToLayerPoint inside
// our function called projectPoint
var d3path = d3.geoPath().projection(transform)

var svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
var g: d3.Selection<SVGGElement, unknown, null, undefined>
// this is not needed right now, but for future we may need
// to implement some filtering. This uses the d3 filter function
// featuresdata is an array of point objects

// similar to projectPoint this function converts lat/long to
// svg coordinates except that it accepts a point from our
// GeoJSON

let isIn: { [key: string]: boolean } = {}

function applyLatLngToLayer(d: any) {
  var y = d.geometry.coordinates[1]
  var x = d.geometry.coordinates[0]
  return map.latLngToLayerPoint(new LatLng(y, x))
}

var toLine = d3
  .line()
  //.interpolate("linear")
  .x(function (d) {
    return applyLatLngToLayer(d).x
  })
  .y(function (d) {
    return applyLatLngToLayer(d).y
  })

function MapChartView({
  circles,
  lines,
  showAllLines,
  allPoints,
}: {
  circles: IFeature[]
  lines: { [key: string]: IPoints }
  allPoints: IPoints[]
  showAllLines?: boolean
}) {
  const getScaleMultiplier = (): number => {
    if (map) {
      const currentZoomLevel = map?.getZoom() || 1
      const zoomScale = map.getZoomScale(currentZoomLevel, defaultZoom)

      return zoomScale
    } else {
      return 1
    }
  }

  const generateBounds = useEffectEvent(() => {
    const positionsAtTimeZero = allPoints[0]

    const allPointsInOneCollection = allPoints.reduce((previous, current) => {
      previous.features.concat(current.features)

      return {
        ...positionsAtTimeZero,
        features: [...previous.features, ...current.features],
      }
    }, positionsAtTimeZero)
    return d3path.bounds(allPointsInOneCollection)
  })

  const reset = useEffectEvent(() => {
    // For simplicity I hard-coded this! I'm taking
    // the first and the last object (the origin)
    // and destination and adding them separately to
    // better style them. There is probably a better
    // way to do this!
    // var originANDdestination = [featuresdata[0], featuresdata[17]]

    var renderedPoints = g.selectAll("circle")

    const zoomScale = getScaleMultiplier()

    renderedPoints
      .attr("transform", function (d) {
        return (
          "translate(" +
          applyLatLngToLayer(d).x +
          "," +
          applyLatLngToLayer(d).y +
          ")"
        )
      })

      .attr("r", initialCircleRadius * zoomScale)

    var bounds = generateBounds()

    var topLeft = bounds[0],
      bottomRight = bounds[1]

    const leftOffset = 200

    // Setting the size and location of the overall SVG container
    svg
      .attr("width", bottomRight[0] - topLeft[0] + 120)
      .attr("height", bottomRight[1] - topLeft[1] + 120)
      .style("left", topLeft[0] + leftOffset + "px")
      .style("top", topLeft[1] - 50 + "px")

    g.attr(
      "transform",
      "translate(" + (-topLeft[0] - leftOffset) + "," + (-topLeft[1] + 50) + ")"
    )

    var backgroundLines = g.selectAll(".backgroundLineConnect")

    // linePath.attr("d", d3path);
    backgroundLines.attr("d", toLine as any)

    var linePath = g.selectAll(".lineConnect")

    // linePath.attr("d", d3path);
    linePath.attr("d", toLine as any)
  })

  const renderLines = useEffectEvent(
    (data: IFeature[][], className = "lineConnect") => {
      g.selectAll(`.${className}`)
        .data(data)
        .enter()

        .append("path")

        .attr("class", `${className} leaflet-zoom-hide`)
    }
  )

  const renderDrifters = useEffectEvent((data: IFeature[]) => {
    const existingCircles = g.selectAll("circle").data(data)

    existingCircles

      .attr("class", function (data) {
        const isSelected = isIn[data.properties.id]

        return isSelected ? "drifter selected" : "drifter"
      })

      .attr("transform", function (d) {
        return (
          "translate(" +
          applyLatLngToLayer(d).x +
          "," +
          applyLatLngToLayer(d).y +
          ")"
        )
      })
  })

  const handleMapClick = useEffectEvent((e: L.LeafletMouseEvent) => {
    const drifters = circles

    const clickLocation = e.latlng

    let drifterLocation: L.LatLngExpression

    const scaleMultiplier = getScaleMultiplier()

    g.selectAll(".selected").classed("selected", false)

    for (let i = 0; i < drifters.length; i++) {
      const properties = drifters[i].properties
      const { latitude, longitude, id } = properties

      drifterLocation = new LatLng(latitude, longitude)

      const distance = clickLocation.distanceTo(drifterLocation)

      const isSelected = distance < 25000 / scaleMultiplier

      isIn[id] = isSelected
    }

    renderDrifters(drifters)

    return
  })

  const handleDrifterClick = useEffectEvent(function (event: any, d: IFeature) {
    const id = d.properties.id
    isIn = {
      [id]: true,
    }

    event.stopPropagation()

    d3.select(event.target.parentNode).classed("selected", true)

    renderDrifters(circles)
    reset()
  })

  const parentMap = useMap()

  //This effect ideally is called once per page load. This initializes the map and d3
  useEffect(() => {
    map = parentMap

    map.on("click", handleMapClick)
    map.on("zoom", reset)

    // we will be appending the SVG to the Leaflet map pane
    // g (group) element will be inside the svg
    svg = d3.select(map.getPanes().overlayPane).append("svg")

    console.log(map.getPanes())

    // if you don't include the leaflet-zoom-hide when a
    // user zooms in or out you will still see the phantom
    // original SVG
    g = svg.append("g").attr("class", "leaflet-zoom-hide")

    // Here we're creating a FUNCTION to generate a line
    // from input points. Since input points will be in
    // Lat/Long they need to be converted to map units
    // with applyLatLngToLayer
    var toLine = d3
      .line()
      //.interpolate("linear")
      .x(function (d) {
        return applyLatLngToLayer(d).x
      })
      .y(function (d) {
        return applyLatLngToLayer(d).y
      })

    if (showAllLines) {
      renderLines(
        circles.map((v) => lines[v.properties.id].features),
        "backgroundLineConnect"
      )
    }

    // From now on we are essentially appending our features to the
    // group element. We're adding a class with the line name
    // and we're making them invisible

    // these are the points that make up the path
    // they are unnecessary so I've make them
    // transparent for now
    var ptFeatures = g
      .selectAll("circle")
      .data(circles)
      .enter()

      .append("g")
      .attr("class", "drifter-group leaflet-zoom-hide")
      .attr("id", function (e, i) {
        return `drifter-group-${i}`
      })

    ptFeatures

      .append("path")
      .data(circles.map((v) => lines[v.properties.id].features))

      .attr("class", "lineConnect")
      .attr("d", toLine as any)

    const circleObjects = ptFeatures

      .append("circle")
      .attr("r", initialCircleRadius)
      .attr("class", "drifter")

      .attr("id", function (e, i) {
        return i
      })

    circleObjects.on("click", handleDrifterClick)

    reset()

    console.log("mount")
    return () => {
      d3.select(map.getPanes().overlayPane).selectAll("svg").remove()
    }
  }, [])

  useEffect(() => {
    renderDrifters(circles)
  }, [circles])

  return <></>
}

export default MapChartView
