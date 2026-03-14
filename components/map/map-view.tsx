"use client"

import { ComponentProps, ReactNode, useEffect, useState } from "react"
import { Browser, Map } from "leaflet"
import { useTheme } from "next-themes"
import {
  RxEnterFullScreen,
  RxExitFullScreen,
  RxMoon,
  RxSun,
} from "react-icons/rx"

import { Button } from "@/components/ui/button"

import "leaflet/dist/leaflet.css"

// @ts-ignore
import FullScreen from "leaflet.fullscreen"
import { MapContainer, TileLayer } from "react-leaflet"
import Control from "react-leaflet-custom-control"

import MapScale from "./map-scale"
import PixiOverlayComponent from "./pixi-overlay-component"

import "./map-view.css"

import { MapLibreTileLayer } from "./map-libre-tile-layer"

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
  stadiaAlidadeSmoothDark: {
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },

  stadiaAlidadeSmooth: {
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
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
  controls,
}: {
  initialLat: number
  initialLong: number
  zoom: number
  children?: ReactNode
  controls?: ReactNode
} & ComponentProps<typeof PixiOverlayComponent>) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const [map, setMap] = useState<Map | null>(null)

  const [isFullscreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    if (map) {
      map.addControl(new FullScreen())

      const fullscreen = map.fullscreenControl as any
      fullscreen.link?.remove()

      map.on("enterFullscreen", function () {
        setIsFullScreen(true)
      })

      map.on("exitFullscreen", function () {
        setIsFullScreen(false)
      })
    }
  }, [map])

  return (
    <div className="md:h-inherit relative max-h-[80vh] min-h-[80vh] flex-1 md:pl-5">
      {map && <MapScale isHorizontal map={map} />}

      <MapContainer
        center={[initialLat, initialLong]}
        zoom={initialZoomLevel}
        id="map"
        ref={setMap}
        className="not-prose relative z-10 h-full min-h-[80vh] w-full"
        maxZoom={15}
        minZoom={7}
        zoomControl={false}
        maxBounds={[
          [51.67131229155612, -117.89978027343751],
          [44.320112128003764, -127.10083007812501],
        ]}
      >
        <Control prepend position="topright">
          {isFullscreen && (
            <Button
              variant="default"
              size="icon"
              onClick={toggleTheme}
              className="h-11 w-11 cursor-pointer"
            >
              <RxSun className="h-[1.1rem] w-[1.1rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <RxMoon className="absolute h-[1.1rem] w-[1.1rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
        </Control>
        {children || (
          <PixiOverlayComponent
            showAllLines={showAllLines}
            circles={circles}
            allPoints={allPoints}
          />
        )}

        <MapLibreTileLayer
          maxBounds={[
            [51.67131229155612, -117.89978027343751],
            [44.320112128003764, -127.10083007812501],
          ]}
          maxZoom={15}
          minZoom={7}
          attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
          url={
            theme === "dark"
              ? "/data/alidade_smooth.json"
              : "/data/alidade_smooth_light.json"
          }
        />

        <Control prepend position="topleft">
          <Button
            variant="default"
            size="icon"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="h-11 w-11 cursor-pointer"
            onClick={() => {
              map?.toggleFullscreen()
            }}
          >
            {isFullscreen ? (
              <RxExitFullScreen className="h-[1.1rem] w-[1.1rem] scale-100" />
            ) : (
              <RxEnterFullScreen className="h-[1.1rem] w-[1.1rem] scale-100" />
            )}
          </Button>
        </Control>

        {controls && (
          <Control
            container={{ className: "w-full m-0" }}
            prepend
            position="bottomleft"
          >
            {controls}
          </Control>
        )}
      </MapContainer>

      {map && <MapScale isHorizontal={false} map={map} />}
    </div>
  )
}

export default MapView
