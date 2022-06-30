include.module( 'layer-rofs', [ 'layer' ], function () {
    "use strict";

    function RofsLayer( config ) {
        SMK.TYPE.Layer[ 'vector' ].prototype.constructor.apply( this, [ config ] )
    }

    $.extend( RofsLayer.prototype, SMK.TYPE.Layer[ 'vector' ].prototype )

    SMK.TYPE.Layer[ 'rofs' ] = RofsLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //  
    SMK.TYPE.Layer[ 'rofs' ].prototype.canMergeWith = function ( other ) {
        return other.config.type == 'fire-reports-cluster'
    }

    SMK.TYPE.Layer[ 'rofs' ].prototype.getConfig = function () {
        var cfg = JSON.parse( JSON.stringify( SMK.TYPE.Layer[ 'vector' ].prototype.getConfig.call( this ) ) )
        
        cfg.type = 'rofs'
        delete cfg.subType

        return cfg
    }
} )
