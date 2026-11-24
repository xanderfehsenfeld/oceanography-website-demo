import { Dispatch, SetStateAction, useEffect, useState } from "react"

const BASE_FRAME_MS = 50

export const usePlayback = (
  playbackSpeed: number,
  maxSliderValue: number,
  speedMultiplier: number = 1
) => {
  const [sliderValue, setSliderValue] = useState(0)

  useEffect(() => {
    if (playbackSpeed === 0) return

    const frameLength = BASE_FRAME_MS / (playbackSpeed * speedMultiplier)
    const start = Date.now()
    let initialFrame = sliderValue
    let rafId: number

    const tick = () => {
      const elapsed = Date.now() - start
      const frameNumber = Math.floor(elapsed / frameLength) + initialFrame
      const nextSliderValue = frameNumber % maxSliderValue

      setSliderValue((prev) => {
        if (nextSliderValue !== prev) return nextSliderValue
        return prev
      })

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [playbackSpeed])

  return [sliderValue, setSliderValue] as [
    number,
    Dispatch<SetStateAction<number>>,
  ]
}
