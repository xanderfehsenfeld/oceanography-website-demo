"use client"

import { IPointData } from "pixi.js"

import { TimesResponse } from "./drifters/pugetsound/types"
import { interpolatePoints } from "./interpolate"
import { interpolateDateSegments } from "./interpolateDates"

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

  const pointsInterpolated = points.map(({ x, y }) => {
    const pointsTyped: IPointData[] = x.map((xValue, i) => ({
      x: xValue,
      y: y[i],
    }))

    const interpolated = interpolatePoints(pointsTyped)

    return interpolated
  })

  return pointsInterpolated[0].map((_, timeIndex) => {
    return {
      type: "FeatureCollection",
      features: pointsInterpolated.map((line, id) => {
        const latitude = line[timeIndex].y
        const longitude = line[timeIndex].x

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

const baseUrl = "/api/liveocean-web/"

export const fetchPoints = async (filename: string) => {
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

  const dateTimes = times[0].t.map((timeString) => {
    //01/11/2026 - 04PM PST
    const dateString = timeString
      .replace("-", "")
      .replace("PM", ":00 PM")
      .replace("AM", ":00 AM")
      .replace("PST", "")

    return new Date(dateString)
  })

  return interpolateDateSegments(dateTimes).map((date) =>
    new Intl.DateTimeFormat("en-US", {
      timeStyle: "short",
      dateStyle: "medium",

      timeZone: "America/Los_Angeles",
    }).format(date)
  )
}
