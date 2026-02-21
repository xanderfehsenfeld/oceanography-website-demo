import dynamic from "next/dynamic"

const ClientMapView = dynamic(() => import("./map-view"), { ssr: false })

export default ClientMapView
