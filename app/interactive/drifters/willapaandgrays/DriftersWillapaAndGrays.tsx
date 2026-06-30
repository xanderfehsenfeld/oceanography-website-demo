"use client"

import { ReactNode, useEffect, useState } from "react"
import { Skeleton } from "@radix-ui/themes"
import useSWR, { preload } from "swr"

import ClientMapView from "@/components/map/client-map-view"
import TimeControls from "@/components/map/time-controls"

import { fetchPoints, fetchTimes } from "../../fetchData"
import { IDataFileNames } from "../pugetsound/types"
import { usePlayback } from "../usePlayback"

const initialZoomLevel = 9
const initialLat = 46.725
const initialLong = -124.05

export const dataFilenames: IDataFileNames = {
  tracks: "wgh0_tracks.json",
  times: "wgh0_times.json",
}

preload(dataFilenames.times, fetchTimes)
preload(dataFilenames.tracks, fetchPoints)

function DriftersPugetSound({ children }: { children: ReactNode }) {
  const { isLoading: isLoadingTracks, data: points = [] } = useSWR(
    dataFilenames.tracks,
    fetchPoints
  )

  const { isLoading: isLoadingTimes, data: times = [] } = useSWR(
    dataFilenames.times,
    fetchTimes
  )

  const [playbackSpeed, setPlaybackSpeed] = useState(0)
  const maxSliderValue = points.length - 1

  const [sliderValue, setSliderValue] = usePlayback(
    playbackSpeed,
    maxSliderValue
  )
  const [isLoadingRender, setIsLoadingRender] = useState(true)

  const isLoading = isLoadingTimes || isLoadingTracks || isLoadingRender

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
        onLoadData={() => setIsLoadingRender(false)}
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
