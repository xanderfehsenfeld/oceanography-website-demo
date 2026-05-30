import { beforeEach, describe } from "node:test"

import { render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"

import { fetchPoints, fetchTimes } from "@/app/interactive/fetchData"

import DriftersPugetSound from "../DriftersPugetSound"

vi.mock(import("@/app/interactive/fetchData"), () => ({
  fetchPoints: vi.fn(),
  fetchTimes: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(fetchPoints).mockReturnValue(
    Promise.resolve([{ type: "FeatureCollection", features: [] }])
  )
  vi.mocked(fetchTimes).mockReturnValue(Promise.resolve(["time"]))
})

describe("DriftersPugetSound", () => {
  render(<DriftersPugetSound>test</DriftersPugetSound>)
  test("renders children", () => {
    expect(screen.getByText("test")).toBeDefined()
  })
})
