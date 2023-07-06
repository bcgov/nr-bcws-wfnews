import { HttpClient } from "@angular/common/http";
import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { NavigationEnd } from "@angular/router";
import { CompassHeading } from "src/app/services/capacitor-service";
import { Position } from "src/app/services/common-utility.service";
import { MapConfigService } from "src/app/services/map-config.service";
import { getSnackbarConfig, WFOnePublicMobileRoutes } from "../../utils";
import { BaseComponent } from "../base/base.component";
import { Snapshot } from "../webcam-snapshot/webcam-snapshot.component";
import { WarningDialogComponent } from "../warning-dialog/warning-dialog.component";
import { WFSnackbarComponent } from "src/app/utils/wf-snackbar.component";
import { ConnectionStatus, Network } from '@capacitor/network';
import { Dialog } from '@capacitor/dialog';

type PageName = 'report-selection' | 'user-selection' | 'user-agreement' | 'user-info' | 'photo-gallery' | 'photo-camera' | 'fire-distance' | 'fire-location' | 'fire-details' | 'other-info' | 'info-submit' | 'call-to-report';
type SharingStatus = 'agree' | 'disagree'
type ReportImage = {
    url: string
    heading: CompassHeading
    latitude?: number
    longitude?: number
}

const DISTANCE = [
    { label: '100 m',   value: 100 },
    { label: '150 m',   value: 150 },
    { label: '200 m',   value: 200 },
    { label: '350 m',   value: 450 },
    { label: '500 m',   value: 500 },
    { label: '750 m',   value: 750 },
    { label: '1 km',    value: 1000 },
    { label: '1.5 km',  value: 1500 },
    { label: '2 km',    value: 2000 },
    { label: '3.5 km',  value: 3500 },
    { label: '5 km',    value: 5000 },
    { label: '7.5 km',  value: 7500 },
    { label: '10+ km',  value: 10000 },
]

const FIRE_SIZE = [
    { label: 'Campfire' ,                    value: 'Campfire' },
    { label: 'Car' ,                         value: 'Car' },
    { label: 'House' ,                       value: 'House' },
    { label: 'Football Field' ,              value: 'Football Field' },
    { label: 'Larger than Football Field',   value: 'Larger than Football Field' },
    { label: 'Other' ,                       value: 'Other' },
    { label: 'Unknown' ,                     value: 'Unknown' },
    { label: 'Not Applicable',               value: 'Not Applicable' }
];

const SPREAD_RATE = [
    { label: 'Not Spreading',    value: 'Not Spreading' },
    { label: 'Slow',             value: 'Slow' },
    { label: 'Fast',             value: 'Fast' },
    { label: 'Unknown',          value: 'Unknown' },
    { label: 'Not Applicable',   value: 'Not Applicable' }
];

@Component({
    selector: 'wfone-report-of-fire',
    templateUrl: './report-of-fire.component.html',
    styleUrls: [
        '../base/base.component.scss',
        './report-of-fire.component.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportOfFireComponent extends BaseComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('fireDetailPage') fireDetailPage: any
    mapConfigService: MapConfigService
    http: HttpClient

    routeSubscription
    currentPage: PageName
    // report-selection ----------
    networkStatus: ConnectionStatus
    location?: Position
    // user-agreement ------------
    sharingStatus?: SharingStatus
    // user-info -----------------
    name: string
    phone: string;
    consentToCall: any = false;
    // photo-gallery -------------
    heading: CompassHeading
    images: ReportImage[] = []
    distanceEstimateMeter: number = 100

    distanceEstimateCode: number = 0
    imageWidth: number = 2048
    imageQuality: number = 100
    // photo-camera --------------
    snapshot: ReportImage
    isCaptured: boolean
    // fire-location -------------
    mapConfig: any
    fireLocation?: LatLon
    // fire-details --------------
    fireSizeCodes = FIRE_SIZE
    fireSize: string = null
    spreadRateCodes = SPREAD_RATE
    spreadRate: string = null
    error: any;
    burning: {
        Trees: boolean
        Slash: boolean
        Brush: boolean
        Grass: boolean
        'Mixed Wood': boolean
        Other: boolean
        Unknown: boolean
    }
    visibleFlame: {
        no: boolean
        yes: boolean
    }
    smoke: {
        White: boolean
        Grey: boolean
        Black: boolean
        Brown: boolean
        Blue: boolean
        Unknown: boolean
        'Not Applicable': boolean
    }
    weather: {
        'Hot/Dry': boolean
        Rain: boolean
        Lightning: boolean
        'Clear/Calm': boolean
        Windy: boolean
    }
    // other-info ----------------
    assetsAtRisk: {
        'Homes/Buildings': boolean
        Powerlines: boolean
        Railway: boolean
        Bridges: boolean
        Unknown: boolean
        None: boolean
    }
    signsOfResponse: {
        Helicopter: boolean
        Sirens: boolean
        'Truck/Personnel': boolean
        'Heavy Equipment': boolean
        None: boolean
    }
    otherInfo: string;
    // info-submit ---------------
    submitStatus: 'pending'|'success'|'failed' = 'pending'
    // call-to-report ------------
    phoneNumber: string;
    cellNumber: string;
    hideFade: boolean = false;


    initComponent() {
        this.backRoute = WFOnePublicMobileRoutes.LANDING;

        this.mapConfigService = this.injector.get(MapConfigService)
        this.http = this.injector.get(HttpClient)

        super.initComponent();
    }

    isHandlerForUrl( url: string ): boolean {
        return url.includes( WFOnePublicMobileRoutes.REPORT_OF_FIRE )
    }

    ngOnInit() {
        window.addEventListener('scroll', this.scroll, true); //third parameter
        const res = this.appConfigService.getAppResourcesConfig();

        this.currentPage = 'report-selection';
        this.phoneNumber = res.reportAFirePhone;
        this.cellNumber = res.reportAFireCell;
        this.resetRoF()

        this.routeSubscription = this.router.events.subscribe((e) => {
            if ( !(e instanceof NavigationEnd) ) return
            if ( !e.urlAfterRedirects.includes( WFOnePublicMobileRoutes.REPORT_OF_FIRE ) ) return
            this.changePage('report-selection')
        });

        super.ngOnInit();
    }

    ngAfterViewInit() {
        this.eventEmitterService.sideNavAccessLocked(true);
        super.ngAfterViewInit();
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
    }

    scroll = (event: any): void => {
        // Here scroll is a variable holding the anonymous function
        // this allows scroll to be assigned to the event during onInit
        // and removed onDestroy
        // To see what changed:
        const number = event.srcElement.scrollTop;
        const scrollHeight = event.srcElement.scrollHeight;
        const scrollTop = event.srcElement.scrollTop;
        const clientHeight = event.srcElement.clientHeight;
        const scrollBottom = scrollHeight - scrollTop - clientHeight;
        if (scrollBottom <= 50) {
          this.hideFade = true;
          this.cdr.detectChanges()
        } else {
          this.hideFade = false;
          this.cdr.detectChanges()
        }
      };

    navigateToBackRoute() {
        switch (this.currentPage) {
            case 'report-selection':
            case 'call-to-report':
            case 'info-submit':
                super.navigateToBackRoute()
                return
        }

        Dialog.confirm({
            title: 'Warning',
            message: `Are you sure you would like to leave this page? If you leave this page, the information shared in this report will be lost.`,
            okButtonTitle: 'Discard Changes',
            cancelButtonTitle: 'Keep Editing'
        }).then( res => {
            if ( res.value ) super.navigateToBackRoute()
        } )
    }

    ngOnDestroy() {
        this.routeSubscription.unsubscribe();
    }

    get stepTitle() {
        const title = "Report a Fire";
        // switch (this.currentPage) {
        //     case 'user-agreement': return title + ' - Agreement'
        //     case 'user-info': return title + ' - Contact Info'
        //     case 'photo-gallery': return title + ' - Photos'
        //     case 'photo-camera': return title + ' - Take Photo'
        //     case 'fire-distance': return title + ' - Fire Distance'
        //     case 'fire-location': return title + ' - Fire Location'
        //     case 'fire-details': return title + ' - Fire Details'
        //     case 'other-info': return title + ' - Other Information'

        //     default: return title
        // }
        return title
    }

    get distanceLabel() {
        return DISTANCE[this.distanceEstimateCode].label
    }

    get currentLocation(): { lat: string, long: string } {
        if (!this.location) return { lat: '', long: '' }
        let f = this.spatialUtilService.formatCoordinates([this.location.coords.longitude, this.location.coords.latitude]).split(', ');
        return { lat: f[0], long: f[1] }
    }

    get hasHeading() {
        if ( !this.heading ) return false
        if ( this.heading.error ) return false
        return true
    }

    get currentHeading() {
        if ( !this.hasHeading ) return 0
        return this.heading.trueHeading || 0
    }

    get hasGPS() {
        return !!this.location
    }

    get hasNetwork() {
        if ( !this.networkStatus ) return true
        return this.networkStatus.connected
    }

    resetRoF() {
        // report-selection ----------
        this.location = null
        this.commonUtilityService.getCurrentLocation((position) => {
            this.location = position
            this.cdr.detectChanges()
        });

        this.networkStatus = null
        Network.getStatus().then( ( status ) => {
            this.networkStatus = status
            this.cdr.detectChanges()
        } )

        // user-agreement ------------
        this.sharingStatus = null

        // user-info -----------------
        this.name = null
        this.phone = null
        this.consentToCall = false;

        // photo-gallery -------------
        this.heading = null
        this.images = []
        this.distanceEstimateCode = 0
        this.distanceEstimateMeter = 100

        // photo-camera --------------
        this.snapshot = null
        this.isCaptured = false

        // fire-location -------------
        this.mapConfig = null
        this.fireLocation = null

        // fire-details --------------
        this.fireSize = null
        this.spreadRate = null
        this.burning = {
            Brush: false,
            Grass: false,
            'Mixed Wood': false,
            Other: false,
            Slash: false,
            Trees: false,
            Unknown: false
        }
        this.visibleFlame = {
            no: false,
            yes: false
        }
        this.smoke = {
            White: false,
            Grey: false,
            Black: false,
            Brown: false,
            Blue: false,
            Unknown: false,
            'Not Applicable': false,
        }
        this.weather = {
            'Hot/Dry': false,
            Rain: false,
            Lightning: false,
            'Clear/Calm': false,
            Windy: false,
        }

        // other-info ----------------
        this.assetsAtRisk = {
            'Homes/Buildings': false,
            Powerlines: false,
            Railway: false,
            Bridges: false,
            Unknown: false,
            None: false,
        }
        this.signsOfResponse = {
            Helicopter: false,
            Sirens: false,
            'Truck/Personnel': false,
            'Heavy Equipment': false,
            None: false,
        }
        this.otherInfo = ''

        // info-submit ---------------
        this.submitStatus = 'pending'
    }

    get showNavigation() {
        switch (this.currentPage) {
            case 'call-to-report':
                return false

            default: return true
        }
    }

    changePage(target: PageName) {
        this.mapConfig = null

        switch (target) {
        case 'report-selection':
            this.resetRoF()
            break

        case 'photo-camera':
            this.snapshot = null
            break

        case 'fire-location':
            this.mapConfigService.getReportOfFireMapConfig().then(cfg => {
                // initial position of map, centered on projected location of photo, zoomed to include current location
                let turf = window[ 'turf' ],
                    loc = [ this.location.coords.longitude, this.location.coords.latitude ],
                    dist = this.distanceEstimateMeter / 1000, //km
                    head = this.currentHeading,
                    photo = turf.destination( loc, dist, head ),
                    poly = turf.circle( photo.geometry.coordinates, dist ),
                    exp = turf.transformScale( poly, 1.10 ),
                    bbox = turf.bbox( exp ),
                    view = { viewer: { location: { extent: bbox } } }

                this.mapConfig = [ cfg, view ]
                this.cdr.detectChanges()
            })
            break

        case 'info-submit':

            this.submitFireReport()
                .then( () => {
                    this.submitStatus = 'success'
                    this.cdr.detectChanges()
                } )
                .catch( ( e ) => {
                    console.warn( 'fire report submit failed', e )
                    this.submitStatus = 'failed'
                    this.cdr.detectChanges()
                } )
            break
        }

        // console.log('page change from', current, 'to', target)
        window[ 'snowplow' ]( 'trackPageView', this.router.url + '#' + target );

        this.currentPage = target
        this.cdr.detectChanges()

        if (this.currentPage == 'fire-details') {
            const hasScroll = this.fireDetailPage.nativeElement.scrollHeight > this.fireDetailPage.nativeElement.clientHeight;
            this.cdr.detectChanges()
            if (!hasScroll) {
                this.hideFade = true
                this.cdr.detectChanges()
            }
        }
    }

    // -----------------------------------

    getPreviousPage() {
        switch (this.currentPage) {
            case 'user-agreement': return 'report-selection'
            case 'user-selection': return 'user-agreement'
            case 'user-info': return 'user-agreement'
            case 'photo-gallery': return 'user-info'
            case 'photo-camera': return 'photo-gallery'
            case 'fire-distance': return 'photo-gallery'
            case 'fire-location': return 'fire-distance'
            case 'fire-details': return 'fire-location'
            case 'other-info': return 'fire-details'
        }
    }

    get showNavigateBack() {
        switch (this.currentPage) {
            case 'report-selection':
            case 'info-submit':
                return false

            default: return true
        }
    }

    get navigateBackEnabled() {
        return true
    }

    onNavigateBack() {
        this.changePage(this.getPreviousPage())
    }

    // -----------------------------------

    getNextPage() {
        switch (this.currentPage) {
            case 'user-agreement':
                if (this.sharingStatus == 'agree') return 'user-info';
                return 'call-to-report';
            case 'user-info': return 'photo-gallery'
            case 'photo-gallery': return 'fire-distance'
            case 'photo-camera': return 'photo-gallery'
            case 'fire-distance': return 'fire-location'
            case 'fire-location': return 'fire-details'
            case 'fire-details': return 'other-info'
            case 'other-info': return 'info-submit'
        }
    }

    get showNavigateNext() {
        switch (this.currentPage) {
            case 'report-selection':
            case 'info-submit':
            case 'other-info':
                return false

            default: return true
        }
    }

    get navigateNextEnabled() {
        switch (this.currentPage) {
            case 'user-agreement':
                return !!this.sharingStatus

            case 'photo-camera':
                return !!this.snapshot

            case 'fire-location':
                return !!this.fireLocation

            default: return true
        }
    }

    onNavigateNext() {
        if ( this.currentPage == 'photo-camera' && this.snapshot ) {
            this.images.push( this.snapshot )
        }

        this.changePage(this.getNextPage())
    }

    // -----------------------------------

    get showNavigateDone() {
        return this.currentPage == 'info-submit'
    }

    onNavigateDone() {
        this.navigateToBackRoute()
    }

    // -----------------------------------

    get showNavigateSubmit() {
        return this.currentPage == 'other-info'
    }

    onNavigateSubmit() {
        this.changePage(this.getNextPage())
    }

    // -----------------------------------

    get stepNumber() {
        switch (this.currentPage) {
            case 'user-agreement': return 1
            case 'user-info': return 2
            case 'photo-gallery': return 3
            case 'fire-distance': return 4
            case 'fire-location': return 5
            case 'fire-details': return 6
            case 'other-info': return 7

            default: return null
        }
    }

    // -----------------------------------
    // report-selection

    onSubmitElectronicReport() {
        this.changePage('user-agreement')
    }

    onCallToReport() {
        this.changePage('call-to-report')
    }

    // -----------------------------------
    // user-agreement

    onChangeSharingStatus( status: SharingStatus ) {
        if ( this.sharingStatus == status ) {
            this.sharingStatus = null
        }
        else {
            this.sharingStatus = status
        }
    }

    // -----------------------------------
    // user-info

    get canAskCallback() {
        let b = !!this.phone && !!this.phone.trim()
        if ( !b ) this.consentToCall = false
        return b
    }

    // -----------------------------------
    // photo-gallery

    get canTakePhoto() {
        return this.images.length < 3
    }

    onTakePhoto() {
        this.changePage('photo-camera')
    }

    // -----------------------------------
    // photo-camera

    onSnapshot( snap: Snapshot ) {
        this.snapshot = {
            url: snap.image,
            heading: snap.heading,
        }

        if ( !this.hasHeading )
            this.heading = snap.heading

        this.onNavigateNext()
        this.cdr.detectChanges()
    }

    onCancelPhoto( error: any) {
        if (error){
            this.onNavigateBack()
            if (error == 'User denied access to camera') {
                error = 'User denied access to camera. You need to allow the BC Wildfire application to access your camera in your Settings'
            }
            this.snackbarService.openFromComponent(WFSnackbarComponent,getSnackbarConfig(error,'warning'))
        }
    }

    // -----------------------------------
    // fire-location

    initMap(smk: any) {
        console.log('initMap')

        const L = window[ 'L' ]
        const T = window[ 'turf' ]

        const loc = {
            type: 'Point',
            coordinates: [ this.location.coords.longitude, this.location.coords.latitude ]
        };

        smk.showFeature( 'location', loc, {
            pointToLayer: function ( geojson, latlng ) {
                return L.marker( latlng, {
                    icon: L.divIcon( {
                        className:  'rof-location',
                        iconSize:   [ 20, 20 ],
                        iconAnchor: [ 14, 14 ]
                    } )
                } )
            }
        } )

        let map = smk.$viewer.map

        map.on( "zoom", () => {
            connector()
        } )
        map.on( "move", () => {
            connector()
        } )

        let connector = () => {
            let photo = map.getCenter(),
                loc = [ this.location.coords.longitude, this.location.coords.latitude ] as LonLat

            this.fireLocation = [ photo.lat, photo.lng ]

            arrow( smk, loc, [ photo.lng, photo.lat ] )
        }

        connector()
    }

    // -----------------------------------
    // fire-details

    onBurningUnknown( unknown ) {
        if ( !unknown ) return

        this.burning.Brush = false
        this.burning.Grass = false
        this.burning["Mixed Wood"] = false
        this.burning.Other = false
        this.burning.Slash = false
        this.burning.Trees = false
    }

    onSmokeUnknown( notApplicable, unknown ) {
        if ( !notApplicable && !unknown ) return

        this.smoke.Black = false
        this.smoke.Blue = false
        this.smoke.Brown = false
        this.smoke.Grey = false
        this.smoke.White = false
    }

    // -----------------------------------
    // other-info

    onAssetsAtRiskNone( noneAtRisk, unknownAtRisk ) {
        if ( !noneAtRisk && !unknownAtRisk ) return

        this.assetsAtRisk.Bridges = false
        this.assetsAtRisk['Homes/Buildings'] = false
        this.assetsAtRisk.Powerlines = false
        this.assetsAtRisk.Railway = false
    }

    onSignsOfResponseNone( noneSigns ) {
        if ( !noneSigns ) return

        this.signsOfResponse['Heavy Equipment'] = false
        this.signsOfResponse.Helicopter = false
        this.signsOfResponse.Sirens = false
        this.signsOfResponse['Truck/Personnel'] = false
    }

    // -----------------------------------
    // info-submit

    submitFireReport(): Promise<any> {
        let body = new FormData()
        body.append( 'resource', JSON.stringify( this.getFireReport() ) )

        return this.images.reduce( ( pr, img, i ) => {
            return pr.then( () => {
                // return fetch( img )
                //     .then( res => res.blob() )
                //     .then( blob => body.append( `image${ i + 1 }`, blob ) )
                body.append( `image${ i + 1 }`, img.url )
            } )
        }, Promise.resolve() ).then( () => {
            let url = this.appConfigService.getAppResourcesConfig().fireReportApi
            let key = this.appConfigService.getAppResourcesConfig().apiKey
            return this.http.post( url, body, {
                // headers: new HttpHeaders( {
                //     'x-api-key': key
                // } ),
                responseType: 'text'
            } ).toPromise()
        } )
    }

    getFireReport() {
        let heading = window[ 'turf' ].bearing(
            [ this.location.coords.longitude, this.location.coords.latitude ],
            [ this.fireLocation[ 1 ], this.fireLocation[ 0 ] ]
        )

        return {
            fullName: this.name,
            phoneNumber: this.phone,
            consentToCall: this.consentToCall,
            heading: heading,
            fireLocation: this.fireLocation,
            fireSize: this.fireSize,
            rateOfSpread: this.spreadRate,
            visibleFlame: checkedKeys( this.visibleFlame ),
            burning: checkedKeys( this.burning ),
            smokeColor: checkedKeys( this.smoke ),
            weather: checkedKeys( this.weather ),
            assetsAtRisk: checkedKeys( this.assetsAtRisk ),
            signsOfResponse: checkedKeys( this.signsOfResponse ),
            otherInfo: this.otherInfo,
            attachments: this.images.map( ( img ) => {
                return {
                    heading: heading,
                    latitude: this.location.coords.latitude,
                    longitude: this.location.coords.longitude,
                    elevation: this.location.coords.altitude
                }
            } )
        }

        function checkedKeys( obj: object ): string[] {
            return Object.entries( obj ).reduce( ( a, [ k, v ] ) => {
                if ( !v ) return a
                return a.concat( k )
            }, [] )
        }
    }

    selectFireDistance(distance: string) {
        this.distanceEstimateMeter = Number(distance);
    }

    exitReporFire() {
        this.dialog.open(WarningDialogComponent);
    }
}

type LonLat = [ number, number ]
type LatLon = [ number, number ]

export function toLatLon(lonLat: LonLat): LatLon {
    return [lonLat[1], lonLat[0]];
}

// start -----> end
function arrow( smk: any, start: LonLat, end: LonLat ) {
    const L = window[ 'L' ]
    const T = window[ 'turf' ]
    const view = smk.$viewer.getView()
    const lineStartOffsetPx = 15
    const lineEndOffsetPx = 35

    let arrowLine = T.lineString( [ start, end ] )
    let arrowLen = T.length( arrowLine )
    let arrowLenPx = arrowLen * 1000 / view.metersPerPixel

    if ( arrowLenPx >= 2 * ( lineStartOffsetPx + lineEndOffsetPx ) ) {
        let startOffset = view.metersPerPixel * lineStartOffsetPx / 1000
        let endOffset = view.metersPerPixel * lineEndOffsetPx / 1000

        let headPt = T.along( T.lineString( [ end, start ] ), endOffset )
        let headRot = T.bearing( headPt.geometry.coordinates, end )

        smk.showFeature( 'arrow-head', headPt, {
            pointToLayer: function ( geojson, latlng ) {
                return L.marker( latlng, {
                    icon: L.divIcon( {
                        className:  'rof-arrow-head',
                        html:       `<i class="material-icons" style="transform:rotateZ(${ headRot }deg);">navigation</i>`,
                        iconSize:   [ 24, 24 ],
                        iconAnchor: [ 12, 12 ]
                    } ),
                    interactive: false
                } )
            }
        } )

        let startPt = T.along( T.lineString( [ start, headPt.geometry.coordinates ] ), startOffset ).geometry.coordinates
        let line = T.lineString( [ startPt, headPt.geometry.coordinates ] )

        smk.showFeature( 'arrow-line', line, {
            style: function () {
                return {
                    color: 'yellow',
                    weight: 5,
                    lineCap: 'butt',
                    interactive: false
                }
            },
            onEachFeature: function ( ft, ly ) {
                ly.bindTooltip( formatDist( arrowLen ) + " km", {
                    permanent: true
                } )
            }
        } )

        smk.showFeature( 'arrow-line-shadow', line, {
            style: function () {
                return {
                    color: 'rgba(0,0,0,36%)',
                    weight: 7,
                    lineCap: 'butt',
                    interactive: false
                }
            }
        } )
    }
    else {
        smk.showFeature( 'arrow-head' )
        smk.showFeature( 'arrow-line' )
        smk.showFeature( 'arrow-line-shadow' )
    }
}

function formatDist( dist: number ): string {
    if ( dist == null ) return ''

    var rounded = parseFloat( dist.toPrecision( 6 ) )
    var a = Math.abs( rounded ),
        s = Math.sign( rounded ),
        i = Math.floor( a ),
        f = a - i

    return ( s * i ).toLocaleString() + f.toFixed( 3 ).substr( 1 )
}
