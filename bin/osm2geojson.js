#!/usr/bin/env node

var osm2geojson = require("../osm2geojson"),
    argv = require("optimist")
        .options("b", { alias: "bbox" })
        .string("b")
        .argv;

osm2geojson(JSON.parse(argv.bbox), process.stdout, function (err) {
    if (err) { process.stderr.write(err.message + "\n" || "argh\n"); }
});