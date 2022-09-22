import { DatePipe } from '@angular/common';
import { ComponentFactoryResolver, ComponentRef, Injectable, NgZone, Type, ViewContainerRef, EventEmitter } from '@angular/core';
import { SpatialUtilsService } from '@wf1/core-ui';
import { ProvisionalZoneResource, PublicReportOfFireResource, SimpleWildfireIncidentResource } from '@wf1/incidents-rest-api';
import { WFMapService } from '../wf-map.service';
import { Location, PlaceData } from './place-data';
import { formatDistance, LonLat, toLatLon, toPoint, Translate } from './util';
import { DateRange, PRESENT } from '../../models/date';
import { MapServiceStatus } from '../map-config.service';

const TIME_FORMAT = Intl.DateTimeFormat('en-CA',{timeZone: undefined, hour12: false, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short'});

export type ClickCallback = ( event: any ) => void;
export type Smk = any;
export type SmkPromise = Promise< Smk >;
export type SmkLayer = any;

@Injectable( {
    providedIn: 'root',
} )
export class WfnewsMapService {
    private smkInstance: Smk;
    private smkInstancePromise: SmkPromise;
    private resolveSmkInstance = function( smk: Smk ): void {
        throw Error( 'resolve smk too soon' );
    };
    private provinceBbox: any;
    private placeData: PlaceData;

    private pointMarkupFeature: any;
    private changedPointMarkup: ( pt: LonLat ) => void = () => {};
    private clearPointMarkup: () => void = () => {};
    public selectedPointChange = new EventEmitter<LonLat|null>();

    private polygonMarkupFeature: any;
    private changedPolygonMarkup: ( poly: any ) => void = () => {};
    private clearPolygonMarkup: () => void = () => {};

    private componentRef: ComponentRef<any>;
    private viewContainerRef: ViewContainerRef;
    private translate: Translate;

	private time: DateRange<any, any>;
    public timeChange = new EventEmitter<DateRange<any, any>>();

    private incidentsVisible = false;
    public incidentsVisibilityChange = new EventEmitter<boolean>();

    private rofsVisible = false;
    public rofsVisibilityChange = new EventEmitter<boolean>();

    private nrofsVisible = false;
    public nrofsVisibilityChange = new EventEmitter<boolean>();

    public mapServiceStatus: MapServiceStatus;

    public viewChange = new EventEmitter<any>();

    private refreshPromise: Promise<string[]> = Promise.resolve([]);

    constructor(
        protected spatialUtils: SpatialUtilsService,
        protected wfMapService: WFMapService,
        protected ngZone: NgZone,
        protected componentFactoryResolver: ComponentFactoryResolver,
    ) {
        this.translate = new Translate( this.spatialUtils );

        this.smkInstancePromise = new Promise( ( res, rej ) => {
            this.resolveSmkInstance = function( smk: Smk ) {
                // console.log('set smk instance')
                this.smkInstance = smk;
                res( smk );
            };
        } );

        this.timeoutLiveLayerRefresh();

        this.placeData = new PlaceData();

        this.installSmkHandlers();

        this.installSvgDefs();
    }

    private timeoutLiveLayerRefresh() {
        const self = this;
        this.refreshLiveTemporalLayers();
        window.setTimeout(()=> {
self.timeoutLiveLayerRefresh();
}, 30*1000);
    }

    setSmkInstance( smk: Smk, viewContainerRef: ViewContainerRef, provinceExtent: any ) {
        this.resolveSmkInstance( smk );
        this.viewContainerRef = viewContainerRef;
        this.installLayerHooks();
        this.installIdentifyHooks();

        this.provinceBbox = window[ 'turf' ].bboxPolygon( provinceExtent );

        this.setTime( DateRange.parseWms( 'PT24H/PRESENT' ) );

        // if ( this.mapServiceStatus.useSecure ) {
        //     let prevToken
        //     this.tokenService.authTokenEmitter.subscribe( (x) => {
        //         let token = this.tokenService.getOauthToken()
        //         if ( token == prevToken ) return
        //         prevToken = token
        //         console.log('set layer token',token)

        //         this.setLayersAuthToken( ly => true, token )
        //             .then( ( ids ) => {
        //                 this.refreshLayers( ly => ids.includes( ly.id ) )
        //             } )
        //     })
        // }

        const changedView = () => {
 this.viewChange.emit();
};
        smk.$viewer.map.on( 'zoomend', changedView );
        smk.$viewer.map.on( 'moveend', changedView );
    }

    installLayerHooks() {
        this.smkInstance.$viewer.changedLayerVisibility( () => {
            if ( this.incidentsVisible != this.isIncidentsVisible() ) {
                this.incidentsVisible = this.isIncidentsVisible();
                this.incidentsVisibilityChange.emit( this.incidentsVisible );
            }

            if ( this.rofsVisible != this.isRofsVisible() ) {
                this.rofsVisible = this.isRofsVisible();
                this.rofsVisibilityChange.emit( this.rofsVisible );
            }

            if ( this.nrofsVisible != this.isNrofsVisible() ) {
                this.nrofsVisible = this.isNrofsVisible();
                this.nrofsVisibilityChange.emit( this.nrofsVisible );
            }
        } );

        this.smkInstance.$viewer.changedLayerVisibility();
    }

    installIdentifyHooks() {
        if ( !this.smkInstance.$tool.IdentifyListTool ) {
return;
}

        // don't allow resizing identify area
        const displaySearchAreaOrig = this.smkInstance.$tool.IdentifyListTool.displaySearchArea;
        this.smkInstance.$tool.IdentifyListTool.displaySearchArea = function() {
            displaySearchAreaOrig.call( this );
            this.trackMouse = false;
        };

        // don't show panel when identify starts
        this.smkInstance.$tool.IdentifyListTool.dispatcher.$off( 'startedIdentify' );

        // get location user clicked on
        // this.smkInstance.$viewer.handlePick( 3, function ( location ) {
            // self.pickLocation = location
            // return
        // } )

        // this.wfMapService.setIdentifyStartCallback( ( location, area ) => {
        //     // if ( location && area )
        //         // this.addNearbyWeatherStation( smk )
        //     return Promise.resolve()
        // } )

        // this.wfMapService.setIdentifyEndCallback( ( location, area ) => {
        //     if ( !location || !area ) return Promise.resolve()

        //     // setTimeout( function () {
        //     //     var stat = smk.$viewer.identified.getStats()

        //     //     if ( stat.featureCount > 0 ) {
        //     //         smk.$sidepanel.setExpand( 1 )
        //     //         smk.$tool.IdentifyListTool.setInternalLayerVisible( true )
        //     //     }

        //     //     smk.$tool.IdentifyListTool.showStatusMessage()

        //     //     if ( stat.featureCount == 1 ) {
        //     //         // setTimeout( function () {
        //     //             smk.$viewer.identified.pick( smk.$tool.IdentifyListTool.firstId )
        //     //         // }, 250 )
        //     //     }
        //     //     else {
        //     //         smk.$tool.IdentifyListTool.active = true
        //     //     }
        //     // }, 500 )
        // } )

        this.smkInstance.on( 'IdentifyFeatureTool', {
            custom: ( ev ) => {
                // console.log( ev )
                if ( ev.layer.id.startsWith( 'bc-' ) ) {
                    this.smkInstance.$viewer.displayContext.layers.setItemVisible( 'resource-track', false );
                    this.smkInstance.$viewer.updateLayersVisible().then( () => {
                        const ft = this.smkInstance.$viewer.identified.getPicked();
                        this.smkInstance.$viewer.layerId[ 'resource-track' ].config.where = [
                            `REGISTRATION = '${ ft.properties.REGISTRATION }'`,
                            `CALL_SIGN = '${ ft.properties.CALL_SIGN }'`,
                            `OPERATIONALFUNCTION = '${ ft.properties.OPERATIONALFUNCTION }'`,
                            `AGENCY = '${ ft.properties.AGENCY }'`,
                        ].join( ' and ' );
                        this.smkInstance.$viewer.layerIdPromise[ 'resource-track' ] = null;

                        this.smkInstance.$viewer.displayContext.layers.setItemVisible( 'resource-track', true );
                        return this.smkInstance.$viewer.updateLayersVisible();
                    } );
                } else if ( ev.layer.id.startsWith( 'ued-' ) ) {
                    window.open( ev.feature.properties.EDIT_URL, 'WFIM-Edit-Window' );
                } else if ( ev.layer.id === 'fw-activereporting-wstn' ) {
                    window.open( ev.feature.properties.MORECAST_URL, 'Morecast-Window' );
                }

            }
        } );
    }

    installSmkHandlers() {
        let markupPointHandled = false;

        this.wfMapService.setHandler( 'MarkupTool--point', 'initialized', ( smk, tool, ft ) => {
            smk.$viewer.handlePick( 3, function( location ) {
                // console.log('MarkupTool--point handle pick',markupPointHandled)
                const h = markupPointHandled;
                markupPointHandled = false;
                return h;
            } );
        } );

        this.wfMapService.setHandler( 'MarkupTool--point', 'activated', ( smk, tool, ft ) => {
            this.clearSelectedPoint();
        } );

        this.wfMapService.setHandler( 'MarkupTool--point', 'markup-created', ( smk, tool, ft ) => {
            this.pointMarkupFeature = ft;
            this.clearPointMarkup = () => tool.removeMarkup();
            this.changedPointMarkup( ft?.geometry?.coordinates );
            this.selectedPointChange.emit( ft?.geometry?.coordinates );
            markupPointHandled = true;
        } );

        let markupPolygonHandled = false;

        this.wfMapService.setHandler( 'MarkupTool--polygon', 'initialized', ( smk, tool, ft ) => {
            smk.$viewer.handlePick( 3, function( location ) {
                // console.log('MarkupTool--polygon handle pick',markupPolygonHandled)
                const h = markupPolygonHandled;
                return h;
            } );
        } );

        this.wfMapService.setHandler( 'MarkupTool--polygon', 'activated', ( smk, tool, ft ) => {
            this.clearPolygonMarkup();
            markupPolygonHandled = true;
        } );

        this.wfMapService.setHandler( 'MarkupTool--polygon', 'deactivated', ( smk, tool, ft ) => {
            markupPolygonHandled = false;
        } );

        this.wfMapService.setHandler( 'MarkupTool--polygon', 'markup-created', ( smk, tool, ft ) => {
            this.polygonMarkupFeature = ft;
            this.clearPolygonMarkup = () => tool.removeMarkup();
            this.changedPolygonMarkup( ft?.geometry );
        } );

        this.wfMapService.setHandler( 'BespokeTool--full-extent', 'triggered', ( smk, tool ) => {
            this.zoomToProvince();
        } );

        this.wfMapService.setHandler( 'BespokeTool--refresh-layers', 'triggered', ( smk, tool ) => {
            this.redrawMap();
        } );

        const handleMouseDown = function( event ) {
            this.boxZoom._onMouseDown.call( this.boxZoom, {
                clientX: event.originalEvent.clientX,
                clientY: event.originalEvent.clientY,
                which: 1,
                shiftKey: true
            } );
        };

        this.wfMapService.setHandler( 'BespokeTool--zoom-to-box', 'activated', ( smk, tool ) => {
            const map = this.smkInstance.$viewer.map;

            map.dragging.disable();

            map.on( 'mousedown', handleMouseDown, map );
            map.on( 'boxzoomend', () => {
                tool.active = false;
            } );
        } );

        this.wfMapService.setHandler( 'BespokeTool--zoom-to-box', 'deactivated', ( smk, tool ) => {
            const map = this.smkInstance.$viewer.map;

            map.off( 'mousedown', handleMouseDown, map );

            map.dragging.enable();
        } );



        this.wfMapService.setHandler( 'resources', 'cluster-click', ( features ) => {

            this.smkInstance.$viewer.identified.clear();
            features.forEach( ( f ) => {
                f.features[ 0 ].title = f.features[ 0 ].properties.CALL_SIGN;
                this.smkInstance.$viewer.identified.add( f.id, f.features );
            } );
        } );

        this.wfMapService.setHandler( 'IdentifyFeatureTool', 'show-custom', ( prop ) => {
            // console.log( prop )
            if ( prop.layer.id.startsWith( 'bc-' ) ) {
return 'Show Track';
}
            if ( prop.layer.id.startsWith( 'ued-' ) ) {
return 'Edit';
}
            if ( prop.layer.id === 'fw-activereporting-wstn' ) {
return 'Morecast';
}
            return false;
        } );

        const self = this;
        this.wfMapService.setHandler( 'IdentifyFeatureTool', 'attribute-replacer-context', function( layerId ) {
            // console.log( 'wfim replace', this, layerId )

            const $ = { ...this.feature.properties };
            const $$ = self.translate;

            return function( token ) {
                const e = eval( token );
                // console.log( 'wfim replace', this, layerId, token, e )
                return e;
            };
        } );


    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //


    clearSimpleIncidents( temporary = false ) {
        return this.clearLayer( temporary ? 'temporary-incident' : 'incidents' );
    }

    isIncidentsVisible(): boolean {
        return this.isLayerVisible( 'incidents' );
    }

    setIncidentsVisible( visible: boolean ) {
        return this.showLayer( 'incidents', visible );
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    loadRofs( rofs: PublicReportOfFireResource[], clickCallback?: ClickCallback, temporary = false ): SmkPromise {
        return this.loadLayer( temporary ? 'temporary-rof' : 'rofs', clickCallback, () => rofs.map( rof => {
                const date = ( rof.messageStatusTimestamp ) ? new DatePipe( 'en-US' ).transform( new Date( rof.messageStatusTimestamp ), 'yyyy-MM-dd HH:mm:ss' ) : '';

                let phoneNumber = '';
                if ( rof.callerTelephone ) {
                    const numberSegments = rof.callerTelephone.replace( /\D/g, '' ).match( /(\d{3})(\d{3})(\d{4})/ );
                    if ( numberSegments && numberSegments.length === 4 ) {
                        phoneNumber = `(${ numberSegments[ 1 ] }) ${ numberSegments[ 2 ] }-${ numberSegments[ 3 ] }`;
                    } else {
                        console.error( `ROF ${ rof.wildfireYear }-${ rof.reportOfFireNumber } phone number value '${ rof.callerTelephone }' is not valid.` );
                    }
                }

                return {
                    type: 'Feature',
                    set: 'rofs',
                    properties: {
                        messageTypeCode: 'Public Report of Fire',
                        messageStatusCode: rof.messageStatusCode,
                        reportOfFireNumber: rof.reportOfFireNumber,
                        reportOfFireLabel: rof.reportOfFireLabel,
                        incidentLabel: rof.incidentLabel,
                        wildfireYear: rof.wildfireYear,
                        hoverTitle: rof.publicReportTypeCode.replace(/\w\S*/g, match=>match.charAt(0).toUpperCase()+match.substr(1).toLowerCase()),
                        publicReportTypeCode: rof.publicReportTypeCode,
                        latitude: rof.latitude,
                        longitude: rof.longitude,
                        yearNumber: rof.reportOfFireLabel,
                        latLon: this.translate.formatCoordinate( [ rof.longitude, rof.latitude ] ),
                        lastUpdated: date,
                        updatedBy: rof.messageStatusUserId,
                        valuesBeingThreatenedNote: rof.valuesBeingThreatenedNote,
                        fireSizeComparisonCode: rof.fireSizeComparisionCode,
                        callerName: rof.callerName,
                        callerTelephone: phoneNumber,
                        hasAttachments: rof.publicAttachmentCount > 0
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [ rof.longitude, rof.latitude ]
                    }
                };
            } ) );
    }

    clearRofs( temporary = false ) {
        return this.clearLayer( temporary ? 'temporary-rof' : 'rofs' );
    }

    isRofsVisible(): boolean {
        return this.isLayerVisible( 'rofs' );
    }

    setRofsVisible( visible: boolean ) {
        return this.showLayer( 'rofs', visible );
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    loadNrofs( nrofs: ProvisionalZoneResource[], clickCallback: ClickCallback, temporary = false ): SmkPromise {
        return this.loadLayer( temporary ? 'temporary-nrof' : 'nrofs', clickCallback, () => nrofs.map( provZone => {
                if(provZone.provisionalZoneTypeCode!=='ROFEZ') {
                    console.warn(`Expected a Provisional Zone of type "ROFEZ" but was "${provZone.provisionalZoneTypeCode}"`);
                }
                // if(provZone.dismissedInd) {
                    // console.warn(`Expected a Provisional Zone that has not been dismissed`)
                // }
                const status = provZone.dismissedInd ? 'Dismissed' : provZone.expiryTimestamp<new Date() ? 'Expired' : 'Active';
                return {
                    type: 'Feature',
                    properties: {
                        zoneId: provZone.provisionalZoneIdentifier,
                        zoneType: provZone.provisionalZoneTypeCode,
                        fireCentreId: provZone.fireCentreOrgUnitIdent,
                        fireCentreName: provZone.fireCentreOrgUnitName,
                        note: provZone.provisionalZoneNote,
                        effective: TIME_FORMAT.format(provZone.effectiveTimeStamp),
                        expiry: TIME_FORMAT.format(provZone.expiryTimestamp),
                        userName: provZone.provisionedByUserName,
                        userId: provZone.provisionedByUserId,
                        dismissed: provZone.dismissedInd,
                        status
                    },
                    geometry: provZone.provisionalZonePolygon
                };
            } ) );
    }

    clearNrofs( temporary = false ) {
        return this.clearLayer( temporary ? 'temporary-nrof' : 'nrofs' );
    }

    isNrofsVisible(): boolean {
        return this.isLayerVisible( 'nrofs' );
    }

    setNrofsVisible( visible: boolean ) {
        return this.showLayer( 'nrofs', visible );
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    mapReady(): Promise<void> {
        return this.smkInstancePromise.then( ( smk ) => {} );
    }

    isLayerVisible( layerId: string ): boolean {
        if ( !this.smkInstance ) {
return false;
}

        return this.smkInstance.$viewer.isDisplayContextItemVisible( layerId );
    }

    putHighlight( lonLat: LonLat ): SmkPromise {
        const L = leaflet();
        return this.clearHighlight().then( ( smk ) => {
            smk.showFeature( 'wfim', toPoint( lonLat ), {
                pointToLayer( geojson, latlng ) {
                    return L.marker( latlng, {
                        icon: L.icon( {
                            iconUrl: 'assets/images/wfml/highlight.png',
                            iconAnchor: [16, 16]
                        } )
                    } );
                }
            } );
            return smk;
        } );
    }

    clearHighlight(): SmkPromise {
        return this.smkInstancePromise.then( ( smk ) => {
            smk.showFeature( 'wfim' );
            return smk;
        } );
    }

    zoomToPoint( lonLat: LonLat, zoomLevel = 12 ): SmkPromise {
        return this.smkInstancePromise.then( ( smk ) => {
            smk.$viewer.panToFeature( toPoint( lonLat ), zoomLevel );
            return smk;
        } );
    }

    zoomToGeometry( geom: any, zoomLevel: number|boolean = 12 ): SmkPromise {
        return this.smkInstancePromise.then( ( smk ) => {
            smk.$viewer.panToFeature( geom, zoomLevel );
            return smk;
        } );
    }

    zoomToProvince(): SmkPromise {
        return this.zoomToGeometry( this.provinceBbox );
    }

    getMapView(): Promise<any> {
        return this.smkInstancePromise.then( ( smk ) => smk.$viewer.getView() );
    }

    putTemporaryLayer( id: string, createLayer: () => Promise<any> ): SmkPromise {
        return this.clearTemporaryLayer( id ).then( ( smk ) => {
            const layer = createLayer();
            smk.$viewer.acetate[ id ].addLayer( layer );
            return smk;
        } );
    }

    clearTemporaryLayer( id: string ): SmkPromise {
        return this.smkInstancePromise.then( ( smk ) => {
            smk.showFeature( id );
            return smk;
        } );
    }

    zoomToTemporaryLayer( id: string ): SmkPromise {
        return this.smkInstancePromise.then( ( smk ) => {
            const lyg = smk.$viewer.acetate[ id ];
            const gj = lyg.toGeoJSON();
            smk.$viewer.panToFeature( gj, true );
        } );
    }

    getSelectedPoint(): Promise<LonLat> {
        return this.smkInstancePromise.then( ( smk ) => {
            if ( !this.pointMarkupFeature ) {
throw new Error( 'no selected point' );
}
            return this.pointMarkupFeature.geometry.coordinates;
        } );
    }

    clearSelectedPoint(): SmkPromise {
        return this.smkInstancePromise.then( ( smk ) => {
            this.clearPointMarkup();
            this.pointMarkupFeature = null;
            this.selectedPointChange.emit();
        } );
    }

    getSelectedPolygon(): Promise<any> {
        return this.smkInstancePromise.then( ( smk ) => {
            if ( !this.polygonMarkupFeature ) {
throw new Error( 'no selected polygon' );
}
            return this.polygonMarkupFeature.geometry;
        } );
    }

    clearSelectedPolygon(): SmkPromise {
        return this.smkInstancePromise.then( ( smk ) => {
            this.clearPolygonMarkup();
            this.polygonMarkupFeature = null;
        } );
    }

    activateTool( toolId: string, activate = true ): SmkPromise {
        return this.smkInstancePromise.then( ( smk ) => smk.getToolById( toolId ).active = activate );
    }

    setMapStateSaveHandler( handler: ( state: any ) => void ) {
        setInterval( () => {
            if ( !this.smkInstance ) {
return;
}

            const cfg = this.smkInstance.getConfig();
            delete cfg.layers;
            delete cfg.tools;
            handler( cfg );
        }, 2000 );
    }

    setSelectPointHandler( handler: ( location: LonLat ) => void ) {
        this.changedPointMarkup = handler;
    }

    setSelectPolygonHandler( handler: ( polygon: any ) => void ) {
        this.changedPolygonMarkup = handler;
    }

    redrawMap(): SmkPromise {
        // fix to refresh only layers that are important
        return this.refreshLayers( ( ly ) => this.isLayerVisible( ly.id ) );
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    clearSearch() {
        return Promise.resolve()
            .then( () => this.crosshairs() )
            .then( () => this.crosshairs2() )
            .then( () => this.arrow() )
            .then( () => this.placeData.init() );
    }

    setMaximumDistance( distance: number ) {
        return this.placeData.setMaximumDistance( distance );
    }

    setAnchor( pt: LonLat ) {
        return Promise.resolve()
            .then( () => this.crosshairs( pt ) )
            .then( () => this.crosshairs2() )
            .then( () => this.arrow() )
            .then( () => this.placeData.setAnchor( pt ) );
    }

    zoomToAnchor() {
        let pt;
        return Promise.resolve()
            .then( () => {
                pt = this.placeData.getAnchor();
                if ( !pt ) {
throw new Error( 'no anchor' );
}
            } )
            .then( () => this.getMapView() )
            .then( ( view ) => this.zoomToPoint( pt, view.zoom + 4 ) );
    }

    panToAnchor() {
        let pt;
        return Promise.resolve()
            .then( () => {
                pt = this.placeData.getAnchor();
                if ( !pt ) {
throw new Error( 'no anchor' );
}
            } )
            .then( ( view ) => this.zoomToPoint( pt ) );
    }

    showCandidate( location?: Location ) {
        if ( !location ) {
return Promise.resolve()
            .then( () => this.crosshairs2() )
            .then( () => this.arrow() );
}

        const anchor = this.placeData.getAnchor();
        return this.crosshairs2( location.loc )
            .then( () => {
                if ( anchor ) {
return this.arrow( anchor, location );
}
            } );
    }

    setSearchResultHandler( callback ) {
        this.placeData.setResultHandler( callback );
    }

    findPlace(txt: string) {
        return this.placeData.findPlace(txt);
    }

    findRoad(txt: string) {
        return this.placeData.findRoad(txt);
    }

    findIntersection(txt1: string, txt2: string) {
        return this.placeData.findIntersection(txt1, txt2);
    }

    private crosshairs( pt?: LonLat ): SmkPromise {
        if ( !pt ) {
return this.clearTemporaryLayer( 'crosshairs' );
}

        return this.putTemporaryLayer( 'crosshairs', () => window[ 'L' ].Layer.crosshairs( toLatLon( pt ) ) );
    }

    private crosshairs2( pt?: LonLat ): SmkPromise {
        if ( !pt ) {
return this.clearTemporaryLayer( 'crosshairs2' );
}

        return this.putTemporaryLayer( 'crosshairs2', () => window[ 'L' ].Layer.crosshairs( toLatLon( pt ), {
                style: {
                    opacity: 0.6,
                    fillOpacity: 0,
                    weight: 2,
                    color: '#08f',
                    radius: 20
                }
            } ) );
    }

    private arrow( start?: LonLat, end?: Location ): SmkPromise {
        if ( !start || !end ) {
return this.clearTemporaryLayer( 'arrow' );
}

        return this.putTemporaryLayer( 'arrow', () => window[ 'L' ].Layer.arrow( toLatLon( start ), toLatLon( end.loc ), {
                title: `${ end.name } - ${ formatDistance( end.dist, 'km' ) }`
            } ) );
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    formatCoordinates( coordinate: LonLat ): string {
        return this.translate.formatCoordinate( coordinate );
    }

    parseCoordinates( val: string ): LonLat | undefined {
        return this.translate.parseCoordinate( val );
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    private loadLayer( layerId: string, clickCallback: ClickCallback, data: () => any ): SmkPromise {
        return this.clearLayer( layerId )
            .then( () => this.showLayer( layerId, true ) )
            .then( ( smk ) => {
                // console.log( 'loading layer', layerId )
                smk.$viewer.layerId[ layerId ].load( data() );
                smk.$viewer.layerId[ layerId ].setClickCallback( clickCallback );

                return smk;
            } );
            // this.smkInstance.$viewer.layerIdPromise[ layerId ] = null
    }

    private clearLayer( layerId: string ): SmkPromise {
        return this.smkInstancePromise
            .then( ( smk ) => {
                // console.log( 'clear layer', layerId )
                smk.$viewer.layerId[ layerId ].clear();

                return smk;
            } );
    }

    private showLayer( layerId: string, visible: boolean ): SmkPromise {
        return this.smkInstancePromise
            .then( ( smk ) => {
                // console.log( 'show layer', layerId, visible )
                smk.$viewer.displayContext.layers.setItemVisible( layerId, visible );

                return smk.$viewer.refreshLayers()
                    .then( () => smk );
            } );
    }

    private refreshLayer( layerId: string ): SmkPromise {
        let vis = false;
        return this.smkInstancePromise
            .then( ( smk ) => {
                if ( !this.isLayerVisible( layerId ) ) {
return smk;
}

                vis = true;

                return this.showLayer( layerId, false );
            } )
            .then( ( smk ) => {
                // if ( smk.$viewer.layerIdPromise[ layerId ] != null ) console.log(layerId)
                smk.$viewer.layerIdPromise[ layerId ] = null;

                if ( !vis ) {
return smk;
}

                return this.showLayer( layerId, true );
            } );
    }

    setTime(time: DateRange<any,any>) {
	    this.time = time;
		return this.getLayers()
		  	.then(layers=>{
			    const affectedLayers = layers.filter(layer=>layer.setTime); // Find temporal layers
				affectedLayers.forEach(layer=>{
						console.log('Setting time on layer', layer.id);
						layer.setTime(this.time);
					});
				return affectedLayers.map(layer=> layer.id);
			})
			.then(layerIds=>this.onTimeChange(this.getTime(), layerIds));
    }

	// refreshLayers( filter: ( SmkLayer ) => boolean ): Promise<string[]> {
    //     return this.getLayers()
    //         .then( ( layers ) => {
    //             return layers.filter( filter )
    //         } )
    //         .then( ( layers ) => {
    //             return layers.reduce( ( acc, ly ) => {
    //                 return acc.then( () => this.refreshLayer( ly.id ) )
    //             }, Promise.resolve() ).then( () => layers.map( ly => ly.id ) )
    //         } )
	// }

    refreshLayers( filter: ( SmkLayer ) => boolean ): Promise<any> {
        this.refreshPromise = this.refreshPromise.then( () => {
            const vis = {}; let anyVis = false;
            // console.log( 'start refresh' )
            return this.getLayers()
                .then( ( layers ) => {
                    const lys = layers.filter( filter );
                    lys.forEach( ( ly ) => {
                        vis[ ly.id ] = this.isLayerVisible( ly.id );
                        if ( !vis[ ly.id ] ) {
return;
}

                        anyVis = true;
                        // console.log('was vis',ly.id)
                        this.smkInstance.$viewer.displayContext.layers.setItemVisible( ly.id, false );
                    } );

                    if ( anyVis )
                        // return this.smkInstance.$viewer.refreshLayers()
                        {
return this.smkInstance.$viewer.updateLayersVisible();
}
                } )
                .then( () => {
                    const cacheKeys = Object.keys( this.smkInstance.$viewer.layerIdPromise );
                    // console.log( cacheKeys )
                    Object.keys( vis ).forEach( ( id ) => {
                        const k = cacheKeys.find( ( k ) => k.includes( id ) );
                        // console.log( k )
                        if ( k ) {
this.smkInstance.$viewer.layerIdPromise[ k ] = null;
}
                    } );

                    if ( !anyVis ) {
return;
}

                    Object.entries( vis ).forEach( ( [ id, v ] ) => {
                        if ( !v ) {
return;
}

                        // console.log( 'set vis',id)
                        this.smkInstance.$viewer.displayContext.layers.setItemVisible( id, true );
                    } );

                    // return this.smkInstance.$viewer.refreshLayers()
                    return this.smkInstance.$viewer.updateLayersVisible();
                } )
                .then( () =>
                    // console.log( 'end refresh' )
                     Object.keys( vis )
                 )
                .catch( ( e ) => {
                    // console.log( 'fail refresh' )
                    console.warn( e );
                    return [];
                } );
        } );

        return this.refreshPromise;
            // .then( ( layers ) => {
            //     return layers.reduce( ( acc, ly ) => {
            //         return acc.then( () => this.refreshLayer( ly.id ) )
            //     }, Promise.resolve() ).then( () => layers.map( ly => ly.id ) )
            // } )
	}

	private onTimeChange(time: DateRange<any, any>, affectedLayers: string[]){
		return this.refreshLayers(layer=> affectedLayers.includes(layer.id))
			.then(()=>{
this.timeChange.emit(time);
});
	}

    public refreshLiveTemporalLayers(): Promise<string[]> {
	    // Refresh layers that either are marked as ""
		return this.refreshLayers(layer=>layer.config.live || layer.getTime?.end == PRESENT);
    }

    getTime(): DateRange<any,any> {
		return this.time;
	}

	getLayers(): Promise<SmkLayer[]> {
		return this.smkInstancePromise.then( ( smk ) => smk.$viewer.layerIds.map(id => smk.$viewer.layerId[id]));
	}

    setLayersAuthToken( filter: ( SmkLayer ) => boolean, token?: string ): Promise<string[]> {
        return this.getLayers()
            .then( ( layers ) => layers.filter( filter ) )
            .then( ( layers ) => layers.map( ly => {
                    if ( token ) {
                        ly.config.header = {
                            Authorization: `Bearer ${ token }`
                        };
                    } else {
                        delete ly.config.header;
                    }

                    return ly.id;
                } ) );
    }

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    private makeComponent<C>( component: Type<C>): ComponentRef<C> {
        if ( this.componentRef ) {
this.componentRef.destroy();
}

        this.viewContainerRef.clear();
        this.componentRef = this.viewContainerRef.createComponent( this.componentFactoryResolver.resolveComponentFactory( component) );

        return this.componentRef;
    }

    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //

    installSvgDefs() {
        const svgRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        // svgRoot.setAttribute('style', "position: absolute;") // Prevent it from interfering with layout.  May not be necessary.

        const svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs' );
        svgRoot.appendChild( svgDefs );

        svgDefs.appendChild( stripePattern( 'rofx-stripes-light', [ [ 1, 'fill:red;' ],  [ 3, 'fill:white;' ] ], 'scale(2) rotate(45)' ) );
        svgDefs.appendChild( stripePattern( 'rofx-stripes-dark',  [ [ 1, 'fill:white;' ], [ 3, 'fill:red;' ] ], 'scale(2) rotate(45)' ) );

        document.body.prepend( svgRoot );
    }

}

function leaflet() {
 return window[ 'L' ];
}

function stripePattern(id, stripes, transform) {
    const width = stripes.map(stripe=>stripe[0]).reduce((a,b)=>a+b, 0);
    const svgNS = 'http://www.w3.org/2000/svg';
    const pat = document.createElementNS(svgNS, 'pattern');
    const height = 2;
    pat.id = id;
    pat.setAttribute('height', ''+height);
    pat.setAttribute('width', ''+width);
    pat.setAttribute('patternTransform', transform);
    pat.setAttribute('patternUnits','userSpaceOnUse');

    let offset=0;
    stripes.forEach(stripe=>{
        const element = document.createElementNS(svgNS, 'rect');
        element.setAttribute('width',''+stripe[0]);
        element.setAttribute('height', ''+height);
        element.setAttribute('x',''+offset);
        element.setAttribute('y','0');
        element.setAttribute('style',stripe[1]);
        offset+=stripe[0];
        pat.appendChild(element);
    });

    return pat;
}
