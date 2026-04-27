import { IPoints } from "@/components/map/getPoints"

export type TimesResponse = TimesData[]

export interface TimesData {
  t: string[]
}

export interface IMapDataProps {
  times: TimesResponse
  points: IPoints[]
}
