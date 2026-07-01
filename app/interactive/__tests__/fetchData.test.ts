import { describe } from "node:test"

import { expect, test } from "vitest"

import { fetchPoints } from "../fetchData"

describe("fetchData", async () => {
  test("interpolates more data", async () => {
    const originalData = (await (
      await fetch("/api/liveocean-web/PS_tracks.json")
    ).json()) as any

    await expect(originalData[0].x).toHaveLength(73)

    const fetchedPoints = await fetchPoints("PS_tracks.json")

    expect(fetchedPoints.length).toBeGreaterThan(originalData[0].x.length)
  })
})
