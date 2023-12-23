/*
 * L.Crosshairs displays a crosshair symbol on the map.
 */

L.Layer.Crosshairs = L.LayerGroup.extend({
  options: {
    style: {
      opacity: 1,
      fillOpacity: 0,
      weight: 2,
      color: "#f00",
      radius: 20,
    },
  },

  initialize: function (latLng, options) {
    L.LayerGroup.prototype.initialize.call(this);
    L.Util.setOptions(this, options);
    this.loc = L.latLng(latLng);
  },

  onAdd: function (map) {
    this._map = map;

    this.crosshair = {
      circle: L.circleMarker([0, 0], this.options.style),
      longitude_line_north: L.polyline([], this.options.style),
      longitude_line_south: L.polyline([], this.options.style),
      latitude_line_east: L.polyline([], this.options.style),
      latitude_line_west: L.polyline([], this.options.style),
    };
    for (var layer in this.crosshair) {
      this.addLayer(this.crosshair[layer]);
    }
    this._setCrosshairs(this.loc);
    this._show();
    this._map.on("moveend", this._setCrosshairs.bind(this));
    //this._map.on('zoomend', this._moveCrosshairs.bind(this))

    this.eachLayer(map.addLayer, map);
  },

  onRemove: function (map) {
    this._map.off("moveend", this._setCrosshairs);
    //this._map.off('zoomend', this._setCrosshairs)
    this.eachLayer(this.removeLayer, this);
  },

  _show: function () {
    this.eachLayer(function (l) {
      this._map.addLayer(l);
    }, this);
  },

  _hide: function () {
    this.eachLayer(function (l) {
      this._map.removeLayer(l);
    }, this);
  },

  _setCrosshairs: function () {
    var latlng = this.loc;
    if (!latlng) return;
    if (!this._map) return;
    this.crosshair.circle.setLatLng(latlng);
    var point = this._map.project(latlng);
    this.crosshair.longitude_line_north.setLatLngs([
      this._map.unproject([point.x, point.y - this.options.style.radius]),
      this._map.unproject([point.x, this._map.getPixelBounds().min.y]),
    ]);
    this.crosshair.longitude_line_south.setLatLngs([
      this._map.unproject([point.x, point.y + this.options.style.radius]),
      this._map.unproject([point.x, this._map.getPixelBounds().max.y]),
    ]);
    this.crosshair.latitude_line_east.setLatLngs([
      this._map.unproject([point.x - this.options.style.radius, point.y]),
      this._map.unproject([this._map.getPixelBounds().min.x, point.y]),
    ]);
    this.crosshair.latitude_line_west.setLatLngs([
      this._map.unproject([point.x + this.options.style.radius, point.y]),
      this._map.unproject([this._map.getPixelBounds().max.x, point.y]),
    ]);
  },
});

L.Layer.crosshairs = function (latLng, options) {
  return new L.Layer.Crosshairs(latLng, options);
};
