var expat = require('node-expat'),
    stream = require('stream')
    geojsonStream = require('geojson-stream');

function Osm2GeoJSON(filterFunction, mappingFunction) {
  // If a filterFunction was not given make one that always returns true
  if (typeof filterFunction !== 'function') filterFunction = function () { return true; };

  // If a mappingFunction was not given make one that will just return the feature
  if (typeof mappingFunction !== 'function') mappingFunction = function (f) { return f; };

  // Setup an xml stream parser and a GeoJSON stream writer
  var transformer = new stream.Transform(),
      parser = new expat.Parser('UTF-8'),
      writer = geojsonStream.stringify()
        .on('data', function (chunk) {
          transformer.push(chunk);
        }),

      // Setup some cruft
      currentFeature = null,
      nodes = {};

  transformer._transform = function (chunk, encoding, callback) {
    parser.write(chunk);
    callback();
  }

  // Helper function to set up a GeoJSON feature
  function newFeature(id, uid, coords) {
    return {
      type: 'Feature',
      id: id,
      properties: {uid: uid},
      geometry: {type: '', coordinates: coords || []}
    };
  }

  // Listen to parser events -- When a new element starts...
  parser.on('startElement', function (name, attrs) {
    // ...react according to what type of element it is
    switch (name) {
    case 'node':
      // Cache the node for later lookup. This sucks.
      var thisNode = nodes[attrs.id] = {uid: attrs.uid, coordinates: [Number(attrs.lon), Number(attrs.lat)]};
      currentFeature = newFeature(attrs.id, thisNode.uid, thisNode.coordinates);
      break;
    case 'way':
      // Begin assembling a new feature
      currentFeature = newFeature(attrs.id, attrs.uid);
      break;
    case 'nd':
      // Lookup the node, assign its coords to the currentFeature
      var node = nodes[attrs.ref];
      if (node) currentFeature.geometry.coordinates.push(node.coordinates);
      break;
    case 'tag':
      // Assign properties to the currentFeature, if it exists.
      if (currentFeature) { currentFeature.properties[attrs.k] = attrs.v; }
      break;
    }
  });
  
  // When an element ends...
  parser.on('endElement', function (name) {    
    // ...deal with ways
    if (name === 'way') {
      // If the last coord is identical to the first...
      var coords = currentFeature.geometry.coordinates;
      if (coords[0] === coords[coords.length - 1]) {
        // ... then it is a Polygon ...
        currentFeature.geometry.type = 'Polygon';
        // ...and the line needs to be wrapped in another pair of brackets
        coords = [currentFeature.geometry.coordinates];
      } else {
        // Otherwise this is a LineString
        currentFeature.geometry.type = 'LineString';
      }
    }

    // ...deal with nodes
    if (name === 'node') {
      // If any properties have been assigned...
      //  ... this is a shitty test for whether or not its worth keeping a node around ...
      if (Object.keys(currentFeature.properties).length > 1) {
        // ... then this is a Point
        currentFeature.geometry.type = 'Point';
      }
    }

    // If we've completed a feature, write it to the output stream if it passes the filter
    //  ... also run the feature through whatever mapping function we've got
    if (currentFeature && currentFeature.geometry.type !== '') {
      if (filterFunction(currentFeature)) writer.write(mappingFunction(currentFeature));
      
      // Get rid of the current feature so nothing additional ends up on the last one
      currentFeature = null;
    }

    // Finished writing when we've parsed the end of the <osm> element
    if (name === 'osm') { writer.end(); }
  });

  return transformer;
}

module.exports = Osm2GeoJSON;