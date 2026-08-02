import { useCallback } from "react"
import useSWR from "swr"

import { IMapDataProps } from "./drifters/pugetsound/types"
import { fetchData } from "./fetchData"

export const useFetchData = (
  tracksFilename: string,
  timesFilename: string
): IMapDataProps & { isLoading: boolean } => {
  const getSwrArgs = useCallback(
    (): [string, string] => [tracksFilename, timesFilename],
    [tracksFilename, timesFilename]
  )
  const fetcher = useCallback(
    (args: [string, string]) => fetchData(...args),
    []
  )
  const { isLoading, data } = useSWR(getSwrArgs, fetcher)

  const points = data?.points || []

  const times = data?.times || []

  return { points, times, isLoading }
}
