"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"

import { usePlayback } from "@/app/interactive/drifters/usePlayback"

import TimeControls from "./map/time-controls"

const durationMultiplier = 100

function Video({
  src,
  ...props
}: React.ComponentProps<"video"> & { width: number; height: number }) {
  const [playbackSpeed, setPlaybackSpeed] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const [duration, setDuration] = useState(0)
  const isLoading = duration === 0

  const [sliderValue, setSliderValue] = usePlayback(
    (playbackSpeed / 20) * durationMultiplier,
    duration * durationMultiplier
  )

  useEffect(() => {
    if (isLoading) {
      setPlaybackSpeed(0)
    } else {
      setPlaybackSpeed(1)
    }
  }, [isLoading])

  // Sync state with video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateDuration = () => setDuration(video.duration)

    // video.addEventListener("play", handlePlay)
    // video.addEventListener("pause", handlePause)
    // video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", updateDuration)

    return () => {
      // video.removeEventListener("play", handlePlay)
      // video.removeEventListener("pause", handlePause)
      video.removeEventListener("loadedmetadata", updateDuration)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (playbackSpeed) {
      video?.play()
    } else {
      video?.pause()
    }
  }, [playbackSpeed])

  const seek = (time: number) => {
    if (videoRef.current) videoRef.current.currentTime = time
  }

  return (
    <div className="flex-col">
      <div className={`relative block h-[70vh]`}>
        <video
          className="not-prose absolute top-0 h-full w-full"
          ref={videoRef}
          loop
          onLoadedMetadata={(e) => {
            console.log(e.target.attributes)
            setDuration(e.target.duration)
          }}
          {...props}
          width={undefined}
          height={undefined}
        >
          <source src={src as string} type="video/mp4" />
        </video>
      </div>
      <TimeControls
        speeds={2}
        playbackSpeed={playbackSpeed}
        isLoading={isLoading}
        value={sliderValue}
        onPlaybackChange={(playbackSpeed) => {
          setPlaybackSpeed(playbackSpeed)
        }}
        maxSliderValue={duration * durationMultiplier}
        onSliderChange={(v) => {
          setPlaybackSpeed(0)
          setSliderValue(v)
          seek(v / durationMultiplier)
        }}
      />
    </div>
  )
}

export { Video }
