import dynamic from "next/dynamic"
import { Skeleton } from "@radix-ui/themes"

export const ClientMapViewLoadingSkeleton = () => (
  <Skeleton className="md:h-inherit relative h-full min-h-[60vh] flex-1 md:pl-5"></Skeleton>
)

const ClientMapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: ClientMapViewLoadingSkeleton,
})

export default ClientMapView
