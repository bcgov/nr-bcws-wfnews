include.module(
  "layer-wms-time-cql-leaflet",
  ["layer-wms-time-cql"],
  function () {
    "use strict";

    function WMSCQLTimeLayer(config) {
      SMK.TYPE.Layer["wms"]["leaflet"].prototype.constructor.apply(
        this,
        arguments,
      );
    }

    $.extend(
      WMSCQLTimeLayer.prototype,
      SMK.TYPE.Layer["wms-time-cql"].prototype,
    );

    SMK.TYPE.Layer["wms-time-cql"]["leaflet"] = WMSCQLTimeLayer;
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer["wms-time-cql"]["leaflet"].create = function (
      layers,
      zIndex,
    ) {
      return SMK.TYPE.Layer["wms"]["leaflet"].create.call(this, layers, zIndex);
    };
  },
);
