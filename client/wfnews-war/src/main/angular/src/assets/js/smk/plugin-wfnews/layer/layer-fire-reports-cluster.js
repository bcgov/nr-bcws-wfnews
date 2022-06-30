include.module( 'layer-fire-reports-cluster', [ 'layer' ], function () {
    "use strict";

    function FireReportsClusterLayer() {
        SMK.TYPE.Layer[ 'vector' ].prototype.constructor.apply( this, arguments )
    }

    $.extend( FireReportsClusterLayer.prototype, SMK.TYPE.Layer[ 'vector' ].prototype )

    SMK.TYPE.Layer[ 'fire-reports-cluster' ] = FireReportsClusterLayer
} )
