( function () {

WFML.RoF = {};

WFML.RoF.LAYER_ID =  'rof';
WFML.RoF.INFO_TITLE =  'Report of Fire';

WFML.Incident = {};

WFML.Incident.LAYER_ID = 'incident';
WFML.Incident.INFO_TITLE = 'Incident';


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

function incidentIconFile(incident) {
  return incident.incidentSituation.interfaceFireInd
            ? 'incident-red.png'
            : 'incident-green.png';
}

var ROF_ICON_MAP = {
                'DRAFT': 'rof_draft.png',

                'CAMPFIRE-CANCELLED':   'rof_campfire_cancel.png',
                'CAMPFIRE-ASSIGNED':    'rof_campfire_assign.png',
                'CAMPFIRE':             'rof_campfire.png',

                'CIGARETTE-CANCELLED':  'rof_cigarette_cancel.png',
                'CIGARETTE-ASSIGNED':   'rof_cigarette_assign.png',
                'CIGARETTE':            'rof_cigarette.png',

                'GENERAL-CANCELLED':    'rof_general_cancel.png',
                'GENERAL-ASSIGNED':     'rof_general_assign.png',
                'GENERAL':              'rof_general.png',

                'INTERFACE-CANCELLED':  'rof_interface_cancel.png',
                'INTERFACE-ASSIGNED':   'rof_interface_assign.png',
                'INTERFACE':            'rof_interface.png',

                'REGULAR-CANCELLED':    'rof_general_cancel.png',
                'REGULAR-ASSIGNED':     'rof_general_assign.png',
                'REGULAR':              'rof_general.png'
            };

function rofIconFile(rof) {
    return ROF_ICON_MAP[ getRofIconType( rof) ];
}

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

    return;
}



WFML.RoF.Util = {};

WFML.RoF.Util.clear = function( mapapi ) {
    mapapi.marker.removeMarkers( WFML.RoF.LAYER_ID );
}
WFML.RoF.Util.show = function( mapapi, isVisible ) {
    mapapi.marker.showMarkers( WFML.RoF.LAYER_ID, isVisible );
}
WFML.RoF.Util.isUnack = function( rof ) {
    return rof.messageStatusCode == 'Submitted';
}
WFML.RoF.Util.isDraft = function( rof ) {
    return rof.messageStatusCode == 'Draft';
}

WFML.RoF.Util.isAssigned = function( rof ) {
    return rof.messageStatusCode == 'Assigned To Incident';
}

WFML.RoF.Util.addClusteredMarkers = function(mapapi, features, callback) {
    mapapi.layer.visible(WFML.RoF.LAYER_ID, true);
    var markers = WFML.RoF.Util.getMarkers( features );
    mapapi.marker.addClusteredMarkers( WFML.RoF.LAYER_ID, markers, {
        markersClickCallback: callback,
        /*
        populatePopup: function ( ft ) {
            return '<pre>' + JSON.stringify( ft, null, '  ' ) + '</pre>'
        },
        */
        populateTooltip: function ( ft ) {
            var html = WFML.Popup.infoHtml( ft,
                INFO_ATTR_ROF, {
                    className: 'rof-tooltip',
                    title: WFML.RoF.INFO_TITLE + ' - ' + ft.hoverTitle
                });
            return html;
        },

        clustering: {
            zoomToBoundsOnClick: true,
            disableClusteringAtZoom: 16,
            spiderfyDistanceMultiplier: 2.25,
            maxClusterRadius: function (zoom) {
                return 40;
            },
            spiderfyOnMaxZoom: true,
            forceSpiderfyOnClick: false,
            className: 'rof-cluster',
            iconCreateFunction: function(cluster) {
                var clz = 'rof-cluster';
                if (hasUnack(cluster)) clz = 'rof-cluster-unack';

                var childCount = cluster.getChildCount();
                return new L.DivIcon( {
                    html: '<div><span>' + childCount + '</span></div>', className: clz,
                    iconSize: new L.Point(40, 40),
                } );

                function hasUnack(cluster) {
                    var childs = cluster.getAllChildMarkers();
                    var unack = WFML.Util.find(childs, function(ch) {
                        return WFML.RoF.Util.isUnack( ch.feature);
                    });
                    return unack != null;
                }
            }
        },
        tooltipConfig : {
            permanent: false,
            direction: 'auto-all',
            offset: L.point(20, 20),
            className: 'rof-tooltip'
        }
    } )
}

WFML.RoF.Util.addMarkers = function(mapapi, features) {
    var markers = WFML.RoF.Util.getMarkers( features );
    mapapi.marker.addMarkers( WFML.RoF.LAYER_ID, rofMarkers, {
        populatePopup: function ( ft ) {
            return '<pre>' + JSON.stringify( ft, null, '  ' ) + '</pre>'
        },
        populateTooltip: function ( ft ) {
            return '<pre>' + JSON.stringify( ft.reportOfFireLabel, null, '  ' ) + '</pre>'
        }
    } );
}


WFML.RoF.Util.getMarkers = function(reportOfFires, options) {
    var markers = [];

    if (reportOfFires && reportOfFires.length > 0) {
        for (var i in reportOfFires) {
            var rof = reportOfFires[i];

            var file = rofIconFile( rof )
            var url = WFML.BASE_URL + '/' + file;

            var lblClass = WFML.RoF.Util.isUnack( rof ) ? 'rof-label-unack' : 'rof-label';
            var iconClass = WFML.RoF.Util.isUnack(rof) ? 'rof-icon rof-blinking' : 'rof-icon';
            var lbl = '';

            if(WFML.RoF.Util.isDraft(rof)){
                lbl = 'Draft';
            }else if(WFML.RoF.Util.isAssigned(rof)){
                lbl = rof.incidentLabel+'';
            }else{
                lbl = rof.reportOfFireLabel+'';
            }

            var m = markerImgLabel(
                [ rof.latitude, rof.longitude ],
                url,
                lbl,
                {
                    size: [ 50, 16+20 ],
                    anchor: [ 25, 20 ],
                    className: iconClass,
                    imageClass: 'rof-img',
                    labelClass: lblClass
                }
            );
            m.feature = rof;

            markers.push(m);
        }
    }
    return markers;
};



// ===============================================================

WFML.Incident.Util = {};

WFML.Incident.Util.clear = function( mapapi ) {
    mapapi.marker.removeMarkers( WFML.Incident.LAYER_ID );
}
WFML.Incident.Util.show = function( mapapi, isVisible ) {
    mapapi.marker.showMarkers( WFML.Incident.LAYER_ID, isVisible );
}

WFML.Incident.Util.addClusteredMarkers = function(mapapi, features, callback) {
    mapapi.layer.visible(WFML.Incident.LAYER_ID, true);
    var markers = WFML.Incident.Util.getMarkers( features );
    mapapi.marker.addClusteredMarkers( WFML.Incident.LAYER_ID, markers, {
        markersClickCallback: callback,
        /*
        populatePopup: function ( ft ) {
            return '<pre>' + JSON.stringify( ft, null, '  ' ) + '</pre>'
        },
        */
        populateTooltip: function ( ft ) {
            var html = WFML.Popup.infoHtml( ft,
            INFO_ATTR_INCIDENT, {
                className: 'incident-tooltip',
                title: WFML.Incident.INFO_TITLE + ' - ' + ft.hoverTitle
            });
            return html;
        },
        clustering: {
            zoomToBoundsOnClick: true,
            disableClusteringAtZoom: 16,
            spiderfyDistanceMultiplier: 2.25,
            maxClusterRadius: function (zoom) {
                return 40;
            },
            spiderfyOnMaxZoom: true,
            forceSpiderfyOnClick: false,
            className: 'incident-cluster',
        },
        tooltipConfig : {
            permanent: false,
            direction: 'auto-all',
            offset: L.point(20, 20),
            className: 'incident-tooltip'
        }
    } )
}

WFML.Incident.Util.addMarkers = function(mapapi, features) {
    var markers = WFML.Incident.Util.getMarkers( features );
    mapapi.marker.addMarkers( WFML.Incident.LAYER_ID, markers, {
        populatePopup: function ( ft ) {
            return '<pre>' + JSON.stringify( ft, null, '  ' ) + '</pre>'
        },
        populateTooltip: function ( ft ) {
            return '<pre>' + JSON.stringify( ft.incidentLabel, null, '  ' ) + '</pre>'
        }
    } )
}

WFML.Incident.Util.getMarkers = function(incidents, options) {
    var markers = [];

    if (incidents && incidents.length > 0) {
        for (var i in incidents) {
            var incident = incidents[i];
            if(incident.incidentLocation
                && incident.incidentLocation.latitude
                && incident.incidentLocation.longitude) {

                var file = incidentIconFile(incident);
                var url = WFML.BASE_URL + '/' + file;

                var m = markerImgLabel(
                    [ incident.incidentLocation.latitude, incident.incidentLocation.longitude ],
                    url,
                    incident.incidentLabel,
                    {
                        size: [ 50, 16+20 ],
                        anchor: [ 25, 20 ],
                        className: 'incident-icon',
                        imageClass: 'incident-img',
                        labelClass: 'incident-label'
                    }
                );
                m.feature = incident;

                markers.push(m);
            }
        }
        return markers;
    }
    return;
};

function markerImgLabel(location, imgUrl, labelTxt, options) {
    var icon = iconImgLabel(imgUrl, labelTxt, options);
    var m = L.marker( location, { icon: icon } );
    return m;
}

function iconImgLabel(imgUrl, labelTxt, options) {
    var size = options.size;
    var anchor = options.anchor
    var className = options.className
    var imgClass = options.imageClass;
    var lblClass = options.labelClass;

    var html = '<div class="' + lblClass + '">' + labelTxt + '</div>'
        + '<div><img class="' + imgClass + '" src="' + imgUrl + '"></div>';

    icon = L.divIcon( { className: className,
        html: html,
        iconSize: size,
        iconAnchor: anchor
        } );

    return icon;
}


} )();
