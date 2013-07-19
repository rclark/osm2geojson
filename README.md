osm2geojson
===============

Streams OSM data via API bbox call into GeoJSON. Generates GeoJSON features from OSM ways.

### Use it from the command line like this

    >> npm install -g osm2geojson
    >> osm2geojson -b "[-111.01032257080078,31.314701127170984,-110.68004608154295,31.447492524518246]"
    
or pipe it to a file or something...

    >> osm2geojson -b "[-111.01032257080078,31.314701127170984,-110.68004608154295,31.447492524518246]" > osm.geojson
    
### Use it in another project like this

    >> npm install osm2geojson
    
... then in your own scripts:

    osm2geojson = require("osm2geojson");
    osm2geojson(bbox, outputStream, callback);
    
... where:
- __bbox__: an array representing a bounding box as [ left, bottom, right, top ]. Units of degrees. The total area cannot exceed 0.25 sq. degrees.
- __outputStream__: an object that is a [writeable stream](http://nodejs.org/api/stream.html#stream_class_stream_writable)
- __callback__: a function to execute when everything is finished. You'll get an error if one occurred, and nothing if it worked.