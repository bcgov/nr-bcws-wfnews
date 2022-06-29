include.module( 'layer-resource-tracks', [ 'layer' ], function () {
    "use strict";

    function ResourceTracksLayer( config ) {
        SMK.TYPE.Layer[ 'vector' ].prototype.constructor.apply( this, [ config ] )
    }

    $.extend( ResourceTracksLayer.prototype, SMK.TYPE.Layer[ 'vector' ].prototype )

    SMK.TYPE.Layer[ 'resource-tracks' ] = ResourceTracksLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //  
    // SMK.TYPE.Layer[ 'resource-tracks' ].prototype.canMergeWith = function ( other ) {
    //     return other.config.type == 'resource-tracks-cluster'
    // }
    
    var time;
    SMK.TYPE.Layer[ 'resource-tracks' ].prototype.setTime = function ( time ) {
        if(! time.getCql ) {
            console.warn("Layer time set to unexpected value", time)
        }
        this.time = time;
    }
    SMK.TYPE.Layer[ 'resource-tracks' ].prototype.getTime = function ( ) {
        return this.time;
    }
} )
