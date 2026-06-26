"use client"

import * as React from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { usePlayback } from "@/app/interactive/drifters/usePlayback"

import TimeControls from "./map/time-controls"

const durationMultiplier = 100

function Video({
  src,
  ...props
}: React.ComponentProps<"video"> & { width: number; height: number }) {
  const [playbackSpeed, setPlaybackSpeed] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)

  const didAutoPlay = useRef(false)

  const [duration, setDuration] = useState(videoRef.current?.duration || 0)

  const isLoading = duration === 0

  const [sliderValue, setSliderValue] = usePlayback(
    (playbackSpeed / 20) * durationMultiplier,
    duration * durationMultiplier
  )

  useEffect(() => {
    const video = videoRef.current

    if (video && !duration) setDuration(video.duration)
  }, [videoRef.current])

  // Sync state with video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateDuration = () => {
      console.log("loaded metadata")

      setDuration(video.duration)
    }

    video.addEventListener("load", () => {
      console.log("loaded", video.duration)
    })
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
    } else if (!isLoading) {
      video?.pause()
    }
  }, [playbackSpeed])

  const seek = (time: number) => {
    if (videoRef.current) videoRef.current.currentTime = time
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <video
          onPointerOver={() => {
            const video = videoRef.current

            if (!didAutoPlay.current && !playbackSpeed) {
              didAutoPlay.current = true

              video?.play()

              setPlaybackSpeed(1)
            }
          }}
          autoPlay
          className="not-prose max-h-[70vh] w-full cursor-pointer"
          ref={videoRef}
          onClick={() => {
            setPlaybackSpeed(playbackSpeed ? 0 : 1)
          }}
          loop
          onLoadedMetadata={(e) => {
            setDuration(e.target.duration)
            setPlaybackSpeed(1)
          }}
          src={src as string}
        >
          {/* <source src={src as string} type="video/mp4" /> */}
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
