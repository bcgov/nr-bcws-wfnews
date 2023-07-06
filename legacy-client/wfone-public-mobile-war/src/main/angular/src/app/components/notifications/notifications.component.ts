import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ParamMap } from '@angular/router';
import { VmNotificationPreferences } from 'src/app/conversion/models';
import { MapConfigService } from 'src/app/services/map-config.service';
import { NotificationService } from 'src/app/services/notification.service';
import { NearMeItem } from 'src/app/services/point-id.service';
import { WFMapService } from 'src/app/services/wf-map.service';
import { WFOnePublicMobileRoutes } from 'src/app/utils';
import { VmNotificationDetail } from './../../conversion/models';
import { BaseComponent } from './../base/base.component';
import { NotificationsComponentModel } from './notifications.component.model';

declare const window: any;

@Component({
    selector: 'wfone-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['../base/base.component.scss', './notifications.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent extends BaseComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    backRoute = WFOnePublicMobileRoutes.LANDING;

    @Input() nearMeHighlight: NearMeItem;

    @ViewChildren('accessFocusPoint') accessFocusPoint;

    title = 'Notifications';
    color: ThemePalette = 'accent';
    nearMeComponentRef: any;
    zoomMapper = { 25: 8, 50: 7, 75: 6.5, 100: 6 }; // , 125: 6, 150: 5.5, 175: 5, 200: 5, 225: 5, 250: 5, 275: 4.5, 300: 4.5 };
    latestNewsStub = {
        name: 'newsNotification',
        type: 'news',
        radius: 1,
        preferences: ['allNews'],
        locationCoords: { long: -10, lat: 1 },
        active: true,
    };
    paramSubscription;
    navSubscription;
    smkInited = false;
    latestNewsLink = '/' + WFOnePublicMobileRoutes.LATEST_NEWS
    notificationPreferences: VmNotificationPreferences;
    notificationDetails: VmNotificationDetail[] = [];
    newsDetail: VmNotificationDetail
    saving = false

    protected mapConfigService: MapConfigService;
    protected wfMapService: WFMapService;
    protected notificationService: NotificationService;

    initComponent() {
        super.initComponent()

        this.wfMapService = this.injector.get(WFMapService)
        this.mapConfigService = this.injector.get(MapConfigService)
        this.notificationService = this.injector.get(NotificationService)
    }

    isHandlerForUrl( url: string ): boolean {
        return url.includes( WFOnePublicMobileRoutes.NOTIFICATIONS )
    }

    ngOnInit() {
        this.paramSubscription = this.route.queryParams.subscribe((params: ParamMap) => {
            this.loadNotificationPreferences().then( () => {
                if (params['radius']) {
                    this.editLandmark(params);
                }    
            } )
        });

        super.ngOnInit();
    }

    loadNotificationPreferences() {
        return this.registerNotificationWithServer()
            .then( () => {
                return this.notificationService.getUserNotificationPreferences().then( n => {
                    this.notificationPreferences = n

                    this.notificationDetails = []
                    this.newsDetail = this.latestNewsStub
                    this.notificationPreferences.notificationDetails.forEach( d => {
                        if ( d.type == 'news' ) {
                            this.newsDetail = d
                        }
                        else if ( d.type == 'nearme' ) {
                            this.notificationDetails.push( d )
                        }
                    } )

                    this.cdr.detectChanges()
                } )            
            } )
    }

    saveNotificationPreferences() {       
        this.notificationPreferences.notificationDetails = [
            this.newsDetail,
            ...this.notificationDetails
        ]

        this.saving = true
        this.cdr.detectChanges()
        return this.notificationService.updateUserNotificationPreferences(this.notificationPreferences)
            .then( () => {
                this.saving = false
                this.cdr.detectChanges()
            } )
            .catch( e => {
                console.warn('saveNotificationPreferences fail',e)
                this.saving = false
                this.cdr.detectChanges()
            } )
    }

    ngOnDestroy() {
        this.paramSubscription.unsubscribe();
    }

    initModels() {
        this.model = new NotificationsComponentModel(this.sanitizer);
        this.viewModel = new NotificationsComponentModel(this.sanitizer);
    }

    loadPage() {
        this.updateView();
    }

    getViewModel(): NotificationsComponentModel {
        return <NotificationsComponentModel>this.viewModel;
    }

    getMapConfig(notification: VmNotificationDetail) {
        if (!notification.mapConfig) {
            const center = [notification.locationCoords.long, notification.locationCoords.lat]
            const zoom = this.zoomMapper[notification.radius]

            notification.mapConfig = this.mapConfigService.getNotificationDetailMapConfig(false, center, zoom)
                .then(function (config) {
                    return [config, 'theme=wf']
                })
        }

        return notification.mapConfig
    }

    initMap(notification: any, smk: any) {
        var self = this

        const tempCoords = notification['locationCoords'];
        const geomet = {
            type: 'Point',
            coordinates: [tempCoords['long'], tempCoords['lat']]
        };

        const center = [tempCoords['long'], tempCoords['lat']];
        const radius = notification['radius'];
        const options = { steps: 40, units: 'kilometers', properties: { foo: 'bar' } };
        const circle = window.turf.circle(center, radius, options);

        smk.showFeature('near-me-highlight2', geomet);
        smk.showFeature('near-me-highlight3', circle);
    }

    deleteLandmark(index) {
        this.notificationDetails.splice( index, 1 )

        this.saveNotificationPreferences()
    }

    // called on page load, either update a landmark or add a new one
    editLandmark(params) {
        // if index exists, that means we are updating an existing one
        if (params['index']) {
            const index = Number( params['index'] )

            let d = this.notificationDetails[ Number( params['index'] ) ]
            d.name = params['name'];
            d.radius = parseInt(params['radius'], 10);
            d.preferences = params['preferences'];
            d.locationCoords = JSON.parse(params['locationCoords']);
        }
        else {
            // here we are adding a new landmark to the list
            this.notificationDetails.push( {
                name: this.getName(params['name']),
                type: 'nearme',
                radius: parseInt(params['radius'], 10),
                preferences: params['preferences'],
                locationCoords: JSON.parse(params['locationCoords']),
                active: this.nearMeToggle == null ? true : this.nearMeToggle,
            } )
        }

        this.saveNotificationPreferences().then( () => {
            this.loadNotificationPreferences()
        } )
    }

    registerNotificationWithServer() {
        return this.capacitorService.deviceProperties.then( p => {
            return this.capacitorService.notificationToken.then( token => {
                let localToken = localStorage.getItem('pnregistered')

                console.log('PNN token',token,'localstorage token',localToken);
                if ( localToken == token ) return

                this.notificationPreferences = {
                    subscriberGuid: p.deviceId,
                    subscriberToken: 'TODO',
                    notificationToken: null,
                    deviceType: null,
                    notificationDetails: [ this.latestNewsStub ]
                }

                return this.saveNotificationPreferences()
                    .then( () => {
                        localStorage.setItem('pnregistered', token);
                    } )
            } )
        } )
    }

    getFormattedCoords(coords): string {
        return this.spatialUtilService.formatCoordinates([coords.long, coords.lat]);
    }

    // Logic to name the field incase there is no name provided
    // its called Landmark + whatever index based on labels with Landmark already in them
    getName(name: string): string {
        if (!name || name.length === 0) {
            let counter = 1;
            if (this.notificationPreferences.notificationDetails && this.notificationPreferences.notificationDetails.length > 0) {
                while (counter < 10) {
                    if (this.notificationPreferences.notificationDetails.map(function (e) { return e.name; }).indexOf('Landmark ' + counter) > -1) {
                        counter++;
                    } else {
                        return 'Landmark ' + counter;
                    }
                }
            } else {
                return 'Landmark 1';
            }
        } else {
            return name;
        }
    }

    // this is called when the edit/Add location button is pressed
    editOrAddLandmarkDetail(index) {
        if (index === '100') {
            // add new
            const name = this.getName(null);
            this.router.navigate([WFOnePublicMobileRoutes.NOTIFICATION_DETAIL], {
                queryParams: { mode: 'add', name: name }
            });
        }
        else {
            // edit
            const landmark = this.notificationDetails[ index ];
            this.router.navigate([WFOnePublicMobileRoutes.NOTIFICATION_DETAIL], {
                queryParams: {
                    name: landmark['name'], index: index, radius: landmark['radius'],
                    preferences: landmark['preferences'], zoomLevel: this.zoomMapper[landmark['radius']],
                    locationCoords: JSON.stringify({ long: landmark['locationCoords']['long'], lat: landmark['locationCoords']['lat'] })
                }
            });
        }
    }

    get canAddNotification() {
        return !this.notificationDetails || this.notificationDetails.length < 3
    }

    onChangeNearMeToggle( ev ) {
        if ( !this.notificationDetails ) return 

        this.notificationDetails.forEach( d => {
            d.active = ev.checked
        } )

        this.saveNotificationPreferences()
    }

    get nearMeToggle() {
        if ( !this.notificationDetails ) return null
        if ( this.notificationDetails.length == 0 ) return null

        return this.notificationDetails[ 0 ].active
    }
}
