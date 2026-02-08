"use client"

import { CircleMarker, Popup, Tooltip } from "react-leaflet"

import MapView from "@/components/map/map-view"

import stations from "./stations"

const imagePathPrefix =
  "https://faculty.washington.edu/pmacc/LO/Figs_validation/ctd/"

function StationsMap() {
  return (
    <MapView initialLat={48} initialLong={-123} zoom={8}>
      {stations.map(({ lat, lng, longname, sta }) => {
        return (
          <CircleMarker
            key={sta}
            color="red"
            fillColor="#f03"
            fillOpacity={0.5}
            radius={5}
            center={[lat, lng]}
          >
            <Popup
              autoPan
              maxHeight={800}
              maxWidth={800}
              autoPanPadding={[25, 25]}
              className="w-[275px] sm:w-md"
            >
              <h3>{longname}</h3>
              <p>
                <img
                  src={`${imagePathPrefix}${sta}.png`}
                  alt={longname}
                  width="100%"
                />
              </p>
            </Popup>
            <Tooltip content={longname} />
          </CircleMarker>
        )
      })}
    </MapView>
  )
}

export default StationsMap
