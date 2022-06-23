import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, ParamMap, Router } from "@angular/router";
import { select, Store } from "@ngrx/store";
import { BehaviorSubject, Subject } from 'rxjs';
import { RouterExtService } from "../../../../services/router-ext.service";
import { WfimMapService } from '../../../../services/wfim-map.service';
import { LonLat } from '../../../../services/wfim-map.service/util';
import { RootState } from "../../../../store";
import {
    PointIdClearAction,
    PointIdGeographyAction,
    PointIdOwnershipAction,
    PointIdWeatherAction
} from "../../../../store/point-id/point-id.actions";
import {
    DailyWeather,
    GeographyState,
    HourlyWeather,
    OwnershipState,
    WeatherState
} from "../../../../store/point-id/point-id.state";
import { convertToBoolean } from "../../../../utils";
import { PointIdRoutes } from '../../point-id-route-definitions';

@Component({
    selector: 'wfim-point-id-panel',
    templateUrl: './point-id-panel.component.html',
    styleUrls: ['./point-id-panel.component.scss','../../../../components/marker-layer-base.component.scss']
})
export class PointIdPanelComponent implements OnInit, OnDestroy {
    public TOOLTIP_DELAY = 500;

    private sub;

    hourlyWeatherResults: HourlyWeather[] = [];
    dailyWeatherResults: DailyWeather[] = [];
    hourlyWeatherColumns: string[] = ['day', 'hour', 'temperature', 'relativeHumidity', 'wind', 'precipitation', 'fineFuelMoistureCode', 'initialSpreadIndex', 'fireWeatherIndex'];
    dailyWeatherColumns: string[] = ['day', 'temperature', 'relativeHumidity', 'wind', 'precipitation', 'fineFuelMoistureCode', 'buildupIndex', 'initialSpreadIndex', 'fireWeatherIndex'];

    geographyState: GeographyState;
    ownershipState: OwnershipState;
    weatherState: WeatherState;

    isGeographyLoaded = true;
    isOwnershipLoaded = true;
    isWeatherLoaded = true;

    showPreviousPageNav: Subject<boolean> = new BehaviorSubject(null);
    placeAnchorOnMap: boolean = false;
    coordindates: LonLat;
    anchorPlacedOnMap = false;

    constructor(
        private store: Store<RootState>,
        private router: Router,
        private route: ActivatedRoute,
        private routerExtService: RouterExtService,
        protected wfimMapService: WfimMapService
    ) {
    }

    ngOnInit() {
        this.sub = this.route.queryParams.subscribe( (params: ParamMap) => {
            if (params && params['showPreviousPageNav']) {
                this.showPreviousPageNav.next(convertToBoolean(params['showPreviousPageNav']));
                this.coordindates = params['coords'];
                this.placeAnchorOnMap = params['placeAnchorOnMap'] ? convertToBoolean(params['placeAnchorOnMap']) : false;

                if (this.placeAnchorOnMap && this.canPlaceAnchorOnMap()) {
                    this.showAnchorOnMap();
                    this.anchorPlacedOnMap = true;
                }
            }
        });

        this.store.pipe(select('pointId', 'geography')).subscribe( (geographyState: GeographyState) => {
            this.geographyState = geographyState;

            if (!this.geographyState.loading) {
                this.isGeographyLoaded = true;
            }
        });

        this.store.pipe(select('pointId', 'ownership')).subscribe( (ownershipState: OwnershipState) => {
            this.ownershipState = ownershipState;

            if (!this.ownershipState.loading) {
                this.isOwnershipLoaded = true;
            }
        } );

        this.store.pipe(select('pointId', 'weather')).subscribe( (weatherState: WeatherState) => {
            this.weatherState = weatherState;
            this.hourlyWeatherResults = this.weatherState.weather?.stations[0].hourly || [];
            this.dailyWeatherResults = this.weatherState.weather?.stations[0].daily || [];

            if (!this.weatherState.loading) {
                this.isWeatherLoaded = true;
            }
        } );

        this.router.events.subscribe( ( ev ) => {
            if ( !( ev instanceof NavigationEnd ) ) return

            if ( (ev as NavigationEnd).urlAfterRedirects.endsWith( PointIdRoutes.POINT_ID ) ) {
                this.wfimMapService.activateTool( 'MarkupTool--point' )
            }
            else {
                this.wfimMapService.activateTool( 'MarkupTool--point', false )
            }
        } )

        this.wfimMapService.activateTool( 'MarkupTool--point' )

        if (this.placeAnchorOnMap && this.canPlaceAnchorOnMap()) {
            this.showAnchorOnMap();
            this.anchorPlacedOnMap = true;
        }
    }

    canPlaceAnchorOnMap() {
        return this.coordindates
    }

    showAnchorOnMap() {
        return this.wfimMapService.getSelectedPoint().then((point) => {
            this.wfimMapService.setAnchor(point || this.coordindates)
            return this.wfimMapService.zoomToAnchor()
        })
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    clearPointIdSearch() {
        this.store.dispatch(new PointIdClearAction());
        this.wfimMapService.clearSearch()
    }

    getGeographyValue(propertyName) {
        if (this.geographyState?.geography) {
            if (propertyName === 'location') {
                return this.wfimMapService.formatCoordinates([
                    this.geographyState.geography['lon'],
                    this.geographyState.geography['lat']
                ])
            }
            else {
                return this.geographyState?.geography?.[propertyName] || ''
            }
        }
        return ''
    }

    getOwnershipValue(propertyName) {
        return this.ownershipState?.ownership?.[propertyName] || '';
    }

    getWeatherValue(propertyName) {
        return this.weatherState?.weather?.stations?.[0]?.[propertyName] || '';
    }

    navigateToPreviousUrl() {
        let previous = this.routerExtService.getPreviousUrl();
        this.router.navigateByUrl(previous);
    }

    locationSelected(location?: LonLat) {
        if (location) {
            this.isGeographyLoaded = false;
            this.isOwnershipLoaded = false;
            this.isWeatherLoaded = false;

            setTimeout(() => {
                this.store.dispatch(new PointIdGeographyAction(location));
                this.store.dispatch(new PointIdOwnershipAction(location));
                this.store.dispatch(new PointIdWeatherAction(location));
            }, 500);

            this.wfimMapService.clearSelectedPoint()
            this.clearPointIdSearch()
        }
        else {
            this.geographyState = null
            this.weatherState = null
            this.ownershipState = null
            this.wfimMapService.clearSelectedPoint()
            this.clearPointIdSearch()
        }
    }

    onClose() {
        this.router.navigate( [ '/' ] )
    }
}
