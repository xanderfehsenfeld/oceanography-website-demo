import { Map as LeafletMap } from "leaflet"

/**
 * Convert a PIXI projected pixel coordinate (at the fixed zoom=11 projection
 * basis used throughout this app) back to a geographic [lat, lng] pair.
 *
 * The PIXI overlay projects all coordinates at zoom level 11. To reverse that
 * we use Leaflet's `unproject` at the same zoom.
 */
export function pixelToLatLng(
  map: LeafletMap,
  pixelPoint: { x: number; y: number }
): { lat: number; lng: number } {
  const PROJECTION_ZOOM = 11
  const latlng = map.unproject([pixelPoint.x, pixelPoint.y], PROJECTION_ZOOM)
  return { lat: latlng.lat, lng: latlng.lng }
}

/**
 * Given a reticule's PIXI pixel centre and its pixel radius (scale * 500, the
 * base circle radius used in Reticule), return the radius in miles.
 *
 * We pick a point directly "east" (same latitude) at `pixelRadius` pixels
 * away and compute the Haversine distance between the two geographic points.
 */
export function getReticuleRadiusInMiles(
  map: LeafletMap,
  centre: { x: number; y: number },
  pixelRadius: number
): number {
  const centreLatLng = pixelToLatLng(map, centre)
  const edgeLatLng = pixelToLatLng(map, {
    x: centre.x + pixelRadius,
    y: centre.y,
  })
  return getDistanceInMiles(
    [centreLatLng.lat, centreLatLng.lng],
    [edgeLatLng.lat, edgeLatLng.lng]
  )
}

export function getDistanceInMiles(
  pointA: [number, number],
  pointB: [number, number]
) {
  const [lat1, lon1] = pointA

  const [lat2, lon2] = pointB
  // Radius of the Earth in miles
  const R = 3958.8

  // Convert degrees to radians
  const toRad = (value: number) => (value * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const radLat1 = toRad(lat1)
  const radLat2 = toRad(lat2)

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  // Distance in miles
  return R * c
}
