include.module('layer-mobile-resources-cluster-leaflet', [
    'layer-mobile-resources-cluster',
    'plugin-wfim-util' 
], function ( inc ) {
    "use strict";

    function MobileResourcesClusterLeafletLayer(config) {
        this.config.subType = this.config.type
        this.config.type = 'mobile-resources-cluster'
        this.clusters = []
        this.leafletLayer = null

        this.updateClusters = function (lfltLayerCreate) {
            if (lfltLayerCreate || lfltLayerCreate === null)
                this.leafletLayer = lfltLayerCreate

            this.clusters.forEach(function (c) {
                c.cluster.clearLayers()
                c.sources.forEach(function (smkLayer) {
                    if (smkLayer.leafletLayer)
                        c.cluster.addLayer(smkLayer.leafletLayer())
                })
            })
        }
    }

    SMK.TYPE.Layer['mobile-resources-cluster']['leaflet'] = MobileResourcesClusterLeafletLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer['mobile-resources-cluster']['leaflet'].create = function (smkLayers, zIndex) {
        console.log('cluster create', smkLayers.map((ly) => ly.id))
        return Promise.all(smkLayers.map(function (ly) {
            return SMK.TYPE.Layer[ly.config.subType]['leaflet'].create([ly], zIndex)
        })).then(function (lfltLayers) {
            // console.log('sub layers created', lfltLayers)

            var layer = lfltLayers.reduce( function ( acc, lfly ) {
                acc[ lfly.options.layerId ] = lfly
                return acc
            }, {} )

            var callbackOpt = {};
            var callbackProxy = function (handler, properties, layer) {
                return function () {
                    var h = ov.layerMgr.wfmlMap.getHandler('feature', handler, 'action')
                    if (h)
                        h(properties, layer, callbackOpt)
                }
            }

            var selectedMarker, popupMarker

            var clusterOption = {
                zoomToBoundsOnClick: false,
                spiderfyDistanceMultiplier: 2.25,
                spiderfyOnMaxZoom: true,
                forceSpiderfyOnClick: false,

                iconCreateFunction: function ( cluster ) {
                    var features = cluster.getAllChildMarkers()
                        .map( function ( m ) { return m.feature } )

                    var labels = features
                        .map(function (f) { return inc[ 'plugin-wfim-util' ].resourceLabel(f) })

                    return  L.divIcon( {
                        iconSize: [10, 10],
                        iconAnchor: [7, 7],
                        className: `wfim-fire-resource wfim-fire-resource-cluster`,
                        html: `<div class="wfim-fire-resource-labels">${labels.join('')}</div>`
                    })
                },                   
            }

            var cluster = L.markerClusterGroup(clusterOption)

            cluster.on( 'clusterclick', function ( ev ) {
                var clus = ev.layer
                var features = ( clus.getAllChildMarkers ? clus.getAllChildMarkers() : [ clus ] )
                    .map( function ( m ) { 
                        return {
                            id: m.options.layerId,
                            layer: layer[ m.options.layerId ],
                            features: [ m.feature ],
                            marker: m
                        }
                    } )

                SMK.HANDLER.get( 'resources', 'cluster-click' )( features )
            } )
   
            smkLayers.forEach(function (smklayer) {
                smklayer.clusters.push({
                    cluster: cluster,
                    sources: smkLayers
                })
            })

            smkLayers.forEach(function (smklayer) {
                smklayer.updateClusters()
            })

            return cluster
        })
    }

})