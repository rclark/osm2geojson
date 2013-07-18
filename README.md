osm2json-stream
===============

Streams OSM data via API bbox call into a GeoJSON file.

### Use it like this

    git clone https://github.com/rclark/osm2json-stream.git
    cd osm2json-stream
    npm install
    
Take a look at the `streamer.js` script, adjust the `bbox` and `outFilePath`. It'll work for now.

    node streamer.js
