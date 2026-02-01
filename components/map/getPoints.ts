import * as d3 from "d3"

interface Track {
  x: number[]
  y: number[]
}

export interface IPoints {
  type: "FeatureCollection"
  features: IFeature[]
}

export interface IFeature {
  type: "Feature"
  properties: IProperties
  geometry: Geometry
}

interface IProperties {
  latitude: number
  longitude: number
  id: string
}

interface Geometry {
  type: "Point"
  coordinates: [number, number]
}

export const getTrack = (
  id: string,
  tracksTyped: Track[],
  times: string[]
): IPoints => {
  const points = tracksTyped

  const track = points[parseInt(id)]

  const features: IFeature[] = track.x.map((longitude, index) => {
    const latitude = track.y[index]

    return {
      type: "Feature",
      properties: {
        latitude,
        longitude,
        id: times[index] + "_" + id,
      },
      geometry: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    }
  })

  return {
    type: "FeatureCollection",
    features,
  }
}

export const getPoints = (tracksTyped: Track[]): IPoints[] => {
  const points = tracksTyped

  return points[0].x.map((_, timeIndex) => {
    return {
      type: "FeatureCollection",
      features: points.map(({ x, y }, id) => {
        const latitude = y[timeIndex]
        const longitude = x[timeIndex]

        return {
          type: "Feature",
          properties: {
            latitude,
            longitude,
            id: id.toString(),
          },
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        }
      }),
    }
  })
}
