"use client"

import { ComponentProps, ReactNode, useEffect, useRef, useState } from "react"
import { Map } from "leaflet"
import type { Map as MaplibreMap } from "maplibre-gl"
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
import { AttributionControl, MapContainer } from "react-leaflet"
import Control from "react-leaflet-custom-control"

import MapScale from "./map-scale"

import "./map-view.css"

import { Attribution } from "./attribution"
import DeckOverlayComponent from "./deck-overlay-component"
import { MapLibreTileLayer } from "./map-libre-tile-layer"
import { type PixiOverlayComponentProps } from "./pixi-overlay-compat"

// @refresh reset

function MapView({
  initialLong = -122.5,
  initialLat = 48,
  children,
  zoom: initialZoomLevel,
  circles,
  allPoints,
  controls,
  onLoadData,
  frame,
  timeDeltaMS,
  // isPlaying kept for API compatibility but not passed to DeckOverlayComponent
  isPlaying: _isPlaying,
}: {
  initialLat: number
  initialLong: number
  zoom: number
  children?: ReactNode
  controls?: ReactNode
} & PixiOverlayComponentProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const [map, setMap] = useState<Map | null>(null)

  const maplibreMapRef = useRef<MaplibreMap | null>(null)
  const [maplibreReady, setMaplibreReady] = useState(false)

  const [isFullscreen, setIsFullScreen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (map) {
      map.attributionControl.remove()

      setTimeout(() => setIsLoaded(true), 2000)
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

  const handleMapLibreReady = (mlMap: MaplibreMap) => {
    maplibreMapRef.current = mlMap
    // Apply a 45° pitch for the 3D terrain effect
    mlMap.setPitch(45)
    setMaplibreReady(true)
  }

  return (
    <div className="md:h-inherit relative max-h-[80vh] min-h-[80vh] flex-1 md:pl-5">
      {/* Horizontal scale: above the map in normal mode, overlaid in fullscreen */}
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
              onClick={toggleTheme}
              className="h-11 w-11 cursor-pointer"
            >
              <RxSun className="h-[1.1rem] w-[1.1rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <RxMoon className="absolute h-[1.1rem] w-[1.1rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
        </Control>

        {children ||
          (circles.length > 0 &&
            isLoaded &&
            maplibreReady &&
            maplibreMapRef.current && (
              <DeckOverlayComponent
                frame={frame ?? 0}
                timeDeltaMS={timeDeltaMS}
                onLoadData={onLoadData}
                circles={circles}
                allPoints={allPoints ?? []}
                isDark={theme === "dark"}
                maplibreMap={maplibreMapRef.current}
              />
            ))}

        <MapLibreTileLayer
          maxBounds={[
            [51.67131229155612, -117.89978027343751],
            [44.320112128003764, -127.10083007812501],
          ]}
          maxZoom={15}
          minZoom={7}
          attribution=""
          onMapLibreReady={handleMapLibreReady}
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
            <Attribution />
            {controls}
          </Control>
        )}
      </MapContainer>

      {/* Vertical scale: left of the map in normal mode, overlaid in fullscreen */}
      {map && <MapScale isHorizontal={false} map={map} isFullscreen={isFullscreen} />}
    </div>
  )
}

export default MapView
