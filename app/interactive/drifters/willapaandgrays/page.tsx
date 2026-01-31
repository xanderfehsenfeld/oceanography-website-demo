import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/typography"
import { ArticleBreadcrumb } from "@/components/article/breadcrumb"
import { Pagination } from "@/components/article/pagination"

import DriftersWillapaAndGrays from "./DriftersWillapaAndGrays"

export default function Pages() {
  return (
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
          <DriftersWillapaAndGrays>
            <h3> Willapa Bay & Grays Harbor Drifter Tracks</h3>

            <p>
              The map plot shows tracks from simulated drifter tracks over three
              days from the most recent LiveOcean daily forecast. At the start
              time you can see the initial drifter release locations as two
              clusters of blue dots near the beaches north and south of Willapa
              Bay. The green lines show the tracks that the drifters take over
              the full three days, about six tidal cycles.
            </p>
            <p>
              Using the "Time Slider" you can see where each particle goes in
              time. If you click on the map with some drifters nearby they will
              turn red. They will stay red when you use the Time Slider. By
              selecting different groups of particles at different times you can
              explore questions such as: Where do all the particles from the
              North release site go? or Where did all the particles that ended
              up in some place come from?
            </p>
            <p>
              The model used here is a high-resolution model of these two
              estuaries, nested inside the larger LiveOcean model. It has 200 m
              horizontal resolution, 30 vertical layers, and wetting-and-drying
              of the intertidal. The particles are tracked in 3-D, including
              dispersion due to turbulence.
            </p>
          </DriftersWillapaAndGrays>
        </section>
        <Pagination
          pathname={"drifters/willapaandgrays"}
          prefix="interactive"
        />
      </Typography>
    </section>
  )
}
