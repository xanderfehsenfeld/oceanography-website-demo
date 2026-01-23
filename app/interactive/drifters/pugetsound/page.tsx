import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/typography"
import { ArticleBreadcrumb } from "@/components/article/breadcrumb"
import { Pagination } from "@/components/article/pagination"

import DriftersPugetSound from "./DriftersPugetSound"

export default function Pages() {
  return (
    <div className="flex items-start gap-10">
      <section className="flex-3">
        <ArticleBreadcrumb
          paths={["drifters", "pugetsound"]}
          prefix={"/interactive"}
        />
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">
            Puget Sound: Drifter Tracks
          </h1>
          <p className="text-sm">
            The map plot shows tracks from simulated surface drifter tracks over
            three days from the most recent LiveOcean daily forecast.
          </p>
          <Separator />
        </div>

        <Typography>
          <section>
            <DriftersPugetSound />
          </section>
          <Pagination pathname={"drifters/pugetsound"} prefix="interactive" />
        </Typography>
      </section>
    </div>
  )
}
