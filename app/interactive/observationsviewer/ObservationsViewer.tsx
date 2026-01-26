"use client"

import React, { useEffect } from "react"
import L from "leaflet"

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
const initializeMap = () => {
  map?.remove()
  deleteAllChildNodes("map")

  map = L.map("map").setView([48, -124], 7)

  L.tileLayer(mapSources.darkMatterNoLabels.url, {
    attribution: mapSources.darkMatterNoLabels.attribution,
    maxZoom: 10,
    minZoom: 7,
  }).addTo(map)

  const geoJSONLayer = L.geoJSON().addTo(map)

  map.setMaxBounds(map.getBounds())

  // geoJSONLayer.addData(marinePolys)
}

function MapChart() {
  useEffect(initializeMap)
  return (
    <div className="not-prose">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />{" "}
      <div id="map" className="h-[360px]"></div>
    </div>
  )
}

export default MapChart
