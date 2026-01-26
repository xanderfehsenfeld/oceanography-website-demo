"use client"

import { useEffect } from "react"
import * as d3 from "d3"
import L from "leaflet"

import { Slider } from "@/components/slider"

import marinePolys from "./ne_10m_geography_marine_polys.json"
import times from "./PS_times.json"
import tracks from "./PS_tracks.json"

const tracksArray = tracks as {
  x: number[]
  y: number[]
}[]

const timeValues = times[0].t

console.log(timeValues)

const featuresAtTime = timeValues.map((time, index) => {
  return {
    type: "FeatureCollection",
    properties: { time },
    features: tracksArray.map(({ x, y }) => {
      return {
        type: "Feature",
        properties: {},
        geometry: {
          coordinates: [x[index], y[index]],
          type: "Point",
        },
      }
    }),
  }
})
const allCoordinates = featuresAtTime.reduce((previous, next) => {
  const coordinates = next.features.map(({ geometry }) => {
    return geometry.coordinates
  })

  return [...previous, ...coordinates]
}, [] as number[][])

function deleteAllChildNodes(id: string) {
  const myNode = document.getElementById(id)
  while (myNode?.firstChild && myNode.lastChild) {
    myNode.removeChild(myNode.lastChild)
  }
}

var map: L.Map

//light mode
// L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
// 	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',

interface ISource {
  attribution: string
  url: string
}

const mapSources: { [name: string]: ISource } = {
  voyagerNoLabels: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  darkMatterNoLabels: {
    url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
}

function projectPoint(x: number, y: number) {
  var point = map.latLngToLayerPoint(new L.LatLng(y, x))
  this.stream.point(point.x, point.y)
}

const initializeMap = () => {
  map?.remove()
  deleteAllChildNodes("map")

  map = L.map("map", {
    zoomControl: false,
    maxZoom: 8,
    minZoom: 8,
  }).setView([48, -124], 8)

  L.tileLayer(mapSources.voyagerNoLabels.url, {
    attribution: mapSources.voyagerNoLabels.attribution,
  }).addTo(map)

  map.setMaxBounds(map.getBounds())

  var svg = d3.select(map.getPanes().overlayPane).append("svg")
  const g = svg.append("g").attr("class", "leaflet-zoom-hide")

  const transform = d3.geoTransform({ point: projectPoint })
  const path = d3.geoPath().projection(transform)

  //   circle.attr("cx", (data, index: number) => {
  //   return data[0]
  // })

  // circle.attr("cy", (data: number[], index: number) => {
  //   return data[1]
  // })

  console.log(featuresAtTime[0].features)

  var feature = g
    .selectAll("circle")
    .data(featuresAtTime[0].features)
    .attr("cy", (data, index: number) => {
      return data.geometry.coordinates[1]
    })

    .attr("cx", (data, index: number) => {
      return data.geometry.coordinates[0]
    })

    .attr("r", 50)
    .attr("opacity", 1)
    .style("fill", "blue")
    .enter()
    .append("svg:circle")

  feature.attr("d", path)

  function reset() {
    var bounds = path.bounds(allCoordinates),
      topLeft = bounds[0],
      bottomRight = bounds[1]

    console.log("bounds", topLeft, bottomRight)

    const width = bottomRight[0] - topLeft[0]

    const height = bottomRight[1] - topLeft[1]

    console.log(width, height)

    svg
      .attr("width", bottomRight[0] - topLeft[0])
      .attr("height", bottomRight[1] - topLeft[1])
      .style("left", topLeft[0] + "px")
      .style("top", topLeft[1] + "px")

    g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")")
  }

  // reset()

  // geoJSONLayer.addData(marinePolys)
}

function MapChart() {
  useEffect(initializeMap)

  return (
    <div className="not-prose flex flex-col gap-2">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />{" "}
      <div key={"key"} id="map" className="h-[540px]"></div>
      <link href="/scripts/jspm/style1.css" rel="stylesheet" type="text/css" />
      <Slider
        onChange={(input) => {
          // setSliderValue(input.target.valueAsNumber)//
        }}
        min={0}
        max={16}
        className="slider"
        id="myRange"
      />
    </div>
  )
}

export default MapChart
