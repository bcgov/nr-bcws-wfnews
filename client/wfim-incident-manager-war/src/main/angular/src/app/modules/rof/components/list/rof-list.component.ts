import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { select } from '@ngrx/store';
import {
    DefaultSort,
    FilterConfig, SearchActions,
    SortOption,
    WFROF_WINDOW_NAME
} from '@wf1/core-ui';
import {
    PublicReportOfFireResource, SimpleReportOfFireResource
} from '@wf1/incidents-rest-api';
import { forkJoin } from 'rxjs';
import { MarkerLayerBaseComponent } from "../../../../components/marker-layer-base.component";
// import { selectMapCurrentState } from "../../../../store/map/map.selectors";
import * as RofActions from '../../../../store/rof/rof.actions';
import { ROF_MAP_COMPONENT_ID } from "../../../../store/rof/rof.state";
import {
    formatFilter,
    formatFilterOptions,
    getCodeLabel,
    getCodeOptions,
    getOrgCodeOptions,
    getZoneOptions,
    isEmpty
} from "../../../../utils";
import { ROFRoutes } from '../../rof-route-definitions';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wfim-rof-list',
    templateUrl: './rof-list.component.html',
    styleUrls: ['./rof-list.component.scss','../../../../components/marker-layer-base.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ROFListComponent extends MarkerLayerBaseComponent implements OnInit, OnDestroy, AfterViewInit {
    componentId = ROF_MAP_COMPONENT_ID; //Used to identify search component for managing multiple search stores
    rofLayerId = 'rof';

    loading: boolean = false;
    firstLoad = true;
    readonly defaultSort: DefaultSort = { param: 'submittedOrReceivedTimestamp', direction: 'DESC' };
    sortOptions: SortOption[] = [
        { label: 'Submitted Date', param: 'submittedOrReceivedTimestamp' },
        { label: 'ROF Number', param: 'reportOfFireNumber' },
        { label: 'Fire Centre', param: 'fireCentreOrgUnitName' }
    ];

    filterOptions: FilterConfig[] = [];

    readonly defaultActiveFilters = { messageStatusCode: ['Submitted', 'Acknowledged'], submittedAsOfTimestamp: ['L30D'] };

    construct() {
        super.construct()

        this.router.events.subscribe( ( ev ) => {
            if ( !( ev instanceof NavigationEnd ) ) return

            let navEv = ev as NavigationEnd
            if ( navEv.urlAfterRedirects.endsWith( '/' + ROFRoutes.LIST ) ) {
                this.wfimMapService.setRofsVisible( true )
            }
        } )
    }

    ngOnInit() {
        super.ngOnInit();
        this.getFilters();
        this.subscribeLoading();

        // this.store.select(selectMapCurrentState()).subscribe((state) => {
        //     if (state) {
        //         if (this.isRofListRoute()) {
        //             this.mapPersistedState = state;
        //             this.detectChanges();

        //             this.wfimMapService.mapReady().then(() => {
        //                 if (this.rofLayerVisible())
        //                     this.loadRofMarkers();
        //             })
        //         }
        //     }
        // });
    }

    ngAfterViewInit() {
        this.loadFireReports();

        this.store.pipe(select('rof', 'simpleRofs')).subscribe( (simpleRofs: SimpleReportOfFireResource[]) => {
            if (this.isRofListRoute()) {
                this.simpleRofs = simpleRofs;
            }
        } );

        this.store.pipe(select('rof', 'newSimpleRofs')).subscribe( (simpleRofs: SimpleReportOfFireResource[]) => {
            if (this.isRofListRoute()) {
                if (simpleRofs && simpleRofs.length > 0) {
                    let rofs: PublicReportOfFireResource[] = [];
                    forkJoin(this.getBatchReportOfFire(simpleRofs)).subscribe((values) => {
                        rofs = values;
                        this.store.dispatch(new RofActions.ROFSyncAction(rofs));
                    });
                }

            }
        });

        this.store.pipe(select('rof', 'rofs')).subscribe( (rofs: PublicReportOfFireResource[]) => {
            if (this.isRofListRoute()) {
                this.updateFireReports(rofs);

                this.wfimMapService.mapReady().then(() => {
                    if (this.rofLayerVisible())
                        this.loadRofMarkers();
                })
            }
        });
    }

    ngOnDestroy() {
        this.wfimMapService.clearHighlight()
    }

    setDefaultFilters() {
        this.store.dispatch(new SearchActions.UpdateActiveFiltersAction(this.defaultActiveFilters, this.componentId));
    }

    public canOpenIncidentScreen() {
        return !this.applicationStateService.isGeneralStaff();
    }

    public openRofScreen() {
        if (this.canOpenIncidentScreen()) {
            let windowId = this.messagingService.getWindowId(WFROF_WINDOW_NAME);
            if (!windowId) {
                this.messagingService.openWindow(this.appConfigService.getConfig().externalAppConfig.rof.url, WFROF_WINDOW_NAME);
            } else {
                this.messagingService.focusWindow(windowId);
            }
        }
    }

    setDefaultSort() {
        this.store.dispatch(new SearchActions.UpdateSortAction(this.defaultSort.param, this.defaultSort.direction, this.componentId));
    }

    getCustomTimeFilters() {
        const options =
            [
                { label: 'Last 24 hours', value: 'L24H' },
                { label: 'Last 7 days', value: 'L7D' },
                { label: 'Last 30 days', value: 'L30D' },
                { label: 'Last 365 days', value: 'L365D' }
            ]

        return formatFilter('Time', 'submittedAsOfTimestamp', options, 'single');
        // return formatFilter('Time', 'submittedOrReceivedTimestamp', options, 'single');
    }

    getFilters() {
        this.filterOptions = [
            formatFilter('Type', 'publicReportTypeCode', formatFilterOptions(getCodeOptions('PUBLIC_REPORT_TYPE_CODE'))),
            formatFilter('Status', 'messageStatusCode', formatFilterOptions(getCodeOptions('MESSAGE_STATUS_CODE'))),
            formatFilter('Fire Centre', 'fireCentreOrgUnitIdentifier', formatFilterOptions(getOrgCodeOptions('FIRE_CENTRE_CODE'))),
            formatFilter('Fire Zone', 'zoneOrgUnitIdentifier', formatFilterOptions(getOrgCodeOptions('ZONE_CODE'))),
            this.getCustomTimeFilters()
        ];
        this.subscribeSearchFilters();
    }

    getLabel(table: string, value: string): string {
        return getCodeLabel(table, value);
    }

    subscribeLoading() {
        this.store.pipe(select('rof', 'loading')).subscribe(loading => {
            this.loading = loading;
            this.detectChanges();
        });
    }

    subscribeSearchFilters() {
        this.store.pipe(select(ROF_MAP_COMPONENT_ID, 'filters')).subscribe(
            filters => {
                if (this.firstLoad) {
                    if (!filters || isEmpty(filters)) {
                        this.setDefaultSort();
                        this.setDefaultFilters();
                    }
                }
                // if(!this.firstLoad) { this.retrievingRofMarkers = true; }
                const zoneOrgUnitIndex = this.filterOptions.findIndex((value) => value.param === 'zoneOrgUnitIdentifier');

                let zones = getZoneOptions(this.store, this.componentId, filters, this.filterOptions, this.firstLoad);
                this.filterOptions[zoneOrgUnitIndex].options = formatFilterOptions(zones);

                // this seeming no-op tricks the change detection into seeing filterOptions as different
                this.filterOptions = [].concat(this.filterOptions)

                this.changeDetectorRef.markForCheck()

                if (this.firstLoad) {
                    this.firstLoad = false;
                    this.store.dispatch(new SearchActions.UpdateActiveFiltersAction(filters, this.componentId));
                }
            }
        );
    }
}
