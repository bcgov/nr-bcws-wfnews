include.module( 'layer-image-leaflet', [ 'layer-image' ], function () {
    "use strict";

    function ImageLeafletLayer() {
        SMK.TYPE.Layer[ 'image' ].prototype.constructor.apply( this, arguments )
    }

    $.extend( ImageLeafletLayer.prototype, SMK.TYPE.Layer[ 'image' ].prototype )

    SMK.TYPE.Layer[ 'image' ][ 'leaflet' ] = ImageLeafletLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'image' ][ 'leaflet' ].create = function ( layers, zIndex ) {
        var ly = layers[ 0 ].config

        var overlay = L.imageOverlay( ly.baseUrl, ly.bounds, {
            opacity: ly.opacity
        });

        var timeOverlay = L.timeDimension.layer.imageOverlay( overlay, {
            getUrlFunction: SMK.TYPE.Layer[ 'image' ][ 'leaflet' ].getImageUrl
        });

        return Promise.resolve( timeOverlay )
    }

    function pad2 ( n ) { return n < 10 ? '0' + n : n }
    
    SMK.TYPE.Layer[ 'image' ][ 'leaflet' ].getImageUrl = function ( baseUrl, time, context ) {        
        /* jshint evil: true */

        var timestamp = time.getUTCFullYear().toString()
        timestamp += pad2( time.getUTCMonth() + 1 ).toString()
        timestamp += pad2( time.getUTCDate() ).toString()
        timestamp += pad2( time.getUTCHours() ).toString()
        timestamp += pad2( time.getUTCMinutes() ).toString()
        
        return SMK.UTIL.templateReplace( baseUrl, function ( token ) {
            return ( function () {
                var e = eval( token )
                // console.log( 'replace', token, e, this )
                return e
            } ).call( context )
        } )
    }
} )
