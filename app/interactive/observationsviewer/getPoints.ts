import tracks from "./PS_tracks.json"

interface Track {
  x: number[]
  y: number[]
}

const tracksTyped = tracks as Track[]

interface IPoints {
  type: "FeatureCollection"
  features: Feature[]
}

interface Properties {
  name: string
}

export interface Feature {
  type: "Feature"
  properties: Properties2
  geometry: Geometry
}

interface Properties2 {
  latitude: number
  longitude: number
  //   time: number
  //   id: string
  //   name: string
}

interface Geometry {
  type: "Point"

  coordinates: [number, number]
}

export const getPoints = (): IPoints => {
  const points = tracksTyped

  return {
    type: "FeatureCollection",
    features: points.map(({ x, y }) => {
      const latitude = y[0]
      const longitude = x[0]

      return {
        type: "Feature",
        properties: {
          latitude,
          longitude,
        },
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      }
    }),
  }
}
