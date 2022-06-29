include.module( 'layer-rofs-leaflet', [
    'layer-rofs',
    'layer-fire-reports-cluster-leaflet',
    'plugin-wfim-util'
], function ( inc ) {
    "use strict";

    function RofsLeafletLayer() {
        SMK.TYPE.Layer[ 'rofs' ].prototype.constructor.apply( this, arguments )
        SMK.TYPE.Layer[ 'fire-reports-cluster' ][ 'leaflet' ].call( this, arguments )
        this.clickCallback = function () {}
    }

    $.extend( RofsLeafletLayer.prototype, SMK.TYPE.Layer[ 'rofs' ].prototype )

    SMK.TYPE.Layer[ 'rofs' ][ 'leaflet' ] = RofsLeafletLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    const rofAttributes = [
        { title: "Location", name: "latLon" },
        { title: "Status", name: "messageStatusCode" },
        { title: "Last Updated", name: "lastUpdated" },
        { title: "Values at Risk", name: "valuesBeingThreatenedNote" },
        { title: "Size", name: "fireSizeComparisonCode" },
        { title: "Caller", name: "callerName" },
        { title: "Phone", name: "callerTelephone" }
    ];

    const STATUS_RECEIVED = "Received"
    const STATUS_DRAFT = "Draft"
    const STATUS_SUBMITTED = "Submitted"
    const STATUS_ACKNOWLEDGED = "Acknowledged"
    const STATUS_ASSIGNED_TO_INCIDENT = "Assigned To Incident"
    const STATUS_CANCELLED = "Cancelled"
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'rofs' ][ 'leaflet' ].create = function ( layers, zIndex ) {
        var self = this
        // console.log( 'create layer rofs' )

        var pointHandler = function ( ly, feature ) {
            if ( feature.set == 'rofs' ) {
                var messageStatusCode = feature.properties.messageStatusCode
                var publicReportTypeCode = feature.properties.publicReportTypeCode
                var reportOfFireLabel = feature.properties.reportOfFireLabel
                var incidentLabel = feature.properties.incidentLabel

                var classes = [ 'rof-status-' + messageStatusCode.toLowerCase().replace( /\s/g, '-' ), ]
                if ( publicReportTypeCode )
                    classes.push( 'rof-type-' + publicReportTypeCode.toLowerCase().replace( /\s/g, '-' ) )
                if ( feature.properties.hasAttachments )
                    classes.push( 'rof-attachments' )

                var label = reportOfFireLabel
                var status = ''
                switch ( messageStatusCode ) {
                case STATUS_RECEIVED:
                    status = 'Received'
                    classes.push( 'rof-blinking', 'rof-status' )
                    break

                case STATUS_DRAFT:
                    status = 'Draft'
                    classes.push( 'rof-status' )
                    break

                case STATUS_SUBMITTED:
                    classes.push( 'rof-blinking' )
                    break

                case STATUS_ACKNOWLEDGED:
                    break

                case STATUS_ASSIGNED_TO_INCIDENT:
                    label = incidentLabel
                    classes.push( 'rof-assigned' )
                    break

                case STATUS_CANCELLED:
                    classes.push( 'rof-cancelled' )
                    break

                default:
                    status = messageStatusCode + '?'
                    classes.push( 'rof-status' )
                }

                return {
                    icon: L.divIcon( {
                        className:  'wfim-rof ' + classes.join( ' ' ),
                        iconSize: [ 20, 20 ],
                        html:       `
<div class="rof-label">
    <div class="wrap">
        <div class="status">${ status }</div>
        <div class="label">
            <i class="material-icons attachments">camera</i>
            ${ label }
        </div>
    </div>
</div>
<div class="rof-icon"></div>
`,
                    } )
                }
            }
        }

        var featureHandler = function ( ly, feature, leafLayer ) {
            if ( feature.set == 'rofs' ) {
                leafLayer.hideDelay = 800;

                var statusCode = feature.properties.messageStatusCode
                var classes = "rof-tooltip rof-status-" + statusCode.toLowerCase().replace( /\s/g, '-' )

                var firstAttr = { title: 'ROF #', name: 'yearNumber' }
                if ( statusCode == 'Received' || statusCode == 'Draft' )
                    firstAttr = { title: 'ROF #', value: 'Not Assigned' }

                leafLayer.bindTooltipDelayed( function ( featureLayer ) {
                    return inc[ 'plugin-wfim-util' ].infoHtml( feature.properties, [ firstAttr ].concat( rofAttributes ), {
                        className:  classes,
                        title:      'Report of Fire - ' + feature.properties.hoverTitle
                    } )
                }, {
                    permanent:  false,
                    direction:  'auto-all',
                    offset:     [ 20, 20 ],
                    className:  classes
                } )
            }
        }

        var layerCreate = function () {
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
                    return feature.properties._style || {}
                }
            } )

            layer.on( {
                add: function () {
                    if ( layer.options?.renderer?._container )
                        layer.options.renderer._container.style.zIndex = zIndex
                }
            } )

            return layer
        }

        layers[ 0 ].loadLayer = function ( data ) {
            layers[ 0 ].updateClusters( function () {
                var ly = layerCreate()
                // console.log( 'load layer rofs' )
                data.forEach( function ( ft ) {
                    ly.addData( ft )
                } )
                return ly
            } )
        }

        if ( layers[ 0 ].loadCache ) {
            layers[ 0 ].loadLayer( layers[ 0 ].loadCache )
            layers[ 0 ].loadCache = null
        }

        layers[ 0 ].clearLayer = function () {
            layers[ 0 ].updateClusters( null )
        }

    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    RofsLeafletLayer.prototype.setClickCallback = function ( cb ) {
        this.clickCallback = cb
    }

} )
