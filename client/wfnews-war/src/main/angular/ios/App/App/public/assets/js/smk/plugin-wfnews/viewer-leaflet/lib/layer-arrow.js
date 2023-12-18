/*
 * L.Arrow displays an arrow symbol on the map.
 */

L.Layer.Arrow = L.LayerGroup.extend({
  options: {
    title: null,
    style: {
      opacity: 1,
      fillOpacity: 1,
      weight: 2,
      fillColor: "#0c0",
      color: "#080",
    },
  },

  initialize: function (latLngStart, latLngEnd, options) {
    L.LayerGroup.prototype.initialize.call(this);
    L.Util.setOptions(this, options);
    this.locStart = L.latLng(latLngStart);
    this.locEnd = L.latLng(latLngEnd);
  },

  onAdd: function (map) {
    this._map = map;

    this.symbol = {
      arrow: L.polygon([], this.options.style),
    };
    for (var layer in this.symbol) {
      this.addLayer(this.symbol[layer]);
    }
    this._setArrow(this.locStart, this.locEnd);
    this._show();

    this.eachLayer(map.addLayer, map);
  },

  onRemove: function (map) {
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

  _setArrow: function () {
    if (!this.locStart) return;
    if (!this.locEnd) return;
    if (!this._map) return;

    var pt0 = this._map.project(this.locStart);
    var pt1 = this._map.project(this.locEnd);
    var bnds = this._map.getPixelBounds();

    var dx = pt1.x - pt0.x;
    var dy = pt1.y - pt0.y;

    var dist = Math.sqrt(dx * dx + dy * dy);
    var cos = dx / dist;
    var sin = dy / dist;

    var offset = 23;
    var len = 100;

    if (len > dist) return;

    var tailLen = (len * 3) / 4;
    var tailWidth = 3;
    var headLen0 = 5;
    var headLen1 = 15;

    var base = [offset * cos, offset * sin];
    var baseL = [
      offset * cos + tailWidth * sin,
      offset * sin + tailWidth * -cos,
    ];
    var baseR = [
      offset * cos + tailWidth * -sin,
      offset * sin + tailWidth * cos,
    ];
    var headL0 = [
      tailLen * cos + headLen0 * sin,
      tailLen * sin + headLen0 * -cos,
    ];
    var headL1 = [
      tailLen * cos + headLen1 * sin,
      tailLen * sin + headLen1 * -cos,
    ];
    var tipPt = [len * cos, len * sin];
    var headR0 = [
      tailLen * cos + headLen0 * -sin,
      tailLen * sin + headLen0 * cos,
    ];
    var headR1 = [
      tailLen * cos + headLen1 * -sin,
      tailLen * sin + headLen1 * cos,
    ];

    var pts = [baseR, baseL, headL0, headL1, tipPt, headR1, headR0];
    var latlngs = unproject(this._map, translate(pts, pt0.x, pt0.y));
    var tipLL = latlngs[4];

    this.symbol.arrow.setLatLngs(latlngs);

    if (this.options.title && this.options.title.length > 0) {
      var dir = cos <= 0 ? "left" : "right";
      this.symbol.arrow.bindTooltip(this.options.title, {
        permanent: true,
        offset: [0, 10],
        direction: dir,
      });
      this.symbol.arrow.openTooltip(tipLL);
    }

    function translate(pts, x, y) {
      var p2 = [];
      for (var i = 0; i < pts.length; i++) {
        p2.push([pts[i][0] + x, pts[i][1] + y]);
      }
      return p2;
    }

    function unproject(map, pts) {
      var p2 = [];
      for (var i = 0; i < pts.length; i++) {
        p2.push(map.unproject(pts[i]));
      }
      return p2;
    }
  },
});

L.Layer.arrow = function (latLngStart, latLngEnd, options) {
  return new L.Layer.Arrow(latLngStart, latLngEnd, options);
};
