"use client"

import { ComponentProps, ReactNode, useEffect, useState } from "react"
import { Map } from "leaflet"

import "leaflet/dist/leaflet.css"

import { useTheme } from "next-themes"
import { MapContainer, TileLayer } from "react-leaflet"
import { FullscreenControl } from "react-leaflet-fullscreen"

import "react-leaflet-fullscreen/styles.css"

import { applyAllPolyfills } from "./leaflet-polyfill"
import MapScale from "./map-scale"
import PixiOverlayComponent from "./pixi-overlay-component"

// import "react-leaflet-fullscreen/styles.css"

const options = {
  position: "topleft", // change the position of the button can be topleft, topright, bottomright or bottomleft, default topleft
  title: "Show me the fullscreen !", // change the title of the button, default Full Screen
  titleCancel: "Exit fullscreen mode", // change the title of the button when fullscreen is on, default Exit Full Screen
  content: null, // change the content of the button, can be HTML, default null
  forceSeparateButton: true, // force separate button to detach from zoom buttons, default false
  forcePseudoFullscreen: true, // force use of pseudo full screen even if full screen API is available, default false
  fullscreenElement: false, // Dom element to render in full screen, false by default, fallback to map._container
}

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
  children,
  zoom: initialZoomLevel,
  circles,
  allPoints,
  showAllLines,
}: {
  initialLat: number
  initialLong: number
  zoom: number
  children?: ReactNode
} & ComponentProps<typeof PixiOverlayComponent>) {
  const { theme } = useTheme()

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
        maxBounds={[
          [51.67131229155612, -117.89978027343751],
          [44.320112128003764, -127.10083007812501],
        ]}
      >
        <FullscreenControl />

        {children || (
          <PixiOverlayComponent
            showAllLines={showAllLines}
            circles={circles}
            allPoints={allPoints}
          />
        )}

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
      </MapContainer>

      {map && <MapScale isHorizontal={false} map={map} />}
    </div>
  )
}

export default MapView
