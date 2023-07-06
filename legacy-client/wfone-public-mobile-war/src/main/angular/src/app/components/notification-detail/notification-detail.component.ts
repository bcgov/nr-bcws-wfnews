import { AfterViewInit, ChangeDetectionStrategy, Component, OnChanges, OnInit, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { NavigationEnd, ParamMap } from '@angular/router';
import * as L from 'leaflet';
import { MapConfigService } from 'src/app/services/map-config.service';
import { WFMapService } from 'src/app/services/wf-map.service';
import { WFOnePublicMobileRoutes } from 'src/app/utils';
import { BaseComponent } from './../base/base.component';
import { NotificationDetailComponentModel } from './notification-detail.component.model';

declare const window: any;

@Component({
    selector: 'wfone-notification-detail',
    templateUrl: './notification-detail.component.html',
    styleUrls: ['../base/base.component.scss', './notification-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationDetailComponent extends BaseComponent implements OnInit, AfterViewInit, OnChanges {
    @ViewChildren('nameLabel') nameLabel;
    @ViewChildren('accessFocusPoint') accessFocusPoint;
    @ViewChild('evacCheck') evacCheck;
    @ViewChild('banCheck') banCheck;

    title = 'Notification Detail';
    backRoute = WFOnePublicMobileRoutes.NOTIFICATIONS;
    radiusValue = 25;
    nameLabelText;
    mapConfig = null;
    smkInstance = null
    sub;
    editItem;
    index;
    locationCoords;
    zoomLevel;
    enableSave = false

    protected mapConfigService: MapConfigService;
    protected wfMapService: WFMapService;

    initComponent() {
        super.initComponent()

        this.wfMapService = this.injector.get(WFMapService)
        this.mapConfigService = this.injector.get(MapConfigService)
    }

    isHandlerForUrl( url: string ): boolean {
        return url.includes( WFOnePublicMobileRoutes.NOTIFICATION_DETAIL )
    }

    ngOnInit() {
        var self = this

        this.route.queryParams.subscribe((params: ParamMap) => {
            if (params['mode']) {
                this.nameLabelText = params['name'];
                this.editItem = null;
                this.evacCheck._checked = true;
                this.banCheck._checked = true;
                this.locationCoords = { long: null, lat: null };
                this.zoomLevel = 8;
                this.radiusValue = 25;
            }
            else {
                this.editItem = params;
                this.nameLabelText = params['name'];
                this.evacCheck._checked = params['preferences'].indexOf('Evacuation_Orders_and_Alerts') > -1;
                this.banCheck._checked = params['preferences'].indexOf('British_Columbia_Bans_and_Prohibition_Areas') > -1;
                this.locationCoords = JSON.parse(params['locationCoords']);
                this.zoomLevel = params['zoomLevel'];
                this.radiusValue = params['radius'];
                this.index = params['index'];
            }

            this.router.events.subscribe((e) => {
                if (e instanceof NavigationEnd && e.urlAfterRedirects.indexOf('notification-detail') !== -1) {
                    // this.accessFocusPoint.first.nativeElement.focus();
                }
            });

        });

        this.mapConfigService.getNotificationDetailMapConfig(true).then(function (config) {
            self.mapConfig = [config, 'theme=wf']
            self.cdr.detectChanges();
        })

        super.ngOnInit();
    }

    ngAfterViewInit() {
        // this.accessFocusPoint.first.nativeElement.focus();
        super.ngAfterViewInit();
    }

    initModels() {
        this.model = new NotificationDetailComponentModel(this.sanitizer);
        this.viewModel = new NotificationDetailComponentModel(this.sanitizer);
    }

    loadPage() {
        this.updateView();
    }

    getViewModel(): NotificationDetailComponentModel {
        return <NotificationDetailComponentModel>this.viewModel;
    }

    formatLabel(value: number) {
        if (value >= 1000) {
            return Math.round(value / 1000) + 'k';
        }

        return value;
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        if (changes.radiusValue) {
            this.radiusValue = changes.radiusValue.currentValue;
            this.setRadius(this.radiusValue);
        }
    }

    initMap(smk: any) {
        var self = this

        this.smkInstance = smk

        smk.$viewer.map.options.minZoom = 2;
        smk.$viewer.map.options.zoomSnap = 0.5;
        smk.$viewer.map.on('drag', function (ev) {
            smk.showFeature('near-me-highlight4');
            smk.showFeature('near-me-highlight5');
            const geomet = {
                type: 'Point',
                coordinates: [smk.$viewer.map.getCenter().lng, smk.$viewer.map.getCenter().lat]
            };
            const center1 = [smk.$viewer.map.getCenter().lng, smk.$viewer.map.getCenter().lat];
            const radius1 = self.radiusValue;
            const options1 = { steps: 40, units: 'kilometers', properties: { foo: 'bar' } };
            const circle1 = window.turf.circle(center1, radius1, options1);
            smk.showFeature('near-me-highlight5', circle1);
            smk.showFeature('near-me-highlight4', geomet);
            self.locationCoords = { lat: smk.$viewer.map.getCenter().lat, long: smk.$viewer.map.getCenter().lng };
        });

        if (self.editItem) {
            self.setRadius(self.radiusValue);
            self.enableSave = true
            self.cdr.detectChanges()
        }
        else {
            self.commonUtilityService.getCurrentLocation((position) => {
                self.locationCoords.long = position.coords.longitude;
                self.locationCoords.lat = position.coords.latitude;
                self.setRadius(self.radiusValue);
                self.enableSave = true
                self.cdr.detectChanges()
            });
        }
    }

    setRadius(rad) {
        const self = this;

        if (!this.smkInstance) return

        this.smkInstance.showFeature('near-me-highlight4');
        this.smkInstance.showFeature('near-me-highlight5');

        const geomet = {
            type: 'Point',
            coordinates: [self.locationCoords.long, self.locationCoords.lat]
        };
        const center = [self.locationCoords.long, self.locationCoords.lat];
        const radius = parseInt(rad, 10);
        const options = { steps: 40, units: 'kilometers', properties: { foo: 'bar' } };
        const circle = window.turf.circle(center, radius, options);

        this.smkInstance.showFeature('near-me-highlight4', geomet,
            {
                pointToLayer: function (pt, ll) {
                    return L.marker(ll, { draggable: true, interactive: false })
                }
            });

        this.smkInstance.$viewer.map.setView([self.locationCoords.lat, self.locationCoords.long], self.zoomLevel);
        this.smkInstance.showFeature('near-me-highlight5', circle);
    }

    updateRadius(event: MatSliderChange) {
        this.setRadius(event.value);
        this.radiusValue = (event.value);
    }

    saveLocation() {
        let pref = [];

        if (this.banCheck._checked) {
            pref.push('British_Columbia_Area_Restrictions');
            pref.push('British_Columbia_Bans_and_Prohibition_Areas');
        }

        if (this.evacCheck._checked) {
            pref.push('BCWS_ActiveFires_PublicView');
            pref.push('Evacuation_Orders_and_Alerts');
        }

        this.router.navigate([WFOnePublicMobileRoutes.NOTIFICATIONS], {
            queryParams: {
                name: this.nameLabel.first.nativeElement.value,
                index: this.index,
                preferences: pref,
                locationCoords: JSON.stringify(this.locationCoords),
                radius: this.radiusValue
            }
        });
    }

    textFocus(isFocused: boolean) {
        if (isFocused) {
            this.applicationStateService.setIsHoveringTextBox(true);
        } else {
            this.applicationStateService.setIsHoveringTextBox(false);
        }
    }

}
