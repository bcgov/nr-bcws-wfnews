import { animate, state, style, transition, trigger } from '@angular/animations';
import { FocusMonitor, FocusTrapFactory, ListKeyManager } from '@angular/cdk/a11y';
import { Location } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef, EventEmitter, HostListener,
    Input,
    OnChanges, OnDestroy, OnInit, Output, QueryList, SimpleChanges,
    ViewChild,
    ViewChildren
} from "@angular/core";
import { MatSidenav, MatSlideToggleChange, MatSnackBar } from "@angular/material";
import { NavigationEnd, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { PublicAppHeaderActionItem } from "@wf1/core-ui/lib/public-application-header/public-application-header.component";
import { EventEmitterService } from "src/app/services/event-emitter.service";
import { HelpDocumentService } from 'src/app/services/help-document.service';
import { ApplicationStateService } from "../../services/application-state.service";
import { RootState } from "../../store";
import { ErrorState } from "../../store/application/application.state";
import { CONSTANTS, WFOnePublicMobileRoutes } from "../../utils";
import { ICONS } from "../../utils/icons";
import { AppConfigService } from './../../services/app-config.service';
import { CapacitorService } from './../../services/capacitor-service';
import {MatDialog} from "@angular/material/dialog";
import { WarningDialogComponent } from '../warning-dialog/warning-dialog.component';


var initializations: number = 0

export interface NavItem {
    icon: any;
    svgIcon: string;
    label: string;
    routerLink: string;
    badge: number;
    queryParams?: any;
}

export interface ActionItem {
    label: string;
    callBackFunction: Function;
}

@Component({
    selector: 'base-wrapper',
    templateUrl: './base-wrapper.component.html',
    styleUrls: ['./base-wrapper.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger( 'menu-collapsed-expanded', [
            state( 'collapsed', style( {
                'width': '50px',
                'min-width': 0,
            } ) ),
            state( 'expanded', style( {
                'width': '250px'
            } ) ),
            transition( 'collapsed => expanded', [
                animate( '0.25s' )
            ] ),
            transition( 'expanded => collapsed', [
                animate( '0.25s' )
            ] )
        ] )
    ]
})
export class BaseWrapperComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    @Input() toolbarIsVisible: boolean;
    @Input() title?: string;
    @Input() backRouteQueryParams?: any;
    @Input() backRoute?: WFOnePublicMobileRoutes;
    @Input() backRouteLabel?: string = null;
    @Input() summaryString?: string = null;
    @Input() actionItems?: ActionItem[] = null;
    @Input() errorState?: ErrorState[];
    @Input() useNavigateBack: boolean = false;

    @Output() navigateBack = new EventEmitter<any>();

    @ViewChild('sidenav') sidenav: MatSidenav;
    @ViewChild('topnav') topnav: MatSidenav;
    @ViewChild("appHeader") appHeader: ElementRef;
    @ViewChild('navList') navList: ElementRef;
    @ViewChildren('accessNavItems') accessNavItems: QueryList<any>;

    menuState;
    exitBlocked = true;
    elevation = "mat-elevation-z2";
    isMobileRes = false;
    isTabletRes = false;
    sideNavAccessLocked = false;
    appVersion: string;
    appEnvironment: string;
    keyManager: any;
    navFocusTrap;
    headerItemsDesktop = [];
    headerItemsMobile: PublicAppHeaderActionItem[] = [
        {
            icon: 'menu',
            label: 'Menu',
            badge: 0,
            callBackFunction: this.openSidenav.bind(this)
        },
    ];
    mainNavItems = [];
    showingMenuOnStartup = false
    routerSubscription;
    arrowIcon: string = 'arrow-default';
    isMobilePlatform: boolean = false

    constructor(
        private router: Router,
        private applicationStateService: ApplicationStateService,
        private store: Store<RootState>,
        private cdr: ChangeDetectorRef,
        private eventEmitterService: EventEmitterService,
        private focusTrap: FocusTrapFactory,
        private focusMonitor: FocusMonitor,
        protected snackbarService: MatSnackBar,
        private appConfigService: AppConfigService,
        private capacitorService: CapacitorService,
        private location: Location,
        private helpDocumentService: HelpDocumentService,
        protected dialog: MatDialog,

    ) {
        this.toolbarIsVisible = false;

        this.capacitorService.isMobile.then( b => {
            this.isMobilePlatform = b
            this.mainNavItems = this.getNavItems('main');
            this.cdr.detectChanges()
        } )
    }

    ngOnInit(): void {
        const self = this
        this.isMobileRes = this.applicationStateService.getIsMobileResolution();
        this.isTabletRes = this.applicationStateService.getIsTabletResolution();
        this.mainNavItems = this.getNavItems('main');
        this.backRouteLabel = 'Back';
        if (this.isTabletRes) {
            this.menuState = this.applicationStateService.getMenuState()
        }
        if (this.eventEmitterService.subsVar === undefined) {
            this.eventEmitterService.subsVar = this.eventEmitterService.
                invokeKeyboardTabFunction.subscribe((name: string) => {
                    this.keyboardShiftTabbed(name);
                });

            this.eventEmitterService.
                invokeSideNavAccessLocked.subscribe((isLocked: boolean) => {
                    this.changeSideNavAccessLocked(isLocked);
                });
        }

        this.appVersion = this.appConfigService.getConfig()['application']['version'];
        this.appEnvironment = this.appConfigService.getConfig()['application']['environment'];

        initializations += 1
        this.showingMenuOnStartup = this.applicationStateService.getShowMenuOnStartup()

        if (initializations < 2) {
            this.helpDocumentService.hasCurrentAnnouncement().then(function (id) {
                self.applicationStateService.showHelpDialog(id)
            })
        }

        this.routerSubscription = this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd) {
                self.mainNavItems = self.getNavItems('main');
                self.cdr.detectChanges();
            }
        });
    }

    ngOnDestroy() {
        this.routerSubscription.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.keyManager = new ListKeyManager(this.accessNavItems);
        this.keyManager.withHorizontalOrientation('ltr'); // Arrow navigation options
        this.keyManager.withWrap();  // Arrow navigation options

        this.navFocusTrap = this.focusTrap.create(this.navList.nativeElement);
        this.navFocusTrap.focusInitialElement();
        this.keyManager.setFirstItemActive();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.summaryString) {
            this.summaryString = changes.summaryString.currentValue;
        }
        if (changes.toolbarIsVisible) {
            this.toolbarIsVisible = changes.toolbarIsVisible.currentValue;
        }
    }


    showToolbar() {
        return this.toolbarIsVisible;
    }

    getNavItems(type?: string): NavItem[] {
        if (type) {
            if (type === 'main') {
                return this.getMainNavItems();
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    getMainNavItems() {
        const items = [];

        if (!this.isMobileRes) {
            items.push({ svgIcon: CONSTANTS.MAP, label: 'Wildfire Map', routerLink: '/' + WFOnePublicMobileRoutes.LANDING, badge: 0 });
        }

        items.push({ svgIcon: CONSTANTS.MAT_ICON_CUSTOM_TWITTER, label: 'Latest News', routerLink: '/' + WFOnePublicMobileRoutes.LATEST_NEWS, badge: 0 });
        items.push({ svgIcon: CONSTANTS.MAT_ICON_CUSTOM_ADVISORIES, label: 'Current Notices', routerLink: '/' + WFOnePublicMobileRoutes.ADVISORIES, badge: 0 });
        items.push({ svgIcon: CONSTANTS.MAT_ICON_CUSTOM_INCIDENT, label: 'Report a Fire', routerLink: '/' + WFOnePublicMobileRoutes.REPORT_OF_FIRE, badge: 0 });
        items.push({ icon: 'bar_chart', label: 'Current Stats', routerLink: '/' + WFOnePublicMobileRoutes.CURRENT_STATS, badge: 0 });


        if (this.isMobilePlatform)
            items.push({ icon: 'notifications', label: 'Notifications', routerLink: '/' + WFOnePublicMobileRoutes.NOTIFICATIONS, badge: 0 });

        if (this.isMobileRes) {
            items.push({ icon: 'help', label: 'Help', routerLink: '/' + WFOnePublicMobileRoutes.HELP + '/helpContents', badge: 0 });
            items.push({ icon: 'local_library', label: 'Wildfire Learning', routerLink: '/' + WFOnePublicMobileRoutes.HELP + '/wildfireLearning', badge: 0, isNew: !this.helpDocumentService.isTopicSeen('wildfireLearning') });
        }
        else {
            items.push({ icon: 'help', label: 'Help', badge: 0, help: true });
            items.push({ icon: 'local_library', label: 'Wildfire Learning', badge: 0, learning: true, isNew: !this.helpDocumentService.isTopicSeen('wildfireLearning') });
        }

        items.push({ icon: 'info', label: 'Disclaimer', routerLink: '/' + WFOnePublicMobileRoutes.DISCLAIMER, badge: 0 });
        items.push({ icon: 'comment', label: 'Feedback', routerLink: '/' + WFOnePublicMobileRoutes.FEEDBACK, badge: 0 });

        return items;
    }

    getIcon(icon: string) {
        return ICONS[icon];
    }

    navigateToBackRoute() {
        this.eventEmitterService.onGoBackCalled()
    }

    openSidenav() {
        this.sidenav.open();
        this.cdr.detectChanges();
    }

    closeSidenav() {
        if ( !this.isMobileRes ) return
        this.sidenav.close();
        this.cdr.detectChanges();
    }

    toggleTopnav() {
        this.topnav.opened ? this.topnav.close() : this.topnav.open();
    }

    closeTopnav() {
        this.topnav.close();
    }

    @HostListener('window:orientationchange', ['$event'])
    onOrientationChange(event) {
        setTimeout(() => {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);

            this.cdr.detectChanges();
        }, 250);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        setTimeout(() => {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);

            this.cdr.detectChanges();
            if (this.isMobileRes) {
                this.sidenav.close();// this is gross and if there is a better way to do this, we can come back to it. For now this workaround works.
            } else {
                // this.sidenav.open();
            }
        }, 250);
    }


    @HostListener('window:keydown', ['$event'])
    keyFunc(event) {
        // causes input fields to lose focus in desktop mode.
        // unsure why this is even here.

        // if(this.applicationStateService.getIsHoveringTextBox()){
        // }
        // else if(!this.sideNavAccessLocked) {
        //     if (event.code !== 'Tab' && event.keyCode !== 13 && this.keyManager.activeItem._element && event.keyCode !== 39) {
        //     this.keyManager.onKeydown(event);
        //     this.focusMonitor.focusVia(this.keyManager.activeItem._element.nativeElement, "keyboard");
        //     } else if(event.keyCode === 39 ) {
        //         event.preventDefault();
        //         //document.getElementsByName('back button')[0].focus();
        //         document.getElementById('accessFocusPoint').focus();
        //         this.changeSideNavAccessLocked(true);
        //     }
        // } else {

        // }
    }

    closeSideNav(onlyWhenMobileRes, navItem) {
        const self = this

        if (this.applicationStateService.getShouldVisSideNav()) {
            this.applicationStateService.setShouldVisSideNav(false);
        }
        if (onlyWhenMobileRes) {
            //console.log("close only when mobile res");
            if (this.isMobileRes) {
                // console.log("isMobileRes - close side nav");
                this.sidenav.close();
            }
        } else {
            // console.log("close side nav regardless of resolution");
            this.sidenav.close();
        }
        // if(this.router.url != WFOnePublicMobileRoutes.LANDING)this.store.dispatch(clearNearMeHighlight());

        if (!navItem) return

        if (navItem.help)
            this.applicationStateService.showHelpDialog().then(function () {
                self.mainNavItems = self.getNavItems('main');
                self.cdr.detectChanges();
            })

        if (navItem.learning)
            this.applicationStateService.showLearningDialog().then(function () {
                self.mainNavItems = self.getNavItems('main');
                self.cdr.detectChanges();
            })
    }

    sideBarOpenChoice(): boolean {
        if (!this.isMobileRes) {
            return true;
        } else {
            if (this.applicationStateService.getShouldVisSideNav()) {
                return true;
            } else {
                return false;
            }
        }
    }

    keyboardShiftTabbed(name: string) {
        for (let i = 0; i < this.mainNavItems.length; i++) {
            if (this.mainNavItems[i].routerLink.indexOf(name) != -1) {
                this.navFocusTrap = this.focusTrap.create(this.navList.nativeElement);
                this.focusMonitor.focusVia(this.keyManager.activeItem._element.nativeElement, "keyboard")
                this.keyManager.onKeydown(event);
                this.keyManager.setNextItemActive();

                break;
            }
        }
    }

    protected displayInformationalMessage(text: string) {
        this.snackbarService.open(text, null, { duration: 2500 });
    }

    changeSideNavAccessLocked(isLocked: boolean) {
        this.sideNavAccessLocked = isLocked;
    }

    showMenu(): boolean {
        return !this.isMobileRes || (initializations < 2 && this.showingMenuOnStartup)
    }

    showMenuOnStartup(): boolean {
        return this.applicationStateService.getShowMenuOnStartup()
    }

    changeMenuOnStartup(event: MatSlideToggleChange) {
        this.applicationStateService.setShowMenuOnStartup(event.checked)
    }

    get toggleTitle() {

        if ( this.menuState == 'expanded' ) {
            return 'Collapse'
        } else if (this.menuState == 'collapsed') {
            return 'Expand'
        }
    }
    onToggleClick() {
            let state = this.menuState == 'expanded' ? 'collapsed' : 'expanded'
            this.applicationStateService.setMenuState(state)
            this.menuState = state
            if (this.menuState === 'expanded') {
                this.arrowIcon = 'arrow-default';
            }
            else if (this.menuState === 'collapsed') {
                this.arrowIcon = 'arrow-change';
            }
    }

    get toggleIcon() {
        if ( this.menuState == 'expanded' ) {
            return 'double_arrow'
        } else if (this.menuState == 'collapsed') {
            return 'keyboard_double_arrow_right'
        }
    }

    get versionNumber() {
        if (this.menuState == 'collapsed') {
            return 'V' + this.appVersion.replace('-SNAPSHOT','')
        }
        else {
            return 'Version ' + this.appVersion
        }
    }

}
