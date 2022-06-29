include.module( 'layer-mobile-resources-cluster', [ 'layer' ], function () {
    "use strict";

    function MobileResourcesClusterLayer() {
        SMK.TYPE.Layer[ 'vector' ].prototype.constructor.apply( this, arguments )
    }

    $.extend( MobileResourcesClusterLayer.prototype, SMK.TYPE.Layer[ 'vector' ].prototype )

    SMK.TYPE.Layer[ 'mobile-resources-cluster' ] = MobileResourcesClusterLayer
} )
