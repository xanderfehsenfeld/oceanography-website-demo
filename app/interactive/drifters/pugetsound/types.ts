import { IPoints } from "../../fetchData"

export type TimesResponse = TimesData[]

export interface TimesData {
  t: string[]
}

export interface IMapDataProps {
  times: string[]
  points: IPoints[]
}
