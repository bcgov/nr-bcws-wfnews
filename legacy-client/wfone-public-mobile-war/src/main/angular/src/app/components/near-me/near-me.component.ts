import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SpatialUtilsService } from "@wf1/core-ui";
import { ApplicationStateService } from "src/app/services/application-state.service";
import { NearMeTemplate, WeatherHourlyCondition } from "../../services/point-id.service";
import { CONSTANTS, copyToClipboard, getCurrentCondition } from "../../utils";

@Component({
    selector: 'wfone-near-me',
    templateUrl: './near-me.component.html',
    styleUrls: ['../base/base.component.scss', './near-me.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NearMeComponent {
    nearMeTemplate: NearMeTemplate;
    loading = true;
    isAllFromAdvisories = false;
    expandedIndex = null
    isMobileRes: boolean;
    showMapInline: boolean = true;
    filter: string = ''
    CONSTANTS = CONSTANTS
    weatherDetailsHandler
    showWeather = true
    currentCondition: WeatherHourlyCondition

    constructor(
        protected spatialUtils: SpatialUtilsService,
        protected snackbarService: MatSnackBar,
        protected cdr: ChangeDetectorRef,
        protected applicationStateService: ApplicationStateService
    ) {
        this.isMobileRes = this.applicationStateService.getIsMobileResolution();
    }

    setShowWeather( show: boolean ) {
        this.showWeather = show
        this.cdr.detectChanges()
    }

    setShowMapInline( show: boolean) {
        this.showMapInline = show
        this.cdr.detectChanges()
    }

    setLoading(value: boolean, isAll?:boolean) {
        this.loading = value;
        if( isAll !== undefined) {
            this.isAllFromAdvisories = isAll;
        }
        this.cdr.detectChanges()
    }

    setNearMeTemplate(nearMeTemplate: NearMeTemplate) {
        this.nearMeTemplate = nearMeTemplate;
        this.currentCondition = getCurrentCondition( nearMeTemplate.weatherConditions )
        this.loading = false;
        this.cdr.detectChanges()
    }

    setTypeFilter( filter: string ) {
        this.filter = filter
        this.cdr.detectChanges()
    }

    setWeatherDetailsHandler( handler: any ) {
        this.weatherDetailsHandler = handler
    }

    get hasCurrentCondition(): boolean {
        return !!this.currentCondition
    }

    get currentConditionDay() {
        if ( !this.currentCondition ) return
        const y = parseInt( this.currentCondition.hour.slice( 0, 4 ) ),
            m = this.currentCondition.hour.slice( 4, 6 ),
            d = this.currentCondition.hour.slice( 6, 8 )

        const now = new Date(),
            yNow = now.getFullYear(),
            mNow = now.getMonth() + 1,
            dNow = now.getDate()

        var day = `${ y }-${ m }-${ d }`
        if ( y == yNow && parseInt( m ) == mNow && parseInt( d ) == dNow )
            day = 'Today'

        return day
    }

    get currentConditionTime() {
        if ( !this.currentCondition ) return
        const h = parseInt( this.currentCondition.hour.slice( 8 ) )

        return `${ h }:00`
    }

    get currentConditionsDistance() {
        if ( !this.nearMeTemplate || !this.nearMeTemplate.weatherConditions ) return ''
        return parseFloat( this.nearMeTemplate.weatherConditions.distance ) / 1000
    }

    copyLocation(){
        let str = undefined;
        if(this.nearMeTemplate && this.nearMeTemplate.header && this.nearMeTemplate.header.latitude
            && this.nearMeTemplate && this.nearMeTemplate.header && this.nearMeTemplate.header.longitude){
            str = this.spatialUtils.formatCoordinates([parseFloat(this.nearMeTemplate.header.longitude), parseFloat(this.nearMeTemplate.header.latitude)]);
            this.snackbarService.open(str + ' copied to clipboard.', null, {duration: 2500});
            copyToClipboard(str);
        }
    }

    showWeatherDetails() {
        if ( !this.weatherDetailsHandler ) return
        this.weatherDetailsHandler()
    }

    clickNearMe( index: number, event ) {
        let pathEls = event.composedPath()
        if ( pathEls.some( function ( el ) { return el.localName == 'wf-map-container' } ) ) return

        if ( index == null ) {
            this.expandedIndex = null
            return
        }

        if ( !this.nearMeTemplate.nearMeItems[ index ].bbox ) return

        if ( this.expandedIndex == index ) {
            this.expandedIndex = null
        }
        else {
            this.expandedIndex = index
        }

        this.cdr.detectChanges()
    }
}
