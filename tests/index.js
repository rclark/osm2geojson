var assert = require('assert'),
    osm2geojson = require('../'),
    geojsonStream = require('geojson-stream'),
    stream = require('stream'),
    fs = require('fs'),
    path = require('path'),
    errors = '',
    errLog = new stream.Writable();

errLog._write = function (chunk) { errors += chunk; };

describe('Osm2GeoJSON', function () {
  it('should return a function', function () {
    assert.equal('function', typeof osm2geojson);
  });
  describe(' when called', function () {
    var converter = osm2geojson()
      .on('error', errLog.write);
    it('is readable', function () {
      assert(converter.pipe);
    });
    it('is writable', function () {
      assert(converter.write && converter.end);
    });
    describe(', can convert test data', function () {
      it('should create the correct number of features', function (done) {
        var xml = fs.createReadStream(path.join(__dirname, 'bejaia.osm')),
            features = [],
            parser = geojsonStream.parse()
              .on('data', features.push)
              .on('finish', function () {
                assert.equal(features.length, 0);
                done();
              });
        xml.pipe(converter).pipe(parser);
      });
    }); 
  });
});