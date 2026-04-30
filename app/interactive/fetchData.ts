"use server"

import { TimesResponse } from "./drifters/pugetsound/types"

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

const getPoints = (tracksTyped: Track[]): IPoints[] => {
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

const baseUrl = "https://s3.kopah.uw.edu/liveocean-web/"

export const fetchPoints = async (filename: string) => {
  console.log("fetch points hit")

  const tracksResponse = await fetch(`${baseUrl}${filename}`, {
    cache: "force-cache",
    next: { revalidate: 3600 },
  })

  const points = getPoints(await tracksResponse.json())

  return points
}

export const fetchTimes = async (filename: string): Promise<string[]> => {
  const timesResponse = await fetch(`${baseUrl}${filename}`, {
    cache: "force-cache",
    next: { revalidate: 3600 },
  })

  const times: TimesResponse = await timesResponse.json()

  return times[0].t.map((timeString) => {
    //01/11/2026 - 04PM PST
    const dateString = timeString
      .replace("-", "")
      .replace("PM", ":00 PM")
      .replace("AM", ":00 AM")
      .replace("PST", "")

    return new Intl.DateTimeFormat("en-US", {
      timeStyle: "short",
      dateStyle: "medium",

      timeZone: "America/Los_Angeles",
    }).format(new Date(dateString))
  })
}
