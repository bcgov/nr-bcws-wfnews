import { HttpClient } from "@angular/common/http";
import {EventEmitter, Injectable} from "@angular/core";
import { HTTP } from "@ionic-native/http/ngx";
import { Observable } from "rxjs";
import { CapacitorService } from "./capacitor-service";

@Injectable( {
    providedIn: 'root',
} )
export class WFMapService {
    private patchPromise: Promise<any>;
    private smkBaseUrl = `${window.location.protocol}//${window.location.host}/assets/smk/`
    private incidentDetail;

    identifyCallback
    identifyDoneCallback
    layerFailedToLoad = new EventEmitter();

    constructor(
        private http: HTTP,
        private httpClient: HttpClient,
        private capacitorService: CapacitorService,
    ) {
    }

    setHandler( id, method, handler ): Promise<any> {
        const SMK = window[ 'SMK' ]

        return this.patch().then( function () {
            SMK.HANDLER.set( id, method, handler )
        } )
    }

    setIdentifyCallback( cb ) {
        this.identifyCallback = cb
    }

    setIdentifyDoneCallback( cb ) {
        this.identifyDoneCallback = cb
    }

    changeBasemapCacheToken() {
        changeBasemapCacheToken()
    }

    createSMK( option: any ) {
        var self = this

        const SMK = window[ 'SMK' ]
        let baseMap = option.baseMap
        delete option.baseMap

        return this.patch()
            .then( function () {
                option.config.push( {
                    viewer: {
                        baseMap: baseMap || baseMapIds[ 0 ]
                    },
                    tools: [
                        {
                            type: "baseMaps",
                            choices: baseMapIds
                        }
                    ]
                } )

                return SMK.INIT( {
                    baseUrl: self.smkBaseUrl,
                    ...option
                } )
            } )
    }

    private patch(): Promise<any> {
        var self = this, service = this

        const include = window[ 'include' ]
        const SMK = window[ 'SMK' ]
        const jQuery = window[ 'jQuery' ]

        if ( !this.patchPromise ) this.patchPromise = Promise.resolve()
            .then( function () {
                console.log( "start patching SMK" );

                // Create a DIV for a temporary map.
                // This map is used to ensure that SMK is completely loaded before monkey-patching
                var temp = document.createElement( 'div' )
                document.body.appendChild( temp )

                return SMK.INIT( {
                    id: 999,
                    containerSel: temp,
                    baseUrl: self.smkBaseUrl,
                    config: 'show-tool=bespoke'
                } )
                .then( function ( smk ) {
                    var customBasemapEsri = function ( id ) {
                        /* jshint -W040 */
                        var opt = Object.assign( { detectRetina: true }, this.option )

                        var lys = []
                        lys.push( window[ 'L' ].esri.basemapLayer( id, opt ) )

                        if ( this.labels )
                            this.labels.forEach( function ( lb ) {
                                lys.push( window[ 'L' ].esri.basemapLayer( lb.id, lb.option ) )
                            } )

                        return lys
                    }


                    const option2x = {
                        tileSize: 512,
                        zoomOffset: -1
                    }

                    const topographicOption = {
                        maxNativeZoom: 16,
                        maxZoom: 30
                    }

                    // defineBasemap( 'topographic', 'Topographic', [
                    //     { id: 'Topographic', option: { ...topographicOption } }
                    // ] )

                    defineBasemap( 'topographic-2x', 'Topographic 2x', [
                        { id: 'Topographic', option: { ...topographicOption, ...option2x } }
                    ] )

                    const imageryOption = {
                        maxZoom: 30
                    }

                    // defineBasemap( 'imagery', 'Imagery', [
                    //     { id: 'Imagery', option: { ...imageryOption } },
                    //     { id: 'ImageryTransportation', option: { ...imageryOption } },
                    //     { id: 'ImageryLabels', option: { ...imageryOption } },
                    // ] )

                    defineBasemap( 'imagery-2x', 'Imagery 2x', [
                        { id: 'Imagery', option: { maxNativeZoom: 20, ...imageryOption, ...option2x } },
                        { id: 'ImageryTransportation', option: { maxNativeZoom: 19, ...imageryOption, ...option2x } },
                        { id: 'ImageryLabels', option: { maxNativeZoom: 19, ...imageryOption, ...option2x } },
                    ] )

                    // defineBasemap( 'imagery-2x-a', 'Imagery 2x (a)', [
                    //     { id: 'Imagery', option: { ...imageryOption } },
                    //     { id: 'ImageryTransportation', option: { ...imageryOption, ...option2x } },
                    //     { id: 'ImageryLabels', option: { ...imageryOption, ...option2x } },
                    // ] )

                    // const nationalGeographicOption = {
                    //     maxNativeZoom: 16,
                    //     maxZoom: 30
                    // }

                    // defineBasemap( 'national-geographic', 'NationalGeographic', [
                    //     { id: 'NationalGeographic', option: { ...nationalGeographicOption } }
                    // ] )

                    // defineBasemap( 'national-geographic-2x', 'NationalGeographic 2x', [
                    //     { id: 'NationalGeographic', option: { ...nationalGeographicOption, ...option2x } }
                    // ] )


                    // const shadedReliefOption = {
                    //     maxNativeZoom: 12,
                    //     maxZoom: 30
                    // }

                    // const terrainOption = {
                    //     maxNativeZoom: 13,
                    //     maxZoom: 30
                    // }

                    // defineBasemap( 'shaded-relief', 'ShadedRelief', [
                    //     { id: 'ShadedRelief', option: { ...shadedReliefOption } },
                    //     // { id: 'ShadedReliefLabels', option: { ...shadedReliefOption } },
                    //     { id: 'TerrainLabels', option: { ...terrainOption } },
                    // ] )

                    // defineBasemap( 'shaded-relief-2x', 'ShadedRelief 2x', [
                    //     { id: 'ShadedRelief', option: { ...shadedReliefOption, ...option2x } },
                    //     // { id: 'ShadedReliefLabels', option: { ...shadedReliefOption, ...option2x } },
                    //     { id: 'TerrainLabels', option: { ...terrainOption, ...option2x } },
                    // ] )



                    // defineBasemap( 'terrain', 'Terrain', [
                    //     { id: 'Terrain', option: { ...terrainOption } },
                    //     { id: 'TerrainLabels', option: { ...terrainOption } },
                    // ] )

                    // defineBasemap( 'terrain-2x', 'Terrain 2x', [
                    //     { id: 'Terrain', option: { ...terrainOption, ...option2x } },
                    //     { id: 'TerrainLabels', option: { ...terrainOption, ...option2x } },
                    // ] )

                    // defineBasemap( 'terrain-2x-a', 'Terrain 2x (a)', [
                    //     { id: 'Terrain', option: { ...terrainOption } },
                    //     { id: 'TerrainLabels', option: { ...terrainOption, ...option2x } },
                    // ] )


                    // defineBasemap( 'physical', 'Physical', [
                    //     { id: 'Physical' },
                    //     { id: 'TerrainLabels' },
                    // ] )

                    // defineBasemap( 'physical-2x', 'Physical 2x', [
                    //     { id: 'Physical', option: option2x },
                    //     { id: 'TerrainLabels', option: option2x },
                    // ] )

                    // defineBasemap( 'physical-2x-a', 'Physical 2x (a)', [
                    //     { id: 'Physical' },
                    //     { id: 'TerrainLabels', option: option2x },
                    // ] )



                    smk.destroy()
                    temp.parentElement.removeChild( temp )


                } )
            } )
            .then( function () {
                // add a component to Vue global used by SMK
                const Vue = window['Vue']

                return include( 'component' ).then( function () {
                    var f = Vue.component( 'wf-feature', {
                        template: '#wf-feature-template',
                        extends: SMK.COMPONENT.FeatureBase,
                        methods: {
                            asDate: function ( attr ) {
                                var v
                                try {
                                    v = this.feature.properties[ attr ]
                                }
                                catch ( e ) {
                                    return attr
                                }

                                try {
                                    // if date ends in Z for zulu time, splice out that character as it causes an invalid date error in Firefox (but not chrome)
                                    if (typeof(v) === 'string' && v.slice(-1) === 'Z') {
                                        v = v.slice(0, -1)
                                        v = v.replace(/-/g, "/")
                                    }
                                    let date = new Date( v)
                                    return date.toLocaleDateString("en-CA").slice( 0, 10 )
                                }
                                catch ( e ) {
                                    return v
                                }
                            },
                            zoomFeature: function () {
                                this.$root.trigger( 'IdentifyFeatureTool', 'zoom' )
                            }
                        }
                    } );

                    Vue.directive( 'content2', function ( el, binding ) {
                        binding.value.create( el )
                    } )

                    Vue.component( 'wf-weather-station-feature', {
                        template: '#wf-weather-station-feature-template',
                        extends: f,
                        computed: {
                            content: function () {
                                // console.log( 'get content', this.feature.properties )
                                return {
                                    create: this.feature.properties.createContent
                                }
                            }
                        },
                    } );

                    Vue.component( 'wf-incident-detail-feature', {
                        template: '#wf-incident-detail-feature-template',
                        extends: f,
                        computed: {
                            content: function () {
                                // console.log( 'get content', this.feature.properties )
                                return {
                                    create: this.feature.properties.createContent
                                }
                        }
                        },
                    } );

                } )
            } )
            .then( function () {
                include.tag( "layer-image",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-time-dimension/layer/layer-image.js" },
                    ] }
                )
                include.tag("layer-vector-legend",
                    {
                        loader: "group", tags: [
                            { loader: "script", url: "./assets/js/smk/plugin-time-dimension/layer/layer-vector-legend.js" },
                        ]
                    }
                )

                include.tag("layer-vector-legend-leaflet",
                    {
                        loader: "group", tags: [
                            { loader: "script", url: "./assets/js/smk/plugin-time-dimension/viewer-leaflet/layer/layer-vector-legend-leaflet.js" },
                        ]
                    }
                )

                include.tag( "layer-image-leaflet",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-time-dimension/viewer-leaflet/layer/layer-image-leaflet.js" },
                    ] }
                )

                include.tag( "layer-wms-time",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-time-dimension/layer/layer-wms-time.js" }
                    ] }
                );

                include.tag( "layer-wms-time-leaflet",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-time-dimension/viewer-leaflet/layer/layer-wms-time-leaflet.js" }
                    ] }
                );

                include.tag( "tool-time-dimension",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-time-dimension/tool/time-dimension/tool-time-dimension.js" }
                    ] }
                )

                include.tag( "tool-time-dimension-leaflet",
                    { loader: "sequence", tags: [
                        { loader: "style", url: "https://cdn.jsdelivr.net/npm/leaflet-timedimension@1.1.1/dist/leaflet.timedimension.control.min.css" },
                        { loader: "script", url: "https://cdn.jsdelivr.net/npm/iso8601-js-period@0.2.1/iso8601.min.js" },
                        { loader: "script", url: "https://cdn.jsdelivr.net/npm/leaflet-timedimension@1.1.1/dist/leaflet.timedimension.min.js" },
                        { loader: "script", url: "./assets/js/smk/plugin-time-dimension/viewer-leaflet/tool/time-dimension/lib/time-dimension-layer-image-overlay.js" },
                        { loader: "script", url: "./assets/js/smk/plugin-time-dimension/viewer-leaflet/tool/time-dimension/tool-time-dimension-leaflet.js" }
                    ] }
                )

                return include( 'layer-image-leaflet', 'layer-wms-time-leaflet', 'layer-vector-legend-leaflet' ).then( function () {
                    console.log('plugin-time-dimension loaded')
                } )
            } )
            .then( function () {
                SMK.TYPE.Viewer.leaflet.prototype.mapResized = function () {
                    this.map.invalidateSize(true)
                }

                SMK.TYPE.Viewer.leaflet.prototype.panToFeature = function ( feature, zoomIn, mobile ) {
                    // console.log('panToFeature')
                    const turf = window[ 'turf' ], L = window[ 'L' ]

                    var bounds
                    var maxZoom
                    switch ( turf.getType( feature ) ) {
                    case 'Point':
                        var ll = L.latLng( feature.geometry.coordinates[ 1 ], feature.geometry.coordinates[ 0 ] )
                        bounds = L.latLngBounds( [ ll, ll ] )
                        maxZoom = 16
                        break;

                    default:
                        var bbox = turf.bbox( feature )
                        bounds = L.latLngBounds( [ bbox[ 1 ], bbox[ 0 ] ], [ bbox[ 3 ], bbox[ 2 ] ] )
                    }
                    if ( !bounds ) return

                    var padding = this.getPanelPadding()

                    if ( !zoomIn ) {
                        maxZoom = this.map.getZoom()
                    }
                    else if ( zoomIn === true ) {
                        // maxZoom = null
                    }
                    else {
                        maxZoom = parseFloat( zoomIn )
                    }

                    if ( mobile ) {
                        this.map
                        .fitBounds( bounds, {
                            paddingTopLeft: padding.topLeft,
                            paddingBottomRight: padding.bottomRight,
                            maxZoom: maxZoom,
                            animate: true
                        } )
                    }
                    else {
                        this.map
                        .fitBounds( bounds, {
                            paddingTopLeft: 0,
                            paddingBottomRight: 0,
                            maxZoom: maxZoom,
                            animate: true
                        } )
                    }
                }

                let origIdentifyFeatures = SMK.TYPE.Viewer.leaflet.prototype.identifyFeatures

                SMK.TYPE.Viewer.leaflet.prototype.identifyFeatures = function ( location, area ) {
                    var vw = this

                    if ( self.identifyCallback )
                        self.identifyCallback( location, area )

                    return Promise.resolve()
                        .then( function () {
                            console.log('start identify')
                            return origIdentifyFeatures.call( vw, location, area )
                        } )
                        .then( function () {
                            console.log('end identify')
                            if ( self.identifyDoneCallback )
                                self.identifyDoneCallback( location, area )
                        } )
                }

                SMK.TYPE.Layer[ 'wms' ]['leaflet'].prototype.getFeaturesInArea = function ( area, view, option ) {
                    // console.log('getFeaturesInArea')
                    var self = this

                    var extraFilter = this.config.where || ''
                    if ( extraFilter ) extraFilter = ' AND ' + extraFilter

                    var polygon = 'SRID=4326;POLYGON ((' + area.geometry.coordinates[ 0 ].map( function ( c ) { return c.join( ' ' ) } ).join( ',' ) + '))'

                    var data = {
                        service:        "WFS",
                        version:        '1.1.0',
                        request:        "GetFeature",
                        srsName:        'EPSG:4326',
                        typename:       this.config.layerName,
                        outputformat:   "application/json",
                        cql_filter:     'INTERSECTS(' + (this.config.geometryAttribute||'GEOMETRY') + ',' + polygon + ')' + extraFilter
                    }

                    return service.httpGet( this.config.serviceUrl, data, this.config.header )
                    .then( function ( data: any ) {
                        console.log('parse ok')
                        // console.log( data )

                        if ( !data ) throw new Error( 'no features' )
                        if ( !data.features || data.features.length == 0 ) throw new Error( 'no features' )
                        console.log('feature count',data.features.length)

                        return data.features.map( function ( f, i ) {
                            if ( self.config.titleAttribute )
                                f.title = f.properties[ self.config.titleAttribute ]
                            else
                                f.title = 'Feature #' + ( i + 1 )

                            return f
                        } )
                    } )
                    .then( function ( features ) {
                        console.log('features returned',features.length)
                        return features
                    } )
                }

                SMK.TYPE.Viewer.leaflet.prototype.afterCreateViewerLayer = function ( id, type, layers, viewerLayer ) {
                    if ( !viewerLayer ) {
                        // console.log('afterCreateViewerLayer no layer')
                        this.layerIdPromise[ id ] = null
                        this.displayContext.layers.setItemVisible( id, false )
                        this.updateLayersVisible()
                        
                        self.layerFailedToLoad.emit( id )
                        return 
                    }

                    viewerLayer._smk_type = type
                    viewerLayer._smk_id = id
            
                    return viewerLayer
                }           

                var addViewerLayerInner = SMK.TYPE.Viewer.leaflet.prototype.addViewerLayer
                SMK.TYPE.Viewer.leaflet.prototype.addViewerLayer = function ( viewerLayer ) {
                    if ( !viewerLayer ) {
                        // console.log('addViewerLayer no layer')
                        return 
                    }

                    return addViewerLayerInner.call( this, viewerLayer )
                }
            
                var positionViewerLayerInner = SMK.TYPE.Viewer.leaflet.prototype.positionViewerLayer
                SMK.TYPE.Viewer.leaflet.prototype.positionViewerLayer = function ( viewerLayer, zOrder ) {
                    if ( !viewerLayer ) {
                        // console.log('positionViewerLayer no layer')
                        return 
                    }

                    return positionViewerLayerInner.call( this, viewerLayer, zOrder )
                }
            

            } )
            .then( function () {
                console.log( "done patching SMK" );
            } )

        return this.patchPromise
    }

    httpGet( url: string, params?: any, headers?: any ): Promise<any> {
        return this.capacitorService.isMobile.then( b => {
            if ( b ) return this.http.get( url, params, headers )
                .then( function( resp ) {
                    if ( resp.error ) throw resp.error
                    return JSON.parse( resp.data )
                } )

            return this.httpClient.get( url, { params: params, headers: headers } ).toPromise()
        } )
    }

}


function clone( obj ) {
    return JSON.parse( JSON.stringify( obj ) )
}

var order = 100
var baseMapIds = []
var baseMapCacheToken
var baseMapLayers = []
changeBasemapCacheToken()

function defineBasemap( id: string, title: string, baseMaps: { id: string, option?: { [key: string]: any } }[] ) {
    order += 1
    baseMapIds.push( id )
    window[ 'SMK' ].TYPE.Viewer.prototype.basemap[ id ] = {
        title,
        order,
        create: function () {
            console.log('create',title)
            return baseMaps.map( function ( bm ) {
                const L = window[ 'L' ]

                var orig = clone( L.esri.BasemapLayer.TILES[ bm.id ].options )
                var opts = clone( bm.option || {} )
                opts.cacheToken = function () {
                    return baseMapCacheToken
                }
                opts.ignoreDeprecationWarning = true

                var bmly = window[ 'L' ].esri.basemapLayer( bm.id, opts )
                L.esri.BasemapLayer.TILES[ bm.id ].options = orig

                bmly._url += '?_={cacheToken}'
                bmly._url = bmly._url.replace('http:','https:')

                baseMapLayers.push( bmly )

                return bmly
            } )
        }
    }
}

function changeBasemapCacheToken() {
    baseMapCacheToken = Math.trunc( Math.random() * 1e10 )
}

function encodeUrl( url, data ) {
    if ( !data ) return url

    var params = Object.keys( data )
        .filter( function ( k ) { return data[ k ] } )
        .map( function ( k ) {
            return `${ encodeURIComponent( k ) }=${ encodeURIComponent( data[ k ] ) }`
        } )
        .join( '&' )

    if ( /[?]\S+$/.test( url ) )
        return `${ url }&${ params }`

    if ( /[?]$/.test( url ) )
        return `${ url }${ params }`

    return `${ url }?${ params }`
}