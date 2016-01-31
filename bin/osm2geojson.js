#!/usr/bin/env node

var osm2geojson = require('..');
var geojson = require('geojson-stream');
var minimist = require('minimist');

var args = minimist(process.argv.slice(2));
var filepath = args._[0];

if (args.h || args.help || !filepath) {
  console.log('Usage: osm2geojson [options] <filepath>');
  console.log('');
  console.log('Options:');
  console.log('  -w, --warn\tLog warnings to stderr on invalid data');
  console.log('');
  process.exit(1);
}

osm2geojson(filepath, { failEvents: args.w || args.warn })
  .on('fail', function(err) { console.error(err.message); })
  .on('error', function(err) { throw err; })
  .pipe(geojson.stringify())
  .on('error', function(err) { throw err; })
  .pipe(process.stdout);
