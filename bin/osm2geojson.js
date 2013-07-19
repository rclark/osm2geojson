#!/usr/bin/env node

var osm2geojson = require("../osm2geojson"),
    
    scriptIndex = process.argv.indexOf("osm2geojson"),
    left = process.argv[scriptIndex + 1],
    bottom = process.argv[scriptIndex + 2],
    right = process.argv[scriptIndex + 3],
    top = process.argv[scriptIndex + 4];

osm2geojson([left, bottom, right, top], process.stdout, function (err) {
    process.stderr.write(err);    
});