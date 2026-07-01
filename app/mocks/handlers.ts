// src/mocks/handlers.ts
import { http, HttpResponse } from "msw"

import times from "./PS_times.json"
import tracks from "./PS_tracks.json"

export const handlers = [
  http.get("/api/liveocean-web/PS_times.json", () => {
    return HttpResponse.json(times)
  }),
  http.get("/api/liveocean-web/PS_tracks.json", () => {
    return HttpResponse.json(tracks)
  }),
]
