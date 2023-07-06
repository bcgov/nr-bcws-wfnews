import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    HostListener,
    Input,
    NgZone,
    OnInit,
    SimpleChanges,
    Type,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import { LandingPageComponentModel } from "./landing-page.component.model";
import { BaseComponent } from "../base/base.component";
import { NearMeComponent } from "../near-me/near-me.component";
import { IncidentDetailComponent} from "../incident-detail-panel/incident-detail.component";
import { WFOnePublicMobileMapToolRoutes, WFOnePublicMobileRoutes } from "src/app/utils";
import { NearMeItem, NearMeTemplate, WeatherHourlyCondition, WeatherStationConditions } from "../../services/point-id.service";
import { BaseWrapperComponent } from "../base-wrapper/base-wrapper.component";
import { NavigationEnd, ParamMap } from "@angular/router";
import * as L from 'leaflet';
import { WFMapService } from "src/app/services/wf-map.service";
import { MapConfigService } from "src/app/services/map-config.service";
import { AppConfigService } from "src/app/services/app-config.service";
import { WeatherDetailComponent } from "../weather-detail/weather-detail.component";
import { WeatherHistoryComponent } from "../weather-history/weather-history.component";
import { LocationNotification } from "src/app/services/capacitor-service";
import { SmkApi } from "src/app/utils/smk";
import { HttpClient } from "@angular/common/http";
import { PushNotification } from "@capacitor/push-notifications";
import { LayerFailureConfig, LayerFailureSnackbarComponent } from "../layer-failure-snackbar/layer-failure-snackbar.component";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";

declare const window: any;
declare var $: any;

@Component({
    selector: 'wfone-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['../base/base.component.scss', './landing-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent extends BaseComponent implements AfterViewInit, OnInit {
    @ViewChild('nearMeContainer', { read: ViewContainerRef }) nearMeContainer: ViewContainerRef;
    @ViewChild('baseWrapperComponent', { read: BaseWrapperComponent }) baseWrapperComponent;
    @Input() nearMeHighlight: NearMeItem;
    @Input() source: string;
    updateMapSize: () => void;
    nearMeComponentRef
    componentRef: ComponentRef<any>
    locationNotification: LocationNotification
    navSubscription;
    paramSubscription;
    layerUpdateSubscription;
    nearMeBadge;
    mapConfig = null;
    // smkInstance: any;
    smkApi: SmkApi = new SmkApi(null)
    weatherStation;
    pickLocation;
    notificationState = 0
    httpClient: HttpClient

    protected mapConfigService: MapConfigService;
    protected wfMapService: WFMapService;
    protected appConfig: AppConfigService;
    protected snackbar: MatSnackBar;

    zone: NgZone;

    initComponent() {
        super.initComponent()

        this.wfMapService = this.injector.get(WFMapService)
        this.mapConfigService = this.injector.get(MapConfigService)
        this.appConfig = this.injector.get(AppConfigService)
        this.zone = this.injector.get(NgZone)
        this.snackbar = this.injector.get(MatSnackBar)
    }

    isHandlerForUrl( url: string ): boolean {
        return url.includes( WFOnePublicMobileRoutes.LANDING )
    }

    ngOnInit() {
        var self = this

        this.navSubscription = this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd && e.urlAfterRedirects.indexOf('wildfire-map') !== -1) {
                setTimeout(() => {
                    this.updateMapSize();
                    this.cdr.detectChanges()
                }, 500)
            }
        });

        this.paramSubscription = this.route.queryParams.subscribe((params: ParamMap) => {
            this.locationNotification = null
            if (!params['latitude'] || !params['longitude']) return

            try {
                // console.log('params', params)
                this.locationNotification = {
                    latitude: parseFloat(params['latitude']),
                    longitude: parseFloat(params['longitude']),
                    radius: parseFloat(params['radius']),
                    featureId: params['featureId'],
                    featureType: params['featureType'],
                    fireYear: parseInt( params['fireYear'] ), // added for debugging purposes
                }
                // console.log('locationNotification', this.locationNotification)

                this.baseWrapperComponent.closeSidenav()

                switch ( this.locationNotification.featureType ) {
                    case 'BCWS_ActiveFires_PublicView':
                        this.incidentDetailToolActive(false)
                        setTimeout(() => {
                            this.incidentDetailToolActive(true)
                            this.cdr.detectChanges();
                        }, 1000);
                        return

                    case 'British_Columbia_Area_Restrictions':
                    case 'British_Columbia_Bans_and_Prohibition_Areas':
                    case 'Evacuation_Orders_and_Alerts':
                    case '':
                        this.nearMeToolActive(false)
                        setTimeout(() => {
                            this.nearMeToolActive(true)
                            this.cdr.detectChanges();
                        }, 1000);
                        return

                    default:
                        console.warn( 'don\'t know how to handle feature type:', this.locationNotification.featureType )
                        return
                }
            }
            catch (e) {
                console.warn('failed to parse paramaters:', e, params)
            }
        });

        this.mapConfigService.getMapConfig().then(function (config) {
            let overrideConfig = self.appConfig.getConfig().mapConfig || {};
            self.mapConfig = [config, overrideConfig, 'theme=wf', '?']
            self.cdr.detectChanges();
        })

        this.installSmkHandlers()
    }

    ngAfterViewInit() {
        this.eventEmitterService.sideNavAccessLocked(true);
        super.ngAfterViewInit();
    }

    clearHighlight(clearLocation = true): Promise<any> {
        try {
            if (clearLocation) {
                this.clearLocationMarker()
                this.clearAreaHighlight()
            }

            this.clearNearMeMarker()
            this.showNotifiedFeature()

            return this.smkApi.setDisplayContextItemsVisible(
                { itemId: 'bans-and-prohibitions-highlight', visible: false },
                { itemId: 'evacuation-orders-and-alerts-wms-highlight', visible: false },
                { itemId: 'area-restrictions-highlight', visible: false }
            )
        }
        catch ( e ) {
            return Promise.reject( e )
        }
    }

    installSmkHandlers() {
        var self = this

        var weatherStation

        let fitToBounds = ( smk, bounds ) => {
            if ( this.getIsMobileRes() ) {
                smk.$viewer.map.fitBounds(
                    [ bounds._southWest, bounds._northEast ],
                    { paddingBottomRight: [0, (window.innerHeight - 120) / 2] }
                )
            }
            else {
                smk.$viewer.map.fitBounds(
                    [ bounds._southWest, bounds._northEast ],
                    { paddingBottomRight: 0 }
                )
            }
        }

        this.wfMapService.setHandler('BespokeTool--incident', 'deactivated', function (smk, tool) {
            window.snowplow('trackPageView', self.router.url);

            self.zone.run(function () {
                self.clearHighlight()
            })
        } )

        this.wfMapService.setHandler('BespokeTool--incident', 'activated', function (smk, tool, el) {
            window.snowplow('trackPageView', self.router.url + WFOnePublicMobileMapToolRoutes.IDENTIFY);

            let compRef

            self.zone.run(function () {
                compRef = self.makeComponent(IncidentDetailComponent)

                self.clearHighlight()
                    .then(() => {
                        if ( !self.locationNotification ) return

                        return compRef.instance.setIncidentDetail( {
                            incident_number_label: self.locationNotification.featureId,
                            fire_year: self.locationNotification.fireYear // added for debugging purposes
                        } ).then( incident => {
                            self.cdr.detectChanges();
                            if ( !incident ) return

                            let lat = Number(incident.latitude),
                                lng = Number(incident.longitude),
                                rad = 50 //km

                            const bounds = L.latLng(lat, lng).toBounds(rad * 2400);

                            fitToBounds( smk, bounds )

                            self.showNearMeMarker({
                                type: 'Point',
                                coordinates: [lng, lat]
                            } )
                        } )
                    } )
                    .catch( ( e ) => {
                        try {
                            console.warn( e )
                            compRef.instance.setError( e )
                        }
                        catch ( e ) {
                            alert(e)
                        }
                    } )
                    .then( () => {
                        el.appendChild(compRef.location.nativeElement)
                        setTimeout(() => {
                            self.cdr.detectChanges();
                        } )
                    } )
            } )
        } )

        this.wfMapService.setHandler('BespokeTool--nearme', 'deactivated', function (smk, tool) {
            window.snowplow('trackPageView', self.router.url);

            self.zone.run(function () {
                self.clearHighlight()
            })

            // if (self.nearMeComponentRef) {
            //     self.nearMeComponentRef._component.setNearMeTemplate([]);
            //     setTimeout(() => {
            //         self.cdr.detectChanges();
            //     }, 50);
            // }
        });

        this.wfMapService.setHandler('BespokeTool--nearme', 'activated', function (smk, tool, el) {
            window.snowplow('trackPageView', self.router.url + WFOnePublicMobileMapToolRoutes.NEARME);

            self.zone.run(function () {
                self.clearHighlight().then(() => {
                    let compRef = self.makeComponent(NearMeComponent)
                    compRef.instance.setShowMapInline(false);
                    compRef.instance.setWeatherDetailsHandler(function () {
                        smk.getToolById('BespokeTool--nearme-weather-detail').active = true;
                    });

                    el.appendChild(compRef.location.nativeElement)
                    self.cdr.detectChanges();

                    if (self.nearMeBadge) {
                        self.nearMeBadge.remove();
                        self.nearMeBadge = null;
                    }

                    if (!self.locationNotification) {
                        self.commonUtilityService.getCurrentLocationPromise().then((position) => {
                            const coordinates = position.coords;

                            const bounds = L.latLng(coordinates.latitude, coordinates.longitude).toBounds(120000);
                            fitToBounds( smk, bounds )

                            self.showAreaHighlight([coordinates.longitude, coordinates.latitude], 50)
                            self.showLocationMarker({
                                type: 'Point',
                                coordinates: [coordinates.longitude, coordinates.latitude]
                            });

                            self.pointIdService.fetchNearbyFeatures(coordinates.latitude, coordinates.longitude, 50)
                                .then(function (resp: NearMeTemplate) {
                                    compRef.instance.setNearMeTemplate(resp);
                                    weatherStation = resp.weatherConditions

                                    setTimeout(() => {
                                        self.cdr.detectChanges();
                                    }, 50);
                                })
                                .catch(function (error) {
                                    self.snackbarService.open('There was an error in the server. Please try again',
                                        '', { duration: 2500, panelClass: 'full-snack-bar-offline' });
                                    compRef.instance.setLoading(false);

                                    self.clearHighlight(false)

                                    setTimeout(() => {
                                        self.cdr.detectChanges();
                                    });
                                })
                        });
                    }
                    else {
                        console.log('using location notification:', self.locationNotification)

                        let lat = self.locationNotification.latitude,
                            lng = self.locationNotification.longitude,
                            rad = self.locationNotification.radius,
                            fid = self.locationNotification.featureId,
                            ftype = self.locationNotification.featureType

                        const bounds = L.latLng(lat, lng).toBounds(rad * 2400);

                        fitToBounds( smk, bounds )

                        self.showAreaHighlight([lng, lat], rad)
                        self.showLocationMarker({
                            type: 'Point',
                            coordinates: [lng, lat]
                        });

                        self.pointIdService.fetchNearbyFeatures(lat, lng, rad, fid, ftype)
                            .then(function (resp: NearMeTemplate) {
                                compRef.instance.setNearMeTemplate(resp);
                                weatherStation = resp.weatherConditions

                                self.showAreaHighlight([lng, lat], rad)

                                let notifiedItem = resp.nearMeItems.find((it) => it.notified)
                                if (notifiedItem)
                                    self.showNotifiedFeature(notifiedItem)

                                self.locationNotification = null
                                // self.PNCoords = null;
                                setTimeout(() => {
                                    self.cdr.detectChanges();
                                }, 50);
                            })
                            .catch(function (error) {
                                self.snackbarService.open('There was an error in the server. Please try again',
                                    '', { duration: 2500, panelClass: 'full-snack-bar-offline' });
                                compRef.instance.setLoading(false);

                                self.clearHighlight(false)

                                setTimeout(() => {
                                    self.cdr.detectChanges();
                                });
                            })
                    }

                    setTimeout(() => {
                        self.cdr.detectChanges();
                    });
                })

            })
        });

        this.wfMapService.setHandler('BespokeTool--menu', 'triggered', function (smk, tool) {
            self.zone.run(function () {
                self.baseWrapperComponent.openSidenav();
            })
        });

        this.wfMapService.setHandler('BaseMapsTool', 'triggered', function (smk, tool) {
            window.snowplow('trackPageView', self.router.url + WFOnePublicMobileMapToolRoutes.BASEMAP + "-" + tool.title.replace("Base Map: ", ""));
            window.snowplow('trackPageView', self.router.url);
            self.wfMapService.changeBasemapCacheToken()
        });

        this.wfMapService.setHandler('IdentifyListTool', 'activated', function (smk, tool) {
            window.snowplow('trackPageView', self.router.url + WFOnePublicMobileMapToolRoutes.IDENTIFY);
        });
        this.wfMapService.setHandler('IdentifyListTool', 'deactivated', function (smk, tool) {
            window.snowplow('trackPageView', self.router.url);
        });

        this.wfMapService.setHandler('LayersTool', 'activated', function (smk, tool) {
            window.snowplow('trackPageView', self.router.url + WFOnePublicMobileMapToolRoutes.LAYERS);
        });
        this.wfMapService.setHandler('LayersTool', 'deactivated', function (smk, tool) {
            window.snowplow('trackPageView', self.router.url);
        });

        this.wfMapService.setHandler('SearchLocationTool', 'activated', function (smk, tool) {
            window.snowplow('trackPageView', self.router.url + WFOnePublicMobileMapToolRoutes.SEARCH);
        });
        this.wfMapService.setHandler('SearchLocationTool', 'deactivated', function (smk, tool) {
            window.snowplow('trackPageView', self.router.url);
        });

        this.wfMapService.setHandler('BespokeTool--identify-weather-history', 'activated', function (smk, tool, el) {
            self.zone.run(function () {
                let compRef = self.makeComponent(WeatherHistoryComponent)
                compRef.instance.setWeatherStation(self.weatherStation);
                el.appendChild(compRef.location.nativeElement)
                self.cdr.detectChanges();
            })
            window.snowplow('trackPageView', self.router.url + '#identify-weather-history');
        });
        this.wfMapService.setHandler('BespokeTool--identify-weather-history', 'deactivated', function (smk, tool) {
            window.snowplow('trackPageView', self.router.url);
        });

        this.wfMapService.setHandler('BespokeTool--nearme-weather-detail', 'activated', function (smk, tool, el) {
            self.zone.run(function () {
                let compRef = self.makeComponent(WeatherDetailComponent)
                compRef.instance.setWeatherStation(weatherStation);
                compRef.instance.setWeatherHistoryHandler(function () {
                    smk.getToolById('BespokeTool--nearme-weather-history').active = true;
                });
                el.appendChild(compRef.location.nativeElement)
                self.cdr.detectChanges();
            })
            window.snowplow('trackPageView', self.router.url + '#nearme-weather-detail');
        });
        this.wfMapService.setHandler('BespokeTool--nearme-weather-detail', 'deactivated', function (smk, tool) {
            window.snowplow('trackPageView', self.router.url);
        });

        this.wfMapService.setHandler('BespokeTool--nearme-weather-history', 'activated', function (smk, tool, el) {
            self.zone.run(function () {
                let compRef = self.makeComponent(WeatherHistoryComponent)
                compRef.instance.setWeatherStation(weatherStation);
                el.appendChild(compRef.location.nativeElement)
                self.cdr.detectChanges();
            })
            window.snowplow('trackPageView', self.router.url + '#nearme-weather-history');
        });
        this.wfMapService.setHandler('BespokeTool--nearme-weather-history', 'deactivated', function (smk, tool) {
            window.snowplow('trackPageView', self.router.url);
        });
    }

    makeComponent<C>(component: Type<C>): ComponentRef<C> {
        if (this.componentRef)
            this.componentRef.destroy()

        this.nearMeContainer.clear()
        this.componentRef = this.nearMeContainer.createComponent(this.componentFactoryResolver.resolveComponentFactory(component))
        return this.componentRef
    }

    initMap(smk: any) {
        var self = this

        this.smkApi = new SmkApi(smk)

        this.updateMapSize = function () {
            smk.updateMapSize();
        };

        smk.on('LayersTool', {
            'layer-click': function (ev) {
                smk.$viewer.displayContext.layers.setItemVisible(ev.id, !ev.isVisible)
            }
        })

        var prevFeatureId

        smk.$viewer.identified.pickedFeature(function (ev) {
            // console.log('pickedFeature',ev)
            prevFeatureId = ev.feature ? ev.feature.id : ev.was ? ev.was.id : null
        })

        smk.on('BespokeTool--identify-weather-history', {
            'previous-panel': function (ev) {
                // console.log( 'BespokeTool--identify-weather-history', 'previous-panel' )
                smk.emit('IdentifyListTool', 'active', { featureId: prevFeatureId })
            }
        })

        smk.on('weather', {
            'history': function (ev) {
                // console.log('showDetails')
                smk.getToolById('BespokeTool--identify-weather-history').active = true;
                self.weatherStation = ev.weatherStation
            },
            'help': function (ev) {
                self.zone.run(function () {
                    self.applicationStateService.showHelpDialog('weather')
                })
            }
        })

        // remove existing search list handler
        smk.$dispatcher.$off( 'SearchListTool.input-change' )



        // install new handler to override bug in geocoder search API - WFONE-2854
        var searchTool = smk.$tool.SearchListTool
        smk.on( 'SearchListTool', { 'input-change': function (ev) {
             smk.$viewer.searched.clear()

              searchTool.busy = true
              searchTool.title = 'Locations matching <wbr>"' + ev.text + '"';
             doAddressSearch( ev.text, self )
                  .then( function ( features ) {
                      searchTool.active = true
                      smk.$viewer.searched.add( 'search', features, 'fullAddress' )
                      searchTool.busy = false
                  } )
                  .catch( function ( e ) {
                      console.warn( 'search failure:', e )
                  } )
         } 
        
        } 
        
        )

        var displaySearchAreaOrig = smk.$tool.IdentifyListTool.displaySearchArea
        smk.$tool.IdentifyListTool.displaySearchArea = function () {
            displaySearchAreaOrig.call(this)
            this.trackMouse = false
        }

        smk.$tool.IdentifyListTool.dispatcher.$off('startedIdentify')

        this.wfMapService.setIdentifyCallback(function (location, area) {
            if (location && area && smk && smk.$viewer.displayContext.layers.itemId['weather-stations'] && smk.$viewer.displayContext.layers.itemId['weather-stations'][0].isVisible){
                self.addNearbyWeatherStation(smk)
            }
        })
        this.wfMapService.setIdentifyDoneCallback(function (location, area) {
            if (!location || !area) return

            Object.keys( smk.$viewer.identified.featureSet ).forEach( fid => {
                let ft = smk.$viewer.identified.featureSet[ fid ]

                switch ( ft.layerId ) {
                    case 'active-wildfires-fire-of-note':
                    case 'active-wildfires-out-of-control':
                    case 'active-wildfires-holding':
                    case 'active-wildfires-under-control':
                    case 'bcws-activefires-publicview-inactive':
                        ft.properties.createContent = function ( el ) {
                            self.zone.run( function () {
                                let compRef = self.makeComponent( IncidentDetailComponent );
                                compRef.instance.setIncidentDetail( ft.properties );
                                el.appendChild(compRef.location.nativeElement)

                                self.cdr.detectChanges();
                            })
                        }
                        break;

                    default: return
                }
            } )

            setTimeout(function () {
                var stat = smk.$viewer.identified.getStats()

                if (stat.featureCount > 0) {
                    smk.$sidepanel.setExpand(1)
                    smk.$tool.IdentifyListTool.setInternalLayerVisible(true)
                }

                smk.$tool.IdentifyListTool.showStatusMessage()

                if (stat.featureCount == 1) {
                    // setTimeout( function () {
                    smk.$viewer.identified.pick(smk.$tool.IdentifyListTool.firstId)
                    // }, 250 )
                }
                else {
                    smk.$tool.IdentifyListTool.active = true
                }
            }, 500)
        })

        smk.$viewer.handlePick(3, function (location) {
            self.pickLocation = location
            return
        })


        this.layerUpdateSubscription = this.capacitorService.updateMainMapLayers.subscribe(() => {
            smk.$viewer.displayContext.layers.setItemVisible(smk.$viewer.displayContext.layers.root.id, false)
            smk.$viewer.updateLayersVisible()
            smk.$viewer.layerIdPromise = {}
            setTimeout(function () {
                smk.$viewer.displayContext.layers.setItemVisible(smk.$viewer.displayContext.layers.root.id, true)
                smk.$viewer.updateLayersVisible()
            }, 250)
        })

        // const pn = this.capacitorService.getPnUrl();
        // if (pn && pn['coords']) {
        //     this.PNCoords = JSON.parse(pn['coords']);
        //     this.PnRadius = JSON.parse(pn['radius']);
        //     this.nearMeToolActive( true )
        //     // smk.$tool['BespokeTool--nearme'].active = true;
        // }

        this.commonUtilityService.getCurrentLocationPromise().then((position) => {
            const coordinates = position.coords;
            self.pointIdService.fetchNearbyFeatures(coordinates.latitude, coordinates.longitude, 50)
                .then(function (resp: NearMeTemplate) {
                    if (resp.nearMeItems.length > 0) {
                        self.nearMeBadge = $('<div class="nearme-badge">' + resp.nearMeItems.length + '</div>');
                        window.jQuery('.smk-theme-wf .smk-overlay .smk-shortcut-menu .smk-tool-BespokeTool--nearme')
                            .append(self.nearMeBadge);
                    }
                })
                .catch(function (error) { })
        });

        this.wfMapService.layerFailedToLoad.subscribe( ( id ) => {
            console.log('layer failed',id, smk.$viewer.displayContext.layers.getItem( id ).title )
            this.showLayerFailureSnackbar(id)
        } )
    }

    showLayerFailureSnackbar( layerId: string ) {
        let title = this.smkApi.getDiaplayContextItemTitle( layerId )

        let cfg: MatSnackBarConfig<LayerFailureConfig> = {
            data: { title },
            // duration: 20 * 1000,
            verticalPosition: 'top',
            panelClass: 'wfone-notification-snackbar'
        }

        let sb = this.snackbar.openFromComponent( LayerFailureSnackbarComponent, cfg )

        sb.onAction().subscribe( () => {
            this.smkApi.setDisplayContextItemsVisible({
                itemId: layerId,
                visible: true,
                reload: true
            }) 
        } )
    }


    addNearbyWeatherStation(smk) {
        const self = this

        this.pointIdService.fetchNearestWeatherStation(this.pickLocation.map.latitude, this.pickLocation.map.longitude)
            .then(function (station: WeatherStationConditions) {
                self.weatherStation = station
                smk.$viewer.identified.add('weather-stations', [{
                    type: 'Feature',
                    title: station.stationName,
                    properties: {
                        code: station.stationCode,

                        createContent: function (el) {
                            self.zone.run(function () {
                                let compRef = self.makeComponent(WeatherDetailComponent)
                                compRef.instance.setWeatherStation(station);
                                compRef.instance.setWeatherHistoryHandler(function () {
                                    smk.getToolById('BespokeTool--identify-weather-history').active = true;
                                });
                                el.appendChild(compRef.location.nativeElement)
                                self.cdr.detectChanges();
                            })
                        },
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [self.pickLocation.map.longitude, self.pickLocation.map.latitude]
                    }
                }])
            })
    }

    parseConditionHour(condition: WeatherHourlyCondition) {
        const y = parseInt(condition.hour.slice(0, 4)),
            m = condition.hour.slice(4, 6),
            d = condition.hour.slice(6, 8),
            h = parseInt(condition.hour.slice(8))

        const now = new Date(),
            yNow = now.getFullYear(),
            mNow = now.getMonth() + 1,
            dNow = now.getDate()

        var day = `${y}-${m}-${d}`
        if (y == yNow && parseInt(m) == mNow && parseInt(d) == dNow)
            day = 'Today'

        return `${day} at ${h}:00`
    }

    nearMeToolActive(active: boolean) {
        this.smkApi.with((smk) => {
            smk.$tool['BespokeTool--nearme'].active = active;
        })
    }

    incidentDetailToolActive(active: boolean) {
        this.smkApi.with((smk) => {
            smk.$tool['BespokeTool--incident'].active = active;
        })
    }

    ngOnDestroy() {
        this.paramSubscription.unsubscribe();
        this.navSubscription.unsubscribe();
        this.layerUpdateSubscription.unsubscribe();
    }

    initModels() {
        this.model = new LandingPageComponentModel(this.sanitizer);
        this.viewModel = new LandingPageComponentModel(this.sanitizer);
    }

    loadPage() {
        this.updateView();
    }

    getViewModel(): LandingPageComponentModel {
        return <LandingPageComponentModel>this.viewModel;
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);

        if (changes.nearMeHighlight && this.nearMeHighlight) {
            this.highlightFeature(this.nearMeHighlight);
        }

        // if (changes.source) {
        // this.source = changes.source.currentValue;
        // }
    }

    highlightFeature(nearMeItem: NearMeItem) {
        this.clearHighlight(false).then(() => {
            if (!nearMeItem) return;

            switch (nearMeItem.type) {
                case 'AREA_RESTRICTIONS':
                    return this.highlightAreaRestriction( nearMeItem.key ).then( () => {
                        this.panToBbox( nearMeItem.bbox )
                    })

                case 'BANS_AND_PROHIBITIONS':
                    return this.highlightBansAndProhibition( nearMeItem.key ).then( () => {
                        this.panToBbox( nearMeItem.bbox )
                    })

                case 'EVACUATION_ORDERS':
                    return this.highlightEvacuationOrder( nearMeItem.key ).then( () => {
                        this.panToBbox( nearMeItem.bbox )
                    })

                case 'FIRE':
                    if (nearMeItem.nearestCoordinates && nearMeItem.nearestCoordinates.geometry) {
                        this.showNearMeMarker(nearMeItem.nearestCoordinates.geometry)
                        this.smkApi.panToFeature(nearMeItem.nearestCoordinates, 8, this.getIsMobileRes() )
                    }
                    break
            }
        })
    }

    showNotifiedFeature(item?: NearMeItem) {
        if (!item) {
            this.smkApi.showFeature('notified-fire')
            return
        }

        switch (item.type) {
            case 'FIRE':
                this.smkApi.showFeature('notified-fire', item.nearestCoordinates, {
                    pointToLayer: function (geojson, latLong) {
                        return L.marker(latLong, {
                            icon: L.divIcon({
                                className: 'wfim-notified notified-fire',
                                html: '<i class="material-icons">place</i>',
                                iconSize: [32, 32],
                                iconAnchor: [16, 32]
                            })
                        })
                    }
                })
                break;

            case 'AREA_RESTRICTIONS':
                return this.highlightAreaRestriction( item.key )

            case 'BANS_AND_PROHIBITIONS':
                return this.highlightBansAndProhibition( item.key )

            case 'EVACUATION_ORDERS':
                return this.highlightEvacuationOrder( item.key )
        }
    }

    panToBbox( bbox: number[] ) {
        if ( !bbox || bbox.length != 4 ) return

        this.smkApi.panToFeature( window.turf.bboxPolygon(bbox), true, this.getIsMobileRes() )
    }

    highlightAreaRestriction( id?: string ) {
        return this.smkApi.setDisplayContextItemsVisible({ itemId: 'area-restrictions-highlight', visible: false })
            .then(() => {
                if ( !id ) return

                this.smkApi.withLayerConfig('area-restrictions-highlight', (config) => {
                    config.where = `PROT_RA_SYSID=${id}`
                })

                return this.smkApi.setDisplayContextItemsVisible({ itemId: 'area-restrictions-highlight', visible: true, reload: true })
            })
    }

    highlightBansAndProhibition( id?: string ) {
        return this.smkApi.setDisplayContextItemsVisible({ itemId: 'bans-and-prohibitions-highlight', visible: false })
            .then(() => {
                if ( !id ) return

                this.smkApi.withLayerConfig('bans-and-prohibitions-highlight', (config) => {
                    config.where = `PROT_BAP_SYSID=${id}`
                })

                return this.smkApi.setDisplayContextItemsVisible({ itemId: 'bans-and-prohibitions-highlight', visible: true, reload: true })
            })
    }

    highlightEvacuationOrder( id?: string ) {
        return this.smkApi.setDisplayContextItemsVisible({ itemId: 'evacuation-orders-and-alerts-wms-highlight', visible: false })
            .then(() => {
                if ( !id ) return

                this.smkApi.withLayerConfig('evacuation-orders-and-alerts-wms-highlight', (config) => {
                    config.where = `EMRG_OAA_SYSID=${id}`
                })

                return this.smkApi.setDisplayContextItemsVisible({ itemId: 'evacuation-orders-and-alerts-wms-highlight', visible: true, reload: true })
            })
    }

    showLocationMarker(point) {
        this.smkApi.showFeature('my-location', point, {
            pointToLayer: function (geojson, latLong) {
                return L.marker(latLong, {
                    icon: L.divIcon({
                        className: 'wfone-my-location',
                        html: '<i class="material-icons">my_location</i>',
                        iconSize: [24, 24]
                    })
                })
            }
        })
    }

    clearLocationMarker() {
        this.smkApi.showFeature('my-location');
    }

    showNearMeMarker(point) {
        this.smkApi.showFeature('near-me-marker', point, {
            pointToLayer: function (geojson, latlng) {
                return window['L'].marker(latlng, {
                    icon: window['L'].icon({
                        iconUrl: 'assets/images/marker-icon-blue.png',
                        shadowUrl: 'assets/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    }),
                    interactive: false,
                    draggable: false
                })
            }
        })
    }

    clearNearMeMarker() {
        this.smkApi.showFeature('near-me-marker');
    }

    showAreaHighlight(center, radius) {
        const circle = window.turf.circle(center, radius, { steps: 40, units: 'kilometers' });
        this.smkApi.showFeature('near-me-highlight3x', circle);
    }

    clearAreaHighlight() {
        this.smkApi.showFeature('near-me-highlight3x');
    }

    // @HostListener('window:orientationchange', ['$event'])
    // onOrientationChange(event) {
    //     setTimeout(() => {
    // console.log('window:orientationchange')
    // this.updateMapSize();
    // }, 250);
    // }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        setTimeout(() => {
            // console.log('window:resize')
            this.updateMapSize();
            this.cdr.detectChanges()
        }, 250);
    }

    onRofClick() {
        this.router.navigate([WFOnePublicMobileRoutes.REPORT_OF_FIRE])
    }

    // public static String BRITISH_COLUMBIA_BANS_AND_PROHIBITION_AREAS = "British_Columbia_Bans_and_Prohibition_Areas";
    // public static String EVACUATION_ORDERS_AND_ALERTS = "Evacuation_Orders_and_Alerts";
    // public static String BRITISH_COLUMBIA_AREA_RESTRICTIONS = "British_Columbia_Area_Restrictions";
    // public static String BCWF_ACTIVEFIRES_PUBLIVIEW = "BCWS_ActiveFires_PublicView";


    testNotifications = [
        // {
        //     latitude: 48.435000,
        //     longitude: -123.368000,
        //     radius: 25,
        //     featureId: '',
        //     featureType: ''
        // },
        makeLocation( {
            latitude: 49.709814, // lemon creek
            longitude: -117.470736,
            radius: 20,
            // featureId: 'N50155', //FIRE_NUMBER
            featureType: 'BCWS_ActiveFires_PublicView',
            fireYear: 2022
        } ),
        // {
        //     latitude: 51.37212, // OUT -
        //     longitude: -117.959634,
        //     radius: 20,
        //     featureId: 'N400006', //FIRE_NUMBER
        //     featureType: 'BCWS_ActiveFires_PublicView'
        // },
        makeLocation( {
            latitude: 48.507955, // OUT - beaver lake
            longitude: -123.393515,
            radius: 20,
            featureId: 'V60164', //FIRE_NUMBER
            featureType: 'BCWS_ActiveFires_PublicView',
            fireYear: 2022
        } ),
        // makeLocation( {
        //     latitude: 49.18527, // cawston
        //     longitude: -119.76336,
        //     radius: 20,
        //     featureId: 'K50275', //FIRE_NUMBER
        //     featureType: 'BCWS_ActiveFires_PublicView',
        //     fireYear: 2022
        // } ),
        // makeLocation( {
        //     latitude: 49.709814, // lemon creek
        //     longitude: -117.470736,
        //     radius: 20,
        //     featureId: 'N50155xxxxx', //FIRE_NUMBER
        //     featureType: 'BCWS_ActiveFires_PublicView',
        //     fireYear: 2022
        // } ),
        // makeLocation( {
        //     latitude: 49.709814, // lemon creek
        //     longitude: -117.470736,
        //     radius: 20,
        //     featureId: 'N50155', //FIRE_NUMBER
        //     featureType: 'BCWS_ActiveFires_PublicViewxxxx',
        //     fireYear: 2022
        // } ),
        makeLocation( {
            latitude: 48.463259, // uvic
            longitude: -123.312635,
            radius: 20,
            featureId: 'V65055', //FIRE_NUMBER
            featureType: 'BCWS_ActiveFires_PublicView',
            fireYear: 2022
        } ),

        // {
        //     latitude: 49.48305, //penticton
        //     longitude: -119.58415,
        //     radius: 20,
        //     featureId: '1', //FIRE_CENTRE_NAME
        //     featureType: 'British_Columbia_Area_Restrictions'
        // },
        // {
        //     latitude: 51.95599,
        //     longitude: -121.44135,
        //     radius: 250,
        //     featureId: '1', // FIRE_CENTRE_NAME
        //     featureType: 'British_Columbia_Bans_and_Prohibition_Areas'
        // }
    ]

    onPushNotificationClick() {
        let n = this.testNotifications[ this.notificationState % this.testNotifications.length ]
        this.notificationState += 1

        this.capacitorService.handleLocationPushNotification( n )
    }

    onNearMeClick() {
        this.nearMeToolActive(true)
    }



    
}

function makeLocation( loc ): PushNotification {
    return {
        title: `Near Me Notification for [${ loc.featureId }]`,
        // subtitle?: string;
        body: `There is a new active fire [${ loc.featureId }] within your saved location, tap here to view the current situation`,
        id: '1',
        // badge?: number;
        // notification?: any;
        data: {
            type: 'location',
            coords: `[ ${ loc.latitude }, ${ loc.longitude } ]`,
            radius: '' + loc.radius,
            messageID: loc.featureId,
            topicKey: loc.featureType
        }
        // click_action?: string;
        // link?: string;
    }
}

function doAddressSearch( text, self ) {
    
    let request
    
    if ( request )
        request.abort()

    let query = {
        ver:            1.2,
        maxResults:     10,
        outputSRS:      4326,
        addressString:  text,
        autoComplete:   true
    }

    return self.smkApi.resolved()
        .then( function () {
            return ( request = $.ajax( {
                timeout:    10 * 1000,
                dataType:   'json',
                url:       'https://geocoder.api.gov.bc.ca/addresses.geojson',
                data:       query,
            } ) )
        } )
        .then( function ( data ) {
             sortAddressList( data.features, text )
             return $.map( data.features, function ( feature ) {
                 if ( !feature.geometry.coordinates ) return;

                 // exclude whole province match
                 if ( feature.properties.fullAddress == 'BC' ) return;

                 if ( feature.properties.intersectionName ) {
                     feature.title = feature.properties.intersectionName
                 }
                 else if ( feature.properties.streetName ) {
                     feature.title = [
                         feature.properties.civicNumber,
                         feature.properties.streetName,
                         feature.properties.streetQualifier,
                         feature.properties.streetType
                     ].filter( function ( x ) { return !!x } ).join( ' ' )
                 }
                 else if ( feature.properties.localityName ) {
                     feature.title = feature.properties.localityName
                 }

                 return feature
             } )

        } )
}

function sortAddressList(results: any, value: string) {
    let address = null;
    let trimmedAddress = null;
    let valueLength = null;
    let valueMatch = null;

    results.forEach((result) => {
        address = result.properties.fullAddress;
        result.address = address.trim();
        trimmedAddress = result.address;
        valueLength = value.length;
        if (trimmedAddress != null) valueMatch = trimmedAddress.substring(0, valueLength);

        if (address != null && valueLength != null && valueMatch != null &&
          (value.toUpperCase() === address.toUpperCase() || value.toUpperCase() === valueMatch.toUpperCase())) {
            const index = results.indexOf(result);
            if (index !== -1) {
              results.splice(index, 1);
            }
            let resultToBeUnshifted = result;

            results.unshift(resultToBeUnshifted);
        }

      });

      return results;
      
} 


 