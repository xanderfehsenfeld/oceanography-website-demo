"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import { Ticker } from "pixi.js"

import ClientMapView from "@/components/map/client-map-view"
import TimeControls from "@/components/map/time-controls"

// import times from "./wgh0_times.json"
import { IMapDataProps } from "../pugetsound/types"

const initialZoomLevel = 9
const initialLat = 46.725
const initialLong = -124.05

function DriftersPugetSound({
  children,
  times,
  points,
}: { children: ReactNode } & IMapDataProps) {
  const [sliderValue, setSliderValue] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const displayValue = times[sliderValue]

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
          <div className={`flex flex-col gap-2 border bg-background p-4 pb-6`}>
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
