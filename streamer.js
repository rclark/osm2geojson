// Configurable parts
var bbox = "-111.01032257080078,32.314701127170984,-110.68004608154295,32.447492524518246",
    outFilePath = "content.geojson";


// The rest...
var expat = require("node-expat"),
    request = require("request"),
    fs = require("fs"),
    parser = new expat.Parser("UTF-8"),
    outFile = fs.createWriteStream(outFilePath),
    firstFeature = true,
    url = "http://api.openstreetmap.org/api/0.6/map?bbox=" + bbox,
    currentFeature = null,
    nodes = {};
    
outFile.write('{"type":"FeatureCollection","features":[');

function getFeature(id, uid) {
    return {
        type: "Feature",
        id: id,
        properties: { uid: uid },
        geometry: { type: "", coordinates: [] }
    };
}

function finishFeature(f) {
    var lastCoord = f.geometry.coordinates.length - 1;
    if (f.geometry.coordinates[0] === f.geometry.coordinates[lastCoord]) {
        f.geometry.type = "Polygon";
        f.geometry.coordinates = [f.geometry.coordinates];
    } else {
        f.geometry.type = "LineString";
    }
    
    if (firstFeature) { firstFeature = false; }
    else { outFile.write(","); }
    outFile.write(JSON.stringify(f));
}
    
parser.on("startElement", function (name, attrs) {
    if (name === "way") {
        currentFeature = getFeature(attrs.id, attrs.uid);
    } else if (name === "tag" && currentFeature) {
        currentFeature.properties[attrs.k] = attrs.v;
    } else if (name === "node") {
        nodes[attrs.id] = {
            uid: attrs.uid,
            coordinates: [attrs.lon, attrs.lat]
        };
    } else if (name === "nd" && currentFeature) {
        currentFeature.geometry.coordinates.push(nodes[attrs.ref].coordinates);
    }
});

parser.on("endElement", function (name, attrs) {
    if (name === "way" && currentFeature) {
        finishFeature(currentFeature);
        currentFeature = null;
    }
});

parser.on("end", function () {
    console.log("finished");
    outFile.write("]}");
});

request(url).pipe(parser);