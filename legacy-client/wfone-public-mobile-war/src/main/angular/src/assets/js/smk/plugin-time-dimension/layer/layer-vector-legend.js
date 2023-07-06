include.module('layer-vector-legend', ['layer'], function () {
    "use strict";

    function VectorLegendLayer() {
        SMK.TYPE.Layer.prototype.constructor.apply(this, arguments)
    }

    $.extend(VectorLegendLayer.prototype, SMK.TYPE.Layer['vector'].prototype)

    SMK.TYPE.Layer['vector-legend'] = VectorLegendLayer

    VectorLegendLayer.prototype.initLegends = function (viewer, width, height) {
        return [{
            url: this.config.legend.url,
            title: this.config.legend.title || this.config.title,
            width: 15,
            height: 15
        }]
    }


})
