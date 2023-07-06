import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router } from "@angular/router";
import { ApplicationStateService } from "src/app/services/application-state.service";
import { GoogleChartsService } from "src/app/services/google-charts.service";
import { getCurrentCondition } from "src/app/utils";
import { WeatherHourlyCondition, WeatherStationConditions } from "../../services/point-id.service";
import { WeatherHistoryOptionsDialogComponent } from "../weather-history-options-dialog/weather-history-options-dialog.component";

@Component({
    selector: 'wfone-weather-history',
    templateUrl: './weather-history.component.html',
    styleUrls: ['../base/base.component.scss', './weather-history.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherHistoryComponent implements AfterViewInit, OnInit, OnDestroy {  
    @ViewChild('chart') chartContainer;

    loading = true;
    isMobileRes: boolean;
    weatherStation: WeatherStationConditions;
    currentCondition: WeatherHourlyCondition;

    constructor(
        protected changeDetector: ChangeDetectorRef,
        protected applicationStateService: ApplicationStateService,
        protected googleChartsService: GoogleChartsService,
        private dialog: MatDialog,
        protected router: Router        
    ) {
        this.isMobileRes = this.applicationStateService.getIsMobileResolution();
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
    }

    ngAfterViewInit(): void {
        this.showChart()
    }

    setLoading( loading: boolean ) {
        this.loading = loading;
        this.changeDetector.detectChanges()
    }

    setWeatherStation( station: WeatherStationConditions ) {
        this.weatherStation = station
        this.currentCondition = getCurrentCondition( station )
        this.setLoading( false )
    }

    showChart() {
        const self = this

        this.setLoading( true )

        let historyOpt = this.applicationStateService.getWeatherHistoryOptions()

        this.googleChartsService.getVisualization().then( function ( vis ) {
            self.setLoading( false )

            var data = new vis.DataTable()

            data.addColumn( 'date', 'Hour' );

            let props = [], titles = []
            historyOpt.chartDataSources.forEach( function ( ds ) {
                data.addColumn( 'number', ds.title )
                data.addColumn( { type: 'string', role: 'tooltip', 'p': { 'html': true } } )
                titles.push( ds.title )
                props.push( ds.property )
            } )

            const range = new Date()
            range.setHours( range.getHours() - historyOpt.historyLength )
            range.setMinutes( 0 )
            range.setSeconds( 0 )
            range.setMilliseconds( 0 )

            self.weatherStation.hourly.forEach( function ( c ) {
                let y = parseInt( c.hour.slice( 0, 4 ) )
                let m = parseInt( c.hour.slice( 4, 6 ) ) - 1
                let d = parseInt( c.hour.slice( 6, 8 ) )
                let h = parseInt( c.hour.slice( 8 ) )
                let ts = new Date( y, m, d, h )

                if ( ts.getTime() < range.getTime() ) return

                let r = [ ts, ...props.reduce( function ( acc, p, i ) { 
                    return acc.concat( c[ p ], chartTooltip( titles[ i ], ts, c[ p ] ) ) 
                }, [] ) ]
                
                data.addRow( r )
            } )

            var opt = {
                series: {
                  0: {targetAxisIndex: 0},
                  1: {targetAxisIndex: 1}
                },
                vAxes: {
                  0: { title: historyOpt.chartDataSources[ 0 ].title },
                  1: { title: historyOpt.chartDataSources[ 1 ].title }
                },
                hAxis: {
                },
                legend: {
                    maxLines: 2,
                    position: 'top'
                },
                tooltip: { isHtml: true },
                vAxis: {
                  viewWindow: {
                  }
                }
            };            
            
            var chart = new vis.LineChart( self.chartContainer.nativeElement )

            chart.draw( data, opt )
            self.changeDetector.detectChanges()
        } )

        function chartTooltip( title, ts, val ) {
            return `
<div>${ title }: ${ val }</div>
<div>${ ts.toDateString() }, ${ ts.toLocaleTimeString() }</div>
`
        }
    }  

    showHelp() {
        this.applicationStateService.showHelpDialog( 'weather' )
    }

    showOptions() {
        const self = this

        let opts = this.applicationStateService.getWeatherHistoryOptions()

        opts.includedSources = []
        
        Object.keys( this.currentCondition ).forEach( function ( p ) {
            if ( self.weatherStation.hourly.map( function ( c ) { return c[ p ] } ).some( function ( v ) { return v } ) )
                opts.includedSources.push( { property: p } )
        } )

        window[ 'snowplow' ]( 'trackPageView', self.router.url + '#weather-history-options' );

        let dialog = this.dialog.open( WeatherHistoryOptionsDialogComponent, {
            width: '300px',
            data: opts,
            autoFocus: false
        } );

        return dialog.afterClosed().toPromise().then( function ( result ) {
            if ( !result ) return

            self.applicationStateService.setWeatherHistoryOptions( result )
            self.showChart()
        } )

    }
}
