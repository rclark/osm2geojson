osm2geojson
===========

Streams OSM data in XML format to GeoJSON. Generates GeoJSON features from OSM ways and nodes.

### Use it from the command line like this

    >> npm install -g osm2geojson
    >> osm2geojson -b "[-111.01032257080078,31.314701127170984,-110.68004608154295,31.447492524518246]"

... or ...

    >> osm2geojson -f /path/to/osm.xml

Pipe it to a file or something...

    >> osm2geojson -b "[-111.01032257080078,31.314701127170984,-110.68004608154295,31.447492524518246]" > osm.geojson

### Use it in another project like this

    >> npm install osm2geojson

... then in your own scripts:

    osm2geojson = require("osm2geojson")();
    osm2geojson.output.pipe(aWriteableStream);
    aReadableStream.pipe(osm2geojson.input);

Or, optionally, provide a "filter function" that will return `true` for the features you care about, and `false` for those you don't.

For example:

    osm2geojson = require("osm2geojson")(function (feature) {
        return feature.geometry.type === 'Point';
    });

This will provide an output stream of features that only contains points, or "nodes".