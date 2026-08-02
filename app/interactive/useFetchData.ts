import { useCallback } from "react"
import useSWR, { mutate } from "swr"

import { IMapDataProps } from "./drifters/pugetsound/types"
import { fetchData } from "./fetchData"

export const fetchDataKey = (tracksFilename: string, timesFilename: string) =>
  [`fetchData`, tracksFilename, timesFilename] as const

export const useFetchData = (
  tracksFilename: string,
  timesFilename: string
): IMapDataProps & { isLoading: boolean } => {
  const getSwrArgs = useCallback(
    (): readonly [string, string, string] => fetchDataKey(tracksFilename, timesFilename),
    [tracksFilename, timesFilename]
  )
  const fetcher = useCallback((_: readonly [string, string, string]) => {
    // fetchData expects (tracksFilename, timesFilename)
    return fetchData(tracksFilename, timesFilename)
  }, [tracksFilename, timesFilename])

  const { isLoading, data } = useSWR(getSwrArgs, fetcher)

  const points = data?.points || []
  const times = data?.times || []

  return { points, times, isLoading }
}

export async function prefetchFetchData(tracksFilename: string, timesFilename: string) {
  const key = fetchDataKey(tracksFilename, timesFilename)
  try {
    const data = await fetchData(tracksFilename, timesFilename)
    // populate SWR cache
    await mutate(key, data, false)
    return data
  } catch (err) {
    await mutate(key, null, false)
    throw err
  }
}
