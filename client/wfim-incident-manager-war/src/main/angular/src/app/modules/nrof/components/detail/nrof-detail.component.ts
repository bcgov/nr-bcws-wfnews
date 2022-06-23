import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import {
    AppConfigService,
    IconSize, WFNROF_WINDOW_NAME, WindowMessagingService
} from '@wf1/core-ui';
import { ProvisionalZoneResource, PublicReportOfFireCommentResource } from '@wf1/incidents-rest-api';
import * as moment from 'moment';
import { WfimMapService } from '../../../../services/wfim-map.service';
import { RootState } from '../../../../store';
import * as NrofActions from '../../../../store/nrof/nrof.actions';
import { selectActiveNROF } from '../../../../store/nrof/nrof.selectors';
import { NrofComment } from "../../../../store/nrof/nrof.state";
import { durationToExpire, getCodeLabel } from "../../../../utils";
import { NROFRoutes } from '../../nrof-route-definitions';

@Component({
    selector: 'wfim-nrof-detail',
    templateUrl: './nrof-detail.component.html',
    styleUrls: ['./nrof-detail.component.scss']
})
export class NROFDetailComponent implements OnInit {
    public TOOLTIP_DELAY = 500;

    tableDef: any[] = [];
    tableHeaders: string[] = [];
    provisionalZoneGuid: string;
    nrof: ProvisionalZoneResource;
    comments: NrofComment[];
    dataSource = new MatTableDataSource([]);
    loading: boolean = false;
    defaultOpenPanel: boolean = true;
    icon = {};
    expires = '';

    constructor(
        private appConfigService: AppConfigService,
        private store: Store<RootState>,
        private router: Router,
        private route: ActivatedRoute,
        private messagingService: WindowMessagingService,
        protected wfimMapService: WfimMapService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(
            (params => {
                this.provisionalZoneGuid = params.get('provisionalZoneGuid');
                this.loadNROF(this.provisionalZoneGuid);
            })
        );

        this.store.pipe(select(selectActiveNROF())).subscribe(
            (nrof: ProvisionalZoneResource) => {
                this.nrof = nrof;
                if (this.nrof) {
                    let expiry = moment(this.nrof.expiryTimestamp);
                    let now = moment();
                    let duration = moment.duration(expiry.diff(now));

                    this.expires = durationToExpire(duration);
                }

                this.loading = false;
                if (this.nrof) {
                    this.loadNROFIcon();
                }
            }
        );

        this.subscribeLoading();
        this.getTableDef();
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

    loadNROFIcon() {
        let iconColourCode;
        const iconIsBlinking = false;
        const iconIsCancelled = false;
        const iconIsAssignedToIncident = false;

        this.icon = {
            iconType: this.expires == "Expired" ? 'no-more-report-of-fire-dark' : 'no-more-report-of-fire-light',
            iconSize: IconSize.TOOLBAR,
            colourCode: iconColourCode,
            isBlinking: iconIsBlinking,
            isCancelled: iconIsCancelled,
            isAssignedToIncident: iconIsAssignedToIncident,
            hasHalo: true
        };
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

    loadNROF(provisionalZoneGuid) {
        this.loading = true;
        this.store.dispatch(new NrofActions.NROFLoadAction(provisionalZoneGuid));
    }

    subscribeLoading() {
        this.store.pipe(select('nrofMap', 'loading')).subscribe(loading => this.loading = loading);
    }

    viewList() {
        this.router.navigate([NROFRoutes.LIST]);
    }

    refresh() {
        this.loadNROF(this.provisionalZoneGuid);
    }

    getNROFClass() {
        // if (this.nrof && this.nrof.publicReportTypeCode) {
        // 	const code = this.nrof.publicReportTypeCode;
        // 	switch (code) {
        // 		case 'GENERAL_VALIDATION': {
        // 			return 'wf-nrof-general-color';
        // 		}
        // 		case 'CIGARETTE': {
        // 			return 'wf-nrof-cigarette-color';
        // 		}
        // 		case 'INTERFACE': {
        // 			return 'wf-nrof-interface-color';
        // 		}
        // 		case 'CAMPFIRE': {
        // 			return 'wf-nrof-campfire-color';
        // 		}
        // 		default:
        // 			return;
        // 	}
        //}
    }

    locateOnMap() {
        if (this.nrof && this.nrof.provisionalZonePolygonSpecifiedInd && this.nrof.provisionalZonePolygon && this.nrof.provisionalZonePolygon.coordinates)
            return this.wfimMapService.zoomToGeometry(this.nrof.provisionalZonePolygon)

        console.error(`No coordinates found for nrof: ${this.nrof.provisionalZoneIdentifier}`);
    }


    selectPolygon() {
        return this.wfimMapService.clearSelectedPolygon().then(() => {
            return this.wfimMapService.activateTool( 'MarkupTool--polygon' )
        })
    }

    openNROF() {
        let windowId = this.messagingService.getWindowId(WFNROF_WINDOW_NAME);
        if (!windowId) {
            const originalUrl = this.appConfigService.getConfig().externalAppConfig.nrof.url;
            windowId = this.messagingService.openWindow(originalUrl, WFNROF_WINDOW_NAME);
            setTimeout(() => {
                this.messagingService.broadcastAction(windowId, new NrofActions.OpenNrofTabAction(this.nrof));
            }, 5000);

        } else {
            this.messagingService.focusWindow(windowId);
            this.messagingService.broadcastAction(windowId, new NrofActions.OpenNrofTabAction(this.nrof));
        }
    }

}
