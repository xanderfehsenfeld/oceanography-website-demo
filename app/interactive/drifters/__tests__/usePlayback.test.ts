import { describe } from "node:test"

import { renderHook } from "@testing-library/react"
import { expect, test } from "vitest"

import { usePlayback } from "../usePlayback"

describe("usePlayback", () => {
  test("begins at 0", () => {
    renderHook(() => {
      const [sliderValue, setSliderValue] = usePlayback(1, 10)

      expect(sliderValue).toEqual(0)
    })
  })
})
