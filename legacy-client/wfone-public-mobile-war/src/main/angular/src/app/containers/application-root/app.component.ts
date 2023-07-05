import { AfterViewInit, ChangeDetectionStrategy, Component, NgZone } from "@angular/core";
import { MatIconRegistry } from "@angular/material";
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { SplashScreen } from '@capacitor/splash-screen';
import { Store } from "@ngrx/store";
import { ApplicationStateService } from "src/app/services/application-state.service";
import { EventEmitterService } from 'src/app/services/event-emitter.service';
import { CapacitorService, LocationNotification } from "../../services/capacitor-service";
import { CommonUtilityService } from "../../services/common-utility.service";
import { UpdateService } from "../../services/update.service";
import { RootState } from "../../store";
import { CONSTANTS } from "../../utils";
import { AppRoutingModule } from './../../app-routing.module';
import { WFOnePublicMobileRoutes } from './../../utils/index';

@Component({
    selector: 'wfone-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
    exitBlocked = true;
    isMobile = this.stateService.getIsMobileResolution()

    constructor(
        private updateService: UpdateService,
        private router: Router, private store: Store<RootState>,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private stateService: ApplicationStateService,
        private commonUtilityService: CommonUtilityService,
        private capacitorService: CapacitorService,
        private snackbarService: MatSnackBar,
        private eventEmitterService: EventEmitterService,
        private aaa: AppRoutingModule,
        private zone: NgZone
    ) {
        SplashScreen.hide();

        this.capacitorService.initialized.then(() => {
            this.commonUtilityService.preloadGeolocation();

            setTimeout(() => {
                this.zone.run( () => {
                    this.router.navigate([WFOnePublicMobileRoutes.LANDING])
                    aaa.addDefaultRoute();
                    this.stateService.setIsLoadedUp();
                } )
            }, 1000);

        });

        console.log('AppComponent - checking for swUpdate');
        this.updateService.checkForUpdates();

        this.addCustomMaterialIcons();
        this.stateService.setFirstLoadOps();
        this.commonUtilityService.preloadGeolocation();

        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        this.eventEmitterService.invokeAndroidBackPressed.subscribe(() => {
            if ( this.router.url.includes( WFOnePublicMobileRoutes.LANDING ) ) {
                if ( this.exitBlocked ) {
                    this.snackbarService.open(
                        'Pressing back again will close the app',
                        null,
                        {
                            duration: 2500,
                            panelClass: 'snack-bar-warning',
                            verticalPosition: 'bottom'
                        }
                    );
                    this.exitBlocked = false;
                }
                else {
                    try {
                        navigator['app'].exitApp();
                    }
                    catch ( e ) {
                        console.warn( e )
                        this.exitBlocked = true
                    }
                }
            }
            else {
                this.exitBlocked = true;
                this.eventEmitterService.onGoBackCalled();
            }
        })

        this.capacitorService.locationNotifications.subscribe( (ev: LocationNotification) => {
            this.router.navigate([WFOnePublicMobileRoutes.LANDING], {
                queryParams: {
                    ...ev,
                    // coords: notification.notification.data.coords,
                    // radius: notification.notification.data.radius,
                    // messageId: notification.notification.data.messageId,
                    // topic: notification.notification.data.topic,
                    time: Date.now()
                }
            } );
        } )

    }

    // uncomment button in html, and use this to fake android back button
    // onBackClick() {
    //     this.eventEmitterService.invokeAndroidBackPressed.emit()
    // }

    addCustomMaterialIcons() {
        this.matIconRegistry.addSvgIcon(
            CONSTANTS.MAT_ICON_CUSTOM_TWITTER,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/custom_mat_icons/twitter.svg')
        );
        this.matIconRegistry.addSvgIcon(
            CONSTANTS.ICON_WEB_NAVIGATE,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/custom_mat_icons/webnavigate.svg')
        );
        this.matIconRegistry.addSvgIcon(
            CONSTANTS.MAT_ICON_CUSTOM_FACEBOOK,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/custom_mat_icons/facebook.svg')
        );
        this.matIconRegistry.addSvgIcon(
            CONSTANTS.MAT_ICON_CUSTOM_FIRE,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/custom_mat_icons/fire.svg')
        );

        this.matIconRegistry.addSvgIcon(
            CONSTANTS.MAT_ICON_CUSTOM_EXCLAMATION_CIRCLE,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/custom_mat_icons/exclamation-circle.svg')
        );

        this.matIconRegistry.addSvgIcon(
            CONSTANTS.MAT_ICON_CUSTOM_MAP_SIGNS,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/custom_mat_icons/map-signs.svg')
        );

        this.matIconRegistry.addSvgIcon(
            CONSTANTS.MAT_ICON_CUSTOM_INCIDENT,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/custom_mat_icons/incident.svg')
        );

        this.matIconRegistry.addSvgIcon(
            CONSTANTS.MAT_ICON_CUSTOM_ADVISORIES,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/custom_mat_icons/bullhorn.svg')
        );

        this.matIconRegistry.addSvgIcon(
            CONSTANTS.MAT_ICON_CUSTOM_EXT_LINK,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/custom_mat_icons/external-link.svg')
        );

        this.matIconRegistry.addSvgIcon(
            CONSTANTS.MAT_ICON_CLOUD_SUN,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/custom_mat_icons/cloud-sun.svg')
        );

        this.matIconRegistry.addSvgIcon(
            CONSTANTS.MAP,
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/custom_mat_icons/map.svg')
          );

    }
}
