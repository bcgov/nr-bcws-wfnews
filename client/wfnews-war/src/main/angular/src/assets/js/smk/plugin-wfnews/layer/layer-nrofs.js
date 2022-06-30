include.module( 'layer-nrofs', [ 'layer' ], function () {
    "use strict";

    function NrofsLayer( config ) {
        SMK.TYPE.Layer[ 'vector' ].prototype.constructor.apply( this, [ config ] )
    }

    $.extend( NrofsLayer.prototype, SMK.TYPE.Layer[ 'vector' ].prototype )

    SMK.TYPE.Layer[ 'nrofs' ] = NrofsLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //  
    // SMK.TYPE.Layer[ 'rofs' ].prototype.canMergeWith = function ( other ) {
    //     return other.config.type == 'cluster'
    // }
} )
