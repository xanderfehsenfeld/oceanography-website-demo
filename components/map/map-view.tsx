"use client"

import { useEffect, useRef } from "react"
import { Control, LeafletMouseEvent, Map, MapOptions, TileLayer } from "leaflet"
import { useTheme } from "next-themes"

var leafletMap: Map

const mapSources = {
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

function MapView({
  initialLong = -122.5,
  initialLat = 48,
  options = {},
  onMapMount,
  onMapClick,
  onZoomChange,
  zoom: initialZoomLevel,
}: {
  initialLat: number
  initialLong: number
  zoom: number
  onZoomChange: () => void
  options?: MapOptions
  onMapClick: (e: LeafletMouseEvent) => void
  onMapMount: (map: Map) => void
}) {
  const { theme } = useTheme()

  const ref = useRef<HTMLDivElement>(null)

  //This effect ideally is called once per page load. This initializes the map and d3
  useEffect(() => {
    leafletMap?.remove()

    leafletMap = new Map(ref.current as any, {
      zoomControl: false,
      maxZoom: 15,
      minZoom: 7,

      ...options,
    }).setView([initialLat, initialLong], initialZoomLevel)

    const bounds = leafletMap.getBounds()

    leafletMap.setMaxBounds(bounds.pad(2))
    leafletMap.addControl(new Control.Scale())

    onMapMount(leafletMap)

    leafletMap.on("click", onMapClick)

    // when the user zooms in or out you need to reset
    // the view
    leafletMap.on("zoom", onZoomChange)

    // this puts stuff on the map!
    onZoomChange()
    // transition()
  }, [])

  useEffect(() => {
    const tileset =
      theme === "dark"
        ? mapSources.darkMatterNoLabels
        : mapSources.voyagerNoLabels

    new TileLayer(tileset.url, {
      attribution: tileset.attribution,
    }).addTo(leafletMap)
  }, [theme])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div
        className="not-prose z-10 min-h-[60vh] flex-1 md:h-[70vh]"
        id="map"
        ref={ref}
      ></div>
    </>
  )
}

export default MapView
