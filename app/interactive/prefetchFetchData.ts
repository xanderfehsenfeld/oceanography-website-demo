import { fetchData } from "./fetchData"

export const fetchDataKey = (tracksFilename: string, timesFilename: string) =>
  [`fetchData`, tracksFilename, timesFilename] as const

export async function prefetchFetchData(
  tracksFilename: string,
  timesFilename: string
) {
  const key = fetchDataKey(tracksFilename, timesFilename)

  try {
    const data = await fetchData(tracksFilename, timesFilename)

    // If running in the browser, populate the SWR cache using mutate.
    // Avoid importing 'swr' at module top-level because server-side environments
    // (RSC) can't statically import the client mutate export.
    if (typeof window !== "undefined") {
      const { mutate } = await import("swr")
      await mutate(key, data, false)
    }

    return data
  } catch (err) {
    if (typeof window !== "undefined") {
      const { mutate } = await import("swr")
      await mutate(key, null, false)
    }
    throw err
  }
}
