include.module( 'layer-wms-time', [ 'layer' ], function () {
    "use strict";

    function WmsTimeLayer() {
        SMK.TYPE.Layer[ 'wms' ].prototype.constructor.apply( this, arguments )
    }

    $.extend( WmsTimeLayer.prototype, SMK.TYPE.Layer[ 'wms' ].prototype )

    SMK.TYPE.Layer[ 'wms-time' ] = WmsTimeLayer
} )
