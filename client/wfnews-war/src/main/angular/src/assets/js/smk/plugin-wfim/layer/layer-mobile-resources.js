include.module( 'layer-mobile-resources', [ 'layer' ], function () {
    "use strict";

    function MobileResourcesLayer( config ) {
        SMK.TYPE.Layer[ 'vector' ].prototype.constructor.apply( this, [ config ] )
    }

    $.extend( MobileResourcesLayer.prototype, SMK.TYPE.Layer[ 'vector' ].prototype )

    SMK.TYPE.Layer[ 'mobile-resources' ] = MobileResourcesLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //  
    SMK.TYPE.Layer[ 'mobile-resources' ].prototype.canMergeWith = function ( other ) {
        return other.config.type == 'mobile-resources-cluster'
    }

    SMK.TYPE.Layer[ 'mobile-resources' ].prototype.getConfig = function () {
        var cfg = JSON.parse( JSON.stringify( SMK.TYPE.Layer[ 'vector' ].prototype.getConfig.call( this ) ) )
        
        cfg.type = 'mobile-resources'
        delete cfg.subType

        return cfg
    }
} )
