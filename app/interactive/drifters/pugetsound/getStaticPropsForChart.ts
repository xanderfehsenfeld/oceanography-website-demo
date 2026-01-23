import coast from "./coast_xy.json"
import { IDriftersPugetSoundProps } from "./DriftersPugetSound"
import times from "./PS_times.json"
import tracks from "./PS_tracks.json"

// ---
// title: Puget Sound Drifter Tracks
// description: The map plot shows tracks from simulated surface drifter tracks over three days from the most recent LiveOcean daily forecast. At the start time you can see the initial drifter release locations as blue dots.
// ---

//Load the data

// Test of plotting particle tracking lines.

// Define async function to load the data files.
// All other code is in the function create_vis() which is executed
// at the bottom of the script to run once the data have loaded.
// async function loadFiles() {
//     let coast = await d3.json("/scripts/jspm/coast_xy.json");
//     let tracks = await d3.json("/scripts/jspm/PS_tracks.json");
//     let times = await d3.json("/scripts/jspm/PS_times.json");
//     //return [parseFloat(tracks_full)];
//     return [tracks, times, coast];
// };

// Define the geographical range of the svg and its aspect ratio.
// NOTE: by using "let" these variables are available anywhere inside this
// code block (embraced by {}). They cannot be redeclared.
interface ICoast {
  x: number[]
  y: number[]
}

export const getStaticPropsForChart = (): IDriftersPugetSoundProps => {
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

  // Get the coast line segments
  const coastVal: ICoast[] = Object.values(coast)
  const nCoast = coastVal.length

  // Get the list of timestamps
  const timeVal = Object.values(times)
  const tlist = timeVal[0].t
  const nTimes = tlist.length

  // Get the track data values.
  const trackVal = Object.values(tracks)

  // This is packed as:
  // [{"x:[lon values for one track]", "y":[lat values for one track]},{},...]
  // Like a list of dict objects, and each dict has keys x and y with values that
  // are lists of lon or lat for one track.
  const nTracks = trackVal.length

  // Function to convert from lon and lat to svg coordinates.
  function xyScale(x: number, y: number) {
    const xscl = w0 / dlon
    const yscl = h0 / dlat

    return {
      sx: margin.left + xscl * (x - lon0),
      sy: height - margin.top - yscl * (y - lat0),
    }
  }

  // Save the coastline as a list of lists in the format
  // [ [ [x,y], [x,y], ...], [], ...]
  // where each item in the list is one segment, packed as a list of [x,y] points.
  const cxy: number[][][] = []
  for (let s = 0; s < nCoast; s++) {
    // pull out a single segment and scale
    const cx = coastVal[s].x
    const cy = coastVal[s].y
    const csxy = []
    for (let i = 0; i < cx.length; i++) {
      const { sx, sy } = xyScale(cx[i], cy[i])
      csxy.push([sx, sy])
    }
    cxy.push(csxy)
  }

  // Scale all tracks to svg coordinates and save in an array.
  // sxyAll is packed as:
  // [ [ [x,y], [x,y], ...], [], ...]
  // where each item in the list is one track, packed as a list of [x,y] points.
  const sxyAll: number[][][] = []
  for (let j = 0; j < nTracks; j++) {
    // pull out a single track
    const xdata = trackVal[j].x
    const ydata = trackVal[j].y

    const sxy = []
    for (let i = 0; i < nTimes; i++) {
      const { sx, sy } = xyScale(xdata[i], ydata[i])
      sxy.push([sx, sy])
    }
    sxyAll.push(sxy)
  }

  // Also save all scaled locations in an array that makes it easy to pull out
  // all the drifters for a single time.
  // sxyT is packed as:
  // [ [ [x,y], [x,y], ...], [], ...]
  // where each item in the list is one time, packed as a list of [x,y] points.
  const sxyT: number[][][] = []
  for (let i = 0; i < nTimes; i++) {
    const xy = []
    for (let j = 0; j < nTracks; j++) {
      xy.push(sxyAll[j][i])
    }
    sxyT.push(xy)
  }

  return {
    sxyAll,
    sxyT,
    coastVal,
    nCoast,
    nTracks,
    trackVal,
    timeVal,
    nTimes,
    tlist,
    cxy,
  }
}
