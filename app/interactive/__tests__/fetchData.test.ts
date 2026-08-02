import { http, HttpResponse } from "msw"
// src/mocks/node.ts
import { setupServer } from "msw/node"
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest"

import { fetchData } from "@/app/interactive/fetchData"

import sampleLiveoceanResponse from "../../mock/sampleLiveoceanResponse.json"

export const handlers = [
  http.get("/api/forecast/drifters/*", () => {
    return HttpResponse.json(sampleLiveoceanResponse)
  }),
]

export const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("fetchData", () => {
  test("returns correct data type", async () => {
    const response = await fetchData("PS_tracks.json", "PS_times.json")

    expect(response).toHaveProperty("times")
    expect(response).toHaveProperty("points")
  })

  test("parses strings to numbers correctly", async () => {
    const response = await fetchData("PS_tracks.json", "PS_times.json")

    expect(response.points[0].features[1].properties.latitude).toEqual(47.067)
  })
})
