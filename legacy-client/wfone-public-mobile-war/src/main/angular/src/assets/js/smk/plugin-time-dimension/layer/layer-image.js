include.module( 'layer-image', [ 'layer' ], function () {
    "use strict";

    function ImageLayer() {
        SMK.TYPE.Layer.prototype.constructor.apply( this, arguments )
    }

    $.extend( ImageLayer.prototype, SMK.TYPE.Layer.prototype )

    SMK.TYPE.Layer[ 'image' ] = ImageLayer

    ImageLayer.prototype.initLegends = function ( viewer, width, height ) {
        return [ {
            url: this.config.legend.url,
            title: this.config.legend.title || this.config.title,
            width: 200,
            height: 60
        } ]
    }

    ImageLayer.prototype.getFeaturesInArea = function ( area, view, option ) {
    }

} )
