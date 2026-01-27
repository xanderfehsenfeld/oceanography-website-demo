"use client"

import { useEffect } from "react"
import { ScrollArea } from "@radix-ui/react-scroll-area"

import { initializeVisualization } from "./obs"

const OberservationsViewer = () => {
  useEffect(() => {
    initializeVisualization()
  })

  return (
    <div>
      <link href="/scripts/jspm/style1.css" rel="stylesheet" type="text/css" />
      <div className="flex flex-row dark:bg-gray-600">
        <div className="flex-2" id="div1"></div>

        <div className="flex-3">
          <div className="container">
            <input type="range" className="slider" id="myRange" />
            <h3 style={{ textAlign: "center", color: "red" }}>
              <span id="demo"></span>
            </h3>
          </div>
          <div className="container">
            <select id="myDropdown"></select>
          </div>
          <ScrollArea
            className="flex max-h-[500px] w-full flex-wrap overflow-y-auto"
            id="div2"
          ></ScrollArea>{" "}
        </div>
      </div>
    </div>
  )
}

export default OberservationsViewer
