var express = require("express"),
    fs = require("fs"),
    osm2geojson = require("./osm2geojson"),
    app = express();

function enableCors(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    
    if (req.method === "OPTIONS") { res.send(200); }
    else { next(); }
}

app.use("/static", express.static(__dirname + '/static'));
app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');

app.get("/", function (req, res) {
    res.render("map");
});

app.all("/get-geojson", enableCors);

app.get("/get-geojson", function (req, res) {
    if (!req.query.bbox) { res.send(400); return; }
    
    res.header("Content-type", "application/json");
    osm2geojson(req.query.bbox.split(","), res, function (err) {
        if (err) { console.log(err); res.end(); }
        else { res.end(); }
    });
});

app.all("/download-geojson", enableCors);

app.get("/download-geojson", function (req, res) {
    if (!req.query.bbox) { res.send(400); return; }
    
    var filename = "tmp-" + Math.floor(Math.random()*11) + ".geojson",
        output = fs.createWriteStream(filename);
    osm2geojson(req.query.bbox.split(","), output, function (err) {
        if (err) { console.log(err); res.send(400); }
        else { 
            res.download(filename, "osm-clip.geojson", function (err) {
                if (err) { console.log(err); res.send(400); }
                else { fs.unlink(filename); }
            }); 
        }
    });
}); 

app.listen(3000);