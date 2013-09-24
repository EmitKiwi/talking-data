var addingVertex = false,
    movingVertex = false,
    movingVertexIndex = -1;

var padding = 1000000;

var radiusMin = 15,
    radiusMax = 60;
    
var strokeWidth = 20;

var map, svg, g, eg, vg, bounds, vertices, undoStates = [], previousPulseMillis;

function initMap() {
  
  var tileUrl = "http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png";
  //var tileUrl = "http://{s}.tiles.mapbox.com/v3/bertspaan.map-dvysiubb/{z}/{x}/{y}.png";

  map = new L.Map("map", {
      minZoom: 2
    }).addLayer(new L.TileLayer(tileUrl));

  map.removeControl(map.zoomControl);
  map.removeControl(map.attributionControl);
  map.setView([52.3674, 4.915], 5);        

  svg = d3.select(map.getPanes().overlayPane).append("svg").attr("id", "drawing"),
      g = svg.append("g").attr("class", "leaflet-zoom-hide"),
      eg = g.append("g").attr("class", "edges"),
      vg = g.append("g").attr("class", "vertices");

  vertices = {
    type: "FeatureCollection",
    features: []
  };


  map.on("movestart", function(e) {
    addingVertex = false;
  });


  map.on("mousedown", function(e) {
    addingVertex = true;
  });

  map.on("mouseout", function(e) {
    addingVertex = false;
    movingVertex = false;
    map.dragging.enable();
  });

  map.on("mousemove", function(e) {
    if (movingVertex) {
      vertices.features[movingVertexIndex].geometry.coordinates = [
        e.latlng.lng,
        e.latlng.lat
      ];

      update();
    }
  });

  map.on("zoomstart", function(e) {
    map.dragging.enable();
    movingVertex = false; 
    addingVertex = false;
  });

  map.on("mouseup", function(e) {
    if (addingVertex &! movingVertex) {
      var vertex = {
        type: "Feature",
        properties: {
          radius: radiusMin + (radiusMax - radiusMin) / 2,
          x: 0
        },
        geometry: {
          type: "Point",
          coordinates: [
            e.latlng.lng,
            e.latlng.lat
          ]
        }
      };
      console.log("Adding undo state");
      undoStates.push($.extend(true, {}, vertices));
      
      vertices.features.push(vertex);
      bounds = d3.geo.bounds(vertices);

      update(); 
      
    } 
    
    if (movingVertex) {      
      
      console.log("Adding undo state");      
      undoStates.push($.extend(true, {}, vertices));
      
    }
    map.dragging.enable();
    movingVertex = false;  
  });

  map.on("viewreset", update);
  update();

  

}

function undo() {
  if (undoStates.length) {
    vertices = undoStates.pop();
    update();
  } else {
    resetMap();
  }
}


function resetMap() {
  undoStates = [];
  vertices = {
    type: "FeatureCollection",
    features: []
  };
  update();
}


var fps = 40;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;
function pulseRadius() {
  now = Date.now();
  delta = now - then;
     
  if (delta > interval) {
    if (movingVertex) {
      var x = vertices.features[movingVertexIndex].properties.x + 0.07;
      var radiusNew = (Math.sin(x) + 1) / 2 * (radiusMax - radiusMin) + radiusMin;

      vertices.features[movingVertexIndex].properties.radius = radiusNew;
      vertices.features[movingVertexIndex].properties.x = x;
      update();
    }
    then = now - (delta % interval);         
  }
  return !movingVertex;
}

// Reposition the SVG to cover the features.
function update() {    
  var vertex = vg.selectAll("circle")
      .data(vertices.features)
      .attr("cx", function(d) { return project(d.geometry.coordinates)[0]; })
      .attr("cy", function(d) { return project(d.geometry.coordinates)[1]; })
      .attr("r", function(d) { return d.properties.radius; });
    
  vertex.enter().append("circle")
      .attr("cx", function(d) { return project(d.geometry.coordinates)[0]; })
      .attr("cy", function(d) { return project(d.geometry.coordinates)[1]; })
      .attr("r", function(d) { return d.properties.radius; })
      .attr("fill", "none")
      .attr("stroke-width", strokeWidth)      
      .on("mousedown", function(d, i) {
        map.dragging.disable();
        movingVertexIndex = i;
        movingVertex = true;          
        d3.timer(pulseRadius);                      
      });
      
  vertex.exit().remove();   

  var edge = eg.selectAll("line")
      .data(vertices.features, function(d, i) {
        return [i, (i + 1) % vertices.features.length];
      });
 
  updateEdge(edge);
  updateEdge(edge.enter().append("line").attr("stroke-width", strokeWidth));
      
  edge.exit().remove();
          
  if (vertices.features.length) {
    // Set SVG position, translate group
    var bottomLeft = project(bounds[0]),
        topRight = project(bounds[1]);
      
    svg.attr("width", topRight[0] - bottomLeft[0] + padding * 2)
       .attr("height", bottomLeft[1] - topRight[1] + padding * 2)
       .style("margin-left", (bottomLeft[0] - padding) + "px")
       .style("margin-top", (topRight[1] - padding) + "px");
     
    g.attr("transform", "translate(" + (-bottomLeft[0] + padding) + "," + (-topRight[1] + padding) + ")");
  }
}

function updateEdge(edge) {
  edge
    .attr("x1", function(d, i) {
      var rx = Math.cos(angle(i)) * d.properties.radius;
      var x1 = f_x(i);
      var x2 = f_x(i + 1);
      var s = (x2 > x1) ? 1 : -1;
        
      return x1 + rx * s;           
    })
    .attr("y1", function(d, i) { 
      var ry = Math.sin(angle(i)) * d.properties.radius;
      var y1 = f_y(i);
      var y2 = f_y(i + 1);
      var s = (y2 < y1) ? 1 : -1;
              
      // TODO: Waarom?
      var dyi = y2 - y1;
      var dxi = f_x(i + 1) - f_x(i); 

      if (dxi >= 0 && dyi >=0) {
        return y1 - ry * s;  
      } else if (dxi < 0 && dyi < 0) {
        return y1 - ry * s;  
      } else {
        return y1 + ry * s;  
      }   
    })
    .attr("x2", function(d, i) { 
      var rx = Math.cos(angle(i)) * vertices.features[(i + 1) % vertices.features.length].properties.radius;        
      var x1 = f_x(i);
      var x2 = f_x(i + 1);
      var s = (x2 < x1) ? 1 : -1;
      return x2 + rx * s; 
    })
    .attr("y2", function(d, i) { 
      var ry = Math.sin(angle(i)) * vertices.features[(i + 1) % vertices.features.length].properties.radius;
      var y1 = f_y(i);
      var y2 = f_y(i + 1);
      var s = (y2 > y1) ? 1 : -1;        
      
      // TODO: Waarom?
      var dyi = y2 - y1;
      var dxi = f_x(i + 1) - f_x(i); 

      if (dxi >= 0 && dyi >=0) {
        return y2 - ry * s;  
      } else if (dxi < 0 && dyi < 0) {
        return y2 - ry * s;  
      } else {
        return y2 + ry * s;  
      }         
    })
    .attr("class", function(d, i) { return (i == vertices.features.length - 1) ? "last" : ""});
}

function f_x(i) {
  return project(vertices.features[i % vertices.features.length].geometry.coordinates)[0];
}

function f_y(i) {
  return project(vertices.features[i % vertices.features.length].geometry.coordinates)[1];
}

function d(i, c) {
  if (vertices.features.length) {
    return project(vertices.features[(i + 1) % vertices.features.length].geometry.coordinates)[c] 
      - project(vertices.features[i].geometry.coordinates)[c];
  } else {
    return 0;
  }
}

function dx(i) {
  return d(i, 0);
}

function dy(i) {
  return d(i, 1);
}

function angle(i) {
  var dyi = dy(i);
  var dxi = dx(i);
  var r = 0;
  if (dxi != 0) {
    r = dy(i) / dx(i);   
  }
  return Math.atan(r);
}

function project(x) {
  var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
  return [point.x, point.y];
}