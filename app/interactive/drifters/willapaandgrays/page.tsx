import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/typography"
import { ArticleBreadcrumb } from "@/components/article/breadcrumb"
import { Pagination } from "@/components/article/pagination"

import DriftersWillapaAndGrays from "./DriftersWillapaAndGrays"

export default function Pages() {
  return (
    <div className="flex items-start gap-10">
      <section className="flex-3">
        <ArticleBreadcrumb
          paths={["drifters", "willapaandgrays"]}
          prefix={"/interactive"}
        />
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">
            Willapa Bay & Grays Harbor Drifter Tracks
          </h1>
          <p className="text-sm">
            The map plot shows tracks from simulated drifter tracks over three
            days from the most recent LiveOcean daily forecast.{" "}
          </p>
          <Separator />
        </div>
        <Typography>
          <section>
            <DriftersWillapaAndGrays />
          </section>
          <Pagination
            pathname={"drifters/willapaandgrays"}
            prefix="interactive"
          />
        </Typography>
      </section>
    </div>
  )
}
