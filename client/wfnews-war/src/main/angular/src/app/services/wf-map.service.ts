import {Injectable} from "@angular/core";

@Injectable( {
    providedIn: 'root',
} )
export class WFMapService {
    private patchPromise: Promise<any>;
    private smkBaseUrl = `${window.location.protocol}//${window.location.host}/wfnews/assets/smk/`

    identifyCallback
    identifyDoneCallback

    constructor(
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

    createSMK( option: any ) {
        var self = this

        const SMK = window[ 'SMK' ]

        return this.patch()
            .then( function () {
                option.config.push( {
                    // viewer: {
                    //     baseMap: baseMapIds[ 0 ]
                    // },
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
        var self = this

        const include = window[ 'include' ]
        const SMK = window[ 'SMK' ]
        const jQuery = window[ 'jQuery' ]

        if ( !this.patchPromise ) this.patchPromise = Promise.resolve()
            .then( function () {

                // Create a DIV for a temporary map.
                // This map is used to ensure that SMK is completely loaded before monkey-patching
                var temp = document.createElement( 'div' )
                temp.style.display = 'none'
                temp.style.visibility = 'hidden'
                temp.style.position = 'absolute'
                temp.style.left = '-5000px'
                temp.style.top = '-5000px'
                temp.style.right = '-4000px'
                temp.style.bottom = '-4000px'
                document.body.appendChild( temp )

                return SMK.INIT( {
                    id: 999,
                    containerSel: temp,
                    baseUrl: self.smkBaseUrl,
                    config: 'show-tool=bespoke'
                } )
                .then( function ( smk ) {
                    const option2x = {
                        tileSize: 512,
                        zoomOffset: -1
                    }

                    const topographicOption = {
                        maxNativeZoom: 20,
                        maxZoom: 30
                    }

                    // defineEsriBasemap( 'topographic', 'ESRI Topographic', [
                    //     { id: 'Topographic', option: { ...topographicOption } }
                    // ] )

                    defineEsriBasemap( 'topographic', 'Topographic', [
                        { id: 'Topographic', option: { ...topographicOption, ...option2x } }
                    ] )


                    const imageryOption = {
                        maxZoom: 30
                    }



                    defineEsriBasemap( 'imagery', 'Imagery', [
                        { id: 'Imagery', option: { maxNativeZoom: 20, ...imageryOption/*, ...option2x*/ } },
                        { id: 'ImageryTransportation', option: { maxNativeZoom: 19, ...imageryOption, ...option2x } },
                        { id: 'ImageryLabels', option: { maxNativeZoom: 19, ...imageryOption, ...option2x } },
                    ] )


                    const streetsOption = {
                        maxNativeZoom: 19,
                        maxZoom: 30
                    }




                    const bcOption = {
                        maxNativeZoom: 17,
                        maxZoom: 30
                    }




                    const lightGrayOption = {
                        maxNativeZoom: 16,
                        maxZoom: 30
                    }


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
                                    return ( new Date( v ) ).toISOString().slice( 0, 10 )
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

                    Vue.component( 'wf-weather-station-feature', {
                        template: '#wf-weather-station-feature-template',
                        extends: f,
                        computed: {
                            content: function () {
                                return {
                                    create: this.feature.properties.createContent
                                }
                            }
                        },
                    } );

                } )
            } )
            .then( function () {
                include.tag( "plugin-wfim-util",
                    // { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/util.js" }
                    // ] }
                )

                include.tag( "layer-fire-reports-cluster",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/layer/layer-fire-reports-cluster.js" }
                    ] }
                )

                include.tag( "layer-fire-reports-cluster-leaflet",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/viewer-leaflet/layer/layer-fire-reports-cluster-leaflet.js" },
                    ] }
                )

                include.tag( "layer-incidents",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/layer/layer-incidents.js" }
                    ] }
                )

                include.tag( "layer-incidents-leaflet",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/viewer-leaflet/layer/layer-incidents-leaflet.js" },
                    ] }
                )

                include.tag( "layer-rofs",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/layer/layer-rofs.js" }
                    ] }
                )

                include.tag( "layer-rofs-leaflet",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/viewer-leaflet/layer/layer-rofs-leaflet.js" },
                    ] }
                )

                include.tag( "layer-nrofs",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/layer/layer-nrofs.js" }
                    ] }
                )

                include.tag( "layer-nrofs-leaflet",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/viewer-leaflet/layer/layer-nrofs-leaflet.js" },
                    ] }
                )
				include.tag( "util-date",
				    { loader: "group", tags: [
    				    { loader: "script", url: "./assets/js/smk/plugin-wfnews/lib/date.js" }
				    ] }
				)
				include.tag( "layer-wms-time-cql",
				    { loader: "group", tags: [
				        { loader: "script", url: "./assets/js/smk/plugin-wfnews/layer/layer-wms-time-cql.js" }
				    ] }
				)
				include.tag( "layer-wms-time-cql-leaflet",
				    { loader: "group", tags: [
				        { loader: "script", url: "./assets/js/smk/plugin-wfnews/viewer-leaflet/layer/layer-wms-time-cql-leaflet.js" }
				    ] }
				)
                include.tag( "layer-mobile-resources-cluster",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/layer/layer-mobile-resources-cluster.js" }
                    ] }
                )

                include.tag( "layer-mobile-resources-cluster-leaflet",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/viewer-leaflet/layer/layer-mobile-resources-cluster-leaflet.js" },
                    ] }
                )

                include.tag( "layer-mobile-resources",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/layer/layer-mobile-resources.js" }
                    ] }
                )

                include.tag( "layer-mobile-resources-leaflet",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/viewer-leaflet/layer/layer-mobile-resources-leaflet.js" },
                    ] }
                )

                include.tag( "layer-resource-tracks",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/layer/layer-resource-tracks.js" }
                    ] }
                )

                include.tag( "layer-resource-tracks-leaflet",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/viewer-leaflet/layer/layer-resource-tracks-leaflet.js" },
                    ] }
                )

                include.tag( "leaflet-extensions",
                    { loader: "group", tags: [
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/viewer-leaflet/lib/layer-tooltip.js" },
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/viewer-leaflet/lib/layer-arrow.js" },
                        { loader: "script", url: "./assets/js/smk/plugin-wfnews/viewer-leaflet/lib/layer-crosshairs.js" },
                        { loader: "style", url: "./assets/js/smk/plugin-wfnews/style/wfnews-markers2.css" },
                        { loader: "style", url: "./assets/js/smk/plugin-wfnews/style/wfnews-info.css" }
                    ] }
                )

                // include.tag( "layer-image-leaflet",
                //     { loader: "group", tags: [
                //         { loader: "script", url: "./assets/js/smk/plugin-time-dimension/viewer-leaflet/layer/layer-image-leaflet.js" },
                //     ] }
                // )

                // include.tag( "layer-wms-time",
                //     { loader: "group", tags: [
                //         { loader: "script", url: "./assets/js/smk/plugin-time-dimension/layer/layer-wms-time.js" }
                //     ] }
                // );

                // include.tag( "layer-wms-time-leaflet",
                //     { loader: "group", tags: [
                //         { loader: "script", url: "./assets/js/smk/plugin-time-dimension/viewer-leaflet/layer/layer-wms-time-leaflet.js" }
                //     ] }
                // );

                // include.tag( "tool-time-dimension",
                //     { loader: "group", tags: [
                //         { loader: "script", url: "./assets/js/smk/plugin-time-dimension/tool/time-dimension/tool-time-dimension.js" }
                //     ] }
                // )

                // include.tag( "tool-time-dimension-leaflet",
                //     { loader: "sequence", tags: [
                //         { loader: "style", url: "https://cdn.jsdelivr.net/npm/leaflet-timedimension@1.1.1/dist/leaflet.timedimension.control.min.css" },
                //         { loader: "script", url: "https://cdn.jsdelivr.net/npm/iso8601-js-period@0.2.1/iso8601.min.js" },
                //         { loader: "script", url: "https://cdn.jsdelivr.net/npm/leaflet-timedimension@1.1.1/dist/leaflet.timedimension.min.js" },
                //         { loader: "script", url: "./assets/js/smk/plugin-time-dimension/viewer-leaflet/tool/time-dimension/lib/time-dimension-layer-image-overlay.js" },
                //         { loader: "script", url: "./assets/js/smk/plugin-time-dimension/viewer-leaflet/tool/time-dimension/tool-time-dimension-leaflet.js" }
                //     ] }
                // )

                return include(
                    'leaflet-extensions',
                    'layer-incidents-leaflet',
                    'layer-rofs-leaflet',
                    'layer-nrofs-leaflet',
                    'layer-mobile-resources-leaflet',
                    'layer-resource-tracks-leaflet',
                    'layer-wms-time-cql-leaflet'
                ).then( function () {
                } )
            } )
            .then( function () {
                SMK.TYPE.Viewer.leaflet.prototype.mapResized = function () {
                    var self = this
                    setTimeout( function () {
                        self.map.invalidateSize( { animate: false } )
                    }, 500 )
                }
                const oldInit = SMK.TYPE.Viewer.leaflet.prototype.initialize
                SMK.TYPE.Viewer.leaflet.prototype.initialize = function (smk) {
                    // Call the existing initializer
                    oldInit.apply(this, arguments)

                    // Set the maximum bounds that can be panned to.
                    const L = window[ 'L' ]
                    const maxBounds = L.latLngBounds( [L.latLng( 90, -180 ), L.latLng( 0, -90 )] )
                    this.map.setMaxBounds(maxBounds)
                }

                SMK.TYPE.Viewer.leaflet.prototype.panToFeature = function ( feature, zoomIn ) {
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

                    this.map
                        .fitBounds( bounds, {
                            paddingTopLeft: padding.topLeft,
                            paddingBottomRight: padding.bottomRight,
                            maxZoom: maxZoom,
                            animate: true
                        } )
                }

                let origIdentifyFeatures = SMK.TYPE.Viewer.leaflet.prototype.identifyFeatures

                SMK.TYPE.Viewer.leaflet.prototype.identifyFeatures = function ( location, area ) {
                    var vw = this

                    if ( self.identifyCallback )
                        self.identifyCallback( location, area )

                    return Promise.resolve()
                        .then( function () {
                            return origIdentifyFeatures.call( vw, location, area )
                        } )
                        .then( function () {
                            if ( self.identifyDoneCallback )
                                self.identifyDoneCallback( location, area )
                        } )
                }

                SMK.TYPE.Layer[ 'wms' ].prototype.canMergeWith = function ( other ) {
                    return this.config.combiningClass && this.config.combiningClass === other.config.combiningClass
                }
                SMK.TYPE.Layer[ 'wms' ]['leaflet'].prototype.canMergeWith = function ( other ) {
                    return this.config.combiningClass && this.config.combiningClass === other.config.combiningClass
                }

                SMK.TYPE.Layer[ 'wms' ]['leaflet'].prototype.getFeaturesInArea = function ( area, view, option ) {
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

                    var url = encodeUrl( this.config.serviceUrl, data )

                    return fetch( url, {
                        method: 'GET',
                        headers: this.config.header,
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
                                    res( JSON.parse( reader.result.toString() ) )
                                }
                                catch ( e ) { rej( e ) }
                            }
                            reader.readAsBinaryString( blob )
                        } )
                    } )
                    .then( function ( data: any ) {

                        if ( !data ) throw new Error( 'no features' )
                        if ( !data.features || data.features.length == 0 ) throw new Error( 'no features' )

                        return data.features.map( function ( f, i ) {
                            if ( self.config.titleAttribute )
                                f.title = f.properties[ self.config.titleAttribute ]
                            else
                                f.title = 'Feature #' + ( i + 1 )

                            return f
                        } )
                    } )
                }

                SMK.TYPE.Layer[ 'wms-time-cql' ]['leaflet'].prototype.initLegends =
                SMK.TYPE.Layer[ 'wms' ]['leaflet'].prototype.initLegends = function () {
                    const J = window['jQuery']

                    var url =  this.config.serviceUrl + '?' + J.param( {
                        SERVICE:    'WMS',
                        VERSION:    '1.1.1',
                        REQUEST:    'getlegendgraphic',
                        FORMAT:     'image/png',
                        TRANSPARENT: 'true',
                        LAYER:      this.config.layerName,
                        STYLE:      this.config.styleName
                    } )

                    return fetch( url, {
                        method: 'GET',
                        headers: this.config.header,
                        mode: 'cors'
                    } )
                    .then( ( res ) => {
                        return res.blob()
                    } )
                    .then( ( blob ) => {
                        return new Promise( ( res, rej ) => {
                            try {
                                var reader = new FileReader()
                                reader.onload = () => res( reader.result )
                                reader.readAsDataURL( blob )
                            }
                            catch ( e ) { rej( e ) }
                        } )
                    } )
                    .then( ( dataUrl: string ) => {
                        return new Promise( ( res, rej ) => {
                            try {
                                var img = new Image()
                                img.onload = () => res( [ {
                                    url: dataUrl,
                                    width: img.width,
                                    height: img.height,
                                    ...this.config.legend
                                } ] )
                                img.onerror = ( ev ) => rej( ev )
                                img.src = dataUrl
                            }
                            catch ( e ) { rej( e ) }
                        } )
                    } )
                    .catch( ( e ) => {
                        console.warn( e )
                    } )
                }
            } )
            .then( function () {
            } )

        return this.patchPromise
    }
}

function clone( obj ) {
    return JSON.parse( JSON.stringify( obj ) )
}

var order = 100
var baseMapIds = []
function defineEsriBasemap( id: string, title: string, baseMaps: { id: string, option?: { [key: string]: any } }[] ) {
    order += 1
    baseMapIds.push( id )
    window[ 'SMK' ].TYPE.Viewer.prototype.basemap[ id ] = {
        title,
        order,
        create: function () {
            return baseMaps.map( function ( bm ) {
                const L = window[ 'L' ]

                var orig = clone( L.esri.BasemapLayer.TILES[ bm.id ].options )
                var bmly = window[ 'L' ].esri.basemapLayer( bm.id, clone( bm.option || {} ) )
                L.esri.BasemapLayer.TILES[ bm.id ].options = orig
                return bmly
            } )
        }
    }
}

function defineWmsBasemap( id, title: string, baseMaps: { url: string, option?: { [key: string]: any } }[] ) {
    order += 1
    baseMapIds.push( id )
    window[ 'SMK' ].TYPE.Viewer.prototype.basemap[ id ] = {
        title,
        order,
        create: function () {
            return baseMaps.map( function ( bm ) {
                const L = window[ 'L' ]

                return L.tileLayer( bm.url, bm.option )
            } )
        }
    }
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
