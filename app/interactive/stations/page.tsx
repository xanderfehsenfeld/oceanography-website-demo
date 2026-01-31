import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/typography"
import { ArticleBreadcrumb } from "@/components/article/breadcrumb"
import { Pagination } from "@/components/article/pagination"

import StationsMap from "./StationsMap"

export default function Stations() {
  return (
    <section className="flex-3">
      <ArticleBreadcrumb paths={["stations"]} prefix={"/interactive"} />
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">
          Validation: Comparisons of the Model with Observed Water Properties
        </h1>
        <p className="text-sm">
          Comparisons of water properties in the Salish Sea and coastal
          estuaries based on a year of monthly CTD and Bottle casts from the
          Washington State Dept. of Ecology and Environment Canada.
        </p>
        <Separator />
      </div>
      <Typography>
        <section>
          <h3>
            {" "}
            Click on a marker on the map to see a plot of the model-data
            comparisons for that station.
          </h3>

          <StationsMap />
        </section>
        <Pagination pathname={"stations"} prefix="interactive" />
      </Typography>
    </section>
  )
}
