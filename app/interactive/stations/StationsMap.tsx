"use client"

import { Circle, LeafletMouseEvent, Map, Marker } from "leaflet"

import MapView from "@/components/map/map-view"

import stations from "./stations"

const imagePathPrefix =
  "https://faculty.washington.edu/pmacc/LO/Figs_validation/ctd/"

const onMapClick = (e: LeafletMouseEvent) => {}
const onMapMount = (map: Map) => {
  let marker
  stations.forEach(({ lat, lng, longname, sta }) => {
    marker = new Circle([lat, lng], {
      color: "red",
      fillColor: "#f03",
      fillOpacity: 0.5,
      radius: 500,
    })

    var popupContent =
      `<h3>${longname}</h3>` +
      `<p><img src="${imagePathPrefix}${sta}.png" alt="${longname}" width="100%"/></p>`
    marker.bindTooltip(longname)
    marker.bindPopup(popupContent, {
      autoPan: true,
      maxWidth: 800,
      maxHeight: 800,
      autoPanPadding: [25, 25],
      className: "w-[275px] sm:w-md ",
    })

    marker.addTo(map)
  })
}
const onZoomChange = () => {}

function StationsMap() {
  return (
    <MapView
      initialLat={48}
      initialLong={-123}
      zoom={8}
      onMapMount={onMapMount}
      onMapClick={onMapClick}
      onZoomChange={onZoomChange}
    />
  )
}

export default StationsMap
