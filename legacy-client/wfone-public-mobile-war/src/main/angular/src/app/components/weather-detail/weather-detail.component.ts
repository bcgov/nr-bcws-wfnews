import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { MatTab, MatTabGroup } from "@angular/material";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SpatialUtilsService } from "@wf1/core-ui";
import { ApplicationStateService } from "src/app/services/application-state.service";
import { getCurrentCondition } from "src/app/utils";
import { PointIdService, WeatherDailyCondition, WeatherHourlyCondition, WeatherStation, WeatherStationConditions } from "../../services/point-id.service";

@Component({
    selector: 'wfone-weather-detail',
    templateUrl: './weather-detail.component.html',
    styleUrls: ['../base/base.component.scss', './weather-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherDetailComponent implements AfterViewInit {
    @ViewChild( 'tabs' ) tabs: MatTabGroup;
    @ViewChild( 'tab1' ) tab1: MatTab;
    
    loading = true;
    isMobileRes: boolean;
    weatherStation: WeatherStationConditions;
    currentCondition: WeatherHourlyCondition;
    dailyConditition: WeatherDailyCondition;
    weatherHistoryHandler

    constructor(
        protected spatialUtils: SpatialUtilsService,
        protected snackbarService: MatSnackBar,                
        protected changeDetector: ChangeDetectorRef,
        protected applicationStateService: ApplicationStateService,
        protected pointIdService: PointIdService
    ) {
        this.isMobileRes = this.applicationStateService.getIsMobileResolution();
    }

    ngAfterViewInit(): void {
    }

    setWeatherStation( station: WeatherStationConditions ) {
        this.weatherStation = station
        this.currentCondition = getCurrentCondition(station)
        this.getCurrentDaily(station);
        this.setLoading( false )
    }

    setWeatherStationId( weatherStationId: string ) {
        const self = this

        this.setLoading( true )

        this.pointIdService.fetchWeatherStation( weatherStationId )
            .then( function ( station: WeatherStationConditions ) {
                self.setWeatherStation( station )
            } )
            .catch( function ( e ) {
                self.setLoading( false )
            } )
    }

    setLoading( loading: boolean ) {
        this.loading = loading;
        this.changeDetector.detectChanges()
    }

    getCurrentDaily(station) {
        this.dailyConditition = station.daily[0];
    }


    readableDate(date) {
        let arr = date.slice(0, 4)
        const year = arr

        arr = date.slice(4, 6)
        const month = arr

        arr = date.slice(6, 8)
        const day = arr

        // Months are zero-based indexes in JS Date, so remember to decrement
        const formattedDate = new Date(year, month - 1, day)
        return formattedDate.toDateString()

    }

    currentConditionTime() {
        if ( !this.currentCondition ) return
        const y = parseInt( this.currentCondition.hour.slice( 0, 4 ) ),
            m = this.currentCondition.hour.slice( 4, 6 ),
            d = this.currentCondition.hour.slice( 6, 8 ),
            h = parseInt( this.currentCondition.hour.slice( 8 ) )
        
        const now = new Date(),
            yNow = now.getFullYear(),
            mNow = now.getMonth() + 1,
            dNow = now.getDate()

        var day = `${ y }-${ m }-${ d }`
        if ( y == yNow && parseInt( m ) == mNow && parseInt( d ) == dNow )
            day = 'Today'
        
        return `${ day } at ${ h }:00`
    }

    showHelp() {
        this.applicationStateService.showHelpDialog( 'weather' )
    }

    setWeatherHistoryHandler( handler: any ) {
        this.weatherHistoryHandler = handler
    }
    
    showHistory() {        
        if ( !this.weatherHistoryHandler ) return
        this.weatherHistoryHandler()
    }

    get hasCurrentCondition(): boolean {
        return !!this.currentCondition
    }

}
