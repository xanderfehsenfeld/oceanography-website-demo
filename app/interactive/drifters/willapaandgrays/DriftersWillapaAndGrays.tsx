"use client"

import { ReactNode, useEffect, useState } from "react"
import { Skeleton } from "@radix-ui/themes"
import { Ticker } from "pixi.js"
import useSWR from "swr"

import ClientMapView from "@/components/map/client-map-view"
import TimeControls from "@/components/map/time-controls"

import { fetchPoints, fetchTimes } from "../../fetchData"

const initialZoomLevel = 9
const initialLat = 46.725
const initialLong = -124.05

function DriftersPugetSound({ children }: { children: ReactNode }) {
  const [sliderValue, setSliderValue] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(0)

  const { isLoading: isLoadingTracks, data: points = [] } = useSWR(
    "wgh0_tracks.json",
    () => fetchPoints("wgh0_tracks.json")
  )

  const { isLoading: isLoadingTimes, data: times = [] } = useSWR(
    "wgh0_times.json",
    () => fetchTimes("wgh0_times.json")
  )

  const isLoading = isLoadingTimes || isLoadingTracks

  useEffect(() => {
    if (isLoading) {
      setPlaybackSpeed(0)
      setSliderValue(0)
    } else {
      setPlaybackSpeed(1)
    }
  }, [isLoading])

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
        circles={points[sliderValue]?.features || []}
        allPoints={points}
        showAllLines
        controls={
          <div className={`flex flex-col gap-2 border bg-background p-4 pb-6`}>
            <div className="typography">
              <h3>Time Slider: {displayValue}</h3>
            </div>
            <Skeleton loading={isLoading}>
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
            </Skeleton>
          </div>
        }
      />

      <div className="flex-1 gap-2">{children}</div>
    </div>
  )
}

export default DriftersPugetSound
