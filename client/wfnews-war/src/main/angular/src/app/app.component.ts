import { Location } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AppConfigService, TokenService } from '@wf1/core-ui';
import { RouterLink, WfApplicationConfiguration, WfApplicationState } from '@wf1/wfcc-application-ui';
import { WfMenuItems } from '@wf1/wfcc-application-ui/application/components/wf-menu/wf-menu.component';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { DisclaimerDialogComponent } from './components/disclaimer-dialog/disclaimer-dialog.component';
import { ApplicationStateService } from './services/application-state.service';
import { UpdateService } from './services/update.service';
import { ResourcesRoutes, snowPlowHelper, isMobileView as mobileView } from './utils';
import { WFMapService } from './services/wf-map.service';


export const ICON = {
  ADVISORIES: 'advisories',
  BACK_ICON: 'back-icon',
  BOOKMARK: 'bookmark',
  CLOUD_SUN: 'cloud-sun',
  CONTACT_US: 'contact-us',
  DOT: 'dot',
  EXCLAMATION_CIRCLE: 'exclamation-circle',
  EXT_LINK: 'external-link',
  FACEBOOK_SQUARE: 'fb-square',
  FACEBOOK: 'facebook',
  FILTER_CANCEL: "filter-cancel",
  FIRE: 'fire',
  INCIDENT: 'incident',
  MAP_SIGNS: 'map-signs',
  MAP: 'map',
  TWITTER: 'twitter',
  CAMPING: 'camping',
  LARGER: 'larger',
  PHONE: 'phone',
  ARROW_FORWARD_ENABLED: 'arrow-forward-enabled',
  ARROW_FORWARD_DISABLED: 'arrow-forward-disabled',
  CAMERA: 'camera',
  IMAGE: 'image',
  CAMERA_GREY: 'camera-grey',
  IMAGE_GREY: 'image-grey',
  EDIT: 'edit',
  SEND: 'send',
  LOCATION_OFF: 'location-off',
  DASHBOARD: 'dashboard',
  MORE: 'more',
  REPORT: 'report',
  SAVED: 'saved',
  ARROW: 'arrow',
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy, OnInit, AfterViewInit {
  public url;
  public snowPlowHelper = snowPlowHelper
  public isMobileView = mobileView
  public TOOLTIP_DELAY = 500;


  title = 'News';

  isLoggedIn = true;
  hasAccess = true;

  applicationConfig: WfApplicationConfiguration = {
    title: 'Wildfire News',
    device: this.applicationStateService.getDevice(),
    userName: '',
    version: {
      long: '',
      short: ''
    },
    environment: ''
  };

  applicationState: WfApplicationState = {
    menu: 'hidden'
  }

  appMenu: WfMenuItems;
  footerMenu: WfMenuItems;
  orientation;

  lastSuccessPollSub: Subscription;
  lastSyncDate;
  lastSyncValue = undefined;
  tokenSubscription: Subscription;
  activeMenuItem: string = '';
  showMobileNavigationBar = false;

  constructor(
    protected appConfigService: AppConfigService,
    protected router: Router,
    protected location: Location,
    protected updateService: UpdateService,
    protected applicationStateService: ApplicationStateService,
    protected matIconRegistry: MatIconRegistry,
    protected domSanitizer: DomSanitizer,
    protected tokenService: TokenService,
    protected cdr: ChangeDetectorRef,
    protected dialog: MatDialog,
    protected wfMapService:WFMapService
  ) {
  }

  private updateMapSize = function () {
    this.storeViewportSize();
  };

  ngOnInit() {
    this.wfMapService.patch();
    this.addCustomMaterialIcons();
    this.updateService.checkForUpdates();
    this.checkUserPermissions();

    if (!this.location.path().startsWith('/(root:external')) {
      this.appConfigService.configEmitter.subscribe((config) => {
        this.applicationConfig.version.short = config.application.version.replace(/-snapshot/i, '');
        this.applicationConfig.version.long = config.application.version;
        this.applicationConfig.environment = config.application.environment.replace(/^.*prod.*$/i, ' ') || ' ';
        this.onResize();
      });
    }
    this.tokenSubscription = this.tokenService.credentialsEmitter.subscribe((creds) => {
      let first = creds.given_name || creds.givenName;
      let last = creds.family_name || creds.familyName;

      this.applicationConfig.userName = `${first} ${last}`;
    });


    this.initAppMenu();
    this.initFooterMenu();

    window['SPLASH_SCREEN'].remove();
    if (localStorage.getItem('dontShowDisclaimer') !== 'true'){
      let dialogRef = this.dialog.open(DisclaimerDialogComponent, {
        autoFocus: false,
        width: '600px',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result['dontShowAgain']) {
          localStorage.setItem('dontShowDisclaimer', 'true');
        } else {
          localStorage.removeItem('dontShowDisclaimer');
        }
      });
    }

    const mainApp = document.getElementById('main-app')
    if (mainApp) {
      setTimeout(() => {
        mainApp.classList.remove('menu-collapsed');
        mainApp.classList.add('menu-hidden');
        if (document.getElementsByTagName('wf-menu')[0]) {
          (document.getElementsByTagName('wf-menu')[0] as HTMLElement).removeAttribute('style');
        }
      }, 200)
    }
    this.checkScreenWidth();
  }

  isIncidentsPage () {
    return window.location.pathname === '/incidents' || window.location.pathname === '/reportOfFire'
  }

  redirectToPublicMobile () {
    return ((window.innerWidth < 768 && window.innerHeight < 1024) || (window.innerWidth < 1024 && window.innerHeight < 768))
  }

  getAppStoreLink () {
    if ((navigator.userAgent.toLowerCase().indexOf("iphone") > -1) || (navigator.userAgent.toLowerCase().indexOf("ipad") > -1)) {
      return this.appConfigService.getConfig().externalAppConfig['appStoreUrl'].toString();
    } else {
      return this.appConfigService.getConfig().externalAppConfig['googlePlayUrl'].toString();
    }
  }

  getAppStoreName () {
    if ((navigator.userAgent.toLowerCase().indexOf("iphone") > -1) || (navigator.userAgent.toLowerCase().indexOf("ipad") > -1)) {
      return 'App Store'
    } else {
      return 'Google Play'
    }
  }

  download () {
    window.open(this.getAppStoreLink(), '_blank')
  }

  initAppMenu() {
    this.appMenu = [
      new RouterLink('Wildfires Map', '/' + ResourcesRoutes.ACTIVEWILDFIREMAP, 'map', 'collapsed', this.router),
      new RouterLink('Wildfires List', '/' + ResourcesRoutes.WILDFIRESLIST, 'local_fire_department', 'collapsed', this.router),
      new RouterLink('Current Statistics', '/' + ResourcesRoutes.CURRENTSTATISTICS, 'bar_chart', 'collapsed', this.router),
      new RouterLink('Wildfire Resources', '/' + ResourcesRoutes.RESOURCES, 'links', 'collapsed', this.router)
    ] as unknown as WfMenuItems;
  }

  initFooterMenu() {
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
    ) as unknown as WfMenuItems;
  }

  ngAfterViewInit() {
    setInterval(() => {
      this.getLastSync();
    }, 1000);

    setTimeout(() => {
        const headerImg = document.getElementsByClassName('bc-logo')
        if (headerImg && headerImg[0]) {
          const node = document.createElement("span")
          node.style.color = '#fcba19'
          node.style.marginLeft = '20px'
          node.append(this.applicationConfig.environment)
          headerImg[0].appendChild(node)
      }
    }, 1000);
  }

  getLastSync() {
    if (!this.lastSyncDate) {
      return '-';
    }
    const now = moment();
    const value = now.diff(this.lastSyncDate, 'second', false);
    if (value > 240) {
      this.lastSyncValue = '240+';
    } else {
      this.lastSyncValue = value.toFixed(0);
    }
  }


  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange() {
    this.onSizeChange();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onSizeChange();
  }

  private onSizeChange() {
    setTimeout(() => {
      this.updateMapSize();
      this.initAppMenu();
      this.initFooterMenu();
      this.cdr.detectChanges();

      // on resize, ensure the right main panel css is applied
      // Basically, we want mobile all the time on public and
      // desktop all the time on admin
      const classList = document.getElementById('main-app').classList
      if (this.isAdminPage() && classList.contains('device-mobile')) {
        classList.remove('device-mobile')
        classList.add('device-desktop')
      } else if(!this.isAdminPage() && this.applicationConfig.environment.toLowerCase() === '' && classList.contains('device-desktop')) {
        classList.remove('device-desktop')
        classList.add('device-mobile')
      }
    }, 250);
  }

  storeViewportSize() {
    this.orientation = this.applicationStateService.getOrientation();
    document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
    document.documentElement.style.setProperty('--viewport-width', `${window.innerWidth}px`);
  }

  ngOnDestroy() {
    if (this.lastSuccessPollSub) {
      this.lastSuccessPollSub.unsubscribe();
    }
    if (this.tokenSubscription) {
      this.tokenSubscription.unsubscribe()
    }
  }

  checkUserPermissions() {
    this.hasAccess = true;
    this.isLoggedIn = true;
  }

  navigateToBcWebsite() {
    window.open('https://www2.gov.bc.ca/gov/content/safety/wildfire-status', '_blank');
  }

  navigateToFooterPage(event: any) {
    window.open(event.route, '_blank');
  }

  addCustomMaterialIcons() {
    this.matIconRegistry.addSvgIcon(
      ICON.TWITTER,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/twitter.svg')
    );

    this.matIconRegistry.addSvgIcon(
      ICON.FACEBOOK,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/facebook.svg')
    );

    this.matIconRegistry.addSvgIcon(
      ICON.FACEBOOK_SQUARE,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/facebook-square.svg')
    );

    this.matIconRegistry.addSvgIcon(
      ICON.FIRE,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/fire.svg')
    );

    this.matIconRegistry.addSvgIcon(
      ICON.EXCLAMATION_CIRCLE,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/exclamation-circle.svg')
    );

    this.matIconRegistry.addSvgIcon(
      ICON.MAP_SIGNS,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/map-signs.svg')
    );

    this.matIconRegistry.addSvgIcon(
      ICON.INCIDENT,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/incident.svg')
    );

    this.matIconRegistry.addSvgIcon(
      ICON.ADVISORIES,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/bullhorn.svg')
    );

    this.matIconRegistry.addSvgIcon(
      ICON.EXT_LINK,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/external-link.svg')
    );

    this.matIconRegistry.addSvgIcon(
      ICON.CLOUD_SUN,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/cloud-sun.svg')
    );

    this.matIconRegistry.addSvgIcon(
      ICON.FILTER_CANCEL,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/filter-cancel.svg")
    );

    this.matIconRegistry.addSvgIcon(
      ICON.BOOKMARK,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/bookmark.svg')
    );

    this.matIconRegistry.addSvgIcon(
      ICON.MAP,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/map.svg')
    );

    this.matIconRegistry.addSvgIcon(
      ICON.BACK_ICON,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/back-icon.svg')
    );

    this.matIconRegistry.addSvgIcon(
      ICON.DOT,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/dot.svg")
    );

    this.matIconRegistry.addSvgIcon(
      ICON.CONTACT_US,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/contact-us.svg")
    );
    this.matIconRegistry.addSvgIcon(
      ICON.CAMPING,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/camping.svg")
    );
    this.matIconRegistry.addSvgIcon(
      ICON.LARGER,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/larger.svg")
    );
    this.matIconRegistry.addSvgIcon(
      ICON.PHONE,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/phone.svg")
    );
    this.matIconRegistry.addSvgIcon(
      ICON.ARROW_FORWARD_ENABLED,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/arrow-forward-enabled.svg")
    );
    this.matIconRegistry.addSvgIcon(
      ICON.ARROW_FORWARD_DISABLED,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/arrow-forward-disabled.svg")
    );
    this.matIconRegistry.addSvgIcon(
      ICON.CAMERA,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/camera.svg")
    );
    this.matIconRegistry.addSvgIcon(
      ICON.IMAGE,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/image.svg")
    );
    this.matIconRegistry.addSvgIcon(
      ICON.CAMERA_GREY,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/camera-grey.svg")
    );
    this.matIconRegistry.addSvgIcon(
      ICON.IMAGE_GREY,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/image-grey.svg")
    );
    this.matIconRegistry.addSvgIcon(
      ICON.EDIT,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/edit.svg")
    );
    this.matIconRegistry.addSvgIcon(
      ICON.SEND,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/send.svg")
    );
    this.matIconRegistry.addSvgIcon(
      ICON.LOCATION_OFF,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/location-off.svg')
    );
    this.matIconRegistry.addSvgIcon(
      ICON.DASHBOARD,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/dashboard.svg')
    );
    this.matIconRegistry.addSvgIcon(
      ICON.MORE,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/more.svg')
    );
    this.matIconRegistry.addSvgIcon(
      ICON.REPORT,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/report.svg')
    );
    this.matIconRegistry.addSvgIcon(
      ICON.SAVED,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/svg-icons/saved.svg')
    );
    this.matIconRegistry.addSvgIcon(
      ICON.ARROW,
      this.domSanitizer.bypassSecurityTrustResourceUrl("assets/images/svg-icons/arrow.svg")
    );
  }

  isAdminPage() {
    if (this.router.url === '/admin' || this.router.url.includes("/incident?") || this.router.url.includes("?preview=true") || this.router.url === '/error-page') {
      return true;
    } else {
      return false;
    }
  }

  navigateToBcSupport() {
    let url = this.appConfigService.getConfig().externalAppConfig['bcWildFireSupportPage'].toString();
    window.open(url, "_blank");
  }

  logOutCurrentUser() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.SIGN_OUT]);
    }, 100);
  }

  setActive(menuItem: string): void {
    this.activeMenuItem = menuItem;
    if (menuItem == 'report') {
      this.router.navigate([ResourcesRoutes.ROF]);
      this.activeMenuItem = '';
    }
  }

  checkScreenWidth(): void {
    this.showMobileNavigationBar = window.innerWidth < 768;
  }
}
