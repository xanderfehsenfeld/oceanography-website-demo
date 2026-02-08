"use client"

import {
  ReactNode,
  Ref,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react"
import { LeafletEvent, LeafletMouseEvent, Map, MapOptions } from "leaflet"

import "leaflet/dist/leaflet.css"

import { useTheme } from "next-themes"
import { MapContainer, SVGOverlay, TileLayer } from "react-leaflet"

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

  zoom: initialZoomLevel,
  children,
}: {
  initialLat: number
  initialLong: number
  zoom: number

  children?: ReactNode
}) {
  const { theme } = useTheme()

  //This effect ideally is called once per page load. This initializes the map and d3
  // useEffect(() => {
  //   leafletMapRef.current?.remove()

  //   // // Add the polyfills
  //   applyAllPolyfills()

  //   leafletMapRef.current = new Map(ref.current as any, {
  //     zoomControl: false,
  //     maxZoom: 15,
  //     minZoom: 7,

  //     ...options,
  //   }).setView([initialLat, initialLong], initialZoomLevel)

  //   const leafletMap = leafletMapRef.current

  //   const bounds = leafletMap.getBounds()

  //   leafletMap.setMaxBounds(bounds.pad(2))

  //   onMapMount(leafletMap)

  //   leafletMap.on("click", onMapClick)

  //   // when the user zooms in or out you need to reset
  //   // the view
  //   leafletMap.on("zoom", onZoomChange)
  //   leafletMap.on("move", updateMapViewBounds)

  //   // this puts stuff on the map!
  //   onZoomChange()
  //   // transition()
  // }, [])

  const [map, setMap] = useState<Map | null>(null)

  return (
    <div className="md:h-inherit relative max-h-[80vh] min-h-[60vh] flex-1 md:pl-5">
      {map && <MapScale isHorizontal map={map} />}

      <MapContainer
        center={[initialLat, initialLong]}
        zoom={initialZoomLevel}
        id="map"
        ref={setMap}
        className="not-prose relative z-10 h-full min-h-[60vh] w-full"
        maxZoom={15}
        minZoom={7}
        zoomControl={false}
      >
        <TileLayer
          attribution={
            theme === "dark"
              ? mapSources.darkMatterNoLabels.attribution
              : mapSources.voyagerNoLabels.attribution
          }
          url={
            theme === "dark"
              ? mapSources.darkMatterNoLabels.url
              : mapSources.voyagerNoLabels.url
          }
        />
        {children}
      </MapContainer>

      {map && <MapScale isHorizontal={false} map={map} />}
    </div>
  )
}

export default MapView
