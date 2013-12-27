#!/usr/bin/env node

var osm2geojson = require('../')(),
    fs = require('fs'),
    request = require('request'),

    argv = require('optimist')
      .options('b', {
        alias: 'bbox', 
        default: '[]', 
        describe: 'an array representing a bounding box as [left, bottom, right, top]. Units of degrees. The total area cannot exceed 0.25 sq. degrees.'
      })

      .options('f', {
        alias: 'file',
        default: '',
        describe: 'the path to a file containing an OSM dump as XML'
      })

      .argv,

    input = null;

if (argv.file !== '') {
  input = fs.createReadStream(argv.file);
} else if (argv.bbox !== '[]') {
  var bbox = JSON.parse(argv.bbox);
  if ((bbox[2] - bbox[0]) * (bbox[3] - bbox[1]) > 0.25) return console.log('Requested area is too large.');
  input = request('http://api.openstreetmap.org/api/0.6/map?bbox=' + bbox.join(','));
}

if (!input) return console.log('There was no input recieved');

osm2geojson.output.pipe(process.stdout);
osm2geojson.error.pipe(process.stderr);
input.pipe(osm2geojson.input);