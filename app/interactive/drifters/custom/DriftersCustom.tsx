"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import { Ticker } from "pixi.js"

import ClientMapView from "@/components/map/client-map-view"
import { getPoints } from "@/components/map/getPoints"
import TimeControls from "@/components/map/time-controls"

import times from "./willapa25_times.json"
import tracks from "./willapa25_tracks.json"

const timeOptions: string[] = times[0].t

const initialZoomLevel = 9
const initialLat = 46.725
const initialLong = -124.05

const points = getPoints(tracks as any)

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
  useEffect(() => {
    const ticker = new Ticker()
    const start = Date.now()

    const frameLength = 50 / playbackSpeed
    const initialFrame = sliderValue
    const setNextFrame = () => {
      const elapsed = Date.now() - start
      const frameNumber = Math.floor(elapsed / frameLength) + initialFrame

      const nextSliderValue = frameNumber % maxSliderValue

      if (nextSliderValue !== sliderValue) setSliderValue(nextSliderValue)
    }

    if (playbackSpeed === 0) {
    } else {
      ticker.add(setNextFrame)
      ticker.maxFPS = 1000 / frameLength
      ticker.start()
    }

    return () => {
      ticker.stop()
      ticker.destroy()
    }
  }, [playbackSpeed])

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
          <div className={`flex flex-col gap-2 border bg-background p-2 pb-6`}>
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
