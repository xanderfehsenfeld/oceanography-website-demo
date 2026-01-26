"use client"

import React, { useEffect, useState } from "react"
import * as d3 from "d3"
import L from "leaflet"

import { Slider } from "@/components/slider"

import geography from "./ne_10m_coastline.json"
import marinePolys from "./ne_10m_geography_marine_polys.json"

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json"

let lon0 = -130,
  lon1 = -122,
  lat0 = 42,
  lat1 = 52

// -126, 47

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

  var feature = g
    .selectAll("path")
    .data(marinePolys.features)
    .enter()
    .append("path")

  feature.attr("d", path)

  function reset() {
    var bounds = path.bounds(marinePolys),
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

  reset()

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
