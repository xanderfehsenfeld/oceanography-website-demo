"use client"

import { ReactNode, useEffect, useEffectEvent, useRef, useState } from "react"
import {
  LeafletEvent,
  LeafletMouseEvent,
  Map,
  MapOptions,
  TileLayer,
} from "leaflet"
import { useTheme } from "next-themes"

import { applyAllPolyfills } from "./leaflet-polyfill"
import MapScale from "./map-scale"

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

  const leafletMapRef = useRef<Map>(null)

  const [{ top, bottom }, setVerticalView] = useState({ top: 100, bottom: 0 })
  const [{ left, right }, setHorizontalView] = useState({ left: 100, right: 0 })

  const updateMapViewBounds = useEffectEvent((event: LeafletEvent) => {
    console.log(event.sourceTarget)

    if (leafletMapRef.current) {
      const bounds = leafletMapRef.current.getBounds()

      setHorizontalView({ left: bounds.getWest(), right: bounds.getEast() })

      setVerticalView({ top: bounds.getNorth(), bottom: bounds.getSouth() })
    }
  })

  //This effect ideally is called once per page load. This initializes the map and d3
  useEffect(() => {
    leafletMapRef.current?.remove()

    // // Add the polyfills
    applyAllPolyfills()

    leafletMapRef.current = new Map(ref.current as any, {
      zoomControl: false,
      maxZoom: 15,
      minZoom: 7,

      ...options,
    }).setView([initialLat, initialLong], initialZoomLevel)

    const leafletMap = leafletMapRef.current

    const bounds = leafletMap.getBounds()

    leafletMap.setMaxBounds(bounds.pad(2))

    onMapMount(leafletMap)

    leafletMap.on("click", onMapClick)

    // when the user zooms in or out you need to reset
    // the view
    leafletMap.on("zoom", onZoomChange)
    leafletMap.on("move", updateMapViewBounds)

    // this puts stuff on the map!
    onZoomChange()
    // transition()
  }, [])

  useEffect(() => {
    const tileset =
      theme === "dark"
        ? mapSources.darkMatterNoLabels
        : mapSources.voyagerNoLabels

    if (leafletMapRef.current)
      new TileLayer(tileset.url, {
        attribution: tileset.attribution,
      }).addTo(leafletMapRef.current)
  }, [theme])

  return (
    <div className="md:h-inherit max-h-[80vh] min-h-[60vh] flex-1">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <MapScale isHorizontal min={left} max={right} />

      <div
        className="not-prose z-10 min-h-[60vh] w-full md:h-full"
        id="map"
        ref={ref}
      ></div>
    </div>
  )
}

export default MapView
