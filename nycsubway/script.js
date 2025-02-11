import chroma from "https://cdn.jsdelivr.net/npm/chroma-js@3.1.2/index.min.js";
async function getGeoJson() {
  //const response = await fetch('https://cdn.glitch.global/b8f420da-8b71-4c73-a17e-7415c8fdd12c/lines.geojson?v=1729547793371');
  // const response = await fetch('https://cdn.glitch.global/b8f420da-8b71-4c73-a17e-7415c8fdd12c/separated_lines.geojson?v=1729552462216');
  // const response = await fetch('https://cdn.glitch.global/d7de06f1-9128-450d-ab30-1fc47366090e/Subway%20Lines.geojson?v=1731974212925')
  const response = await fetch(
    "https://cdn.glitch.global/d7de06f1-9128-450d-ab30-1fc47366090e/Subway%20Lines.geojson?v=1733789521281"
  );

  const json = await response.json();
  return json;
}

const geojson = await getGeoJson();

//let map = L.map('map').setView([51.505, -0.09], 13);

let map = L.map("map").setView([40.703312, -73.97968], 12);

//map.setView([40.703312, -73.97968], 10);

let baseLayer = L.tileLayer(
  "https://maps{s}.nyc.gov/xyz/1.0.0/carto/basemap/{z}/{x}/{y}.jpg",
  {
    minNativeZoom: 8,
    maxNativeZoom: 19,
    subdomains: "1234",
    bounds: L.latLngBounds([39.3682, -75.9374], [42.0329, -71.7187]),
  }
);

map.addLayer(baseLayer);

let labelLayer = L.tileLayer(
  "https://maps{s}.nyc.gov/xyz/1.0.0/carto/label/{z}/{x}/{y}.png8",
  {
    minNativeZoom: 8,
    maxNativeZoom: 19,
    subdomains: "1234",
    bounds: L.latLngBounds([40.0341, -74.2727], [41.2919, -71.9101]),
  }
);

map.addLayer(labelLayer);
// L.geoJSON(geojson).addTo(map);


let polylines = [];
function updateMap() {
  let sliderValue = document.getElementById('monthslider').value
  let month = (parseInt(sliderValue))%12+1;
  let year = Math.floor(sliderValue/12)+2020;
  let period = document.getElementById('peakiness').value
  document.getElementById('output').value = year + '-' + month.toString().padStart(2, '0')
  let key = `_${year}-${month.toString().padStart(2, '0')}-01_${period}`
  polylines.forEach(line=>line.remove())
  geojson.features.forEach(function (lineSegment) {
    let segmentCoords = L.GeoJSON.coordsToLatLngs(lineSegment.geometry.coordinates, 0);

    let linesOnSegment = lineSegment.properties.name.split("-");
    //ꙮꙮꙮꙮꙮꙮꙮꙮꙮꙮꙮ <- my signature

    // console.log(segmentCoords)
    for (var j = 0; j < linesOnSegment.length; j++) {
      let line
      try {
      line = L.polyline(segmentCoords, {
        color: chroma
          .scale(["green", "yellow", "red"])
          .domain([0, 2])
          .mode("hsv")(
            data[linesOnSegment[j] + key][
              "additional platform time"
            ]
          )
          .hex(),
        weight: 2,
        offset: j * -3,
      })
      } catch(e) {
        line = L.polyline(segmentCoords, {
        color: '#888888',
        weight: 2,
        offset: j * -3,
      })
      }
      try{
      line.bindTooltip(
          (function () {
            let tag = document.createElement("p");
            // console.log(data[linesOnSegment[j]+'_2024-08-01_peak']['line'])
            tag.innerHTML =
              "Line " +
              data[linesOnSegment[j] + key]["line"] +
              "<br>Additional platform time: " +
              Math.round(
                data[linesOnSegment[j] + key][
                  "additional platform time"
                ] * 100
              ) /
                100 +
              " min";

            return tag;
          })()
        )
      line.addTo(map);
      polylines.push(line)
      } catch(e) {
        line.bindTooltip(
          (function () {
            let tag = document.createElement("p");
            // console.log(data[linesOnSegment[j]+'_2024-08-01_peak']['line'])
            tag.innerHTML =
              "Line " +
              data[linesOnSegment[j] + '_2024-08-01_peak']["line"] +
              "<br>Additional platform time: No data";

            return tag;
          })()
        )
      line.addTo(map);
      polylines.push(line)
      }
    }
  });
}
// console.log('data.json: ', data)
updateMap()
document.getElementById('monthslider').addEventListener('input', updateMap)
document.getElementById('peakiness').addEventListener('input', updateMap)