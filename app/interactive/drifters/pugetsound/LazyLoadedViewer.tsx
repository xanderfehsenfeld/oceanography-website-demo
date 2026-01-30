"use client"

import { ReactNode } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@radix-ui/themes"

const ObservationsViewer = dynamic(() => import("./DriftersPugetSound"), {
  ssr: false,
  loading: () => (
    <div className="gap-4 sm:flex">
      <div className="not-prose z-10 min-h-[60vh] flex-1 md:h-[70vh]">
        <Skeleton width={"100%"} height={"100%"} />
      </div>
      <div className="flex-1 gap-2">
        <div className={"w-full"}>
          <p>
            <Skeleton>Time Slider: test</Skeleton>
          </p>
        </div>
        <div className="flex w-full items-center gap-4"></div>
        <h3>
          <Skeleton>Puget Sound Drifter Tracks</Skeleton>
        </h3>

        <Skeleton>
          The map plot shows tracks from simulated surface drifter tracks over
          three days from the most recent LiveOcean daily forecast. At the start
          time you can see the initial drifter release locations as blue dots.
          Using the "Time Slider" you can see where each particle goes in time.
          Use the playback buttons to play the forecast at different speeds.
        </Skeleton>
      </div>
    </div>
  ), // This will be shown while the component loads
})

const LazyLoadedViewer = ({ children }: { children: ReactNode }) => (
  <ObservationsViewer>{children}</ObservationsViewer>
)

export default LazyLoadedViewer
