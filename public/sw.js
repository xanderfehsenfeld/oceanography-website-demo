/* Service Worker: perform interpolation-heavy work off the main thread.
   Loads d3 from CDN and exposes a message handler:
   postMessage({type: 'interpolate', driftersForecast, times}) -> replies with {points, times}
*/

importScripts('https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

function cubicBezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return {
    x: mt ** 3 * p0.x + 3 * mt ** 2 * t * p1.x + 3 * mt * t ** 2 * p2.x + t ** 3 * p3.x,
    y: mt ** 3 * p0.y + 3 * mt ** 2 * t * p1.y + 3 * mt * t ** 2 * p2.y + t ** 3 * p3.y,
  };
}

function extractBezierSegments(points) {
  const segments = [];
  const recorder = d3.path();
  d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveCatmullRom.alpha(0.5))
    .context(recorder)(points);

  const pathString = recorder.toString();
  const commandRegex = /([MLC])\s*([\d.\s,e+-]+)/g;
  let match;
  let current = { x: 0, y: 0 };

  while ((match = commandRegex.exec(pathString)) !== null) {
    const cmd = match[1];
    const nums = match[2].trim().split(/[\s,]+/).map(Number);

    if (cmd === 'M') {
      current = { x: nums[0], y: nums[1] };
    } else if (cmd === 'C') {
      for (let i = 0; i < nums.length; i += 6) {
        const cp1 = { x: nums[i], y: nums[i + 1] };
        const cp2 = { x: nums[i + 2], y: nums[i + 3] };
        const end = { x: nums[i + 4], y: nums[i + 5] };
        segments.push([current, cp1, cp2, end]);
        current = end;
      }
    } else if (cmd === 'L') {
      const end = { x: nums[0], y: nums[1] };
      segments.push([current, current, end, end]);
      current = end;
    }
  }

  return segments;
}

function interpolatePoints(points, numPointsPerSegment = 10) {
  const segments = extractBezierSegments(points);
  const result = [];

  for (let s = 0; s < segments.length; s++) {
    const [p0, p1, p2, p3] = segments[s];
    const count = numPointsPerSegment;
    const end = s === segments.length - 1 ? count : count - 1;
    for (let i = 0; i <= end; i++) {
      result.push(cubicBezierPoint(p0, p1, p2, p3, i / count));
    }
  }

  return result;
}

function interpolateDateSegments(dates, pointsPerSegment = 10) {
  const result = [];
  for (let i = 0; i < dates.length - 1; i++) {
    const interpolator = d3.interpolateDate(dates[i], dates[i + 1]);
    const isLast = i === dates.length - 2;
    for (let t = 0; t < 1; t += 1 / pointsPerSegment) {
      result.push(new Date(interpolator(t)));
    }
    if (isLast) result.push(new Date(dates[i + 1]));
  }
  return result;
}

self.addEventListener('message', (event) => {
  const data = event.data || {};
  const port = (event.ports && event.ports[0]) || null;

  if (data.type !== 'interpolate') return;

  try {
    const driftersForecast = data.driftersForecast || [];
    const times = data.times || [];

    const pointsInterpolated = driftersForecast.map((track) => {
      const points = track.x.map((xVal, i) => ({ x: xVal, y: track.y[i] }));
      return interpolatePoints(points);
    });

    const points = (pointsInterpolated[0] || []).map((_, timeIndex) => ({
      type: 'FeatureCollection',
      features: pointsInterpolated.map((line, id) => {
        const latitude = line[timeIndex].y;
        const longitude = line[timeIndex].x;
        return {
          type: 'Feature',
          properties: { latitude, longitude, id: id.toString() },
          geometry: { type: 'Point', coordinates: [longitude, latitude] },
        };
      }),
    }));

    const dateObjs = (times || []).map((timeString) => {
      const dateString = timeString
        .replace('-', '')
        .replace('PM', ':00 PM')
        .replace('AM', ':00 AM')
        .replace('PST', '');
      return new Date(dateString);
    });

    const formattedTimes = interpolateDateSegments(dateObjs).map((date) =>
      new Intl.DateTimeFormat('en-US', {
        timeStyle: 'short',
        dateStyle: 'medium',
        timeZone: 'America/Los_Angeles',
      }).format(date)
    );

    const payload = { points, times: formattedTimes };

    if (port && port.postMessage) port.postMessage(payload);
    else if (event.source && event.source.postMessage) event.source.postMessage(payload);
  } catch (err) {
    const errPayload = { error: err && err.message ? err.message : String(err) };
    const port = (event.ports && event.ports[0]) || null;
    if (port && port.postMessage) port.postMessage(errPayload);
  }
});
