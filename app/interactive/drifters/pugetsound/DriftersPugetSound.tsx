"use client"

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { SegmentedControl, Slider } from "@radix-ui/themes/dist/cjs/components"
import { FaFastForward, FaPause, FaPlay } from "react-icons/fa"

import { getPoints, getTrack, IFeature, IPoints } from "./getPoints"
import times from "./PS_times.json"

import "./DriftersPugetSound.css"

import MapChartView from "@/components/map/map-chart-view"

const timeOptions: string[] = times[0].t

const initialZoomLevel = 9
const initialLat = 48
const initialLong = -122.5

const points = getPoints()
const lines: { [key: string]: IPoints } = points[0].features.reduce(
  (previous, v: IFeature) => {
    return {
      ...previous,
      [v.properties.id]: getTrack(v.properties.id),
    }
  },
  {}
)

function MapChart({ children }: { children: ReactNode }) {
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
        <div className="flex w-full items-center gap-4">
          <SegmentedControl.Root
            className="cursor-pointer"
            defaultValue="1"
            value={playbackSpeed.toString()}
            size={"3"}
          >
            <SegmentedControl.Item
              className="h-9 w-9 cursor-pointer"
              onClick={() => setPlaybackSpeed(0)}
              value="0"
            >
              <FaPause />{" "}
            </SegmentedControl.Item>
            <SegmentedControl.Item
              className="h-9 w-9 cursor-pointer"
              onClick={() => {
                setPlaybackSpeed(1)
              }}
              value="1"
            >
              <FaPlay />
            </SegmentedControl.Item>
            <SegmentedControl.Item
              className="h-9 w-9 cursor-pointer"
              value="2"
              onClick={() => {
                setPlaybackSpeed(2)
              }}
            >
              <FaFastForward />
            </SegmentedControl.Item>
          </SegmentedControl.Root>

          <Slider
            size={"3"}
            className="cursor-grab"
            onValueChange={(v) => {
              setPlaybackSpeed(0)

              const value = v[0]
              setSliderValue(value)
            }}
            value={[sliderValue]}
            min={0}
            max={maxSliderValue}
            id="myRange"
          />
        </div>

        {children}
      </div>
    </div>
  )
}

export default MapChart
