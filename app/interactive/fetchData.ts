"use client"

import { IPointData } from "pixi.js"

import {
  IMapDataProps,
  TimesData,
  TimesResponse,
} from "./drifters/pugetsound/types"
import { interpolatePoints } from "./interpolate"
import { interpolateDateSegments } from "./interpolateDates"

export interface Track {
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

export const getPoints = (tracksTyped: Track[]): IPoints[] => {
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

interface ILiveoceanDataEndpointResponse {
  name: string
  date_of_query: string
  drifters_forecast: Track[]
  tracks_filename: string
  times: TimesData[]
}

export const fetchData = async (
  tracksFilename: string,
  timesFilename: string
): Promise<IMapDataProps> => {
  const liveOceanResponse = await fetch(
    `/api/forecast/drifters/${tracksFilename}-${timesFilename}`
  )
  const { drifters_forecast: driftersForecast, times } =
    (await liveOceanResponse.json()) as ILiveoceanDataEndpointResponse

  // If service workers are available, offload interpolation to the worker for
  // better main-thread performance. Falls back to existing in-thread logic.
  if (typeof window !== "undefined" && 'serviceWorker' in navigator) {
    try {
      // Register the service worker (no-op if already registered) and wait until active
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready

      const sw = registration.active || registration.waiting || registration.installing;

      if (sw && sw.postMessage) {
        const channel = new MessageChannel()
        const resultPromise: Promise<any> = new Promise((resolve, reject) => {
          channel.port1.onmessage = (ev) => {
            const payload = ev.data
            if (payload && payload.error) reject(new Error(payload.error))
            else resolve(payload)
          }
          channel.port1.onmessageerror = (err) => reject(err)
        })

        // send raw times array (worker will parse/format them)
        const timesArray = (times && times[0] && times[0].t) || []

        sw.postMessage({ type: 'interpolate', driftersForecast, times: timesArray }, [channel.port2])

        const workerResult = await resultPromise
        // Expect { points, times }
        if (workerResult && workerResult.points && workerResult.times) {
          return { points: workerResult.points, times: workerResult.times }
        }
      }
    } catch (err) {
      // On any worker error, fall through to client-side interpolation
      console.warn('Service worker interpolation failed, falling back:', err)
    }
  }

  // Fallback: perform interpolation on the main thread (original behavior)
  const dateTimes = times[0].t.map((timeString) => {
    const dateString = timeString
      .replace("-", "")
      .replace("PM", ":00 PM")
      .replace("AM", ":00 AM")
      .replace("PST", "")

    return new Date(dateString)
  })

  const interpolatedTimes = interpolateDateSegments(dateTimes).map((date) =>
    new Intl.DateTimeFormat("en-US", {
      timeStyle: "short",
      dateStyle: "medium",

      timeZone: "America/Los_Angeles",
    }).format(date)
  )

  return {
    points: getPoints(driftersForecast),
    times: interpolatedTimes,
  }
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
