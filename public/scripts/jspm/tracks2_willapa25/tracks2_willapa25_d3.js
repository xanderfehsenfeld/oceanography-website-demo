// Test of plotting particle tracking lines.

// Define async function to load the data files.
// All other code is in the function create_vis() which is executed
// at the bottom of the script to run once the data have loaded.
async function loadFiles() {
    let coast = await d3.json("/scripts/jspm/tracks2_willapa25/coast_xy.json");
    let tracks = await d3.json("/scripts/jspm/tracks2_willapa25/willapa25_tracks.json");
    let times = await d3.json("/scripts/jspm/tracks2_willapa25/willapa25_times.json");
    //return [parseFloat(tracks_full)];
    return [tracks, times, coast];
};

// Code to make the plot and interact with it.
function create_vis(data) {

    // Define the geographical range of the svg and its aspect ratio.
    // NOTE: by using "let" these variables are available anywhere inside this
    // code block (embraced by {}). They cannot be redeclared.
    let lon0 = -124.4,
        lon1 = -123.7,
        lat0 = 46.35,
        lat1 = 47.1;
    let dlon = lon1 - lon0;
    let dlat = lat1 - lat0;
    let clat = Math.cos(Math.PI * (lat0 + lat1) / (2 * 180));
    let hfac = dlat / (dlon * clat);

    // Define the size of the svg.
    let m = .5,
        w0 = 350,
        h0 = w0 * hfac;

    let margin = { top: m, right: m, bottom: m, left: m },
        width = w0 + margin.left + margin.right,
        height = h0 + margin.top + margin.bottom;

    // Declare the x (horizontal position) scale.
    const x = d3.scaleLinear()
        .domain([lon0, lon1])
        .range([margin.left, width - margin.right]);

    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear()
        .domain([lat0, lat1])
        .range([height - margin.bottom, margin.top]);

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height);

    // make the container visible
    svg.append("g")
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 10)
        .attr("opacity", .3)
        .attr("id", "my_thing");

    // Add the x-axis.
    svg.append("g") // NOTE: the svg "g" element groups things together.
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisTop(x).ticks(3));

    // Add the y-axis.
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisRight(y).ticks(5));

    // Name the data loaded by loadFiles():
    const tracks = data[0];
    const times = data[1];
    const coast = data[2];

    // Get the coast line segments
    coastVal = Object.values(coast);
    let nCoast = coastVal.length;

    // Get the list of timestamps
    timeVal = Object.values(times);
    let tlist = timeVal[0].t;
    let nTimes = tlist.length;

    // Get the track data values.
    trackVal = Object.values(tracks);
    // This is packed as:
    // [{"x:[lon values for one track]", "y":[lat values for one track]},{},...]
    // Like a list of dict objects, and each dict has keys x and y with values that
    // are lists of lon or lat for one track.
    let nTracks = trackVal.length;
    console.log('Number of tracks = ' + nTracks);
    console.log('Times per track = ' + nTimes);
    console.log('Coast line segments = ' + nCoast);

    // Function to convert from lon and lat to svg coordinates.
    let sx, sy;
    function xyScale(x, y) {
        var xscl = w0 / dlon;
        var yscl = h0 / dlat;
        sx = margin.left + xscl * (x - lon0);
        sy = height - margin.top - yscl * (y - lat0);
    }

    // Save the coastline as a list of lists in the format
    // [ [ [x,y], [x,y], ...], [], ...]
    // where each item in the list is one segment, packed as a list of [x,y] points.
    let cxy = [];
    for (let s = 0; s < nCoast; s++) {
        // pull out a single segment and scale
        var cx = coastVal[s].x;
        var cy = coastVal[s].y;
        var csxy = [];
        for (let i = 0; i < cx.length; i++) {
            xyScale(cx[i], cy[i]);
            csxy.push([sx, sy]);
        }
        cxy.push(csxy);
    }

    // Scale all tracks to svg coordinates and save in an array.
    // sxyAll is packed as:
    // [ [ [x,y], [x,y], ...], [], ...]
    // where each item in the list is one track, packed as a list of [x,y] points.
    let sxyAll = [];
    for (let j = 0; j < nTracks; j++) {
        // pull out a single track
        var xdata = trackVal[j].x;
        var ydata = trackVal[j].y;
        var sxy = [];
        for (let i = 0; i < nTimes; i++) {
            xyScale(xdata[i], ydata[i]);
            sxy.push([sx, sy]);
        }
        sxyAll.push(sxy);
    }

    // Also save all scaled locations in an array that makes it easy to pull out
    // all the drifters for a single time.
    // sxyT is packed as:
    // [ [ [x,y], [x,y], ...], [], ...]
    // where each item in the list is one time, packed as a list of [x,y] points.
    let sxyT = [];
    for (let i = 0; i < nTimes; i++) {
        var xy = [];
        for (let j = 0; j < nTracks; j++) {
            xy.push(sxyAll[j][i]);
        }
        sxyT.push(xy);
    }

    // Loop over all tracks and plot them, one line per track.
    for (let j = 0; j < nTracks; j++) {
        svg.append("path")
            .attr("d", d3.line()(sxyAll[j]))
            .attr("stroke", "green")
            .attr("fill", "none")
            .attr("opacity", 0.5);
    }

    // Loop over all the coast segments and plot them, one line per segment.
    for (let j = 0; j < nCoast; j++) {
        svg.append("path")
            .attr("d", d3.line()(cxy[j]))
            .attr("stroke", "black")
            .attr("fill", "none")
            .attr("opacity", 1.0);
    }

    // Append the SVG element.
    map_container.append(svg.node());

    // Slider actions

    var slider = document.getElementById("myRange");
    slider.setAttribute("max", nTimes - 1) // adjust the slider range to match the track length
    var output = document.getElementById("demo");
    output.innerHTML = tlist[slider.value]; // Display the default slider value

    // function that fills out an array with the position of points at
    // a specific timestep
    let sxyNow = [];
    function update_sxyNow(tt) {
        sxyNow = sxyT[tt];
    }
    update_sxyNow(0);

    // Initialize a list to indicate if a particle is within the brushExtent
    let isin = [];
    for (let j = 0; j < nTracks; j++) {
        isin.push(0);
    }

    // Update the current slider value (each time you drag the slider handle)
    // and replot all the drifter locations to match the time from the slider.
    slider.oninput = function () {
        output.innerHTML = tlist[this.value];
        update_sxyNow(this.value);
        update_points();
    }

    // brush code

    // Create a brush "behaviour".
    // A brush behaviour is a function that has methods such as .on defined on it.
    // The function itself adds event listeners to an element as well as
    // additional elements (mainly rect elements) for rendering the brush extent.

    let brushExtent = [[0, 0], [0, 0]];

    function handleBrush(e) {
        brushExtent = e.selection;
        // debugging
        // console.log(brushExtent==null)
        // console.log(e.type)
        // console.log(e.target)
        // console.log(e.sourceEvent)
        // console.log(e.mode)
        if (brushExtent != null) {
            update_isin();
            update_points();
        }
    }

    let brush = d3.brush()
        .on('end', handleBrush);

    function initBrush() {
        svg.call(brush);
    }

    function update_isin() {
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
            // var bxc = (bx1+bx0)/2;
            // var byc = (by0+by1)/2;
            // var br = (bx1-bx0 + by1-by0)/4;
            // var pr = Math.sqrt((xp-bxc)**2 + (yp-byc)**2)
            // if (pr < br) {
            //     isin.push(1.0);
            // } else {
            //     isin.push(2.0);
            // }
            // Using the brush rectangle
            if (sxyNow[j][0] >= brushExtent[0][0] &&
                sxyNow[j][0] <= brushExtent[1][0] &&
                sxyNow[j][1] >= brushExtent[0][1] &&
                sxyNow[j][1] <= brushExtent[1][1]) {
                isin.push(1.0);
            } else {
                isin.push(2.0);
                // I tried to push 0 for this but it threw a TypeError
                // perhaps interpreting 0 as "null".
            }
        }
    }

    function update_points() {
        // get rid of any circles
        svg.selectAll("circle").remove();
        for (let j = 0; j < nTracks; j++) {
            // plot the point
            if (isin[j] == 2.0) {
                svg.append("circle")
                    .attr("cx", sxyNow[j][0])
                    .attr("cy", sxyNow[j][1])
                    .attr("r", 3)
                    .attr("opacity", 0.2)
                    .style("fill", "blue");
            } else if (isin[j] == 1.0) {
                svg.append("circle")
                    .attr("cx", sxyNow[j][0])
                    .attr("cy", sxyNow[j][1])
                    .attr("r", 3)
                    .style("fill", "red");
            }
        }
    }

    initBrush();
    update_isin();
    update_points();

}

// Line that executes the visualization code once the data have loaded.
loadFiles().then(create_vis);