import * as d3 from "d3"

// Generate dates that pass through each original date

export function interpolateDateSegments(
  dates: Date[],
  pointsPerSegment: number = 10
): Date[] {
  const result: Date[] = []

  for (let i = 0; i < dates.length - 1; i++) {
    const interpolator = d3.interpolateDate(dates[i], dates[i + 1])
    const isLast = i === dates.length - 2

    d3.range(0, 1, 1 / pointsPerSegment).forEach((t) =>
      result.push(new Date(interpolator(t)))
    )

    // Add the final endpoint only on the last segment
    if (isLast) result.push(new Date(dates[i + 1]))
  }

  return result
}
