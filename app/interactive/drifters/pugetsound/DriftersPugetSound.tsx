"use client"

import {
  ReactNode,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react"
import { SegmentedControl, Slider } from "@radix-ui/themes/dist/cjs/components"
import * as d3 from "d3"
import { useTheme } from "next-themes"
import { FaFastForward, FaPause, FaPlay } from "react-icons/fa"

import { getPoints, getTrack, IFeature } from "./getPoints"
import times from "./PS_times.json"

import "./DriftersPugetSound.css"

import { LatLng } from "leaflet"

import MapView from "@/components/map/map-view"

const timeOptions: string[] = times[0].t

const points = getPoints()

const positionsAtTimeZero = points[0]

const allPointsInOneCollection = points.reduce((previous, current) => {
  previous.features.concat(current.features)

  return {
    ...positionsAtTimeZero,
    features: [...previous.features, ...current.features],
  }
}, positionsAtTimeZero)

var map: L.Map

const initialZoomLevel = 9
const initialLat = 48
const initialLong = -122.5

const initialCircleRadius = 3

// Use Leaflet to implement a D3 geometric transformation.
// the latLngToLayerPoint is a Leaflet conversion method:
//Returns the map layer point that corresponds to the given geographical
// coordinates (useful for placing overlays on the map).
function projectPoint(this: any, x: number, y: number) {
  var point = map.latLngToLayerPoint(new LatLng(y, x))
  this.stream.point(point.x, point.y)
} //end projectPoint

var svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
var g: d3.Selection<SVGGElement, unknown, null, undefined>
// this is not needed right now, but for future we may need
// to implement some filtering. This uses the d3 filter function
// featuresdata is an array of point objects

var featuresdata = positionsAtTimeZero.features.filter(function (d) {
  return d
})

//stream transform. transforms geometry before passing it to
// listener. Can be used in conjunction with d3.geoPath
// to implement the transform.

var transform = d3.geoTransform({
  point: projectPoint,
})

//d3.geoPath translates GeoJSON to SVG path codes.
//essentially a path generator. In this case it's
// a path generator referencing our custom "projection"
// which is the Leaflet method latLngToLayerPoint inside
// our function called projectPoint
var d3path = d3.geoPath().projection(transform)

const getScaleMultiplier = (): number => {
  if (map) {
    const currentZoomLevel = map?.getZoom() || 1
    const zoomScale = map.getZoomScale(currentZoomLevel, initialZoomLevel)

    return zoomScale
  } else {
    return 1
  }
}

// similar to projectPoint this function converts lat/long to
// svg coordinates except that it accepts a point from our
// GeoJSON

let isIn: { [key: string]: boolean } = {}

function applyLatLngToLayer(d: any) {
  var y = d.geometry.coordinates[1]
  var x = d.geometry.coordinates[0]
  return map.latLngToLayerPoint(new LatLng(y, x))
}

var toLine = d3
  .line()
  //.interpolate("linear")
  .x(function (d) {
    return applyLatLngToLayer(d).x
  })
  .y(function (d) {
    return applyLatLngToLayer(d).y
  })

function MapChart({ children }: { children: ReactNode }) {
  const [sliderValue, setSliderValue] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const { theme } = useTheme()

  const displayValue = useMemo(() => {
    //01/11/2026 - 04PM PST
    const dateString = timeOptions[sliderValue]
      .replace("-", "")
      .replace("PM", ":00 PM")
      .replace("AM", ":00 AM")
      .replace("PST", "")

    return new Intl.DateTimeFormat("en-US", {
      timeStyle: "short",
      dateStyle: "medium",

      timeZone: "PST",
    }).format(new Date(dateString))
  }, [sliderValue])

  const reset = useEffectEvent(() => {
    // For simplicity I hard-coded this! I'm taking
    // the first and the last object (the origin)
    // and destination and adding them separately to
    // better style them. There is probably a better
    // way to do this!
    // var originANDdestination = [featuresdata[0], featuresdata[17]]

    var renderedPoints = g.selectAll("circle")

    const zoomScale = getScaleMultiplier()

    renderedPoints
      .attr("transform", function (d) {
        return (
          "translate(" +
          applyLatLngToLayer(d).x +
          "," +
          applyLatLngToLayer(d).y +
          ")"
        )
      })

      .attr("r", initialCircleRadius * zoomScale)

    var bounds = d3path.bounds(allPointsInOneCollection),
      topLeft = bounds[0],
      bottomRight = bounds[1]

    // Setting the size and location of the overall SVG container
    svg
      .attr("width", bottomRight[0] - topLeft[0] + 120)
      .attr("height", bottomRight[1] - topLeft[1] + 120)
      .style("left", topLeft[0] - 50 + "px")
      .style("top", topLeft[1] - 50 + "px")

    g.attr(
      "transform",
      "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")"
    )
    var linePath = g.selectAll(".lineConnect")

    // linePath.attr("d", d3path);
    linePath.attr("d", toLine as any)
  })

  const renderDrifterTrackLine = useEffectEvent((data: IFeature[]) => {
    g.selectAll(".lineConnect")
      .data([data])
      .enter()

      .append("path")

      .attr("class", "lineConnect")
  })

  const renderDrifters = useEffectEvent((data: IFeature[]) => {
    const existingCircles = g.selectAll("circle").data(data)

    existingCircles

      .attr("class", function (data) {
        const isSelected = isIn[data.properties.id]

        return isSelected ? "drifter selected" : "drifter"
      })

      .attr("transform", function (d) {
        return (
          "translate(" +
          applyLatLngToLayer(d).x +
          "," +
          applyLatLngToLayer(d).y +
          ")"
        )
      })
  })

  const ref = useRef<HTMLDivElement>(null)

  const handleMapClick = useEffectEvent((e: L.LeafletMouseEvent) => {
    const drifters = points[sliderValue].features

    const clickLocation = e.latlng

    let drifterLocation: L.LatLngExpression

    const scaleMultiplier = getScaleMultiplier()

    g.selectAll(".lineConnect").remove()

    for (let i = 0; i < drifters.length; i++) {
      const properties = drifters[i].properties
      const { latitude, longitude, id } = properties

      drifterLocation = new LatLng(latitude, longitude)

      const distance = clickLocation.distanceTo(drifterLocation)

      const isSelected = distance < 25000 / scaleMultiplier

      isIn[id] = isSelected
    }

    if (playbackSpeed === 0) renderDrifters(points[sliderValue].features)

    return
  })

  const handleDrifterClick = useEffectEvent(function (event: any, d: IFeature) {
    const id = d.properties.id
    isIn = {
      [id]: true,
    }
    event.stopPropagation()

    const drifterTrack = getTrack(id)

    renderDrifterTrackLine(drifterTrack.features)

    renderDrifters(points[sliderValue].features)
    reset()
  })
  //This effect ideally is called once per page load. This initializes the map and d3
  const onMapMount = useEffectEvent((mountedMap: L.Map) => {
    map = mountedMap

    // we will be appending the SVG to the Leaflet map pane
    // g (group) element will be inside the svg
    svg = d3.select(map.getPanes().overlayPane).append("svg")

    // if you don't include the leaflet-zoom-hide when a
    // user zooms in or out you will still see the phantom
    // original SVG
    g = svg.append("g").attr("class", "leaflet-zoom-hide")

    // Here we're creating a FUNCTION to generate a line
    // from input points. Since input points will be in
    // Lat/Long they need to be converted to map units
    // with applyLatLngToLayer
    var toLine = d3
      .line()
      //.interpolate("linear")
      .x(function (d) {
        return applyLatLngToLayer(d).x
      })
      .y(function (d) {
        return applyLatLngToLayer(d).y
      })

    // From now on we are essentially appending our features to the
    // group element. We're adding a class with the line name
    // and we're making them invisible

    // these are the points that make up the path
    // they are unnecessary so I've make them
    // transparent for now
    var ptFeatures = g
      .selectAll("circle")
      .data(featuresdata)
      .enter()
      .append("circle")
      .attr("r", initialCircleRadius)
      .attr("class", "drifter")

      .attr("id", function (e, i) {
        return i
      })

      .on("click", handleDrifterClick)
    // Here we will make the points into a single
    // line/path. Note that we surround the featuresdata
    // with [] to tell d3 to treat all the points as a
    // single line. For now these are basically points
    // but below we set the "d" attribute using the
    // line creator function from above.
  })

  const maxSliderValue = points.length - 1
  const increment = useCallback(() => {
    setSliderValue((sliderValue + 1) % maxSliderValue)
  }, [sliderValue])

  useEffect(() => {
    if (playbackSpeed) {
      const timeOut = setTimeout(increment, 100 / playbackSpeed)

      return () => clearTimeout(timeOut)
    }
  }, [playbackSpeed, sliderValue])

  useEffect(() => {
    renderDrifters(points[sliderValue].features)
  }, [sliderValue])

  return (
    <div className="gap-4 sm:flex">
      <MapView
        initialLat={initialLat}
        initialLong={initialLong}
        zoom={initialZoomLevel}
        onZoomChange={reset}
        onMapClick={handleMapClick}
        onMapMount={onMapMount}
      />
      <div className="flex-1 gap-2">
        <div className={"w-full"}>
          <p>
            Time Slider: <span id="demo">{displayValue}</span>
          </p>
        </div>
        <div className="flex w-full items-center gap-4">
          <SegmentedControl.Root
            className="cursor-pointer"
            defaultValue="1"
            value={playbackSpeed.toString()}
            size={"3"}
          >
            <SegmentedControl.Item
              className="h-9 w-9 cursor-pointer"
              onClick={() => setPlaybackSpeed(0)}
              value="0"
            >
              <FaPause />{" "}
            </SegmentedControl.Item>
            <SegmentedControl.Item
              className="h-9 w-9 cursor-pointer"
              onClick={() => {
                setPlaybackSpeed(1)
              }}
              value="1"
            >
              <FaPlay />
            </SegmentedControl.Item>
            <SegmentedControl.Item
              className="h-9 w-9 cursor-pointer"
              value="2"
              onClick={() => {
                setPlaybackSpeed(2)
              }}
            >
              <FaFastForward />
            </SegmentedControl.Item>
          </SegmentedControl.Root>

          <Slider
            size={"3"}
            className="cursor-grab"
            onValueChange={(v) => {
              setPlaybackSpeed(0)

              const value = v[0]
              setSliderValue(value)
            }}
            value={[sliderValue]}
            min={0}
            max={maxSliderValue}
            id="myRange"
          />
        </div>

        {children}
      </div>
    </div>
  )
}

export default MapChart
