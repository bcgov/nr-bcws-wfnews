include.module('layer-vector-legend-leaflet', ['layer-vector-legend'], function () {
    "use strict";

    function VectorLegendLeafletLayer() {
        SMK.TYPE.Layer['vector-legend'].prototype.constructor.apply(this, arguments)
    }

    $.extend(VectorLegendLeafletLayer.prototype, SMK.TYPE.Layer['vector-legend'].prototype)

    SMK.TYPE.Layer['vector-legend']['leaflet'] = VectorLegendLeafletLayer

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer['vector-legend']['leaflet'].create = function (layers, zIndex) {
        return SMK.TYPE.Layer['vector']['leaflet'].create.call(this, layers, zIndex)
            .catch( function( e ) {
                console.warn( e )
            } )
    }


    VectorLegendLeafletLayer.prototype.getFeaturesInArea = function (area, view, option) {
        var self = this

        if (!option.layer) return

        var features = []

        option.layer.eachLayer(function (ly) {
            var ft = ly.toGeoJSON()

            switch (ft.geometry.type) {
                case 'Polygon':
                    if (turf.intersect(ft, area))
                        features.push(ft)
                    break

                case 'MultiPolygon':
                    var intersect = ft.geometry.coordinates.reduce(function (accum, poly) {
                        return accum || !!turf.intersect(turf.polygon(poly), area)
                    }, false)
                    if (intersect) features.push(ft)
                    break

                case 'LineString':
                    if (turf.booleanCrosses(area, ft)) features.push(ft)
                    break

                case 'MultiLineString':
                    var close1 = turf.segmentReduce(ft, function (accum, segment) {
                        return accum || turf.booleanCrosses(area, segment)
                    }, false)
                    if (close1) features.push(ft)
                    break

                case 'Point':
                case 'MultiPoint':
                    var close2 = turf.coordReduce(ft, function (accum, coord) {
                        return accum || turf.booleanPointInPolygon(coord, area)
                    }, false)
                    if (close2) features.push(ft)
                    break

                default:
                    console.warn('skip', ft.geometry.type)
            }
        })

        return features
    }
})
