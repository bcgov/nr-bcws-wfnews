import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Event, NavigationStart, OutletContext } from '@angular/router';
import { select } from '@ngrx/store';
import {
    Message, MessageType, SearchActions, WFNROF_WINDOW_NAME, WFROF_WINDOW_NAME
} from '@wf1/core-ui';
import {
    ProvisionalZoneResource, PublicReportOfFireResource, SimpleReportOfFireResource,
    SimpleWildfireIncidentResource
} from "@wf1/incidents-rest-api";
import * as moment from 'moment';
import { forkJoin, Subscription } from 'rxjs';
import { MarkerLayerBaseComponent } from "./components/marker-layer-base.component";
import { UtilHash } from "./hash-util";
import { AudibleAlertRoutes } from "./modules/audible-alert/audible-alert-route-definitions";
import { IncidentRoutes } from './modules/incident-management/incident-route-definitions';
import { NROFRoutes } from "./modules/nrof/nrof-route-definitions";
import { PlaceNameSearchRoutes } from './modules/place-name-search/place-name-search-route-definitions';
import { PointIdRoutes } from './modules/point-id/point-id-route-definitions';
import { ROFRoutes } from './modules/rof/rof-route-definitions';
import { enterExitLeft } from './shared/animations/index';
import * as AuthActions from './store/auth/auth.actions';
import * as RofActions from "./store/rof/rof.actions";
import { selectLastSyncDate } from "./store/rof/rof.selectors";
import * as MapActions from './store/map/map.actions';
import { NROF_MAP_COMPONENT_ID } from './store/nrof/nrof.state';
import { LonLat } from './services/wfim-map.service/util';
import { WfApplicationState, RouterLink, WfApplicationConfiguration } from '@wf1/wfcc-application-ui';
import { WfMenuItems } from '@wf1/wfcc-application-ui/application/components/wf-menu/wf-menu.component';
import { MapServiceStatus } from './services/map-config.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [enterExitLeft]
})
export class AppComponent extends MarkerLayerBaseComponent implements OnDestroy, OnInit, AfterViewInit {
    public TOOLTIP_DELAY = 500;

    title: string = 'Incident Management';

    isLoggedIn: boolean = true;
    hasAccess: boolean = true;

    mapConfig = null;

    applicationConfig: WfApplicationConfiguration = {
        title: 'INCIDENT MANAGEMENT',
        device: this.applicationStateService.getDevice(),
        userName: '',
        version: {
            long: '',
            short: ''
        },
        environment: ''
    }

    applicationState: WfApplicationState = {
        menu: this.applicationConfig.device == 'desktop' ? 'expanded' : 'hidden'
    }

    appMenu: WfMenuItems

    orientation

    showLeftPanel = true

    private lastSuccessPollSub: Subscription;
    private lastSyncDate;
    private lastSyncValue = undefined;
    private refreshMapInterval;

    private updateMapSize = function () {
        this.storeViewportSize()
    }

    @ViewChild('extOutlet', { static: true }) extOutlet: OutletContext;
    @ViewChild('bespokeContainer', { read: ViewContainerRef }) bespokeContainerRef: ViewContainerRef;

    ngOnInit() {
        const self = this

        super.ngOnInit();
        this.initializeRouterSubscription();
        this.updateService.checkForUpdates();

        this.checkUserPermissions();
        this.registerAuth();

        this.messagingService.subscribeToMessageStream(this.receiveWindowMessage.bind(this));
        if (!this.location.path().startsWith('/(root:external')) {
            this.pollService.startPolling();
            this.appConfigService.configEmitter.subscribe((config) => {
                this.applicationConfig.version.short = config.application.version.replace(/-snapshot/i, '')
                this.applicationConfig.version.long = config.application.version
                this.applicationConfig.environment = config.application.environment.replace(/^.*prod.*$/i, '')

                let mapConfig = []
                this.checkMapServiceStatus()
                    .then( ( mapServiceStatus ) => {
                        console.log(mapServiceStatus)
                        this.wfimMapService.mapServiceStatus = mapServiceStatus

                        return this.mapConfigService.getMapConfig( mapServiceStatus, this.applicationConfig.device )
                    } )
                    .then((config) => {
                        mapConfig.push(config)

                        return this.mapStatePersistenceService.getMapState()
                    })
                    .then((mapState) => {
                        console.log('map state version', mapState?.version)
                        if (!mapState || !mapState.version) return
                        if (mapState.version.app != this.applicationConfig.version.short) return
                        if (mapState.version.build != config.application.buildNumber) return
                        console.log('using map state')

                        eachDisplayContextItem( mapState.viewer.displayContext, ( item ) => {
                            if ( item.id == 'resource-track' )
                                item.isVisible = false
                            delete item.isEnabled
                        } )

                        mapConfig.push(mapState)
                    })
                    .then(() => {
                        let deviceConfig = { viewer: { device: this.applicationConfig.device } }

                        self.mapConfig = [...mapConfig, deviceConfig, 'theme=wf', '?']
                    })

                this.wfimMapService.setMapStateSaveHandler((state) => {
                    state.version = {
                        app: this.applicationConfig.version.short,
                        build: config.application.buildNumber
                    }

                    this.mapStatePersistenceService.putMapState(state)
                        .then(() => { console.log('map state saved') })
                        .catch((e) => {
                            // console.warn( e, 'failed saving map state' )
                        })
                })

                this.wfimMapService.setSelectPointHandler((location: LonLat) => {
                    const action = new MapActions.SetActiveMapLocation(location);

                    let windowId = this.messagingService.getWindowId(WFROF_WINDOW_NAME);
                    if (windowId) {
                        this.messagingService.broadcastAction(windowId, action);
                    }

                    this.store.dispatch(action);
                })

                this.wfimMapService.setSelectPolygonHandler((polygon) => {
                    const action = new MapActions.SetActiveMapPolygon(polygon);

                    let windowId = this.messagingService.getWindowId(WFNROF_WINDOW_NAME);
                    if (windowId) {
                        this.messagingService.broadcastAction(windowId, action);
                    }

                    this.store.dispatch(action);
                })


                // const refreshRate = config?.application?.polling?.mapTool?.layerRefreshPolling
                // this.refreshMapInterval = setInterval(() => {
                //     this.wfimMapService.redrawMap();
                // }, refreshRate || 5000);

                this.onResize()
            });
        }

        this.wfimMapService.incidentsVisibilityChange.subscribe( ( vis ) => {
            console.log( 'incidents visible', vis )
            if ( vis ) this.loadIncidents()
        } )

        this.wfimMapService.rofsVisibilityChange.subscribe( ( vis ) => {
            console.log( 'rofs visible', vis )
            if ( vis ) this.loadFireReports()
        } )

        this.wfimMapService.nrofsVisibilityChange.subscribe( ( vis ) => {
            console.log( 'nrofs visible', vis )
            if ( vis ) this.loadProvisionalZones()
        } )

        this.tokenService.credentialsEmitter.subscribe( (creds) => {
            let first = creds.given_name || creds.givenName
            let last = creds.family_name || creds.familyName

            this.applicationConfig.userName = `${ first } ${ last }`
        } )

        this.initAppMenu()
    }

    initAppMenu() {
        console.log('initAppMenu')
        this.appMenu = ( this.applicationConfig.device == 'desktop' ?
            [
                new RouterLink('Home', '/', 'home', 'expanded', this.router),
                new RouterLink('Incidents', IncidentRoutes.LIST, 'wf/incident', 'collapsed', this.router),
                new RouterLink('Reports of Fire', ROFRoutes.LIST, 'wf/report-of-fire', 'collapsed', this.router),
                new RouterLink('No More Reports of Fire', NROFRoutes.LIST, 'wf/no-more-report-of-fire', 'collapsed', this.router),
                new RouterLink('Place Name Search', PlaceNameSearchRoutes.SEARCH, 'wf/place-name-search', 'collapsed', this.router),
                new RouterLink('Point ID', PointIdRoutes.POINT_ID, 'wf/point-id', 'collapsed', this.router),
                new RouterLink('Audible Alerts', AudibleAlertRoutes.AUDIBLE_ALERT, 'volume_up', 'collapsed', this.router),
            ]
        :
            [
                new RouterLink('Home', '/', 'home', 'hidden', this.router),
                new RouterLink('Incidents', IncidentRoutes.LIST, 'wf/incident', 'hidden', this.router),
                new RouterLink('Reports of Fire', ROFRoutes.LIST, 'wf/report-of-fire', 'hidden', this.router),
                new RouterLink('No More Reports of Fire', NROFRoutes.LIST, 'wf/no-more-report-of-fire', 'hidden', this.router),
                // new RouterLink('Place Name Search', PlaceNameSearchRoutes.SEARCH, 'wf/place-name-search', 'hidden', this.router),
                new RouterLink('Point ID', PointIdRoutes.POINT_ID, 'wf/point-id', 'hidden', this.router),
                // new RouterLink('Audible Alerts', AudibleAlertRoutes.AUDIBLE_ALERT, 'volume_up', 'hidden', this.router),
            ]
        ) as unknown as WfMenuItems
    }

    ngAfterViewInit() {
        this.lastSuccessPollSub = this.lastSuccessPollSub ? this.lastSuccessPollSub : this.store.select(selectLastSyncDate()).subscribe((date) => {
            if (date) {
                this.lastSyncDate = moment(date);
            }
        });

        //monitor incident updates
        this.store.pipe(select('incidentManagementMap', 'simpleIncidents')).subscribe(
            (incidents: SimpleWildfireIncidentResource[]) => {
                if (this.isNonIncidentListRoute()) {
                    this.updateIncidents(incidents);

                    // if (this.incidentLayerVisible() && this.retrievingIncidentMarkers) {
                    if (this.incidentLayerVisible()) {
                        this.loadIncidentMarkers();
                        // this.retrievingIncidentMarkers = false;
                    }
                }
            }
        );

        //monitor ROF updates
        this.store.pipe(select('rof', 'simpleRofs')).subscribe(
            (simpleRofs: SimpleReportOfFireResource[]) => {
                if (this.isNonRofListRoute()) {
                    this.simpleRofs = simpleRofs;
                }
            }
        );

        this.store.pipe(select('rof', 'newSimpleRofs')).subscribe(
            (simpleRofs: SimpleReportOfFireResource[]) => {
                if (this.isNonRofListRoute()) {
                    if (simpleRofs && simpleRofs.length > 0) {
                        let rofs: PublicReportOfFireResource[] = [];
                        forkJoin(this.getBatchReportOfFire(simpleRofs)).subscribe((values) => {
                            rofs = values;
                            this.store.dispatch(new RofActions.ROFSyncAction(rofs));
                        });
                    }
                }
            }
        );

        this.store.pipe(select('rof', 'rofs')).subscribe(
            (rofs: PublicReportOfFireResource[]) => {
                if (this.isNonRofListRoute()) {
                    this.updateFireReports(rofs);
                    // this.detectChanges();

                    // if (this.rofLayerVisible() && this.retrievingRofMarkers) {
                    if (this.rofLayerVisible()) {
                        this.loadRofMarkers();
                    }
                }
            }
        );

        //monitor NROF updates
        this.store.pipe(select('nrofMap', 'nrofs')).subscribe(
            (nrofs: ProvisionalZoneResource[]) => {
                if (this.isNonNrofListRoute()) {
                    this.updateProvisionalZones(nrofs);
                    // this.detectChanges();

                    // if (this.nrofLayerVisible() && this.retrievingNrofMarkers) {
                    if (this.nrofLayerVisible()) {
                        this.loadNRofMarkers();
                        // this.retrievingNrofMarkers = false;
                    }
                }
            }
        );

        setInterval(() => {
            this.getLastSync();
        }, 1000);
    }

    getLastSync() {
        if (!this.lastSyncDate) {
            return '-';
        }
        let now = moment();
        let value = now.diff(this.lastSyncDate, 'second', false);
        if (value > 240) {
            this.lastSyncValue = '240+';
        } else {
            this.lastSyncValue = value.toFixed(0);
        }
    }

    public isGeneralStaff() {
        return this.applicationStateService.isGeneralStaff();
    }

    public canViewNROF() {
        return !this.isGeneralStaff();
    }

    @HostListener('window:orientationchange', ['$event'])
    onOrientationChange() {
        setTimeout(() => {
            console.log('window:orientationchange')
            this.updateMapSize();
        }, 250);
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        setTimeout(() => {
            console.log('window:resize')
            this.updateMapSize();
        }, 250);
    }

    storeViewportSize() {
        this.orientation = this.applicationStateService.getOrientation()
        document.documentElement.style.setProperty( '--viewport-height', `${ window.innerHeight }px`);
        document.documentElement.style.setProperty( '--viewport-width', `${ window.innerWidth }px`);
    }

    getMapStateHashIgnoreTimestamp(state) {
        let stateWithoutTimestamp = Object.assign({}, state);
        delete stateWithoutTimestamp.timestamp;

        return UtilHash(stateWithoutTimestamp);
    }

    private receiveWindowMessage(message: Message) {
        if (message.type === MessageType.ACTION) {
            switch (message.action.type) {
                case MapActions.SET_MAP_POSITION:
                    this.store.dispatch(new MapActions.SetMapLocation((<any>message.action).location));
                    break;

                case MapActions.CLEAR_MAP_SELECT_POINT:
                    this.store.dispatch(new MapActions.ClearMapSelectPoint());
                    break;

                case MapActions.ACTIVATE_SELECT_POINT:
                    this.store.dispatch(new MapActions.ActivateSelectTool());
                    break;

                case MapActions.SET_MAP_POLYGON:
                    this.store.dispatch(new MapActions.SetMapPolygon((<any>message.action).polygon));
                    break;

                case MapActions.SET_ACTIVE_MAP_POLYGON:
                    this.store.dispatch(new MapActions.SetActiveMapPolygon((<any>message.action).polygon));
                    break;

                case MapActions.CLEAR_MAP_SELECT_POLYGON:
                    this.store.dispatch(new MapActions.ClearMapSelectPolygon());
                    break;

                case MapActions.ACTIVATE_SELECT_POLYGON:
                    this.store.dispatch(new MapActions.ActivateSelectPolygonTool());
                    break;

                case SearchActions.SearchActionTypes.REFRESH_SEARCH:
                    let typedAction = message.action as (SearchActions.RefreshSearchAction);
                    if (typedAction.componentId == NROF_MAP_COMPONENT_ID) {
                        this.store.dispatch(new MapActions.ClearMapSelectPolygon());
                    }
                    this.store.dispatch(message.action);
                    break;

                default:
                    this.store.dispatch(message.action);
            }
        } else {
            console.warn('Unhandled message:', JSON.stringify(message));
        }
    }

    ngOnDestroy() {
        if (this.lastSuccessPollSub) {
            this.lastSuccessPollSub.unsubscribe();
        }
        if (this.refreshMapInterval) {
            clearInterval(this.refreshMapInterval);
        }
    }

    registerAuth() {
        this.tokenService.credentialsEmitter.subscribe(
            state => {
                // TODO: FInd a more elegant solution to this problem.  Startup effects don't appear to fire without this fix.
                // Wait 1 tick to make sure routing is finished so effect is not interrupted
                //setTimeout(() => {
                return this.store.dispatch(new AuthActions.SetAuthAction(state))
                //}, 0);
            }
        );
    }

    checkUserPermissions() {
        this.hasAccess = true;
        this.isLoggedIn = true;
    }

    initializeRouterSubscription() {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationStart) {
                this.showLeftPanel = (event as NavigationStart).url != '/'
                this.updateMapSize()

                this.wfimMapService.clearSelectedPoint()
                    .then(() => {
                        return this.wfimMapService.clearSearch()
                    })
                    .then(() => {
                        return this.wfimMapService.clearHighlight()
                    })
            }
        });
    }

    initMap(smk: any) {
        this.wfimMapService.setSmkInstance(smk, this.bespokeContainerRef, this.mapConfig[0].viewer.location.extent)

        this.updateMapSize = function () {
            this.storeViewportSize()
            smk.updateMapSize();
        };

        window[ 'SPLASH_SCREEN' ].remove()
    }

    checkMapServiceStatus(): Promise<MapServiceStatus> {
        return this.tokenService.authTokenEmitter.toPromise().then( () => {
            return Promise.resolve( {
                useSecure: true,
                token: this.tokenService.getOauthToken()
            } )
        } )

		// return this.appConfigService.loadAppConfig().then( () => {
        //     let layerServices = this.appConfigService.getConfig().mapServiceConfig.layerSettings.layerServices
		// 	let unsecuredUrl = layerServices[ 'bcgw' ].url
		// 	// let securedUrl = layerServices[ 'bcgw-secured' ].url

        //     return fetch( unsecuredUrl ).then( ( resp ) => {
        //         return { useSecure: !resp.ok }
        //     } )
		// } )
    }
}

function eachDisplayContextItem( items, callback ) {
    items.forEach( ( item ) => {
        callback( item )

        if ( item.items ) eachDisplayContextItem( item.items, callback )
    } )
}