include.module( 'layer-resource-tracks-leaflet', [
    'layer-resource-tracks',
    'plugin-wfim-util'
], function ( inc ) {
    "use strict";

    function ResourceTracksLeafletLayer() {
        SMK.TYPE.Layer[ 'resource-tracks' ].prototype.constructor.apply( this, arguments )
        this.clickCallback = function () {}
    }

    $.extend( ResourceTracksLeafletLayer.prototype, SMK.TYPE.Layer[ 'resource-tracks' ].prototype )

    SMK.TYPE.Layer[ 'resource-tracks' ][ 'leaflet' ] = ResourceTracksLeafletLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'resource-tracks' ][ 'leaflet' ].create = function ( layers, zIndex ) {
        var self = this
        var pointHandler = function ( ly, feature ) {
            return {
                icon: L.divIcon( {
                    iconSize: [ 6, 6 ],
                    iconAnchor: [ 4, 4 ],
                    className: 'wfim-resource-track',
                } ),
                interactive: false
            }
        }

        var layer = L.geoJSON( null, {
            pointToLayer: function ( geojson, latlng ) {
                var mark = L.marker( latlng, Object.assign( {
                    layerId: self.id
                }, pointHandler( self, geojson ) ) )
            return mark
            },
            // onEachFeature: function ( feature, leafLayer ) {
            //     featureHandler( self, feature, leafLayer )

            //     leafLayer.on( 'click', function( event ) {
            //         return layers[ 0 ].clickCallback( event )
            //     } )
            // },
            style: function ( feature ) {
                return feature.properties._style || {}
            }
        } )

        layer.on( {
            add: function () {
                if ( layer.options?.renderer?._container )
                    layer.options.renderer._container.style.zIndex = zIndex
            }
        } )

        let timeFilter = ''
        try {
            timeFilter = ' AND ' + layers[ 0 ].getTime().getCql(layers[ 0 ])
        }
        catch ( e ) {
            console.warn( e )
        }

        var data = {
            service:        'WFS',
            version:        '1.0.0',
            request:        'GetFeature',
            srsName:        'epsg:4326',
            typename:       layers[ 0 ].config.layerName,
            outputformat:   'application/json',
            cql_filter:     ( layers[ 0 ].config.where || "include" ) + timeFilter
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
                    catch( e ) { rej( e ) }
                }
                reader.readAsBinaryString( blob )
            } )
        } )
        .catch( ( e ) => {
            console.warn( e )
            throw Error( `Failed requesting layer ${ layers[ 0 ].config.layerName } "${ data.cql_filter }": ${ e }` )
        } )
        .then( function ( data ) {
            if ( data ) {
                var ls = {
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: data.features.map( function ( f ) { return f.geometry.coordinates } )
                    }
                }

                data.features.push(
                    Object.assign( {
                        properties: {
                            _style: {
                                weight: 5,
                                color: '#000000',
                                interactive: false
                            }
                        }
                    }, ls )
                )

                data.features.push(
                    Object.assign( {
                        properties: {
                            _style: {
                                weight: 3,
                                color: '#ffff00',
                                interactive: false
                            }
                        }
                    }, ls )
                )

                layer.addData( data )
            }

            return layer
        } )
        // .catch( ( e ) => {
        //     console.warn( e )
        //     throw Error( `Failed requesting layer ${ layers[ 0 ].config.layerName } "${ data.cql_filter }": ${ e }` )
        // } )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    ResourceTracksLeafletLayer.prototype.setClickCallback = function ( cb ) {
        this.clickCallback = cb
    }

    SMK.TYPE.Layer[ 'resource-tracks' ][ 'leaflet' ].prototype.getTimeQuery = function ( ) {
        return this.getTime().getCql(this)
    }
} )
