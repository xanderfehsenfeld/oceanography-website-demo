import * as d3 from "d3"

import {
  add_coastline,
  add_unity_line,
  data_info_all,
  deleteAllChildNodes,
  fld_long_names,
  make_data_info_all,
  make_info,
  make_map_info,
  make_svg,
  map_info,
  overlay_labels,
  process_data,
  update_cast_colors1,
  update_cast_colors2,
  update_cast_colors3,
  update_cid_obj,
  update_point_colors1,
  update_point_colors23,
} from "./obs_functions"

// Code to make interactive plots of model-data comparisons.

let year = 2017

async function fetchData(url) {
  const response = await fetch(url)
  return await response.json()
}

// Define async functions to load the data files.
// All other code is in the function create_vis() which is executed
// at the bottom of the script to run once the data have loaded.
async function loadFiles(year) {
  year = year
  let coast = await fetchData("/data/coast_xy.json")
  let obs_info = await fetchData(
    "/data/combined_bottle_" + year + "_cas7_t0_x4b_info.json"
  )
  let obs_data = await fetchData(
    "/data/combined_bottle_" + year + "_cas7_t0_x4b_obs.json"
  )
  let mod_data = await fetchData(
    "/data/combined_bottle_" + year + "_cas7_t0_x4b_mod.json"
  )
  return [coast, obs_info, obs_data, mod_data]
}

async function loadFiles_only_data(year) {
  year = year
  let obs_info = await fetchData(
    "/data/combined_bottle_" + year + "_cas7_t0_x4b_info.json"
  )
  let obs_data = await fetchData(
    "/data/combined_bottle_" + year + "_cas7_t0_x4b_obs.json"
  )
  let mod_data = await fetchData(
    "/data/combined_bottle_" + year + "_cas7_t0_x4b_mod.json"
  )
  return [obs_info, obs_data, mod_data]
}

// These values control what type of plot we are making and whether values are plotted
// as lines or circles. This is the main thing you would change to go between and
// observations viewer vs. and obsmod viewer.
let plotType = "obsz"
let linesOrCircles = "lines"

let brushExtent = [
  [200, 250],
  [200, 250],
]
let slider
let svgMap
let plot_fld_list = ["CT", "SA", "DO (uM)", "NO3 (uM)", "DIC (uM)", "TA (uM)"]
let fld_svg = {}

// Code to make the plot and interact with it.
function create_vis(data) {
  slider = document.getElementById("myRange")
  // Name the data loaded by loadFiles():
  const coast = data[0]
  const obs_info = data[1]
  const obs_data = data[2]
  const mod_data = data[3]
  // Checking that these have the same length
  // console.log(year)
  // console.log(Object.keys(obs_info.cid).length)
  // console.log(Object.keys(obs_data.CT).length)
  // console.log(Object.keys(mod_data.CT).length)

  // Create the map svg and add the coastline.
  make_map_info()
  svgMap = make_svg(map_info)

  var div1 = document.getElementById("div1")

  deleteAllChildNodes("div1")

  div1.append(svgMap.node())

  add_coastline(coast, svgMap, map_info)

  // Create the data svg's

  make_data_info_all()

  // Create the svg's for the data
  plot_fld_list.forEach(function (fld) {
    fld_svg[fld] = make_svg(data_info_all[fld])
  })

  // Append the SVG element to an element in the html.
  var div2 = document.getElementById("div2")
  deleteAllChildNodes("div2")

  plot_fld_list.forEach(function (fld) {
    div2.append(fld_svg[fld].node())
  })

  // SLIDER CODE
  slider.setAttribute("min", 1) // adjust the slider range to months in a year
  slider.setAttribute("max", 12) // adjust the slider range to months in a year
  var output = document.getElementById("demo")
  let sliderMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  slider.value = 3 // Initialize the slider value.
  output.innerHTML = sliderMonths[slider.value - 1] + " " + year // Display the default slider value
  // Update the current slider value (each time you drag the slider handle)
  // and replot all the drifter locations to match the time from the slider.
  // Note: slider.oninput would update continuously, whereas .onchange
  // updates when you end the movement.
  slider.oninput = function () {
    sliderUpdateAction()
  }
  // And this code does the same thing every time you push the left or right
  // arrow keys. Note that even though we keep incrementing or decrementing
  // slider.value it never goes below 1 or above 12.
  document.addEventListener("keydown", (e) => {
    // let slider = document.getElementById("myRange")
    if (e.key === "ArrowLeft") {
      //slider.value -= 1
      slider.value = Number(slider.value) - 1
    } else if (e.key === "ArrowRight") {
      slider.value = Number(slider.value) + 1
    }
    sliderUpdateAction()
  })
  // This snippet solves a problem where if I had just used the slider and then
  // used the arrow keys it would jump by two months instead of one.
  // BUGGY: this works for the first year but not after I change years.
  slider.addEventListener("focus", () => {
    slider.blur() // Immediately remove focus from the slider
  })

  function sliderUpdateAction() {
    update_cid_obj(brushExtent, slider)
    plot_fld_list.forEach(function (fld) {
      update_cast_colors2(fld, fld_svg[fld], linesOrCircles)
      update_cast_colors3(fld, fld_svg[fld], linesOrCircles)
      add_unity_line(fld, fld_svg[fld])
      overlay_labels(
        data_info_all[fld],
        fld_svg[fld],
        fld_long_names[fld],
        plotType
      )
    })
    output.innerHTML = sliderMonths[slider.value - 1] + " " + year
  }
  // ISSUE: Using the code above worked fine when using the arrow buttons
  // after selecting a region with the brush, but if you selected the slider
  // then the arrow buttons would advance by 2 months instead of 1.

  // BRUSH CODE
  // Create a brush "behaviour".
  // A brush behaviour is a function that has methods such as .on defined on it.
  // The function itself adds event listeners to an element as well as
  // additional elements (mainly rect elements) for rendering the brush extent.
  function handleBrush(e) {
    brushExtent = e.selection
    // console.log(brushExtent)
    if (brushExtent != null) {
      update_cid_obj(brushExtent, slider)
      update_point_colors23(svgMap)
      plot_fld_list.forEach(function (fld) {
        update_cast_colors2(fld, fld_svg[fld], linesOrCircles)
        update_cast_colors3(fld, fld_svg[fld], linesOrCircles)
        add_unity_line(fld, fld_svg[fld])
        overlay_labels(
          data_info_all[fld],
          fld_svg[fld],
          fld_long_names[fld],
          plotType
        )
      })
    }
  }
  let brush = d3.brush().on("end", handleBrush)
  function initBrush(whichSVG) {
    // I had to add the brush as a group otherwise it made the text label invisible.
    whichSVG.append("g").call(brush)
  }
  initBrush(svgMap)

  // These lines execute at the start. The later execution is controlled by
  // interaction with the time slider or the brush.

  // Process the data for this year and add it to the plots
  make_info(obs_info, map_info)
  process_data(obs_data, mod_data, plotType)
  update_cid_obj(brushExtent, slider)
  update_point_colors1(svgMap)
  plot_fld_list.forEach(function (fld) {
    update_cast_colors1(fld, fld_svg[fld], linesOrCircles)
    add_unity_line(fld, fld_svg[fld])
    overlay_labels(
      data_info_all[fld],
      fld_svg[fld],
      fld_long_names[fld],
      plotType
    )
  })

  // Create a dropdown menu
  const dropdown = d3.select("#myDropdown").on("change", updateChart)

  // Add options to the dropdown
  dropdown
    .selectAll("option")
    .data([2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023])
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d)
    .property("selected", function (d) {
      return d === year
    })

  // Function to update the chart based on the selected value
  function updateChart() {
    year = d3.select(this).property("value")
    output.innerHTML = sliderMonths[slider.value - 1] + " " + year
    loadFiles_only_data(year).then(update_vis)
  }
}

function update_vis(data) {
  const obs_info = data[0]
  const obs_data = data[1]
  const mod_data = data[2]
  // Process the data for this year and add it to the plots
  make_info(obs_info, map_info)
  process_data(obs_data, mod_data, plotType)
  update_cid_obj(brushExtent, slider)
  update_point_colors1(svgMap)
  update_point_colors23(svgMap)
  plot_fld_list.forEach(function (fld) {
    update_cast_colors1(fld, fld_svg[fld], linesOrCircles)
    update_cast_colors2(fld, fld_svg[fld], linesOrCircles)
    update_cast_colors3(fld, fld_svg[fld], linesOrCircles)
    add_unity_line(fld, fld_svg[fld])
    overlay_labels(
      data_info_all[fld],
      fld_svg[fld],
      fld_long_names[fld],
      plotType
    )
  })
}

// Line that executes the visualization code once the data have loaded.
export const initializeVisualization = async () => {
  await loadFiles(year).then(create_vis)
}
