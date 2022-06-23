import { DatePipe } from "@angular/common";
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AppConfigService, IncidentType, WFIM_WINDOW_NAME, WindowMessagingService } from '@wf1/core-ui';
import {
    AttachmentResource,
    IncidentAttachmentService,
    IncidentAttachmentsService,
    IncidentCommentListResource,
    IncidentCommentResource,
    PublicReportOfFireResource,
    WildfireIncidentResource
} from '@wf1/incidents-rest-api';
import * as moment from 'moment';
import { convertIncidentToSimpleIncident } from "../../../../conversion/conversion-validation-from-rest";
import { ApplicationStateService } from "../../../../services/application-state.service";
import { WfimMapService } from "../../../../services/wfim-map.service";
import { RootState } from '../../../../store';
import * as IncidentActions from '../../../../store/im/im.actions';
import {
    selectActiveIncident,
    selectActiveIncidentComments,
    selectActiveIncidentRofs
} from "../../../../store/im/im.selectors";
import { LoadIncidentItem } from "../../../../store/map/map.actions";
import { getCodeLabel, getIncidentIcon } from "../../../../utils";
import { PhotoGalleryComponent } from "../../../core/photo/photo-gallery/photo-gallery.component";
import { PointIdRoutes } from "../../../point-id/point-id-route-definitions";
import { ROFRoutes } from "../../../rof/rof-route-definitions";
import { IncidentRoutes } from '../../incident-route-definitions';

@Component({
    selector: 'wfim-incident-detail',
    templateUrl: './incident-detail.component.html',
    styleUrls: ['./incident-detail.component.scss']
})
export class IncidentDetailComponent implements OnInit, OnDestroy {
    public TOOLTIP_DELAY = 500;

    defaultIncidentType = IncidentType.DEFAULT;
    wildfireYear: number;
    incidentNumberSequence: number;
    incident: WildfireIncidentResource;
    comments: IncidentCommentListResource[];
    rofs: PublicReportOfFireResource[];
    tableDef: any[] = [];
    tableHeaders: string[] = [];
    dataSource = new MatTableDataSource([]);
    loading: boolean = false;
    gallery

    constructor(
        private appConfigService: AppConfigService,
        private store: Store<RootState>,
        private router: Router,
        private route: ActivatedRoute,
        private messagingService: WindowMessagingService,
        private applicationStateService: ApplicationStateService,
        protected wfimMapService: WfimMapService,
        protected incidentAttachmentsService: IncidentAttachmentsService,
        protected incidentAttachmentService: IncidentAttachmentService,
    ) { }

    ngOnDestroy(): void {
        this.wfimMapService.clearSimpleIncidents(true)
    }

    ngOnInit() {
        this.route.paramMap.subscribe( params => {
            this.wildfireYear = parseInt(params.get('wildfireYear'));
            this.incidentNumberSequence = parseInt(params.get('incidentNumberSequence'));
            this.loadIncident(this.wildfireYear, this.incidentNumberSequence);
        });

        this.store.pipe(select(selectActiveIncident())).subscribe( (incident: WildfireIncidentResource) => {
            // Grab the incident from the incident list, if found.
            this.incident = incident;
            this.loading = false;

            this.store.dispatch(new LoadIncidentItem([convertIncidentToSimpleIncident(this.incident)]));
        });

        this.store.pipe(select(selectActiveIncidentComments())).subscribe( (incidentComments: IncidentCommentResource[]) => {
            this.comments = incidentComments;
            this.dataSource = new MatTableDataSource<any>(this.comments);
        });

        this.store.pipe(select(selectActiveIncidentRofs())).subscribe( (incidentRofs: PublicReportOfFireResource[]) => {
            this.rofs = incidentRofs;
        });

        this.getTableDef();
        this.subscribeLoading();
    }

    getIconType() {
        return getIncidentIcon(this.incident.incidentTypeCode);
    }

    getROFLinkLabel(rof: PublicReportOfFireResource): string {
        let label;
        let receivedTimestamp = moment(rof.receivedTimestamp);
        let formattedReceivedTimestamp = receivedTimestamp.format('DD/MM/YYYY-HH:mm:ss')
        label = `${rof.reportOfFireLabel} ${formattedReceivedTimestamp} ${rof.receivedByUserId}`;
        return label;
    }

    getLabel(table: string, value: string): string {
        return getCodeLabel(table, value);
    }

    public isGeneralStaff() {
        return this.applicationStateService.isGeneralStaff();
    }

    public canLoadComments() {
        return !this.isGeneralStaff();
    }

    public canManageIncident() {
        return !this.isGeneralStaff();
    }

    public canDisplayNonReadOnlyFields() {
        return !this.isGeneralStaff();
    }

    loadIncident(wildfireYear, incidentNumberSequence) {
        this.loading = true;
        this.store.dispatch(new IncidentActions.IncidentLoadAction(wildfireYear, incidentNumberSequence));
        if (this.canLoadComments()) {
            this.store.dispatch(new IncidentActions.IncidentCommentLoadAction(wildfireYear, incidentNumberSequence));
        }
        this.store.dispatch(new IncidentActions.IncidentRofsLoadAction(wildfireYear, incidentNumberSequence));
    }

    formatIncident(incident: WildfireIncidentResource) {
        return {
            icon: 'incident',
            time: moment(incident.discoveryTimestamp),
            title: incident.incidentName,
            info: [
                { label: 'Zone:', value: incident.zoneOrgUnitName },
                { label: 'Status:', value: incident.incidentStatusCode },
                { label: 'IC:', value: incident.incidentCommanderName },
                { label: 'Location:', value: (incident.incidentLocation) ? incident.incidentLocation.geographicDescription : '' },
                { label: 'Size:', value: incident.incidentSituation.fireSizeHectares },
            ]
        };
    }

    subscribeLoading() {
        this.store.pipe(select('incidentManagementMap', 'loading')).subscribe(loading => this.loading = loading);
    }

    viewList() {
        this.router.navigate([IncidentRoutes.LIST]);
    }

    refresh() {
        this.loadIncident(this.wildfireYear, this.incidentNumberSequence);
    }

    navigateToPointID() {
        const coords = this.incident.incidentLocation.incidentLocationPoint.coordinates as [number, number];
        this.router.navigate([PointIdRoutes.POINT_ID], { queryParams: { showPreviousPageNav: true, placeAnchorOnMap: true, coords: coords } });
    }

    getInterfaceClass() {
        let interfaceClass;
        if (this.incident.incidentSituation) {
            interfaceClass = (this.incident.incidentSituation.interfaceFireInd)
                ? 'incident-detail-identification-details-interface-fire'
                : 'incident-detail-identification-details-non-interface-fire';
        } else {
            interfaceClass = 'incident-detail-identification-details-interface-not-set';
        }

        return interfaceClass;
    }

    locateOnMap() {
        if (this.incident?.incidentLocation?.incidentLocationPoint?.coordinates)
            return this.wfimMapService.zoomToPoint(this.incident.incidentLocation.incidentLocationPoint.coordinates)

        console.error(`No coordinates found for incident: ${this.wildfireYear}-${this.incidentNumberSequence}`);
    }

    openIncident() {
        let windowId = this.messagingService.getWindowId(WFIM_WINDOW_NAME);
        if (!windowId) {
            // TODO: Simplify this logic when the external app is separated into it's own code base, and we stop using the named outlet.
            // Presently, we have to insert the parameters before the closing parenthesis of the WFIM url.
            const originalUrl = this.appConfigService.getConfig().externalAppConfig.im.url;
            const urlRoot = originalUrl.substring(0, originalUrl.length - 1);
            const url = `${urlRoot}/${this.wildfireYear}/${this.incidentNumberSequence})`;
            this.messagingService.openWindow(url, WFIM_WINDOW_NAME);
        } else {
            this.messagingService.focusWindow(windowId);
            this.messagingService.broadcastAction(windowId, new IncidentActions.OpenIncidentTabAction(this.incident));
        }
    }

    openROFDetails(rof: PublicReportOfFireResource) {
        if (rof && rof.wildfireYear && rof.reportOfFireNumber) {
            this.router.navigate([ROFRoutes.DETAIL, rof.wildfireYear, rof.reportOfFireNumber]);
        }
    }

    getTableDef() {
        this.tableDef = [
            {
                title: 'Author',
                name: 'commenterName',
                prop: (row: IncidentCommentResource) => row.commenterName
            },
            // {
            //   title: 'Type',
            //   name: 'commentType',
            //   prop: (row: IncidentCommentResource) => row.systemGeneratedCommentInd ? 'Event' : 'Comment'
            // },
            {
                title: 'Time',
                name: 'enteredTimestamp',
                prop: (row: IncidentCommentResource) => new DatePipe('en-US').transform(new Date(row.enteredTimestamp), 'yyyy-MM-dd HH:mm:ss')
            },
            {
                title: 'Comment',
                name: 'comment',
                prop: (row: IncidentCommentResource) => row.comment
            }
        ];

        this.tableHeaders = this.tableDef.map(column => column.name);
    }

    get initGallery() {
        return ( inst: PhotoGalleryComponent ) => {
            console.log( 'initGallery', inst )
            this.gallery = inst
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
        return () => {
            /**
             * Get Incident Attachments.
             * Get list of Incident Attachments.
             * @param wildfireYear The wildfireYear of the Wildfire Incident resource.
             * @param incidentNumberSequence The incidentNumberSequence of the Wildfire Incident resource.
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
            return this.incidentAttachmentsService.getIncidentAttachmentList(
                '' + this.incident.wildfireYear,
                '' + this.incident.incidentNumberSequence,
                'false',
                undefined,
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
            ).toPromise().then( ( docs ) => {
                return docs.collection
            } )
        }
    }

}
