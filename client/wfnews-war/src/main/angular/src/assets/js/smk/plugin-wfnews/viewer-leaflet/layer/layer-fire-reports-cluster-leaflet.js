include.module( 'layer-fire-reports-cluster-leaflet', [ 'layer-fire-reports-cluster' ], function () {
    "use strict";

    function FireReportsClusterLeafletLayer( config ) {
        // SMK.TYPE.Layer[ 'cluster' ].prototype.constructor.apply( this, arguments )
        this.config.subType = this.config.type
        this.config.type = 'fire-reports-cluster'
        this.clusters = []
        this.leafletLayer = null

        this.updateClusters = function ( lfltLayerCreate ) {
            if ( lfltLayerCreate || lfltLayerCreate === null )
                this.leafletLayer = lfltLayerCreate

            this.clusters.forEach( function ( c ) {
                c.cluster.clearLayers()
                c.sources.forEach( function ( smkLayer ) {
                    if ( smkLayer.leafletLayer )
                        c.cluster.addLayer( smkLayer.leafletLayer() )
                } )
            } )
        }
    }

    // $.extend( FireReportsClusterLeafletLayer.prototype, SMK.TYPE.Layer[ 'cluster' ].prototype )

    SMK.TYPE.Layer[ 'fire-reports-cluster' ][ 'leaflet' ] = FireReportsClusterLeafletLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'fire-reports-cluster' ][ 'leaflet' ].create = function ( smkLayers, zIndex ) {
        console.log( 'cluster create', smkLayers.map( (ly)=>ly.id ) )
        return Promise.all( smkLayers.map( function ( ly ) {
            return SMK.TYPE.Layer[ ly.config.subType ][ 'leaflet' ].create( [ ly ], zIndex )
        } ) ).then( function ( lfltLayers ) {
            console.log( 'sub layers created', lfltLayers )
            var clusterOption = {
                zoomToBoundsOnClick: true,
                // disableClusteringAtZoom: 16,
                spiderfyDistanceMultiplier: 2.25,
                // maxClusterRadius: clusterRadiusHandler && function ( zoom ) {
                //     return clusterRadiusHandler( self, zoom )
                // },
                spiderfyOnMaxZoom: true,
                forceSpiderfyOnClick: false,
                iconCreateFunction: function ( cluster ) {
                    var features = cluster.getAllChildMarkers()
                        .map( function ( m ) { return m.feature } )

                    var rofHTML = ''
                    if ( features.some( function ( f ) { return f.set == 'rofs' } ) ) {
                        let clusterClass = features.some( function ( f ) {
                            return f.properties.messageStatusCode == 'Submitted' || f.properties.messageStatusCode == 'Received'
                        } ) ? 'rof-cluster-unack' : ''
                        rofHTML = `<div class="rof-cluster ${ clusterClass }"></div>`
                    }
                    var incidentHTML = ''
                    if ( features.some( function ( f ) { return f.set == 'incidents' } ) )
                        incidentHTML = `<div class="incident-cluster"></div>`

                    return L.divIcon( {
                        iconSize:   [ 40, 40 ],
                        iconAnchor: [ 20, 20 ],
                        className:  'wfim-cluster',
                        html:       `${ incidentHTML }${ rofHTML }<span>${ features.length }</span>`
                    } )
                },
                maxClusterRadius: 57
            }

            var cluster = L.markerClusterGroup( clusterOption )

            smkLayers.forEach( function ( smklayer ) {
                smklayer.clusters.push( {
                    cluster: cluster,
                    sources: smkLayers
                } )
            } )

            smkLayers.forEach( function ( smklayer ) {
                smklayer.updateClusters()
            } )

            return cluster
        } )
    }
} )