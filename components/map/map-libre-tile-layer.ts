import {
  createElementObject,
  createTileLayerComponent,
  updateGridLayer,
  withPane,
  type LayerProps,
} from "@react-leaflet/core"
import L from "leaflet"
import type { Map as MaplibreMap } from "maplibre-gl"

import "@maplibre/maplibre-gl-leaflet"

export interface MapLibreTileLayerProps
  extends L.LeafletMaplibreGLOptions, LayerProps {
  url: string
  attribution: string
  onMapLibreReady?: (map: MaplibreMap) => void
}

export const MapLibreTileLayer = createTileLayerComponent<
  L.MaplibreGL,
  MapLibreTileLayerProps
>(
  function createTileLayer({ url, attribution, onMapLibreReady, ...options }, context) {
    const layer = L.maplibreGL(
      { style: url, attribution: attribution, noWrap: true },
      // @ts-ignore
      withPane(options, context)
    )

    // Store the callback on the instance so updateTileLayer can keep it fresh.
    ;(layer as any)._onMapLibreReady = onMapLibreReady

    // `onAdd` is called by Leaflet when the layer is added to the map.
    // We wrap it to hook into the MapLibre map's 'load' event once it exists.
    const originalOnAdd = layer.onAdd.bind(layer)
    layer.onAdd = function (leafletMap: L.Map) {
      originalOnAdd(leafletMap)
      // After onAdd, _glMap is initialised by _initGL()
      const mlMap = layer.getMaplibreMap() as unknown as MaplibreMap

      const notify = () => {
        const cb = (layer as any)._onMapLibreReady
        if (cb) cb(mlMap)
      }

      if (mlMap.loaded()) {
        // Style already loaded (e.g. hot-reload)
        notify()
      } else {
        mlMap.once("load", notify)
      }

      return this
    }

    return createElementObject(layer, context)
  },
  function updateTileLayer(layer, props, prevProps) {
    // @ts-ignore
    updateGridLayer(layer, props, prevProps)

    // Keep the callback reference fresh so the closure captures latest state
    if (props.onMapLibreReady !== prevProps.onMapLibreReady) {
      ;(layer as any)._onMapLibreReady = props.onMapLibreReady
    }

    const { url, attribution } = props
    if (url != null && url !== prevProps.url) {
      layer.getMaplibreMap().setStyle(url)
    }

    if (attribution != null && attribution !== prevProps.attribution) {
      // @ts-ignore
      layer.options.attribution = attribution
    }
  }
)
