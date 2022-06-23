include.module( 'layer-mobile-resources-leaflet', [
    'layer-mobile-resources',
    'layer-mobile-resources-cluster-leaflet',
    'plugin-wfim-util'
], function ( inc ) {
    "use strict";

    function MobileResourcesLeafletLayer() {
        SMK.TYPE.Layer[ 'mobile-resources' ].prototype.constructor.apply( this, arguments )
        SMK.TYPE.Layer[ 'mobile-resources-cluster' ][ 'leaflet' ].call( this, arguments )
        this.clickCallback = function () {}
    }

    $.extend( MobileResourcesLeafletLayer.prototype, SMK.TYPE.Layer[ 'mobile-resources' ].prototype )

    SMK.TYPE.Layer[ 'mobile-resources' ][ 'leaflet' ] = MobileResourcesLeafletLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    const maxSpeed = 350
    const minScale = 0.1
    const maxScale = 0.4
    const scaleRange = maxScale - minScale
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'mobile-resources' ][ 'leaflet' ].create = function ( layers, zIndex ) {
        var self = this
        // console.log( 'create layer mobile-resources' )

        var pointHandler = function ( ly, feature ) {
            var arrowStyle = 'display: none'
            if ( feature.properties.SPEED && feature.properties.HEADING ) {
                var scale = ( feature.properties.SPEED / maxSpeed * scaleRange ) + minScale
                arrowStyle = `transform: scale(${ scale }) rotate(${ feature.properties.HEADING - 90 }deg);`
            }

            return {
                icon: L.divIcon( {
                    iconSize: [ 10, 10 ],
                    iconAnchor: [ 7, 7 ],
                    className: `wfim-fire-resource wfim-fire-resource-status-${ feature.properties.STATUS }`,
                    html: `<div class="wfim-fire-resource-arrow" style="${ arrowStyle }"></div><div class="wfim-fire-resource-labels">${ inc[ 'plugin-wfim-util' ].resourceLabel( feature ) }</div>`,
                } ),
                // interactive: false
            }
        }

        var layer = L.geoJSON( null, {
            pointToLayer: function ( geojson, latlng ) {
                var mark = L.marker( latlng, Object.assign( {
                    layerId: layers[ 0 ].id
                }, pointHandler( self, geojson ) ) )

                mark.on( 'click', function( event ) {
                    SMK.HANDLER.get( 'resources', 'cluster-click' )( [ {
                        id: layers[ 0 ].id,
                        features: [ geojson ]
                    } ] )
                } )

            return mark
            },
            style: function ( feature ) {
                return feature.properties._style || {}
            },
            layerId: layers[ 0 ].id
        } )

        layer.on( {
            add: function () {
                if ( layer.options?.renderer?._container )
                    layer.options.renderer._container.style.zIndex = zIndex
            }
        } )

        var data = {
            service:        'WFS',
            version:        '1.0.0',
            request:        'GetFeature',
            srsName:        'epsg:4326',
            typename:       layers[ 0 ].config.layerName,
            outputformat:   'application/json',
            cql_filter:     layers[ 0 ].config.where || "include",
        }

        var url = inc[ 'plugin-wfim-util' ].encodeUrl( layers[ 0 ].config.serviceUrl, data )

        return fetch( url, {
            method: 'GET',
            headers: layers[ 0 ].config.header,
            mode: 'cors'
        } )
        .then( function ( res ) {
            return res.blob()
        } )
        .then( function ( blob ) {
            return new Promise( ( res, rej ) => {
                var reader = new FileReader()
                reader.onload = function () {
                    try {
                        res( JSON.parse( reader.result ) )
                    }
                    catch ( e ) { rej( e ) }
                }
                reader.readAsBinaryString( blob )
            } )
        } )
        .catch( ( e ) => {
            console.warn( e )
            throw Error( `Failed requesting layer ${ layers[ 0 ].config.layerName } "${ data.cql_filter }": ${ e }` )
        } )
        .then( function ( data ) {
            if ( data )
                layers[ 0 ].updateClusters( function () {
                    layer.clearLayers()
                    layer.addData( inc[ 'plugin-wfim-util' ].addFeatureId( data ) )
                    return layer
                } )

            return layer
        } )
        // .catch( ( e ) => {
        //     console.warn( e )
        //     // throw Error( `Failed requesting layer ${ layers[ 0 ].config.layerName } "${ data.cql_filter }": ${ e }` )
        // } )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    MobileResourcesLeafletLayer.prototype.setClickCallback = function ( cb ) {
        this.clickCallback = cb
    }

} )
