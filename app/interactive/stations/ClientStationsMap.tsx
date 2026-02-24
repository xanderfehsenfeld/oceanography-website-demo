"use client"

import dynamic from "next/dynamic"

const ClientStationsMap = dynamic(() => import("./StationsMap"), { ssr: false })

export default ClientStationsMap
