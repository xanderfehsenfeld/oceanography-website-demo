import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/typography"
import { ArticleBreadcrumb } from "@/components/article/breadcrumb"
import { Pagination } from "@/components/article/pagination"

import DriftersPugetSound from "./DriftersPugetSound"
import LazyLoadedViewer from "./LazyLoadedViewer"

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
          <LazyLoadedViewer />
          <h3>Puget Sound Drifter Tracks</h3>
          The map plot shows tracks from simulated surface drifter tracks over
          three days from the most recent LiveOcean daily forecast. At the start
          time you can see the initial drifter release locations as blue dots.
          Using the "Time Slider" you can see where each particle goes in time.
          If you click and drag across a region of the map with some drifters in
          it they will turn red. They will stay red when you use the Time
          Slider. By selecting different groups of particles at different times
          you can explore questions such as: Where do all the particles from one
          place go? or Where did all the particles that ended up in some place
          come from?
        </section>
        <Pagination pathname={"drifters/pugetsound"} prefix="interactive" />
      </Typography>
    </section>
  )
}
