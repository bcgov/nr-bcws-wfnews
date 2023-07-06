import { HttpClient } from "@angular/common/http";
import {Injectable, Injector} from "@angular/core";
import { MatDialog } from "@angular/material";
import { NavigationEnd, Router } from "@angular/router";
import { HelpDialogComponent } from "../components/help-dialog/help-dialog.component";
import {checkMobileResolution, checkTabletResolution, WFOnePublicMobileRoutes} from "../utils";
import { AppConfigService } from "./app-config.service";
import { WeatherStationConditions } from "./point-id.service";

const SHOW_MENU_ON_STARTUP_KEY: string = 'showMenuOnStartup'

@Injectable({
    providedIn: 'root'
})
export class ApplicationStateService {

    private isMobileResolution: boolean;
    private isHoveringTextBox: boolean;
    private shouldVisSideNav = false;
    private returnToButton = "";
    private isLoadedUp = false;
    private menuState = 'expanded';
    private weatherHistoryOptions: WeatherHistoryOptions = {
        historyLength: 72,
        chartDataSources: [
            {
                property: 'temp',
                title: 'Temperature',
            },
            {
                property: 'relativeHumidity',
                title: 'Relative Humidity',
            },
        ],
        includedSources: []
    }
    private currentUrl: string

    constructor(
        private injector: Injector,
        private dialog: MatDialog,
        private router: Router,
        private http: HttpClient, 
        private appConfigService: AppConfigService
    ) {
        this.isMobileResolution = checkMobileResolution();
        this.isHoveringTextBox = false;

        this.router.events.subscribe( ( e ) => {
            if ( !(e instanceof NavigationEnd) ) return
    
            this.currentUrl = e.urlAfterRedirects
        } )    
    }

    public getIsMobileResolution(): boolean {
        return checkMobileResolution();
    }

    public getIsTabletResolution(): boolean {
        return checkTabletResolution();
    }

    public getHeight(): number {
        return window.innerHeight;
    }

    public getWidth(): number {
        return window.innerWidth;
    }

    public getIsLoadedUp(): boolean {
        return this.isLoadedUp;
    }

    public setIsLoadedUp() {
        this.isLoadedUp = true;
    }

    public setFirstLoadOps(): void {
        if (this.isMobileResolution) {
            this.shouldVisSideNav = true;
        }
    }

    public getShouldVisSideNav(): boolean {
        return this.shouldVisSideNav;
    }

    public setShouldVisSideNav(vis: boolean): void {
        this.shouldVisSideNav = vis;
    }

    public getIsHoveringTextBox(): boolean {
        return this.isHoveringTextBox;
    }

    public setIsHoveringTextBox(hover: boolean): void {
        this.isHoveringTextBox = hover;
    }

    public getShowMenuOnStartup(): boolean {
        try {
            return JSON.parse( localStorage.getItem( SHOW_MENU_ON_STARTUP_KEY ) || 'true' )
        }
        catch ( e ) {
            return true
        }
    }

    public setShowMenuOnStartup( show: boolean ) {
        return localStorage.setItem( SHOW_MENU_ON_STARTUP_KEY, JSON.stringify( show ) )
    }

    public showHelpDialog( topic: string = 'helpContents' ) {
        window[ 'snowplow' ]( 'trackPageView', this.router.url + '#help-topic-' + topic );

        let d = this.dialog.open( HelpDialogComponent, {
            width: '550px',
            data: { topic },
            autoFocus: false,
        } );

        return d.afterClosed().toPromise()
    }

    public showLearningDialog() {
        return this.showHelpDialog( 'wildfireLearning' )
    }

    public getWeatherHistoryOptions(): WeatherHistoryOptions {
        return this.weatherHistoryOptions
    }

    public setWeatherHistoryOptions( opt: WeatherHistoryOptions ) {
        return this.weatherHistoryOptions = opt
    }

    public getMenuState() {
        return this.menuState
    }

    public setMenuState(state: string) {
        return this.menuState = state
    }

    public getCurrentUrl(): string {
        return this.currentUrl
    }
}

export interface WeatherHistoryOptions {
    historyLength: number // hours
    chartDataSources: {
        property: string
        title: string
    }[],
    includedSources: {
        property: string
    }[]
}
