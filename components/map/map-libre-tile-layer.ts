import {
  createElementObject,
  createTileLayerComponent,
  updateGridLayer,
  withPane,
  type LayerProps,
} from "@react-leaflet/core"
import L from "leaflet"

import "@maplibre/maplibre-gl-leaflet"

export interface MapLibreTileLayerProps
  extends L.LeafletMaplibreGLOptions, LayerProps {
  url: string
  attribution: string
}

export const MapLibreTileLayer = createTileLayerComponent<
  L.MaplibreGL,
  MapLibreTileLayerProps
>(
  function createTileLayer({ url, attribution, ...options }, context) {
    const layer = L.maplibreGL(
      { style: url, attribution: attribution, noWrap: true },
      // @ts-ignore
      withPane(options, context)
    )
    return createElementObject(layer, context)
  },
  function updateTileLayer(layer, props, prevProps) {
    // @ts-ignore
    updateGridLayer(layer, props, prevProps)

    const { url, attribution } = props
    if (url != null && url !== prevProps.url) {
      layer.getMaplibreMap().setStyle(url)
    }

    if (attribution != null && attribution !== prevProps.attribution) {
      layer.options.attribution = attribution
    }
  }
)
