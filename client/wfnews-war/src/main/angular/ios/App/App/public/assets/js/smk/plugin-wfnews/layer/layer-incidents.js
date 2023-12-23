include.module("layer-incidents", ["layer"], function () {
  "use strict";

  function IncidentsLayer(config) {
    SMK.TYPE.Layer["vector"].prototype.constructor.apply(this, [config]);
  }

  $.extend(IncidentsLayer.prototype, SMK.TYPE.Layer["vector"].prototype);

  SMK.TYPE.Layer["incidents"] = IncidentsLayer;
  // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
  //
  SMK.TYPE.Layer["incidents"].prototype.canMergeWith = function (other) {
    return other.config.type == "fire-reports-cluster";
  };

  SMK.TYPE.Layer["incidents"].prototype.getConfig = function () {
    var cfg = JSON.parse(
      JSON.stringify(SMK.TYPE.Layer["vector"].prototype.getConfig.call(this)),
    );

    cfg.type = "incidents";
    delete cfg.subType;

    return cfg;
  };
});
