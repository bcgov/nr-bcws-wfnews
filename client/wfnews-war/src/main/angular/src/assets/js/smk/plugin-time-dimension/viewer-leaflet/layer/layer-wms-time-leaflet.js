include.module("layer-wms-time-leaflet", ["layer-wms-time"], function () {
  "use strict";

  function WmsTimeLeafletLayer() {
    SMK.TYPE.Layer["wms-time"].prototype.constructor.apply(this, arguments);
  }

  $.extend(WmsTimeLeafletLayer.prototype, SMK.TYPE.Layer["wms-time"].prototype);

  SMK.TYPE.Layer["wms-time"]["leaflet"] = WmsTimeLeafletLayer;
  // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
  //
  SMK.TYPE.Layer["wms-time"]["leaflet"].create = function (layers, zIndex) {
    var self = this;

    return SMK.TYPE.Layer["wms"]["leaflet"]
      .create(layers, zIndex)
      .then(function (ly) {
        // console.log( self.timeRangeMode )
        var tly = L.timeDimension.layer.wms(ly, {
          requestTimeFromCapabilities: true,
          // updateTimeDimension: true,
          // updateTimeDimensionMode: self.getTimeRangeMode(),
          // period: 'PT1H',

          getCapabilitiesUrl: layers[0].config.capabilitiesUrl,
        });

        SMK.UTIL.wrapFunction(tly, "_createLayerForTime", function (inner) {
          return function (time) {
            var wmsParams = this._baseLayer.options;
            wmsParams.time = new Date(time).toISOString().slice(0, -5) + "Z";
            return new this._baseLayer.constructor(
              this._baseLayer.getURL(),
              wmsParams,
            );
          };
        });

        return tly;
      });
  };
});
