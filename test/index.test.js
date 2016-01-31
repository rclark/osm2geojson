var test = require('tape');
var path = require('path');
var osm2geojson = require('..');
var _ = require('underscore');
var monaco = path.resolve(__dirname, 'fixtures', 'monaco.osm.pbf');
var monacoIds = require('./fixtures/monaco.ids.json');
var iqaluit = path.resolve(__dirname, 'fixtures', 'iqaluit.osm.bz2');
var iqaluitIds = require('./fixtures/iqaluit.ids.json');
var iqaluitAllIds = require('./fixtures/iqaluit.allnodes.ids.json');
var iqaluitFailedIds = require('./fixtures/iqaluit.failed.ids.json');
var bejaia = path.resolve(__dirname, 'fixtures', 'bejaia.osm.xml');

test('monaco (pbf) to geojson', function(assert) {
  var stream = osm2geojson(monaco);
  var features = {};

  stream.on('error', function(err) {
    assert.ifError(err, 'failed');
    assert.end();
  });

  stream.on('end', function() {
    var foundIds = Object.keys(features);
    assert.equal(_.difference(foundIds, monacoIds).length, 0, 'output does not contain extra features');
    assert.equal(_.difference(monacoIds, foundIds).length, 0, 'output is not missing any features');
    assert.end();
  });

  stream.on('data', function(feature) {
    if (features[feature.id]) assert.fail('feature ' + feature.id + ' sent more than once');
    else features[feature.id] = true;
  });
});

test('iqaluit (bad xml.bz2) to geojson -- with failEvents', function(assert) {
  var stream = osm2geojson(iqaluit, { failEvents: true });
  var features = {};
  var failed = {};

  stream.on('error', function(err) {
    assert.ifError(err, 'failed');
    assert.end();
  });

  stream.on('fail', function(err) {
    assert.ok(err.osmId, 'appended osm id to error');
    assert.equal(err.message.indexOf(err.osmId + ' | '), 0, 'prepended osm id to error message');
    failed[err.osmId] = true;
  });

  stream.on('data', function(feature) {
    if (features[feature.id]) assert.fail('feature ' + feature.id + ' sent more than once');
    else features[feature.id] = true;
  });

  stream.on('end', function() {
    var foundIds = Object.keys(features);
    var failedIds = Object.keys(failed);

    assert.equal(_.difference(foundIds, iqaluitIds).length, 0, 'output does not contain extra features');
    assert.equal(_.difference(iqaluitIds, foundIds).length, 0, 'output is not missing any features');
    assert.equal(_.difference(failedIds, iqaluitFailedIds).length, 0, 'failed does not contain extra features');
    assert.equal(_.difference(iqaluitFailedIds, failedIds).length, 0, 'failed is not missing any features');

    assert.end();
  });
});

test('bejaia (bad xml.bz2) to geojson -- without failEvents', function(assert) {
  assert.plan(2);

  var stream = osm2geojson(bejaia);

  stream.on('error', function(err) {
    assert.equal(err.osmId, 'way!8914650!3', 'appended osm id to error');
    assert.equal(err.message, 'way!8914650!3 | location of at least one of the nodes in this way not set', 'expected error message');
  });

  stream.on('end', function() {
    assert.fail('should not fire end event');
  });

  stream.resume();
});

test('iqaluit (bad xml.bz2) to geojson -- with failEvents & allNodes', function(assert) {
  var stream = osm2geojson(iqaluit, { failEvents: true, allNodes: true });
  var features = {};
  var failed = {};

  stream.on('error', function(err) {
    assert.ifError(err, 'failed');
    assert.end();
  });

  stream.on('fail', function(err) {
    assert.ok(err.osmId, 'appended osm id to error');
    assert.equal(err.message.indexOf(err.osmId + ' | '), 0, 'prepended osm id to error message');
    failed[err.osmId] = true;
  });

  stream.on('data', function(feature) {
    if (features[feature.id]) assert.fail('feature ' + feature.id + ' sent more than once');
    else features[feature.id] = true;
  });

  stream.on('end', function() {
    var foundIds = Object.keys(features);
    var failedIds = Object.keys(failed);

    assert.equal(_.difference(foundIds, iqaluitAllIds).length, 0, 'output does not contain extra features');
    assert.equal(_.difference(iqaluitAllIds, foundIds).length, 0, 'output is not missing any features');
    assert.equal(_.difference(failedIds, iqaluitFailedIds).length, 0, 'failed does not contain extra features');
    assert.equal(_.difference(iqaluitFailedIds, failedIds).length, 0, 'failed is not missing any features');

    assert.end();
  });
});
