import times from "./PS_times.json"
import tracks from "./PS_tracks.json"

interface Track {
  x: number[]
  y: number[]
}

const tracksTyped = tracks as Track[]

export interface IPoints {
  type: "FeatureCollection"
  features: IFeature[]
}

interface Properties {
  name: string
}

export interface IFeature {
  type: "Feature"
  properties: Properties2
  geometry: Geometry
}

interface Properties2 {
  latitude: number
  longitude: number
  //   time: number
  id: string
  //   name: string
}

interface Geometry {
  type: "Point"

  coordinates: [number, number]
}

export const getTrack = (id: string): IPoints => {
  const points = tracksTyped

  const track = points[parseInt(id)]

  const features: IFeature[] = track.x.map((longitude, index) => {
    const latitude = track.y[index]

    return {
      type: "Feature",
      properties: {
        latitude,
        longitude,
        id: times[0].t[index] + "_" + id,
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

export const getPoints = (): IPoints[] => {
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
