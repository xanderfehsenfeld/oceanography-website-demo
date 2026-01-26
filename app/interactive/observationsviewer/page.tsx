"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"
import Script from "next/script"
import * as d3 from "d3"

import { HorizontalLayout } from "@/components/ui/horizontal-layout"
import { Slider } from "@/components/slider"

import { initializeVisualization } from "./obs"

const OberservationsViewer = () => {
  useEffect(() => {
    initializeVisualization()
  })
  return (
    <div className="flex flex-row">
      <link href="/scripts/jspm/style1.css" rel="stylesheet" type="text/css" />

      <div className="flex-2" id="div1"></div>

      <div className="flex flex-3 flex-wrap" id="div2">
        <div className="container">
          <input type="range" className="slider" id="myRange" />
          <h3 style={{ textAlign: "center", color: "red" }}>
            <span id="demo"></span>
          </h3>
        </div>

        <div className="container">
          <select id="myDropdown"></select>
        </div>
      </div>
    </div>
  )
}

export default OberservationsViewer
