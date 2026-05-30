import { debug } from "node:console"
import { describe } from "node:test"

import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, test, vi } from "vitest"

import { usePlayback } from "../usePlayback"

describe("usePlayback", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("With playback speed 0", () => {
    it("Returns same value after interval", () => {
      const hookResult = renderHook(() => usePlayback(0, 10))

      vi.advanceTimersByTime(500)

      hookResult.rerender()
      const [sliderValue] = hookResult.result.current

      debug(sliderValue)
      expect(sliderValue).toEqual(0)
    })

    it("Allows setting sliderValue", () => {
      const hookResult = renderHook(() => usePlayback(0, 10))

      const [, setSliderValue] = hookResult.result.current
      setSliderValue(2)

      hookResult.rerender()

      expect(hookResult.result.current[0]).toEqual(2)
    })
  })

  describe("With playback speed greater than 0", () => {
    it("Initally returns sliderValue 0", () => {
      renderHook(() => {
        const [sliderValue] = usePlayback(1, 10)

        expect(sliderValue).toEqual(0)
      })
    })

    it("Returns a higher slider value after interval", () => {
      const hookResult = renderHook(() => usePlayback(1, 10))

      vi.advanceTimersByTime(500)

      hookResult.rerender()
      const [sliderValue] = hookResult.result.current

      debug(sliderValue)
      expect(sliderValue).toBeGreaterThan(0)
    })

    it("Advances more quickly at higher playback speed", () => {
      const slowPlayback = renderHook(() => usePlayback(1, 100))
      const fastPlayback = renderHook(() => usePlayback(2, 100))

      vi.advanceTimersByTime(1000)

      slowPlayback.rerender()
      fastPlayback.rerender()
      const [slowSliderValue] = slowPlayback.result.current
      const [fastSliderValue] = fastPlayback.result.current
      expect(slowSliderValue).toBeLessThan(fastSliderValue)
    })
  })
})
