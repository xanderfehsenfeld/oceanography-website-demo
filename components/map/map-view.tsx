"use client"

import { ReactNode, useEffect, useState } from "react"
import { Map } from "leaflet"
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
import { MapContainer } from "react-leaflet"
import Control from "react-leaflet-custom-control"

import MapScale from "./map-scale"

import "./map-view.css"

import { Attribution } from "./attribution"
import { MapLibreTileLayer } from "./map-libre-tile-layer"

// @refresh reset

interface IMapViewProps {
  initialLat: number
  initialLong: number
  zoom: number
  children?: ReactNode
  controls?: ReactNode
  /** Unused legacy props kept for API compat with StationsMap */
  circles?: unknown[]
  allPoints?: unknown[]
}

function MapView({
  initialLong = -122.5,
  initialLat = 48,
  children,
  zoom: initialZoomLevel,
  controls,
}: IMapViewProps) {
  const { theme, setTheme } = useTheme()
  const [map, setMap] = useState<Map | null>(null)
  const [isFullscreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    if (!map) return
    map.attributionControl.remove()
    map.addControl(new FullScreen())
    const fullscreen = map.fullscreenControl as any
    fullscreen.link?.remove()
    map.on("enterFullscreen", () => setIsFullScreen(true))
    map.on("exitFullscreen", () => setIsFullScreen(false))
  }, [map])

  return (
    <div className="md:h-inherit relative max-h-[80vh] min-h-[80vh] flex-1 md:pl-5">
      {map && <MapScale isHorizontal map={map} isFullscreen={isFullscreen} />}

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
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-11 w-11 cursor-pointer"
            >
              <RxSun className="h-[1.1rem] w-[1.1rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <RxMoon className="absolute h-[1.1rem] w-[1.1rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
        </Control>

        <MapLibreTileLayer
          maxBounds={[
            [51.67131229155612, -117.89978027343751],
            [44.320112128003764, -127.10083007812501],
          ]}
          maxZoom={15}
          minZoom={7}
          attribution=""
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
            onClick={() => map?.toggleFullscreen()}
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
            <Attribution />
            {controls}
          </Control>
        )}

        {children}
      </MapContainer>

      {map && <MapScale isHorizontal={false} map={map} isFullscreen={isFullscreen} />}
    </div>
  )
}

export default MapView
