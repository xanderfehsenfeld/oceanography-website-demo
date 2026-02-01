"use client"

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { SegmentedControl, Slider } from "@radix-ui/themes/dist/cjs/components"
import { FaFastForward, FaPause, FaPlay } from "react-icons/fa"

import {
  getPoints,
  getTrack,
  IFeature,
  IPoints,
} from "@/components/map/getPoints"
import MapChartView from "@/components/map/map-chart-view"
import TimeControls from "@/components/map/time-controls"

import times from "./PS_times.json"
import tracks from "./PS_tracks.json"

const timeOptions: string[] = times[0].t

const initialZoomLevel = 8
const initialLat = 48
const initialLong = -122.5

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
    <div className="gap-4 sm:flex">
      <MapChartView
        circles={points[sliderValue].features}
        allPoints={points}
        lines={lines}
        initialLat={initialLat}
        initialLong={initialLong}
        zoom={initialZoomLevel}
      />
      <div className="flex-1 gap-2">
        <div className={"w-full"}>
          <p>
            Time Slider: <span id="demo">{displayValue}</span>
          </p>
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

        {children}
      </div>
    </div>
  )
}

export default DriftersPugetSound
