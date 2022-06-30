include.module( 'layer-nrofs-leaflet', [
    'layer-nrofs',
    'plugin-wfim-util'
], function ( inc ) {
    "use strict";

    function NrofsLeafletLayer() {
        SMK.TYPE.Layer[ 'nrofs' ].prototype.constructor.apply( this, arguments )
        this.clickCallback = function () {}
    }

    $.extend( NrofsLeafletLayer.prototype, SMK.TYPE.Layer[ 'nrofs' ].prototype )

    SMK.TYPE.Layer[ 'nrofs' ][ 'leaflet' ] = NrofsLeafletLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    const nrofAttributes = [
        { title: 'NROF #', name: 'zoneId'  },
        { title: "Fire Centre", name: "fireCentreName" },
        { title: "Notes", name: "note" },
        { title: "Created Date/Time", name: "effective" },
        { title: "Expired Date/Time", name: "expiry" },
        { title: "Created By", name: "userId" },
        { title: "Status", name: "status" }
    ];
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'nrofs' ][ 'leaflet' ].create = function ( layers, zIndex ) {
        var self = this
        // console.log( 'create layer nrofs' )

        var pointHandler = function ( ly, feature ) {
            var label = `NROF-${feature.properties.zoneId}`

            var classes = nrofClass(feature, 'wfim-nrof-point')

            return {
                icon: L.divIcon( {
                    className:  classes,
                    html:       `<div class="nrof-label">${ label }</div><div class="nrof-icon"></div>`,
                    iconSize:   [ 67, 36 ],
                    iconAnchor: [ 33.5, 27 ]
                } )
            }
        }

        var featureHandler = function ( ly, feature, leafLayer ) {
            leafLayer.hideDelay = 800;
            leafLayer.bindTooltipDelayed( function ( featureLayer ) {
                return inc[ 'plugin-wfim-util' ].infoHtml( feature.properties, nrofAttributes, {
                    className:  'nrof-tooltip',
                    title:      'No More Reports of Fire'
                } )
            }, {
                permanent:  false,
                direction:  'auto-all',
                offset:     [ 20, 20 ],
                className:  nrofClass(feature, 'nrof-tooltip')
            } )
        }

        var layer = L.geoJSON( null, {
            pointToLayer: function ( geojson, latlng ) {
                var mark = L.marker( latlng, Object.assign( {
                    layerId: self.id
                }, pointHandler( self, geojson ) ) )
            return mark
            },
            onEachFeature: function ( feature, leafLayer ) {
                featureHandler( self, feature, leafLayer )

                leafLayer.on( 'click', function( event ) {
                    return layers[ 0 ].clickCallback( event )
                } )
            },
            style: function ( feature ) {
                if ( feature.geometry.type == 'Point' ) return

                return {
                    className: `wfim-rofx-${ feature.properties.status.toLowerCase() }`
                }
            }
        } )

        layer.on( {
            add: function () {
                if ( layer.options?.renderer?._container )
                    layer.options.renderer._container.style.zIndex = zIndex
            }
        } )

        layers[ 0 ].loadLayer = function ( data ) {
            data.forEach( function ( ft ) {
                layer.addData( ft )

                let pt = JSON.parse( JSON.stringify( ft ) )
                pt.geometry = window[ 'turf' ].pointOnFeature( ft ).geometry
                layer.addData( pt )
            } )
        }

        if ( layers[ 0 ].loadCache ) {
            layers[ 0 ].loadLayer( layers[ 0 ].loadCache )
            layers[ 0 ].loadCache = null
        }

        layers[ 0 ].clearLayer = function () {
            layer.clearLayers()
        }

        return Promise.resolve( layer )
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    NrofsLeafletLayer.prototype.setClickCallback = function ( cb ) {
        this.clickCallback = cb
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function nrofClass(feature, ...otherClasses) {
        return otherClasses.concat(['wfim-nrof',`wfim-nrof-${feature.properties.status.toLowerCase()}`]).join(' ')
    }

} )
