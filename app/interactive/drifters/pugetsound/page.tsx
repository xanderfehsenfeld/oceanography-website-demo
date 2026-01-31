import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/typography"
import { ArticleBreadcrumb } from "@/components/article/breadcrumb"
import { Pagination } from "@/components/article/pagination"

import DriftersPugetSound from "./DriftersPugetSound"

export default function Pages() {
  return (
    <section className="flex-3">
      <ArticleBreadcrumb
        paths={["drifters", "pugetsound"]}
        prefix={"/interactive"}
      />
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Puget Sound: Drifter Tracks</h1>
        <p className="text-sm">
          The map plot shows tracks from simulated surface drifter tracks over
          three days from the most recent LiveOcean daily forecast.
        </p>
        <Separator />
      </div>

      <Typography>
        <section>
          <DriftersPugetSound>
            <h3>Puget Sound Drifter Tracks</h3>

            <p>
              The map plot shows tracks from simulated surface drifter tracks
              over three days from the most recent LiveOcean daily forecast. At
              the start time you can see the initial drifter release locations
              as blue dots. Using the "Time Slider" you can see where each
              particle goes in time. Use the playback buttons to play the
              forecast at different speeds.
            </p>

            <h4>Selecting a single drifter</h4>

            <p>
              If you click on a drifter, a green line will appear showing its
              path over the length of the forecast. Use this feature to
              determine the origin and destination of any single drifter.
            </p>

            <h4>Selecting and tracking groups of drifters</h4>

            <p>
              If you click on the map (not a single drifter), all the drifters
              within a certain distance will turn red. Increase or decrease the
              area of selection by zooming in or out of the map. By selecting
              different groups of particles at different times you can explore
              questions such as: Where do all the particles from one place go?
              or Where did all the particles that ended up in some place come
              from?
            </p>
          </DriftersPugetSound>
        </section>
        <Pagination pathname={"drifters/pugetsound"} prefix="interactive" />
      </Typography>
    </section>
  )
}
