//create query variable for use later
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//--------------------------------------------------------------------------------------------------// 
//Create function for marker color based on passed in depth
//color codes from here https://htmlcolorcodes.com/
       function MarkerColor (depth) { 
        // earthquakes with greater depth should appear darker in color.
        if (depth <= 10) {
            return "#30F91F";
        }
        else if (depth <= 30) {
            return "#F0F924";
        } 
        else if (depth <= 50) {
            return "#F9B41F";
        }
        else if (depth <= 70) {
          return "#F97C1F";
      }
      else if (depth <= 90) {
        return "#F9611F";
    }        
        else {
            return "#F92824";
        }

    };   

//--------------------------------------------------------------------------------------------------//    
//Ceate map function, passing in list of circle quake markers L.circleMarker([lat, lng]  
function createMap(quakes) {

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap,
    "Street Map": streetmap
  };

  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "Earthquakes": quakes
  };

  // Create the map object with options
  var map = L.map("map-id", {
    center: [10, -1],
    zoom: 2,
    layers: [lightmap, quakes]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

//create legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
        depth = [10,30,50,70,90,91],
        depthLabel  = ["<=10",">10 to <=30",">30 to <=50",">50 to <=70",">70to<=90",">90"]
     //   colors = ["yellow", "orange", "red", "green", "blue", "purple"]

     div.innerHTML = "<h3>Earthquake Depth (KM)</h3>";

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < depth.length; i++) {
        div.innerHTML +=
            '<i style="background-color:' + MarkerColor(depth[i] ) + '"></i> ' +
           depthLabel[i]+"<br>"
    }

    return div;
};


legend.addTo(map);

}

//----------------------------------------------------------------------------------------------//
//create function to create the array of circle quake markers to pass into createMap function

d3.json(queryURL).then(function(data){

console.log(data)
 var earthquakes = data.features
 var depthList = []

  // Initialize an array to hold quake markers
 var quakeMarkers = [];

 earthquakes.forEach(element => {

  lat = element['geometry']['coordinates'][0];
  lng = element['geometry']['coordinates'][1];
  magnitude = element['properties']['mag'];
  depth = element['geometry']['coordinates'][2];
  depthList.push(depth);


      var quakeMarker = L.circleMarker([lat, lng], {
        radius: magnitude *2,  //make it a little bigger to easier to see
        opacity: 1,
        fillOpacity: .9,
        color: "black",
        stroke: true,
        weight: .5,
        fillColor: MarkerColor(depth)
        
    })
    .bindPopup("<h3>" + "Point of Earthquake: " + element.properties.place +
    "</h3><hr><h3>" + "Latitude,Longitude: " + lat+","+lng +  
    "</h3><hr><h3>" + "Magnitude: " + magnitude + " ML" + "</h3><hr><h3>" 
    + "Time: " +     new Date(element.properties.time) +
    "</h3><hr><h3>" + "Depth: " + depth + " km" + "</h3>")

    // Add the marker to the quake array quakeMarkers
    quakeMarkers.push(quakeMarker);

    });


console.log(quakeMarkers)
    
 createMap(L.layerGroup(quakeMarkers))


});

