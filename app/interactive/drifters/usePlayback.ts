import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Ticker } from "pixi.js"

const BASE_FRAME_MS = 50

export const usePlayback = (playbackSpeed: number, maxSliderValue: number) => {
  const [sliderValue, setSliderValue] = useState(0)

  useEffect(() => {
    const ticker = new Ticker()
    const start = Date.now()

    const frameLength = BASE_FRAME_MS / playbackSpeed
    const initialFrame = sliderValue
    const setNextFrame = () => {
      const elapsed = Date.now() - start
      const frameNumber = Math.floor(elapsed / frameLength) + initialFrame

      const nextSliderValue = frameNumber % maxSliderValue

      if (nextSliderValue !== sliderValue) setSliderValue(nextSliderValue)
    }

    if (playbackSpeed !== 0) {
      ticker.add(setNextFrame)
      ticker.maxFPS = 1000 / frameLength
      ticker.start()
    }

    return () => {
      ticker.stop()
      ticker.destroy()
    }
  }, [playbackSpeed])

  return [sliderValue, setSliderValue] as [
    number,
    Dispatch<SetStateAction<number>>,
  ]
}
