var expat = require("node-expat"),
    request = require("request");

function osmStream2Stream(readable, writeable, callback) {
    // Setup an xml stream parser
    var parser = new expat.Parser("UTF-8"),
        // Setup some cruft
        firstFeature = true,
        currentFeature = null,
        nodes = {};
    
    // Listen to parser events -- When a new element starts...
    parser.on("startElement", function (name, attrs) {
        // ...react according to what type of element it is
        switch (name) {
        case "node":
            // Cache the node for later lookup
            nodes[attrs.id] = { uid: attrs.uid, coordinates: [Number(attrs.lon), Number(attrs.lat)] };
            break;
        case "way":
            // Begin assembling a new feature
            currentFeature = {
                type: "Feature",
                id: attrs.id,
                properties: { uid: attrs.uid },
                geometry: { type: "", coordinates: [] }
            };
            break;
        case "nd":
            // Lookup the node, assign its coords to the currentFeature
            currentFeature.geometry.coordinates.push(nodes[attrs.ref].coordinates);
            break;
        case "tag":
            // Assign properties to the currentFeature, if it exists. Otherwise these are node tags.
            if (currentFeature) { currentFeature.properties[attrs.k] = attrs.v; }
            break;
        }
    });
    
    // When an element ends...
    parser.on("endElement", function (name) {
        // ...only do anything if its a way
        if (name === "way") {
            // If the last coord is identical to the first, then it is a Polygon...
            var last = currentFeature.geometry.coordinates.length - 1;
            if (currentFeature.geometry.coordinates[0] === currentFeature.geometry.coordinates[last]) {
                // ...and the line needs to be wrapped in another pair of brackets
                currentFeature.geometry.coordinates = [currentFeature.geometry.coordinates];
                currentFeature.geometry.type = "Polygon";
            } else {
            // Otherwise this is a LineString
                currentFeature.geometry.type = "LineString";
            }
            
            // Deal with commas between features -- don't prepend one if this is the first feature
            if (firstFeature) {
                // Start writing a FeatureCollection
                writeable.write('{"type":"FeatureCollection","features":[');
                firstFeature = false;
            } else { writeable.write(","); }
            
            // Write the feature to the stream
            writeable.write(JSON.stringify(currentFeature));
        }
    });
    
    // When we're all finished with the incoming data
    parser.on("end", function () {
        if (!currentFeature) { callback("I didn't get any features from OSM\n"); return; }
        
        // Finish up the FeatureCollection
        writeable.write("]}\n");
        
        // Callback
        callback();
    });
    
    // When an error is encountered
    parser.on("error", function (err) {
        // Callback with the error
        callback(err);
    });
    
    readable.pipe(parser);
}

function osm2geojson(bbox, outputStream, callback) {
    // Bail if the area is too big
    if ((bbox[2] - bbox[0]) * (bbox[3] - bbox[1]) > 0.25) {
        callback({
            error: "request_area_too_big",
            statusCode: 400,
            message: "The requested area is too large"
        });
        return;
    }
    
    // Build the API request to OSM
    var url = "http://api.openstreetmap.org/api/0.6/map?bbox=" + bbox.join(",");
    
    // Okay, actually make the request and pipe the response into the parser
    osmStream2Stream(request(url), outputStream, callback);
}

// Export the function for use elsewhere
module.exports = osm2geojson;