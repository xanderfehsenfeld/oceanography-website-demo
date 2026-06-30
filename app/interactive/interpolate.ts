import * as d3 from "d3"
import { path } from "d3-path"

interface IPointData {
  x: number
  y: number
}

// Evaluate a cubic bezier at parameter t (0–1)
function cubicBezierPoint(
  p0: IPointData,
  p1: IPointData,
  p2: IPointData,
  p3: IPointData,
  t: number
): IPointData {
  const mt = 1 - t
  return {
    x:
      mt ** 3 * p0.x +
      3 * mt ** 2 * t * p1.x +
      3 * mt * t ** 2 * p2.x +
      t ** 3 * p3.x,
    y:
      mt ** 3 * p0.y +
      3 * mt ** 2 * t * p1.y +
      3 * mt * t ** 2 * p2.y +
      t ** 3 * p3.y,
  }
}

// Approximate arc length of a cubic bezier segment by sampling
function bezierLength(
  p0: IPointData,
  p1: IPointData,
  p2: IPointData,
  p3: IPointData,
  samples: number = 50
): number {
  let length = 0
  let prev = cubicBezierPoint(p0, p1, p2, p3, 0)
  for (let i = 1; i <= samples; i++) {
    const curr = cubicBezierPoint(p0, p1, p2, p3, i / samples)
    length += Math.hypot(curr.x - prev.x, curr.y - prev.y)
    prev = curr
  }
  return length
}

// Extract cubic bezier segments from a CatmullRom curve via d3-path
function extractBezierSegments(
  points: IPointData[]
): [IPointData, IPointData, IPointData, IPointData][] {
  const segments: [IPointData, IPointData, IPointData, IPointData][] = []

  const recorder = path()
  d3
    .line<IPointData>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveCatmullRom.alpha(0.5))
    // @ts-ignore
    .context(recorder)(points)

  // d3-path stores commands internally — serialize and parse them
  const pathString = recorder.toString()
  const commandRegex = /([MLC])\s*([\d.\s,e+-]+)/g
  let match: RegExpExecArray | null
  let current: IPointData = { x: 0, y: 0 }

  while ((match = commandRegex.exec(pathString)) !== null) {
    const cmd = match[1]
    const nums = match[2]
      .trim()
      .split(/[\s,]+/)
      .map(Number)

    if (cmd === "M") {
      current = { x: nums[0], y: nums[1] }
    } else if (cmd === "C") {
      // C cp1x,cp1y cp2x,cp2y ex,ey
      for (let i = 0; i < nums.length; i += 6) {
        const cp1 = { x: nums[i], y: nums[i + 1] }
        const cp2 = { x: nums[i + 2], y: nums[i + 3] }
        const end = { x: nums[i + 4], y: nums[i + 5] }
        segments.push([current, cp1, cp2, end])
        current = end
      }
    } else if (cmd === "L") {
      // Straight line — treat as a degenerate bezier
      const end = { x: nums[0], y: nums[1] }
      segments.push([current, current, end, end])
      current = end
    }
  }

  return segments
}

export function interpolatePoints(
  points: IPointData[],
  numPointsPerSegment: number = 10
): IPointData[] {
  const segments = extractBezierSegments(points)
  const result: IPointData[] = []

  for (let s = 0; s < segments.length; s++) {
    const [p0, p1, p2, p3] = segments[s]
    const count = numPointsPerSegment
    // Skip the last point of each segment except the final one to avoid duplicates
    const end = s === segments.length - 1 ? count : count - 1
    for (let i = 0; i <= end; i++) {
      result.push(cubicBezierPoint(p0, p1, p2, p3, i / count))
    }
  }

  return result
}
