import { beforeEach, describe } from "node:test"

import { render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"

import { fetchData, fetchPoints, fetchTimes } from "@/app/interactive/fetchData"

import DriftersPugetSound from "../DriftersPugetSound"

vi.mock(import("@/app/interactive/fetchData"), () => ({
  fetchPoints: vi.fn(),
  fetchTimes: vi.fn(),
  fetchData: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(fetchPoints).mockReturnValue(
    Promise.resolve([{ type: "FeatureCollection", features: [] }])
  )
  vi.mocked(fetchTimes).mockReturnValue(Promise.resolve(["time"]))

  vi.mocked(fetchData).mockReturnValue(
    Promise.resolve({
      times: ["time"],
      points: [{ type: "FeatureCollection", features: [] }],
    })
  )
})

describe("DriftersPugetSound", () => {
  render(<DriftersPugetSound>test</DriftersPugetSound>)
  test("renders children", () => {
    expect(screen.getByText("test")).toBeDefined()
  })

  test("fetches data", () => {
    expect(fetchData).toHaveBeenCalled()

    expect(fetchData).toHaveBeenCalledWith("PS_tracks.json", "PS_times.json")
  })
})
