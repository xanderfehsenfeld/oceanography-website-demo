import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/typography"
import { ArticleBreadcrumb } from "@/components/article/breadcrumb"
import { Pagination } from "@/components/article/pagination"

import DriftersCustom from "./DriftersCustom"

export default function Pages() {
  return (
    <section className="flex-3">
      <ArticleBreadcrumb
        paths={["drifters", "willapaandgrays"]}
        prefix={"/interactive"}
      />
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">
          Willapa Bay Customized Drifter Tracks
        </h1>
        <p className="text-sm">
          The map plot shows tracks from simulated drifter tracks over three
          days from the most recent LiveOcean daily forecast. At the start time
          you can see the initial drifter release locations as six clusters of
          blue dots at locations in and near Willapa Bay. The green lines show
          the tracks that the drifters take over the full three days, about six
          tidal cycles.
        </p>
        <Separator />
      </div>
      <Typography>
        <section>
          <DriftersCustom />
        </section>
        <Pagination
          pathname={"drifters/willapaandgrays"}
          prefix="interactive"
        />
      </Typography>
    </section>
  )
}
