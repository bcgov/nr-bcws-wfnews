import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import {
    AppConfigService,
    IconSize,
    ReportOfFireType,
    SpatialUtilsService,
    WFROF_WINDOW_NAME,
    WindowMessagingService
} from '@wf1/core-ui';
import {
    AttachmentListResource,
    AttachmentResource,
    ForestFuelResource,
    PublicReportOfFireCommentResource,
    PublicReportOfFireResource,
    ReportOfFireAttachmentsService
} from '@wf1/incidents-rest-api';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ApplicationStateService } from "../../../../services/application-state.service";
import { WfimMapService } from '../../../../services/wfim-map.service';
import { LonLat, toLatLon } from '../../../../services/wfim-map.service/util';
import { RootState } from '../../../../store';
import { LoadRoFItem } from "../../../../store/map/map.actions";
import * as RofActions from '../../../../store/rof/rof.actions';
import { selectActiveROF, selectActiveROFComments } from '../../../../store/rof/rof.selectors';
import { RofComment } from "../../../../store/rof/rof.state";
import { copyToClipboard, getCodeLabel } from "../../../../utils";
import { PhotoFilter } from '../../../core/photo/photo-gallery/photo-gallery.component';
import { IncidentRoutes } from '../../../incident-management/incident-route-definitions';
import { PointIdRoutes } from "../../../point-id/point-id-route-definitions";
import { ROFRoutes } from '../../rof-route-definitions';


@Component({
    selector: 'wfim-rof-detail',
    templateUrl: './rof-detail.component.html',
    styleUrls: ['./rof-detail.component.scss']
})
export class ROFDetailComponent implements OnInit, OnDestroy {
    public TOOLTIP_DELAY = 500;

    tableDef: any[] = [];
    tableHeaders: string[] = [];
    wildfireYear: number;
    reportOfFireNumber: number;
    rof: PublicReportOfFireResource;
    comments: RofComment[];
    dataSource = new MatTableDataSource([]);
    loading: boolean = false;
    defaultOpenPanel: boolean = true;
    icon = {};
    viewSubscription: Subscription
    attachments: AttachmentResource[]
    showPhotoMarkersTimeoutId

    constructor(
        private appConfigService: AppConfigService,
        private store: Store<RootState>,
        private router: Router,
        private route: ActivatedRoute,
        private spatialUtils: SpatialUtilsService,
        private messagingService: WindowMessagingService,
        private snackbar: MatSnackBar,
        private applicationStateService: ApplicationStateService,
        protected wfimMapService: WfimMapService,
        protected reportOfFireAttachmentsService: ReportOfFireAttachmentsService
        // protected reportOfFireAttachmentService: ReportOfFireAttachmentService,
    ) { }

    ngOnDestroy(): void {
        this.wfimMapService.clearRofs(true)

        if (this.viewSubscription)
            this.viewSubscription.unsubscribe()

        this.attachments = null
        this.showPhotoMarkers(false)
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.wildfireYear = parseInt(params.get('wildfireYear'));
            this.reportOfFireNumber = parseInt(params.get('reportOfFireNumber'));
            // console.log('params',this.wildfireYear, this.reportOfFireNumber);
            this.loadROF(this.wildfireYear, this.reportOfFireNumber);
        });

        this.store.pipe(select(selectActiveROF())).subscribe((rof: PublicReportOfFireResource) => {
            if (!rof && !this.loading) {
                this.router.navigate([ROFRoutes.LIST])
            }

            // console.log('got rof',rof.wildfireYear, rof.reportOfFireNumber)
            this.rof = rof;
            this.loading = false;
            this.showPhotoMarkers()
            if (this.rof) {
                this.loadROFIcon();
                // this.store.dispatch(new LoadRoFItem([this.rof]));
            }
        });

        this.store.pipe(select(selectActiveROFComments())).subscribe((rofComments: RofComment[]) => {
            this.comments = rofComments;
            this.dataSource = new MatTableDataSource<any>(this.comments);
        });

        this.subscribeLoading();
        this.getTableDef();

        this.viewSubscription = this.wfimMapService.viewChange.subscribe((view) => {
            this.showPhotoMarkers()
            // console.log( view )
        })
    }

    public isGeneralStaff() {
        return this.applicationStateService.isGeneralStaff();
    }

    public canLoadComments() {
        return !this.isGeneralStaff();
    }

    public canManageROF() {
        return !this.isGeneralStaff();
    }

    public canShare() {
        return !this.isGeneralStaff();
    }

    public canDisplayNonReadOnlyFields() {
        return !this.isGeneralStaff();
    }

    getTableDef() {
        this.tableDef = [
            {
                title: 'Author',
                name: 'commenterName',
                prop: (row: PublicReportOfFireCommentResource) => row.commenterName
            },
            // {
            // 	title: 'Type',
            // 	name: 'commentType',
            // 	prop: (row: PublicReportOfFireCommentResource) => row.systemGeneratedCommentInd ? 'Event' : 'Comment'
            // },
            {
                title: 'Time',
                name: 'enteredTimestamp',
                prop: (row: PublicReportOfFireCommentResource) => new DatePipe('en-US').transform(new Date(row.enteredTimestamp), 'yyyy-MM-dd HH:mm:ss')
            },
            {
                title: 'Comment',
                name: 'comment',
                prop: (row: PublicReportOfFireCommentResource) => row.comment
            }
        ];

        this.tableHeaders = this.tableDef.map(column => column.name);
    }

    getLabel(table: string, value: string): string {
        return getCodeLabel(table, value);
    }

    public getLatLong(): string {
        return this.spatialUtils.formatCoordinates([this.rof.longitude, this.rof.latitude]);
    }

    loadROFIcon() {
        let iconColourCode;
        const iconIsBlinking = (this.rof.messageStatusCode === 'Submitted' || this.rof.messageStatusCode === 'Received');
        const iconIsCancelled = (this.rof.messageStatusCode === 'Cancelled');
        const iconIsAssignedToIncident = (this.rof.messageStatusCode === 'Assigned To Incident');

        if (this.rof.messageStatusCode === 'Draft' || this.rof.messageStatusCode === 'Received') {
            iconColourCode = 'wf1-rof-icon-draft';
        } else {
            switch (this.rof.publicReportTypeCode) {
                case 'GENERAL':
                    iconColourCode = ReportOfFireType.GENERAL;
                    break;
                case 'CAMPFIRE':
                    iconColourCode = ReportOfFireType.CAMPFIRE;
                    break;
                case 'CIGARETTE':
                    iconColourCode = ReportOfFireType.CIGARETTE;
                    break;
                case 'INTERFACE':
                    iconColourCode = ReportOfFireType.INTERFACE;
                    break;
                default:
                    iconColourCode = ReportOfFireType.DEFAULT;
            }
        }

        this.icon = {
            iconType: 'report-of-fire',
            iconSize: IconSize.TOOLBAR,
            colourCode: iconColourCode,
            isBlinking: iconIsBlinking,
            isCancelled: iconIsCancelled,
            isAssignedToIncident: iconIsAssignedToIncident,
            hasHalo: true
        };
    }

    getFireNumberLabel(): string {
        return `${this.rof.reportOfFireLabel}`;
    }

    getIncidentNumberLabel(): string {
        return (this.rof.incidentLabel) ? this.rof.incidentLabel : '';
    }

    getConcatenatedLabels(table: string, codes: any[]): string {
        let result = '';
        if (codes && codes.length > 0) {
            for (const code of codes) {
                if (table === 'FOREST_FUEL_CATEGORY_CODE') {
                    result = result.concat(',').concat(this.getLabel(table, (<ForestFuelResource>code).forestFuelCategoryCode));
                } else {
                    result = result.concat(',').concat(this.getLabel(table, code));
                }
            }
        }
        if (result.startsWith(',')) {
            result = result.substr(1, result.length - 1);
        }
        return result;
    }

    formatUserId(userId: string) {
        if (userId) {
            const delimiter = '\\';
            const indexOf = userId.indexOf(delimiter);
            if (indexOf > -1 && (indexOf + 1) < userId.length - 1) {
                return userId.substring(indexOf + 1);
            }
            return userId;
        }
        return "";
    }

    loadROF(wildfireYear, reportOfFireNumber) {
        this.loading = true;
        this.showPhotoMarkers(false)
        this.store.dispatch(new RofActions.ROFLoadAction(wildfireYear, reportOfFireNumber));
        if (this.canLoadComments()) {
            this.store.dispatch(new RofActions.ROFLoadCommentsAction(wildfireYear, reportOfFireNumber));
        }
    }

    subscribeLoading() {
        this.store.pipe(select('rof', 'loading')).subscribe(
            (loading) => {
                // console.log('loading',loading)
                this.loading = loading
            }
        );
    }

    viewList() {
        this.router.navigate([ROFRoutes.LIST]);
    }

    refresh() {
        this.loadROF(this.wildfireYear, this.reportOfFireNumber);
    }

    navigateToPointID() {
        const coords = this.rof.fireLocationPoint.coordinates as [number, number];
        this.router.navigate([PointIdRoutes.POINT_ID], { queryParams: { showPreviousPageNav: true, placeAnchorOnMap: true, coords: coords } });
    }


    getROFClass() {
        if (this.rof && this.rof.publicReportTypeCode) {
            const code = this.rof.publicReportTypeCode;
            switch (code) {
                case 'GENERAL': {
                    return 'wf-rof-general-color';
                }
                case 'CIGARETTE': {
                    return 'wf-rof-cigarette-color';
                }
                case 'INTERFACE': {
                    return 'wf-rof-interface-color';
                }
                case 'CAMPFIRE': {
                    return 'wf-rof-campfire-color';
                }
                default:
                    return;
            }
        }
    }

    locateOnMap() {
        if ( this.attachments.length > 0 ) {
            let T = window[ 'turf' ],
                geom = T.multiPoint(
                    this.attachments.map( att => [ att.longitude, att.latitude ] )
                        .concat( [ [ this.rof.longitude, this.rof.latitude ] ] )
                ),
                exp = T.transformScale( geom, 1.5 )
            return this.wfimMapService.zoomToGeometry( exp, true )
        }

        if (this.rof?.fireLocationPoint?.coordinates)
            return this.wfimMapService.zoomToPoint(this.rof.fireLocationPoint.coordinates,14)

        console.error(`No coordinates found for rof: ${this.wildfireYear}-${this.reportOfFireNumber}`);
    }

    share() {
        if (this.rof && this.canShare()) {
            let availForCallback = this.rof.availableForCallbackInd ? 'Yes' : 'No';

            let share =
                `ROF #: ${this.getFireNumberLabel()}
Status: ${asText(getCodeLabel('MESSAGE_STATUS_CODE', this.rof.messageStatusCode))}
Caller: ${asText(this.rof.callerName)}
Phone: ${asText(this.rof.callerTelephone)}
Available for 20 min callback: ${asBoolean(this.rof.availableForCallbackInd)}
Entered by: ${this.formatUserId(this.rof.receivedByUserId) + " - " + moment(this.rof.receivedTimestamp).format('Y-MM-DD HH:mm:s')}
Centre: ${asText(this.rof.fireCentreOrgUnitName)}
Zone: ${asText(this.rof.zoneOrgUnitName)}
Latitude/Longitude: ${this.getLatLong()}
Geographic Area: ${asText(this.rof.geographicAreaDescription)}
Relative Location: ${asText(this.rof.relativeLocationDescription)}
Directions to Fire and Other Comments: ${asText(this.rof.callerReportDetails)}
Type of Fire: ${asText(getCodeLabel('PUBLIC_REPORT_TYPE_CODE', this.rof.publicReportTypeCode))}
What is the fire burning: ${this.getConcatenatedLabels('FOREST_FUEL_CATEGORY_CODE', this.rof.reportedForestFuel)}
Smoke colour: ${this.getConcatenatedLabels('SMOKE_COLOUR_CODE', this.rof.smokeColourCodes)}
Fire Size: ${asText(getCodeLabel('FIRE_SIZE_COMPARISON_CODE', this.rof.fireSizeComparisionCode))}
Rate of Spread: ${asText(this.rof.rateOfSpreadCode)}
Weather: ${asText(this.rof.weatherDescription)}
Is Anyone Fighting the Fire: ${asText(this.rof.fireFightingProgressNote)}
Values threatened: ${asText(this.rof.valuesBeingThreatenedNote)}

WFIM URL: ${location.href}
`

            copyToClipboard(share);
            this.snackbar.open('ROF detail copied to clipboard.', null, { duration: 5000 });
        }
    }



    openROF() {
        let windowId = this.messagingService.getWindowId(WFROF_WINDOW_NAME);
        if (!windowId) {
            const originalUrl = this.appConfigService.getConfig().externalAppConfig.rof.url;
            // const url = `${originalUrl}/${this.wildfireYear}/${this.reportOfFireNumber})`;
            windowId = this.messagingService.openWindow(originalUrl, WFROF_WINDOW_NAME);
        } else {
            this.messagingService.focusWindow(windowId);
        }
        this.messagingService.broadcastAction(windowId, new RofActions.GetRof(this.rof.wildfireYear.toString(), this.rof.reportOfFireNumber.toString()));
    }

    openIncidentDetails() {
        if (this.rof && this.rof.incidentWildfireYear && this.rof.incidentNumberSequence) {
            this.router.navigate([IncidentRoutes.DETAIL, this.rof.incidentWildfireYear, this.rof.incidentNumberSequence]);
        }
    }

    // get attachmentUpdater() {
    //     return ( att: AttachmentResource ) => {
    //         return this.incidentAttachmentService.updateIncidentAttachment(
    //             '' + this.incident.wildfireYear,// wildfireYear: string,
    //             '' + this.incident.incidentNumberSequence,// incidentNumberSequence: string,
    //             att.attachmentGuid, // attachmentGuid: string,
    //             att
    //         )
    //     }
    // }

    get attachmentListUpdater() {
        return (filter: PhotoFilter) => {
            // console.log('load attachments',this.loading,this.wildfireYear,this.reportOfFireNumber)
            if (this.loading || !this.wildfireYear || !this.reportOfFireNumber) {
                this.attachments = []
                this.showPhotoMarkers()
                return Promise.resolve([])
            }

            /**
             * Get Report of Fire Attachments.
             * Get list of Report of Fire Attachments.
             * @param wildfireYear The wildfireYear of the Public Report of Fire resource.
             * @param reportOfFireNumber The reportOfFireNumber of the Public Report of Fire resource.
             * @param archived List archived attachments
             * @param privateIndicator List private attachments
             * @param sourceObjectNameCode The sourceObjectNameCode the results to be returned.
             * @param attachmentTypeCode The attachmentTypeCode the results to be returned.
             * @param uploadedByUserId The uploadedByUserId the results to be returned.
             * @param uploadedByByUserType The uploadedByByUserType the results to be returned.
             * @param uploadedByUserGuid The uploadedByUserGuid the results to be returned.
             * @param pageNumber The page number of the results to be returned.
             * @param pageRowCount The number of results per page.
             * @param orderBy Comma separated list of property names to order the result set by.
             * @param restVersion The version of the Rest API supported by the requesting client.
             * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
             * @param reportProgress flag to report request and response progress.
             */
            return this.reportOfFireAttachmentsService.getReportOfFireAttachmentList(
                '' + this.wildfireYear,
                '' + this.reportOfFireNumber,
                'false',
                'false',
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                '1000',
                undefined,
                undefined,
                'body',
                // reportProgress?: boolean
            ).toPromise().then((docs: AttachmentListResource) => {
                this.attachments = docs.collection
                this.showPhotoMarkers()
                // console.log('got attachments',this.wildfireYear,this.reportOfFireNumber,docs.collection.length)
                return docs.collection
            })
        }
    }

    showPhotoMarkers(show: boolean = true) {
        // console.log('showPhotoMarkers',show,this.wildfireYear,this.reportOfFireNumber,this.rof && [ this.rof.longitude, this.rof.latitude ],this.loading)
        const L = window['L']
        const T = window['turf']
        const lineStartOffsetPx = 15
        const lineEndOffsetPx = 25

        if (this.showPhotoMarkersTimeoutId)
            clearTimeout(this.showPhotoMarkersTimeoutId)

        this.showPhotoMarkersTimeoutId = setTimeout(() => {
            this.wfimMapService.clearTemporaryLayer('rof-attachments')
            if (!show) return
            if (!this.attachments) return

            let rofPt: LonLat = [this.rof.longitude, this.rof.latitude]

            let sec = 360 / this.attachments.length
            this.wfimMapService.getMapView().then((view) => {
                return this.wfimMapService.putTemporaryLayer('rof-attachments', () => {
                    let fts = this.attachments.reduce((acc, att, i) => {
                        let camPt: LonLat = [att.longitude, att.latitude]
                        if (!camPt[0] || !camPt[1]) {
                            let p = T.rhumbDestination(rofPt, 10, i * sec)
                            camPt = p.geometry.coordinates
                        }

                        let camera = L.marker(toLatLon(camPt), {
                            icon: L.divIcon({
                                className: 'wfim-rof-photo',
                                html: `<i class="material-icons">photo_camera</i>`,
                                iconSize: [24, 24],
                                iconAnchor: [12, 12]
                            })
                        })

                        let cameraLine = T.lineString([rofPt, camPt])
                        let cameraLen = T.length(cameraLine)
                        let cameraOffsetPx = cameraLen * 1000 / view.metersPerPixel

                        let tooltipEl = document.createElement('div')
                        let attTitle = att.attachmentTitle || ''
                        if (attTitle) attTitle = `<div>${attTitle}</div>`
                        tooltipEl.innerHTML = `${attTitle}<div>${formatNumber(cameraLen, 3, 1)} km</div>`
                        camera.bindTooltip(tooltipEl, {
                            className: 'rof-attachment',
                            permanent: cameraOffsetPx > 2 * (lineStartOffsetPx + lineEndOffsetPx),
                            direction: 'right',
                            offset: [10, 0],
                        })
                        camera.openTooltip(toLatLon(camPt))

                        if (cameraOffsetPx > lineEndOffsetPx)
                            acc = acc.concat(camera)

                        if (cameraOffsetPx >= 2 * (lineStartOffsetPx + lineEndOffsetPx)) {
                            let startOffset = view.metersPerPixel * lineStartOffsetPx / 1000
                            let endOffset = view.metersPerPixel * lineEndOffsetPx / 1000

                            let arrowPt = T.along(cameraLine, endOffset).geometry.coordinates
                            let arrowRot = T.bearing(arrowPt, rofPt)
                            let arrow = L.marker(toLatLon(arrowPt), {
                                icon: L.divIcon({
                                    className: 'wfim-rof-photo',
                                    html: `<i class="material-icons" style="transform:rotateZ(${arrowRot}deg);">navigation</i>`,
                                    iconSize: [24, 24],
                                    iconAnchor: [12, 12]
                                }),
                                interactive: false
                            })

                            let offsetCamPt = T.along(T.lineString([camPt, rofPt]), startOffset).geometry.coordinates

                            let line = L.polyline([toLatLon(arrowPt), toLatLon(offsetCamPt)], {
                                color: 'yellow',
                                weight: 3,
                                lineCap: 'butt',
                                interactive: false
                            })
                            let shadowLine = L.polyline([toLatLon(arrowPt), toLatLon(offsetCamPt)], {
                                color: 'rgba(0,0,0,36%)',
                                weight: 5,
                                lineCap: 'butt',
                                interactive: false
                            })

                            acc = acc.concat(shadowLine, arrow, line)
                        }

                        return acc
                    }, [])

                    return L.featureGroup(fts)
                })
            })

            this.showPhotoMarkersTimeoutId = null
        }, 500)
    }

}

function asText(val: any) {
    if (val == null) return ''
    return '' + val
}

function asBoolean(val: any, opt: { 'true'?: string, 'false'?: string, 'null'?: string } = {}) {
    opt = { 'true': 'Yes', 'false': 'No', 'null': 'No', ...opt }
    if (val == null) return opt.null
    return val ? opt.true : opt.false
}

function formatNumber(val: number, precision: number, fractionPlaces: number): string {
    if (val == null) return ''

    var rounded = parseFloat(val.toPrecision(precision))
    if (!fractionPlaces) return rounded.toLocaleString()

    var a = Math.abs(rounded),
        s = Math.sign(rounded),
        i = Math.floor(a),
        f = a - i
    return (s * i).toLocaleString() + f.toFixed(fractionPlaces).substr(1)
}
