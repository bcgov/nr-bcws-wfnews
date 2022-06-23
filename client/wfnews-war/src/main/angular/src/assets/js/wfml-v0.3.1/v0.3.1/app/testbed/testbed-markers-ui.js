( function () {
"use strict"
  
    $( '#load-rof' ).click( function () {

        var count = parseInt( $( '#count-rof' ).val() );
        var features = makeRofFeatures( count );

        if( $( '#cluster-rof' )[0].checked ){
            WFML.RoF.Util.addClusteredMarkers(MAPAPI, features, markerCallback);
        } else {
            WFML.RoF.Util.addMarkers(MAPAPI, features);
        }

        $( '#remove-rof' ).attr( 'disabled', false )
        $( '#show-rof' ).attr( 'disabled', false )
        $( '#load-rof' ).attr( 'disabled', true )
        $( '#count-rof' ).attr( 'disabled', true )
        $( '#cluster-rof' ).attr( 'disabled', true )
    } )

    $( '#remove-rof' ).click( function () {
        WFML.RoF.Util.clear( MAPAPI );

        $( '#remove-rof' ).attr( 'disabled', true )
        $( '#show-rof' ).attr( 'disabled', true )
        $( '#load-rof' ).attr( 'disabled', false )
        $( '#count-rof' ).attr( 'disabled', false )
        $( '#cluster-rof' ).attr( 'disabled', false )
    } )

    $( '#show-rof' ).change( function ( ev ) {
        WFML.RoF.Util.show( MAPAPI, ev.target.checked );
    } )

    $( '#load-incident' ).click( function () {
        var count = parseInt( $( '#count-rof' ).val() );
        
        var features = makeIncidentFeatures( count );

        if( $( '#cluster-incident' )[0].checked ) {
            WFML.Incident.Util.addClusteredMarkers(MAPAPI, features, markerCallback);
        } else {
            WFML.Incident.Util.addMarkers(MAPAPI, features);
        }

        $( '#remove-incident' ).attr( 'disabled', false )
        $( '#show-incident' ).attr( 'disabled', false )
        $( '#load-incident' ).attr( 'disabled', true )
        $( '#count-incident' ).attr( 'disabled', true )
        $( '#cluster-incident' ).attr( 'disabled', true )
    } )

    $( '#remove-incident' ).click( function () {
        WFML.Incident.Util.clear( MAPAPI );

        $( '#remove-incident' ).attr( 'disabled', true )
        $( '#show-incident' ).attr( 'disabled', true )
        $( '#load-incident' ).attr( 'disabled', false )
        $( '#count-incident' ).attr( 'disabled', false )
        $( '#cluster-incident' ).attr( 'disabled', false )
    } )

    $( '#show-incident' ).change( function ( ev ) {
        WFML.Incident.Util.show( MAPAPI, ev.target.checked );
    } )

    function markerCallback( e ) {
        $('#marker-callback-text').text( JSON.stringify( e.target.feature ) );
    }

//------------------------------------------------------------------------------

    function rLat() { return Math.random() * 10 + 49 }
    function rLong() { return Math.random() * 5 + -124 }

    function makeRofFeatures( count ) {
        var num = 9099533
        var types = ['GENERAL','INTERFACE','CAMPFIRE','CIGARETTE','REGULAR']
        var status = ['Acknowledged', 'Draft', 'Submitted', 'Assigned To Incident', 'Processed', 'Cancelled']
        var rofs = []
        for ( var i = 0; i < count; i++ )
            rofs.push( makeReportOfFire( rLat(), rLong(), types[i % 5], status[i % 6], num++ ) )
        
        /* return rofs.map( function ( r ) {
            return WFML.MarkerManager.makeReportOfFireMarker( r )
        } )*/
        return rofs;
    }

    function makeReportOfFire( lat, long, type, status, number, option ) {
        option = Object.assign( {
            lat: 23,
            long: -143,
            type: 'GENERAL',
            status: 'Draft',
            number: 9099533,
        }, option )
        if ( lat ) option.lat = lat
        if ( long ) option.long = long
        if ( type ) option.type = type
        if ( number ) option.number = number
        if ( status ) option.status = status

        return {
            "hoverTitle" :  option.type,
            "messageTypeCode": "Public Report of Fire",
            "messageStatusCode": option.status,
            "reportOfFireNumber": option.number,
            "wildfireYear": 2018,
            "publicReportTypeCode": option.type,
            "latitude": option.lat,
            "longitude": option.long,

            "yearNumber": 2018 + "-" + option.number,
            "latLon": WFML.Location.format([ option.long, option.lat ]),
            "lastUpdated": "June 12, 2018",
            "valuesBeingThreatenedNote": "some value",
            "suspectedCauseCategoryCode": null,
            "fireSizeComparisonCode": "BIG",
            "callerName": "Joe Smith",
            "callerTelephone": "250-999-9999"
        } 
    }
    function makeIncidentFeatures( count ) {
        var num = 9099533
        var interfaceInd = [true, false];
        var incidents = []
        for ( var i = 0; i < count; i++ )
            incidents.push( makeIncident( rLat(), rLong(), interfaceInd[i % 2],  num++ ) )

        return incidents;
    }

    function makeIncident( lat, long, interfaceFireInd, number, option ) {
        option = Object.assign( {
            lat: 23,
            long: -143,
            interfaceInd: false,
            number: 9099533,
        }, option )
        if ( lat ) option.lat = lat
        if ( long ) option.long = long
        if ( number ) option.number = number

        option.interfaceFireInd = interfaceFireInd;

        return {
            "hoverTitle" : option.interfaceFireInd ? "Interface" : "Non Interface",
            "wildfireYear":2018,
            "incidentNumberSequence":option.number,
            "incidentId":2018340130,
            "incidentName":null,
            "incidentLocation":{
                "latitude": option.lat,
                "longitude": option.long
            },
            "incidentSituation":{
                "interfaceFireInd": option.interfaceFireInd
            },
            "incidentStatusCode":"Active",
            "incidentLabel": "2018-" + option.number,
            "probabilityOfInitialAttackSuccessCode":null,
            "suspectedCauseCategoryCode":null,
            "incidentCategoryCode":"FIRE_RESP",
            "incidentTypeCode": "FIRE",

            "stageOfControlCode": "Out of Control",
            "fireCentreOrgUnitIdentifier": "Prince George",
            "zoneOrgUnitIdentifier": "Robson Valley",
            "latLon": WFML.Location.format([ option.long, option.lat ]),
            "geographicDescription": "Thunder River - Monitor only",
            "fireSizeHectares": 24
        }
    }


 

} )();


