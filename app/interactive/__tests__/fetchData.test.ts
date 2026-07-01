import { describe } from "node:test"

import { expect, test } from "vitest"

import { fetchPoints, fetchTimes } from "../fetchData"

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

describe("fetchTimes", async () => {
  const originalData = (await (
    await fetch("/api/liveocean-web/PS_times.json")
  ).json()) as any
  const fetchedTimes = await fetchTimes("PS_times.json")
  test("interpolates more values", async () => {
    await expect(originalData[0].t).toHaveLength(73)

    expect(fetchedTimes.length).toBeGreaterThan(originalData[0].t.length)
  })
  test("outputs date string", async () => {
    const [firstEntry] = fetchedTimes

    expect(firstEntry).toEqual("Jun 30, 2026, 5:00 PM")
  })
})
