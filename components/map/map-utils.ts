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
