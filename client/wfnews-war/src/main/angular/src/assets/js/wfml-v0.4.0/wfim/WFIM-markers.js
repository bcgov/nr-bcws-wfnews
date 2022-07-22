( function () {
window.WFIM = {}

WFIM.RoF = {};

WFIM.RoF.LAYER_ID =  'rof';
WFIM.RoF.INFO_TITLE =  'Report of Fire';

WFIM.Incident = {};

WFIM.Incident.LAYER_ID = 'incident';
WFIM.Incident.INFO_TITLE = 'Incident';


var INFO_ATTR_ROF = [
    { title: 'ROF #', name: 'yearNumber'  },
    { title: "Location", name: "latLon" },
    { title: "Status", name: "messageStatusCode" },
    { title: "Last Updated", name: "lastUpdated" },
    { title: "Values at Risk", name: "valuesBeingThreatenedNote" },
    { title: "Size", name: "fireSizeComparisonCode" },
    { title: "Caller", name: "callerName" },
    { title: "Phone", name: "callerTelephone" }
];

var INFO_ATTR_INCIDENT = [
    { title: 'Incident #', name: 'incidentLabel'  },
    { title: "Type", name: "incidentTypeCode" },
    { title: "Stage of Control", name: "stageOfControlCode" },
    { title: "Centre", name: "fireCentreOrgUnitIdentifier" },
    { title: "Zone", name: "zoneOrgUnitIdentifier" },
    { title: "Location", name: "latLon" },
    { title: "Geographic:", name: "geographicDescription" },
    { title: "Size", name: "fireSizeHectares" },
    { title: "Cause", name: "suspectedCauseCategoryCode" }
];

function getRofIconType ( rof ){
    // Message status codes (MSC)
    const MSC_ACKNOWLEDGED = 'Acknowledged';
    const MSC_DRAFT = 'Draft';
    const MSC_ASSIGNED = 'Assigned To Incident';
    const MSC_PROCESSED = 'Processed';
    const MSC_CANCELLED = 'Cancelled';
    const MSC_SUBMITTED = 'Submitted';

    if( rof ) {
        if( rof.messageStatusCode === MSC_DRAFT) {
            return MSC_DRAFT.toUpperCase();
        }else if( rof.messageStatusCode === MSC_ASSIGNED ) {
            return (rof.publicReportTypeCode + '-ASSIGNED').toUpperCase();
        }else if( rof.messageStatusCode === MSC_CANCELLED) {
            return (rof.publicReportTypeCode + '-CANCELLED').toUpperCase();
        }
        return rof.publicReportTypeCode;
    }
    console.log( 'rof undefined', rof);

    return;
}



WFIM.RoF.Util = {};

WFIM.RoF.Util.clear = function( mapapi ) {
    mapapi.layer.setData( WFIM.RoF.LAYER_ID )
}

WFIM.RoF.Util.addClusteredMarkers = function(mapapi, features, callback) {
    mapapi.layer.setData( WFIM.RoF.LAYER_ID, {
        type: 'FeatureCollection',
        features: features.map( function ( f ) {
            return {
                type: 'Feature',
                set: WFIM.RoF.LAYER_ID,
                properties: f,
                geometry: {
                    type: 'Point',
                    coordinates: [ f.longitude, f.latitude ]
                }
            }
        } )
    }, callback )
}

// ===============================================================

WFIM.Incident.Util = {};

WFIM.Incident.Util.clear = function( mapapi ) {
    mapapi.layer.setData( WFIM.Incident.LAYER_ID )
}

WFIM.Incident.Util.addClusteredMarkers = function( mapapi, features, callback ) {
    mapapi.layer.setData( WFIM.Incident.LAYER_ID, {
        type: 'FeatureCollection',
        features: features.map( function ( f ) {
            return {
                type: 'Feature',
                set: WFIM.Incident.LAYER_ID,
                properties: f,
                geometry: {
                    type: 'Point',
                    coordinates: [ f.incidentLocation.longitude, f.incidentLocation.latitude ]
                }
            }
        } )
    }, callback )
}

function now( opt ) {
    var d = new Date()
    if ( opt.minute ) d.setMinutes( d.getMinutes() + opt.minute )
    return d
}

function resourceLabel( feature ) {
    var time10minsAgo = now( { minute: -10 } ).toISOString()
    var time30minsAgo = now( { minute: -30 } ).toISOString()

    var status = 'unknown' 
    if ( feature.properties.at_base )
        status = 'station'        
    else if ( feature.properties.position_timestamp > time10minsAgo ) 
        status = 'active'
    else if ( feature.properties.position_timestamp < time30minsAgo ) 
        status = 'ground'
    else
        status = 'lost'

    return `<span class="wfim-fire-resource-status-${ status } wfim-fire-resource-alert-${ (feature.properties.alert_status || 'unknown').toLowerCase() }" data-id="${ feature.id }">${ feature.properties.Call_Sign }</span>`
}

const maxSpeed = 350
const minScale = 0.1
const maxScale = 0.4
const scaleRange = maxScale - minScale

function featureId( f ) {
    if ( f.featureId ) return f.featureId
    // debugger
    return Object.keys( f.properties ).sort().map( function ( k ) { return f.properties[ k ] } ).join( '~' )
}

WFIM.getHandlers = function ( getAPI ) {
    return {
        'layer.resource.point': function ( ly, feature ) {
            var arrowStyle = 'display: none'
            if ( feature.properties.speed && feature.properties.heading ) {
                var scale = ( feature.properties.speed / maxSpeed * scaleRange ) + minScale
                arrowStyle = `transform: scale(${ scale }) rotate(${ feature.properties.heading - 90 }deg);`
            }

            return {
                icon: L.divIcon( {
                    iconSize: [ 10, 10 ],
                    iconAnchor: [ 7, 7 ],
                    className: `wfim-fire-resource wfim-fire-resource-status-${ feature.properties.status }`,
                    html: `<div class="wfim-fire-resource-arrow" style="${ arrowStyle }"></div><div class="wfim-fire-resource-labels">${ resourceLabel( feature ) }</div>`,
                } ),
                interactive: false
            }
        },

        'overlay.resource.cluster': function ( ov ) {
            var callbackOpt = {}
            var callbackProxy = function( handler, properties, layer ) {
                return function () {
                    var h = ov.layerMgr.wfmlMap.getHandler( 'feature', handler, 'action' )
                    if ( h )
                        h( properties, layer, callbackOpt )
                }
            }

            var selectedMarker, popupMarker 

            return {
                maxClusterRadius: 40,
                zoomToBoundsOnClick: false,

                onCreate: function( features ) {
                    var labels = features
                        .map( function ( f ) { return resourceLabel( f ) } )

                    return L.divIcon( {
                        iconSize: [ 10, 10 ],
                        iconAnchor: [ 7, 7 ],
                        className: `wfim-fire-resource wfim-fire-resource-cluster`,
                        html: `<div class="wfim-fire-resource-labels">${ labels.join( '' ) }</div>`
                    } )
                },
            
                onClick: function ( leafLayer, features, featureId, mod ) {    
                    selectedMarker = null
                    var html = mod.Util.featureSetHtml( features, featureId, callbackProxy, function ( marker ) { selectedMarker = marker } )
                    leafLayer
                        .bindPopup( html, { autoPanPaddingTopLeft: [ 50, 50 ], offset: [ 0, 0 ] } )
                        .openPopup()
                        .on( 'popupclose', function () {
                    // console.log('popupclose',selectedMarker)
                            selectedMarker = null
                        } )
                    callbackOpt.popup = leafLayer
                },

                onBeforeUpdate: function () {
                    // console.log('onBeforeUpdate',selectedMarker)
                    if ( !selectedMarker ) return

                    popupMarker = selectedMarker
                },

                onAfterUpdate: function ( clusterClick ) {
                    // console.log('onAfterUpdate',popupMarker)
                    if ( !popupMarker ) return

                    var id = featureId( popupMarker.feature )
                    var newMarker 
                    ov.leafLayer.eachLayer( function ( ly ) {
                        if ( !newMarker && featureId( ly.feature ) == id )
                            newMarker = ly
                    } )

                    if ( newMarker ) {
                        var clus = ov.leafLayer.getVisibleParent( newMarker )
                        clusterClick( clus, featureId( newMarker.feature ) )
                        // console.log(newMarker)
                    }

                    popupMarker = null
                }
            }
        },

        'layer.resource-track.point': function ( ly, feature ) {
            return {
                icon: L.divIcon( {
                    iconSize: [ 6, 6 ],
                    iconAnchor: [ 4, 4 ],
                    className: 'wfim-resource-track',
                } ),
                interactive: false
            }
        },

        'layer.resource-track.filter': function ( ly, res ) {
            if ( !res || !res.features || res.features == 0 ) {
                ly.enable( false )

                return res
            }

            ly.enable( true )

            var ls = {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: res.features.map( function ( f ) { return f.geometry.coordinates } )
                }
            }

            res.features.push(
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

            res.features.push(
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

            return res 
        },

        'layer.resource-track.title': function ( ly ) {
            return ly.parameter.Call_Sign ? `Track for ${ ly.parameter.Call_Sign }` : 'No track'
        },

        'feature.resource-track.action': function ( properties, layer, opt ) {
            var mapapi = getAPI()

            if ( opt.popup )
                opt.popup.closePopup()

            mapapi.layer.setParameter( 'resources-track', 'registration', properties.registration )
            mapapi.layer.setParameter( 'resources-track', 'Call_Sign', properties.Call_Sign )
            mapapi.layer.setParameter( 'resources-track', 'OperationalFunction', properties.OperationalFunction )
            mapapi.layer.setParameter( 'resources-track', 'Agency', properties.Agency )
            
            mapapi.layer.visible( 'resources-track', true )
            mapapi.layer.enable( 'resources-track', true )

            mapapi.layer.redraw( 'resources-track' )
                .then( function () {
                    mapapi.layer.zoomTo( 'resources-track' )
                } )
        },

        'layer.wfim.fetchFeatures': function ( ly, feature, data ) {
            if ( !data ) throw new Error( 'no data' )
            return data
        },

        'layer.wfim.point': function ( ly, feature ) {
            if ( ly.id == WFIM.Incident.LAYER_ID ) {
                var incidentIcon = 'incident-icon-' + ( feature.properties.incidentSituation.interfaceFireInd ? 'red' : 'green' )

                return {
                    icon: L.divIcon( { 
                        className:  'wfim-incident', 
                        html:       `<div class="incident-label">${ feature.properties.incidentLabel }</div><div class="incident-icon ${ incidentIcon }"></div>`,
                        iconSize:   [ 50, 36 ],
                        iconAnchor: [ 25, 20 ]
                    } )
                }
            }

            if ( ly.id == WFIM.RoF.LAYER_ID ) {
                var statusCode = feature.properties.messageStatusCode

                var label = feature.properties.reportOfFireLabel
                if ( statusCode == 'Draft' ) 
                    label = 'Draft'
                if ( statusCode == 'Assigned To Incident' ) 
                    label = feature.properties.incidentLabel

                var classes = 'wfim-rof'
                if ( statusCode == 'Submitted' )
                    classes += ' rof-unack rof-blinking'

                var rofIcon = 'rof-icon-' + getRofIconType( feature.properties ).toLowerCase()

                return {
                    icon: L.divIcon( { 
                        className:  classes, 
                        html:       `<div class="rof-label">${ label }</div><div class="rof-icon ${ rofIcon }"></div>`,
                        iconSize:   [ 50, 36 ],
                        iconAnchor: [ 25, 20 ]
                    } )
                }
            }
        },

        'layer.wfim.feature': function ( ly, feature, leafLayer ) {
            if ( ly.id == WFIM.Incident.LAYER_ID ) {
                leafLayer.hideDelay = 800; 
                leafLayer.bindTooltipDelayed( function ( featureLayer ) {
                    return WFML.Util.infoHtml( feature.properties, INFO_ATTR_INCIDENT, {
                        className:  'incident-tooltip',
                        title:      WFIM.Incident.INFO_TITLE + ' - ' + feature.properties.hoverTitle
                    } )
                }, {
                    permanent:  false,
                    direction:  'auto-all',
                    offset:     L.point(20, 20),
                    className:  'incident-tooltip'
                } )
            }

            if ( ly.id == WFIM.RoF.LAYER_ID ) {
                leafLayer.hideDelay = 800; 
                leafLayer.bindTooltipDelayed( function ( featureLayer ) {
                    return WFML.Util.infoHtml( feature.properties, INFO_ATTR_ROF, {
                        className:  'rof-tooltip',
                        title:      WFIM.RoF.INFO_TITLE + ' - ' + feature.properties.hoverTitle
                    } )
                }, {
                    permanent:  false,
                    direction:  'auto-all',
                    offset:     L.point(20, 20),
                    className:  'rof-tooltip'
                } )
            }
        },

        'layer.wfim.checkHealth': function ( ly, maxAge, timeout, data ) {
            if ( !data ) throw new Error( 'no data' )
            return true
        },

        'overlay.wfim.cluster': function ( ov ) {
            return {
                maxClusterRadius: 57,

                onCreate: function ( features ) {
                    var rofHTML = ''
                    if ( features.some( function ( f ) { return f.set == WFIM.RoF.LAYER_ID } ) ) 
                        rofHTML = `<div class="rof-cluster ${ features.some( function ( f ) { return f.properties.messageStatusCode == 'Submitted' } ) ? 'rof-cluster-unack' : '' }"></div>`
                    
                    var incidentHTML = ''
                    if ( features.some( function ( f ) { return f.set == WFIM.Incident.LAYER_ID } ) )
                        incidentHTML = `<div class="incident-cluster"></div>`

                    return L.divIcon( {
                        iconSize:   [ 40, 40 ],
                        iconAnchor: [ 20, 20 ],
                        className:  'wfim-cluster',
                        html:       `${ incidentHTML }${ rofHTML }<span>${ features.length }</span>`
                    } )
                },
            }
        },

        'overlay.wfim.enabled': function ( ov, inner ) {
            return function () {} // do nothing
        }
    }
}
} )()
