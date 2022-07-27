import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Event, NavigationStart, OutletContext } from '@angular/router';
import {
    Message, MessageType, WFNROF_WINDOW_NAME, WFROF_WINDOW_NAME
} from '@wf1/core-ui';

import * as moment from 'moment';
import { forkJoin, Subscription } from 'rxjs';
import { MarkerLayerBaseComponent } from './components/marker-layer-base.component';
import { UtilHash } from './hash-util';
import { WfApplicationState, RouterLink, WfApplicationConfiguration } from '@wf1/wfcc-application-ui';
import { WfMenuItems } from '@wf1/wfcc-application-ui/application/components/wf-menu/wf-menu.component';
import { MapServiceStatus } from './services/map-config.service';
import * as MapActions from './store/map/map.actions';
import { LonLat } from './services/wfnews-map.service/util';
import { ResourcesRoutes } from './utils';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})

export class AppComponent extends MarkerLayerBaseComponent implements OnDestroy, OnInit, AfterViewInit {

    public TOOLTIP_DELAY = 500;

    title = 'News';

    isLoggedIn = true;
    hasAccess = true;

    mapConfig = null;

    applicationConfig: WfApplicationConfiguration = {
        title: 'NEWS',
        device: this.applicationStateService.getDevice(),
        userName: '',
        version: {
            long: '',
            short: ''
        },
        environment: ''
    };

    applicationState: WfApplicationState = {
        menu: 'hidden'
    };

    appMenu: WfMenuItems;
    footerMenu: WfMenuItems;
    orientation;

    showLeftPanel = true;


    private lastSuccessPollSub: Subscription;
    private lastSyncDate;
    private lastSyncValue = undefined;
    private refreshMapInterval;

    private updateMapSize = function() {
        this.storeViewportSize();
    };

    @ViewChild('extOutlet', { static: true }) extOutlet: OutletContext;
    @ViewChild('bespokeContainer', { read: ViewContainerRef }) bespokeContainerRef: ViewContainerRef;

    ngOnInit() {
        const self = this;

        super.ngOnInit();
        this.initializeRouterSubscription();
        this.updateService.checkForUpdates();

        this.checkUserPermissions();

        this.messagingService.subscribeToMessageStream(this.receiveWindowMessage.bind(this));
        if (!this.location.path().startsWith('/(root:external')) {
            this.appConfigService.configEmitter.subscribe((config) => {
                this.applicationConfig.version.short = config.application.version.replace(/-snapshot/i, '');
                this.applicationConfig.version.long = config.application.version;
                this.applicationConfig.environment = config.application.environment.replace(/^.*prod.*$/i, '');

                const mapConfig = [];
                this.checkMapServiceStatus()
                    .then( ( mapServiceStatus ) => {
                        this.wfnewsMapService.mapServiceStatus = mapServiceStatus;

                        return this.mapConfigService.getMapConfig( mapServiceStatus, this.applicationConfig.device );
                    } )
                    .then((config) => {
                        mapConfig.push(config);

                        return this.mapStatePersistenceService.getMapState();
                    })
                    .then((mapState) => {
                        if (!mapState || !mapState.version) {
                          return;
                        }
                        if (mapState.version.app !== this.applicationConfig.version.short) {
                          return;
                        }
                        if (mapState.version.build !== config.application.buildNumber) {
                          return;
                        }

                        eachDisplayContextItem( mapState.viewer.displayContext, ( item ) => {
                            if ( item.id == 'resource-track' ) {
                              item.isVisible = false;
                            }
                            delete item.isEnabled;
                        } );

                        mapConfig.push(mapState);
                    })
                    .then(() => {
                        const deviceConfig = { viewer: { device: this.applicationConfig.device } };

                        self.mapConfig = [...mapConfig, deviceConfig, 'theme=wf', '?'];
                    });

                this.wfnewsMapService.setMapStateSaveHandler((state) => {
                    state.version = {
                        app: this.applicationConfig.version.short,
                        build: config.application.buildNumber
                    };

                    this.mapStatePersistenceService.putMapState(state)
                        .then(() => {
                        })
                        .catch((e) => {
                            // console.warn( e, 'failed saving map state' )
                        });
                });

                this.wfnewsMapService.setSelectPointHandler((location: LonLat) => {
                    const action = new MapActions.SetActiveMapLocation(location);

                    const windowId = this.messagingService.getWindowId(WFROF_WINDOW_NAME);
                    if (windowId) {
                        this.messagingService.broadcastAction(windowId, action);
                    }

                    this.store.dispatch(action);
                });

                this.wfnewsMapService.setSelectPolygonHandler((polygon) => {
                    const action = new MapActions.SetActiveMapPolygon(polygon);

                    const windowId = this.messagingService.getWindowId(WFNROF_WINDOW_NAME);
                    if (windowId) {
                        this.messagingService.broadcastAction(windowId, action);
                    }

                    this.store.dispatch(action);
                });


                // const refreshRate = config?.application?.polling?.mapTool?.layerRefreshPolling
                // this.refreshMapInterval = setInterval(() => {
                //     this.wfimMapService.redrawMap();
                // }, refreshRate || 5000);

                this.onResize();
            });
        }





        this.initAppMenu();
        this.initFooterMenu();
    }

    initAppMenu() {
        this.appMenu = ( this.applicationConfig.device == 'desktop' ?
            [
                new RouterLink('Active Wildfires Map', '/'+ResourcesRoutes.ACTIVEWILDFIREMAP, 'home', 'expanded', this.router),
                new RouterLink('Wildfires List', '/'+ResourcesRoutes.WILDFIRESLIST, 'home', 'expanded', this.router), //temp route
                new RouterLink('Current Statistics', '/'+ResourcesRoutes.CURRENTSTATISTICS, 'home', 'expanded', this.router),//temp route
                new RouterLink('Resources', '/'+ResourcesRoutes.RESOURCES, 'home', 'expanded', this.router),


            ]
        :
            [
                new RouterLink('Home', '/', 'home', 'hidden', this.router),
            ]
        ) as unknown as WfMenuItems;
    }

    initFooterMenu() {
        this.footerMenu = ( this.applicationConfig.device == 'desktop' ?
            [
                new RouterLink('Home', 'https://www2.gov.bc.ca/gov/content/home', 'home', 'expanded', this.router),
                new RouterLink('Disclaimer', 'https://www2.gov.bc.ca/gov/content/home/disclaimer', 'home', 'expanded', this.router),
                new RouterLink('Privacy', 'https://www2.gov.bc.ca/gov/content/home/privacy', 'home', 'expanded', this.router),
                new RouterLink('Accessibility', 'https://www2.gov.bc.ca/gov/content/home/accessible-government', 'home', 'expanded', this.router),
                new RouterLink('Copyright', 'https://www2.gov.bc.ca/gov/content/home/copyright', 'home', 'expanded', this.router),
                new RouterLink('Contact Us', 'https://www2.gov.bc.ca/gov/content/home/get-help-with-government-services', 'home', 'expanded', this.router),


            ]
        :
            [
                new RouterLink('Home', '/', 'home', 'hidden', this.router),
            ]
        ) as unknown as WfMenuItems;
    }


    ngAfterViewInit() {

        //monitor incident updates


        //monitor ROF updates


        setInterval(() => {
            this.getLastSync();
        }, 1000);
    }

    getLastSync() {
        if (!this.lastSyncDate) {
            return '-';
        }
        const now = moment();
        const value = now.diff(this.lastSyncDate, 'second', false);
        if (value > 240) {
            this.lastSyncValue = '240+';
        } else {
            this.lastSyncValue = value.toFixed(0);
        }
    }


    @HostListener('window:orientationchange', ['$event'])
    onOrientationChange() {
        setTimeout(() => {
            this.updateMapSize();
        }, 250);
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        setTimeout(() => {
            this.updateMapSize();
        }, 250);
    }

    storeViewportSize() {
        this.orientation = this.applicationStateService.getOrientation();
        document.documentElement.style.setProperty( '--viewport-height', `${ window.innerHeight }px`);
        document.documentElement.style.setProperty( '--viewport-width', `${ window.innerWidth }px`);
    }

    getMapStateHashIgnoreTimestamp(state) {
        const stateWithoutTimestamp = Object.assign({}, state);
        delete stateWithoutTimestamp.timestamp;

        return UtilHash(stateWithoutTimestamp);
    }

    private receiveWindowMessage(message: Message) {
        if (message.type === MessageType.ACTION) {
            switch (message.action.type) {
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


    checkUserPermissions() {
        this.hasAccess = true;
        this.isLoggedIn = true;
    }

    initializeRouterSubscription() {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationStart) {
                this.showLeftPanel = (event as NavigationStart).url != '/';
                this.updateMapSize();

                this.wfnewsMapService.clearSelectedPoint()
                    .then(() => this.wfnewsMapService.clearSearch())
                    .then(() => this.wfnewsMapService.clearHighlight());
            }
        });
    }

    initMap(smk: any) {
        this.wfnewsMapService.setSmkInstance(smk, this.bespokeContainerRef, this.mapConfig[0].viewer.location.extent);

        this.updateMapSize = function() {
            this.storeViewportSize();
            smk.updateMapSize();
        };

        window[ 'SPLASH_SCREEN' ].remove();
    }

    checkMapServiceStatus(): Promise<MapServiceStatus> {

            return Promise.resolve( {
                useSecure: true,
            } );


		// return this.appConfigService.loadAppConfig().then( () => {
        //     let layerServices = this.appConfigService.getConfig().mapServiceConfig.layerSettings.layerServices
		// 	let unsecuredUrl = layerServices[ 'bcgw' ].url
		// 	// let securedUrl = layerServices[ 'bcgw-secured' ].url

        //     return fetch( unsecuredUrl ).then( ( resp ) => {
        //         return { useSecure: !resp.ok }
        //     } )
		// } )
    }

    navigateToBcWebsite() {
        window.open('https://www2.gov.bc.ca/gov/content/safety/wildfire-status', '_blank');

    }

    navigateToFooterPage(event: any) {
        window.open(event.route, '_blank');
    }
}

function eachDisplayContextItem( items, callback ) {
    items.forEach( ( item ) => {
        callback( item );

        if ( item.items ) {
eachDisplayContextItem( item.items, callback );
}
    } );
}
