"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"
import * as d3 from "d3"

import { Slider } from "@/components/slider"

const lon0 = -124,
  lon1 = -122,
  lat0 = 47,
  lat1 = 49.2
const dlon = lon1 - lon0
const dlat = lat1 - lat0
const clat = Math.cos((Math.PI * (lat0 + lat1)) / (2 * 180))
const hfac = dlat / (dlon * clat)

// Define the size of the svg.
const m = 0.5,
  w0 = 350,
  h0 = w0 * hfac

const margin = { top: m, right: m, bottom: m, left: m },
  width = w0 + margin.left + margin.right,
  height = h0 + margin.top + margin.bottom

// function that fills out an array with the position of points at
// a specific timestep
let sxyNow: number[][] = []

// Initialize a list to indicate if a particle is within the brushExtent
let isin: number[] = []

let brushExtent = [
  [0, 0],
  [0, 0],
]

export interface IDriftersPugetSoundProps {
  timeVal: {
    t: string[]
  }[]
  coastVal: {
    x: number[]
    y: number[]
  }[]
  trackVal: {
    x: number[]
    y: number[]
  }[]
  nTracks: number
  nCoast: number
  nTimes: number

  sxyT: number[][][]

  sxyAll: number[][][]
  tlist: string[]

  cxy: number[][][]
}

const DriftersPugetSound = ({
  tlist,
  nTimes,
  nTracks,
  sxyT,
  nCoast,
  cxy,
}: IDriftersPugetSoundProps) => {
  const ref = useRef<SVGElement>(null)

  const [sliderMaxValue, setSliderMaxValue] = useState(10)

  const [sliderValue, setSliderValue] = useState(0)

  const displayValue = tlist[sliderValue]

  useEffect(() => {
    for (let j = 0; j < nTracks; j++) {
      isin.push(0)
    }
  })

  const update_sxyNow = useEffectEvent((tt: number) => {
    sxyNow = sxyT[tt]
  })

  const update_isin = useEffectEvent(() => {
    isin = []
    for (let j = 0; j < nTracks; j++) {
      // plot the point
      // treating the brush rectangle as a circle
      // var xp = sxyNow[j][0];
      // var yp = sxyNow[j][1];
      // var bx0 = brushExtent[0][0];
      // var bx1 = brushExtent[1][0];
      // var by0 = brushExtent[0][1];
      // var by1 = brushExtent[1][1];
      // var bxc = (bx1 + bx0) / 2;
      // var byc = (by0 + by1) / 2;
      // var br = (bx1 - bx0 + by1 - by0) / 4;
      // var pr = Math.sqrt((xp - bxc) ** 2 + (yp - byc) ** 2)
      // if (pr < br) {
      //     isin.push(1.0);
      // } else {
      //     isin.push(2.0);
      // }
      // Using the brush rectangle
      if (
        sxyNow[j][0] >= brushExtent[0][0] &&
        sxyNow[j][0] <= brushExtent[1][0] &&
        sxyNow[j][1] >= brushExtent[0][1] &&
        sxyNow[j][1] <= brushExtent[1][1]
      ) {
        isin.push(1.0)
      } else {
        isin.push(2.0)
        // I tried to push 0 for this but it threw a TypeError
        // perhaps interpreting 0 as "null".
      }
    }
  })

  const initializePoints = useEffectEvent(() => {
    const svg = d3.select(ref.current)

    // get rid of any circles
    svg.selectAll("circle").remove()

    for (let j = 0; j < nTracks; j++) {
      // plot the point
      if (isin[j] == 2.0) {
        svg
          .append("circle")
          .attr("cx", sxyNow[j][0])
          .attr("cy", sxyNow[j][1])
          .attr("r", 3)
          .attr("opacity", 0.2)
          .style("fill", "blue")
      } else if (isin[j] == 1.0) {
        svg
          .append("circle")
          .attr("cx", sxyNow[j][0])
          .attr("cy", sxyNow[j][1])
          .attr("r", 3)
          .style("fill", "red")
      }
    }
  })

  const updatePoints = useEffectEvent(() => {
    const svg = d3.select(ref.current)

    const circle = svg.selectAll("circle").data(sxyNow)
    circle.attr("r", 3).attr("opacity", 0.2).style("fill", "blue")
    circle.enter().append("svg:circle")

    circle.attr("cx", (data: number[], index: number) => {
      return data[0]
    })

    circle.attr("cy", (data: number[], index: number) => {
      return data[1]
    })

    circle.style("fill", (data: number[], index: number) => {
      return isin[index] === 1 ? "red" : "blue"
    })

    circle.attr("opacity", (data: number[], index: number) => {
      return isin[index] === 1 ? 1 : 0.2
    })
  })

  useEffect(() => {
    if (ref) {
      const svg = d3
        .select(ref.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height)

      // Loop over all the coast segments and plot them, one line per segment.
      for (let j = 0; j < nCoast; j++) {
        svg
          .append("path")
          .attr("d", d3.line()(cxy[j] as any))
          .attr("stroke", "black")
          .attr("fill", "none")
          .attr("opacity", 1.0)
      }

      // make the container visible
      svg
        .append("g")
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("stroke", "skyblue")
        .attr("stroke-width", 10)
        .attr("opacity", 1)
        .attr("id", "my_thing")

      //Slider actions

      setSliderMaxValue(nTimes - 1)
      update_sxyNow(0)

      // Create a brush "behaviour".
      // A brush behaviour is a function that has methods such as .on defined on it.
      // The function itself adds event listeners to an element as well as
      // additional elements (mainly rect elements) for rendering the brush extent.

      function handleBrush(e: any) {
        brushExtent = e.selection

        if (brushExtent != null) {
          update_isin()
          updatePoints()
        }
      }
      // brush code
      let brush = d3.brush().on("end", handleBrush)

      function initBrush() {
        svg.call(brush as any)
      }

      initBrush()

      update_isin()
      // updatePoints()
      initializePoints()
    }
  }, [ref])

  return (
    <div className={"gap-4 lg:flex"}>
      <link href="/scripts/jspm/style1.css" rel="stylesheet" type="text/css" />

      <div className={"w-full dark:bg-gray-400"} id="map_container">
        <svg width={width} height={height} id="barchart" ref={ref as any} />
      </div>

      <div className={"w-full"}>
        <p>
          Time Slider: <span id="demo">{displayValue}</span>
        </p>
        <Slider
          defaultValue={sliderValue}
          onChange={(input) => {
            setSliderValue(input.target.valueAsNumber)
            update_sxyNow(input.target.valueAsNumber)
            updatePoints()
          }}
          min={0}
          max={sliderMaxValue}
          className="slider"
          id="myRange"
        />
        <h3>Puget Sound Drifter Tracks</h3>
        The map plot shows tracks from simulated surface drifter tracks over
        three days from the most recent LiveOcean daily forecast. At the start
        time you can see the initial drifter release locations as blue dots.
        Using the "Time Slider" you can see where each particle goes in time. If
        you click and drag across a region of the map with some drifters in it
        they will turn red. They will stay red when you use the Time Slider. By
        selecting different groups of particles at different times you can
        explore questions such as: Where do all the particles from one place go?
        or Where did all the particles that ended up in some place come from?
      </div>
    </div>
  )
}

export default DriftersPugetSound
