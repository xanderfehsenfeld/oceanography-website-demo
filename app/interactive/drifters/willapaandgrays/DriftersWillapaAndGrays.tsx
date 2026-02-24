"use client"

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"

import ClientMapView from "@/components/map/client-map-view"
import {
  getPoints,
  getTrack,
  IFeature,
  IPoints,
} from "@/components/map/getPoints"
import TimeControls from "@/components/map/time-controls"

import times from "./wgh0_times.json"
import tracks from "./wgh0_tracks.json"

const timeOptions: string[] = times[0].t

const initialZoomLevel = 9
const initialLat = 46.725
const initialLong = -124.05

const points = getPoints(tracks as any)
const lines: { [key: string]: IPoints } = points[0].features.reduce(
  (previous, v: IFeature) => {
    return {
      ...previous,
      [v.properties.id]: getTrack(v.properties.id, tracks as any, times[0].t),
    }
  },
  {}
)

function DriftersPugetSound({ children }: { children: ReactNode }) {
  const [sliderValue, setSliderValue] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const displayValue = useMemo(() => {
    //01/11/2026 - 04PM PST
    const dateString = timeOptions[sliderValue]
      .replace("-", "")
      .replace("PM", ":00 PM")
      .replace("AM", ":00 AM")
      .replace("PST", "")

    return new Intl.DateTimeFormat("en-US", {
      timeStyle: "short",
      dateStyle: "medium",

      timeZone: "PST",
    }).format(new Date(dateString))
  }, [sliderValue])

  const maxSliderValue = points.length - 1
  const increment = useCallback(() => {
    setSliderValue((sliderValue + 1) % maxSliderValue)
  }, [sliderValue])

  useEffect(() => {
    if (playbackSpeed) {
      const timeOut = setTimeout(increment, 50 / playbackSpeed)

      return () => clearTimeout(timeOut)
    }
  }, [playbackSpeed, sliderValue])

  return (
    <div className="gap-4 lg:flex">
      <ClientMapView
        initialLat={initialLat}
        initialLong={initialLong}
        zoom={initialZoomLevel}
        circles={points[sliderValue].features}
        allPoints={points}
        showAllLines
        controls={
          <div className="flex flex-col gap-2 border bg-background p-2">
            <div className="typography">
              <h3>Time Slider: {displayValue}</h3>
            </div>
            <TimeControls
              value={sliderValue}
              onPlaybackChange={setPlaybackSpeed}
              maxSliderValue={maxSliderValue}
              onSliderChange={(v) => {
                setPlaybackSpeed(0)
                setSliderValue(v)
              }}
              playbackSpeed={playbackSpeed}
            />
          </div>
        }
      />

      <div className="flex-1 gap-2">{children}</div>
    </div>
  )
}

export default DriftersPugetSound
