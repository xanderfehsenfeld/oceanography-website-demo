import dynamic from "next/dynamic"
import { Skeleton } from "@radix-ui/themes"

export const DeckMapViewLoadingSkeleton = () => (
  <Skeleton className="md:h-inherit relative h-full min-h-[60vh] flex-1 md:pl-5" />
)

const ClientDeckMapView = dynamic(() => import("./deck-map-view"), {
  ssr: false,
  loading: DeckMapViewLoadingSkeleton,
})

export default ClientDeckMapView
