include.module("layer-wms-time-cql", ["layer"], function () {
  "use strict";

  function WMSEpochTimeLayer() {
    SMK.TYPE.Layer["wms"].prototype.constructor.apply(this, arguments);
  }

  $.extend(WMSEpochTimeLayer.prototype, SMK.TYPE.Layer["wms"].prototype);

  SMK.TYPE.Layer["wms-time-cql"] = WMSEpochTimeLayer;

  var time;
  SMK.TYPE.Layer["wms-time-cql"].prototype.setTime = function (time) {
    if (!time.getCql) {
      console.warn("Layer time set to unexpected value", time);
    }
    this.time = time;
    this.updateFilters();
  };
  SMK.TYPE.Layer["wms-time-cql"].prototype.getTime = function () {
    return this.time;
  };

  SMK.TYPE.Layer["wms-time-cql"].prototype.dynamicFilters = function () {
    return [this.getTime().getCql(this)];
  };

  SMK.TYPE.Layer["wms-time-cql"].prototype.updateFilters = function () {
    if (!this.baseFilter) {
      this.baseFilter = this.config.where || "INCLUDE";
    }

    var filters = [this.baseFilter, ...this.dynamicFilters()];

    if (filters.length > 1) {
      filters = filters.map((filter) => `(${filter})`);
    }
    this.config.where = filters.join(" AND ");
  };
});
