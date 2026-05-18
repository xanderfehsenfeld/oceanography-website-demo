"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import { Skeleton } from "@radix-ui/themes"
import { Ticker } from "pixi.js"
import useSWR from "swr"

import ClientMapView from "@/components/map/client-map-view"
import TimeControls from "@/components/map/time-controls"

import { fetchPoints, fetchTimes } from "../../fetchData"
import { IDataFileNames, IMapDataProps } from "../pugetsound/types"
import { usePlayback } from "../usePlayback"

const initialZoomLevel = 9
const initialLat = 46.725
const initialLong = -124.05

export const dataFilenames: IDataFileNames = {
  tracks: "willapa25_tracks.json",
  times: "willapa25_times.json",
}

function DriftersPugetSound({ children }: { children: ReactNode }) {
  const [playbackSpeed, setPlaybackSpeed] = useState(0)

  const { isLoading: isLoadingTracks, data: points = [] } = useSWR(
    dataFilenames.tracks,
    fetchPoints
  )

  const { isLoading: isLoadingTimes, data: times = [] } = useSWR(
    dataFilenames.times,
    fetchTimes
  )
  const maxSliderValue = points.length - 1
  const [sliderValue, setSliderValue] = usePlayback(
    playbackSpeed,
    maxSliderValue
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
              <Skeleton loading={isLoading}>
                <h3>Time Slider: {displayValue}</h3>
              </Skeleton>
            </div>
            <TimeControls
              isLoading={isLoading}
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
