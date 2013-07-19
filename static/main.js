(function () {
    var key;
    this.osm2geojson = app = {
        map: new L.Map("map", { minZoom: 12 }).setView([32.30715689902246, -110.87882995605469], 13),
        baseLayer: new L.TileLayer("http://{s}.tiles.mapbox.com/v3/rclark.map-lgs3w52k/{z}/{x}/{y}.png"),
        jsonLayer: new L.GeoJSON(),
        drawControl: new L.Control.Draw({
            draw: {
                polyline: false,
                polygon: false,
                circle: false,
                marker: false
            }
        }),
        popupTemplate: function (props) {
            var result = '<table class="table table-striped table-condensed table-bordered"><tbody>';
            for (key in props) {
                if (props[key].length < 100) {
                    result += '<tr><th>' + key + '</th><td>' + props[key] + '</td>';
                }
            }
            return result + '</tbody></table>';
        }
    };
    
    app.map.addLayer(app.baseLayer);
    app.map.addLayer(app.jsonLayer);
    app.map.addControl(app.drawControl);
    
    app.map.on("draw:created", function (e) {
        $.ajax({
            url: "/get-geojson?bbox=" + e.layer.getBounds().toBBoxString(),
            dataType: "json",
            success: function (data) {
                app.map.removeLayer(app.jsonLayer);
                app.geojson = data;
                app.jsonLayer = new L.GeoJSON(data, {
                    onEachFeature: function (f, l) {
                        l.bindPopup(app.popupTemplate(f.properties), { maxWidth: 800, closeButton: false });
                    },
                    style: { opacity: 0.8 }
                });
                app.map.addLayer(app.jsonLayer);
            }
        });
    });
}).call(this);

