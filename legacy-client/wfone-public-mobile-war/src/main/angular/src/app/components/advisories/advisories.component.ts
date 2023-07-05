import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
    ViewChild,
    ViewContainerRef,
    OnDestroy,
    NgZone,
    ComponentRef
} from "@angular/core";
import {BaseComponent} from "../base/base.component";
import {VmAdvisory} from "../../conversion/models";
import {NearMeComponent} from "../near-me/near-me.component";
import {WFOnePublicMobileRoutes} from "../../utils";
import { NearMeTemplate } from "src/app/services/point-id.service";

@Component({
    selector: 'wfone-advisories',
    templateUrl: './advisories.component.html',
    styleUrls: ['../base/base.component.scss', './advisories.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvisoriesComponent extends BaseComponent implements AfterViewInit, OnInit, OnDestroy {
    @Input() advisories: VmAdvisory[];
    @ViewChild('nearMeContainerAdvisories', {read: ViewContainerRef}) nearMeContainerAdvisories;

    nearMeComponentRef: ComponentRef<any>
    selectedTypeDesc:string = "All";
    nearMeSelected = true;
    type = "ALL";

    advisoryTypes = [
        {value:"", desc:"All"},
        {value:"BANS_AND_PROHIBITIONS", desc:"Bans & Prohibitions"},
        {value:"AREA_RESTRICTIONS", desc:"Area Restrictions"},
        {value:"EVACUATION_ORDERS", desc:"Evacuation Orders & Alerts "},
    ];

    backRoute = WFOnePublicMobileRoutes.LANDING;
    title = "Current Notices";
    zone: NgZone;
    nearMePromise: Promise<any> = Promise.resolve()

    initComponent() {
        super.initComponent()

        this.zone = this.injector.get( NgZone )
    }

    isHandlerForUrl( url: string ): boolean {
        return url.includes( WFOnePublicMobileRoutes.ADVISORIES )
    }

    ngOnInit(){
        super.ngOnInit();
    }

    ngOnDestroy() {
        console.log('ngOnDestroy AdvisoriesComponent')
        this.nearMeComponentRef.destroy()
        this.nearMeComponentRef = null
    }

    ngAfterViewInit() {
        console.log('ngAfterViewInit AdvisoriesComponent')
        this.nearMeComponentRef = this.nearMeContainerAdvisories.createComponent( this.componentFactoryResolver.resolveComponentFactory( NearMeComponent ) );
        this.nearMeComponentRef.instance.setShowWeather( false )

        this.handleChange();
    }

    detectChanges() {
        let cdr = this.cdr
        setTimeout( function () {
            cdr.detectChanges()
        }, 100 )
    }

    handleChange(){
        const self = this;

        this.nearMeComponentRef.instance.setLoading( true, !this.nearMeSelected);
        this.detectChanges();

        this.nearMePromise = this.nearMePromise
            .then( function () {
                if ( self.nearMeSelected ) {
                    return self.commonUtilityService.getCurrentLocationPromise()
                        .then( function ( location ) {
                            return self.pointIdService.fetchAdvisoryFeatures( location.coords.latitude, location.coords.longitude, 50 )
                        } )
                }
                else {
                    return self.pointIdService.fetchAdvisoryFeatures()
                }        
            } )
            .then( function ( resp: NearMeTemplate ) {
                if ( !self.nearMeComponentRef ) return
                
                self.zone.run( function () {
                    self.nearMeComponentRef.instance.setNearMeTemplate( resp );
                    self.detectChanges();
                } )
            } )
            .catch( function ( error ) {
                console.warn(error)
                self.zone.run( function () {
                    self.snackbarService.open('There was an error in the server. Please try again',
                    '', {duration: 2500, panelClass: 'full-snack-bar-offline'});

                    if ( !self.nearMeComponentRef ) return

                    self.nearMeComponentRef.instance.setLoading(false);

                    self.detectChanges();
                } )
            } )
    }

    nearMeChanged(){
        this.handleChange();
    }

    advisoryTypeChanged(){
        this.selectedTypeDesc = this.advisoryTypes.find(item => item.value == this.type).desc;
        if ( this.nearMeComponentRef )
            this.nearMeComponentRef.instance.setTypeFilter( this.type );

        this.detectChanges();
    }
}
