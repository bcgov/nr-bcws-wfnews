import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Event, NavigationStart } from '@angular/router';
import { RouterLink, WfApplicationConfiguration, WfApplicationState } from '@wf1/wfcc-application-ui';
import { WfMenuItems } from '@wf1/wfcc-application-ui/application/components/wf-menu/wf-menu.component';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { MarkerLayerBaseComponent } from "./components/marker-layer-base.component";
import { ResourcesRoutes } from './utils';

export const ICON = {
    TWITTER: 'twitter',
    FACEBOOK: 'facebook',
    FIRE: 'fire',
    MAP_SIGNS: 'map-signs',
    INCIDENT: 'incident',
    ADVISORIES: 'advisories',
    EXT_LINK: 'external-link',
    EXCLAMATION_CIRCLE: 'exclamation-circle',
    CLOUD_SUN: 'cloud-sun',
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent extends MarkerLayerBaseComponent implements OnDestroy, OnInit, AfterViewInit {

    public TOOLTIP_DELAY = 500;

    title: string = 'News';

    isLoggedIn: boolean = true;
    hasAccess: boolean = true;

    applicationConfig: WfApplicationConfiguration = {
        title: 'NEWS',
        device: this.applicationStateService.getDevice(),
        userName: '',
        version: {
            long: '',
            short: ''
        },
        environment: ''
    }

    applicationState: WfApplicationState = {
        menu: 'hidden'
    }

    appMenu: WfMenuItems
    footerMenu: WfMenuItems
    orientation

    showLeftPanel = true

    lastSuccessPollSub: Subscription;
    lastSyncDate;
    lastSyncValue = undefined;

    private updateMapSize = function () {
        this.storeViewportSize()
    }

    ngOnInit() {
        const self = this

        super.ngOnInit();

        this.addCustomMaterialIcons()
        this.initializeRouterSubscription();
        this.updateService.checkForUpdates();

        this.checkUserPermissions();

        // this.messagingService.subscribeToMessageStream(this.receiveWindowMessage.bind(this));
        if (!this.location.path().startsWith('/(root:external')) {
            this.appConfigService.configEmitter.subscribe((config) => {
                this.applicationConfig.version.short = config.application.version.replace(/-snapshot/i, '')
                this.applicationConfig.version.long = config.application.version
                this.applicationConfig.environment = config.application.environment.replace(/^.*prod.*$/i, '')


                this.onResize()
            });
        }

        this.initAppMenu();
        this.initFooterMenu();

        window['SPLASH_SCREEN'].remove()
    }

    initAppMenu() {
        console.log('initAppMenu')
        this.appMenu = (this.applicationConfig.device == 'desktop' ?
            [
                new RouterLink('Active Wildfires Map', '/' + ResourcesRoutes.ACTIVEWILDFIREMAP, 'home', 'expanded', this.router),
                new RouterLink('Wildfires List', '/' + ResourcesRoutes.WILDFIRESLIST, 'home', 'expanded', this.router), //temp route
                new RouterLink('Current Statistics', '/' + ResourcesRoutes.CURRENTSTATISTICS, 'home', 'expanded', this.router),//temp route
                new RouterLink('Resources', '/' + ResourcesRoutes.RESOURCES, 'home', 'expanded', this.router),
            ]
            :
            [
                new RouterLink('Home', '/', 'home', 'hidden', this.router),
            ]
        ) as unknown as WfMenuItems
    }

    initFooterMenu() {
        console.log('initFooterMenu')
        this.footerMenu = (this.applicationConfig.device == 'desktop' ?
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
        ) as unknown as WfMenuItems
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
        let now = moment();
        let value = now.diff(this.lastSyncDate, 'second', false);
        if (value > 240) {
            this.lastSyncValue = '240+';
        } else {
            this.lastSyncValue = value.toFixed(0);
        }
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
        document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
        document.documentElement.style.setProperty('--viewport-width', `${window.innerWidth}px`);
    }

    ngOnDestroy() {
        if (this.lastSuccessPollSub) {
            this.lastSuccessPollSub.unsubscribe();
        }
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

                this.wfnewsMapService.clearSelectedPoint()
                    .then(() => {
                        return this.wfnewsMapService.clearSearch()
                    })
                    .then(() => {
                        return this.wfnewsMapService.clearHighlight()
                    })
            }
        });
    }

    navigateToBcWebsite() {
        window.open("https://www2.gov.bc.ca/gov/content/safety/wildfire-status", "_blank");

    }

    navigateToFooterPage(event: any) {
        window.open(event.route, "_blank");
    }

    addCustomMaterialIcons() {
        this.matIconRegistry.addSvgIcon(
            ICON.TWITTER,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/twitter.svg')
        )

        this.matIconRegistry.addSvgIcon(
            ICON.FACEBOOK,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/facebook.svg')
        )

        this.matIconRegistry.addSvgIcon(
            ICON.FIRE,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/fire.svg')
        )

        this.matIconRegistry.addSvgIcon(
            ICON.EXCLAMATION_CIRCLE,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/exclamation-circle.svg')
        )

        this.matIconRegistry.addSvgIcon(
            ICON.MAP_SIGNS,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/map-signs.svg')
        )

        this.matIconRegistry.addSvgIcon(
            ICON.INCIDENT,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/incident.svg')
        )

        this.matIconRegistry.addSvgIcon(
            ICON.ADVISORIES,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/bullhorn.svg')
        )

        this.matIconRegistry.addSvgIcon(
            ICON.EXT_LINK,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/external-link.svg')
        )

        this.matIconRegistry.addSvgIcon(
            ICON.CLOUD_SUN,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/cloud-sun.svg')
        )
    }

}
