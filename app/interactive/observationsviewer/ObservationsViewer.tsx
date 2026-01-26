"use client"

import React from "react"
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  ZoomableGroup,
} from "react-simple-maps"

import geography from "./featureCollection.json"

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json"

let lon0 = -130,
  lon1 = -122,
  lat0 = 42,
  lat1 = 52

// -126, 47

function MapChart() {
  return (
    <ComposableMap
      width={800}
      height={800}
      projection="geoAzimuthalEqualArea"
      projectionConfig={{
        rotate: [124, -47, 0],
        // center: [-126, 47],
        scale: 20000,
      }}
    >
      <Graticule stroke="#F53" />

      <Geographies geography={geography}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography key={geo.rsmKey} geography={geo} />
          ))
        }
      </Geographies>
    </ComposableMap>
  )
}

export default MapChart
