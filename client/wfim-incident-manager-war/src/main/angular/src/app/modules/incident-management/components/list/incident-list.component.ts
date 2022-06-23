import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { select } from '@ngrx/store';
import {
    DefaultSort,
    FilterConfig,
    SearchActions,
    WFIM_WINDOW_NAME
} from '@wf1/core-ui';
import { Subject } from "rxjs";
import { MarkerLayerBaseComponent } from "../../../../components/marker-layer-base.component";
import { Option } from "../../../../store/code-data/code-data.state";
import { INCIDENT_COMPONENT_ID, INCIDENT_MAP_COMPONENT_ID } from "../../../../store/im/im.state";
// import { selectMapCurrentState } from "../../../../store/map/map.selectors";
import {
    formatFilter,
    formatFilterOptions, getCodeOptions, getIncidentStatusOptions,
    getOrgCodeOptions,
    getZoneOptions,
    isEmpty
} from "../../../../utils";
import { IncidentRoutes } from '../../incident-route-definitions';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wfim-incident-list',
    templateUrl: './incident-list.component.html',
    styleUrls: ['./incident-list.component.scss','../../../../components/marker-layer-base.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentListComponent extends MarkerLayerBaseComponent implements OnInit, OnDestroy, AfterViewInit {
    componentId: typeof INCIDENT_MAP_COMPONENT_ID | typeof INCIDENT_COMPONENT_ID = INCIDENT_MAP_COMPONENT_ID; //Used to identify search component for managing multiple search stores
    loading: boolean = true;
    resultsNum = 0;

    readonly defaultSort: DefaultSort = { param: 'discoveryDate', direction: 'DESC' };
    readonly defaultActiveFilters = {
        stageOfControlCode: ['OUT_CNTRL', 'HOLDING', 'UNDR_CNTRL', 'UNKNOWN'],
        wildfireYear: ['' + new Date().getFullYear(), '' + (new Date().getFullYear() - 1)]
    };
    readonly defaultHiddenFilters = { incidentCategoryCode: ['FIRE_RESP'] };

    filterOptions: FilterConfig[] = [];
    incidentLayerId = 'incident';
    firstLoad = true;

    initSubject = new Subject<void>();

    construct() {
        super.construct()

        this.router.events.subscribe( ( ev ) => {
            if ( !( ev instanceof NavigationEnd ) ) return

            let navEv = ev as NavigationEnd
            if ( navEv.urlAfterRedirects.endsWith( '/' + IncidentRoutes.LIST ) ) {
                this.wfimMapService.setIncidentsVisible( true )
            }
        } )
    }

    ngOnInit() {
        super.ngOnInit();
        this.getFilters();
        this.subscribeLoading();

        // this.store.select(selectMapCurrentState()).subscribe((state) => {
        //     if (state) {
        //         if (this.isIncidentListRoute()) {
        //             this.mapPersistedState = state;
        //             // this.updateMarkerLayerStates();
        //             // console.log("retrievingIncidentMarkers: ", this.retrievingIncidentMarkers);

        //             this.wfimMapService.mapReady().then(() => {
        //                 if (this.incidentLayerVisible())
        //                     this.loadIncidentMarkers();
        //             })
        //         }
        //     }
        // });
    }

    ngAfterViewInit() {
        this.store.pipe(select('incidentManagementMap', 'simpleIncidents')).subscribe((incidents) => {
            if (this.isIncidentListRoute()) {
                this.updateIncidents(incidents);
                this.wfimMapService.mapReady().then(() => {
                    if (this.incidentLayerVisible())
                        this.loadIncidentMarkers();
                })
            }
        });

        this.loadIncidents();
    }

    ngOnDestroy() {
        this.wfimMapService.clearHighlight()
    }

    setDefaultSort() {
        this.store.dispatch(new SearchActions.UpdateSortAction(this.defaultSort.param, this.defaultSort.direction, this.componentId));
    }

    setDefaultFilters() {
        setTimeout(() => {
            this.store.dispatch(new SearchActions.UpdateActiveFiltersAction(this.defaultActiveFilters, this.componentId));
            this.store.dispatch(new SearchActions.UpdateHiddenFiltersAction(this.defaultHiddenFilters, this.componentId));
        }, 0);
    }

    getFilters() {
        this.filterOptions = [
            this.formatYearFilter('Year', 'wildfireYear', 10),
            formatFilter('Type', 'incidentTypeCode', formatFilterOptions(getCodeOptions('INCIDENT_TYPE_CODE'))),
            formatFilter('Status', 'incidentStatusCode', formatFilterOptions(getIncidentStatusOptions())),
            formatFilter('Stage of Control', 'stageOfControlCode', formatFilterOptions(getCodeOptions('STAGE_OF_CONTROL_CODE'))),
            formatFilter('Fire Centre', 'fireCentreOrgUnitIdentifier', formatFilterOptions(getOrgCodeOptions('FIRE_CENTRE_CODE'))),
            formatFilter('Fire Zone', 'zoneOrgUnitIdentifier', formatFilterOptions(getOrgCodeOptions('ZONE_CODE'))),
            formatFilter('General Cause', 'suspectedCauseCategoryCode', formatFilterOptions(getCodeOptions('GENERAL_INCIDENT_CAUSE_CAT_CODE')))
        ];

        this.subscribeSearchFilter();
    }


    subscribeLoading() {
        this.store.pipe(select('incidentManagementMap', 'loading')).subscribe(loading => {
            this.loading = loading;
            this.detectChanges();
        });
    }

    subscribeSearchFilter() {
        this.store.pipe(select(this.componentId, 'filters')).subscribe(
            filters => {
                if (this.firstLoad) {
                    if (!filters || isEmpty(filters)) {
                        this.setDefaultSort();
                        this.setDefaultFilters();
                    }
                }

                // if(!this.firstLoad) { this.retrievingIncidentMarkers = true; }
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


    formatYearFilter(label: string, param: string, yearCount: number) {
        const currentYear = new Date().getFullYear();

        const filterData: Option[] = [];
        for (let diff = 0; diff < yearCount; diff++) {
            const year = currentYear - diff;
            filterData.push({ description: `${year}`, code: `${year}` })
        }

        return formatFilter(label, param, formatFilterOptions(filterData));
    }

    public canOpenIncidentScreen() {
        return !this.applicationStateService.isGeneralStaff();
    }

    public openIncidentScreen() {
        if (this.canOpenIncidentScreen()) {
            let windowId = this.messagingService.getWindowId(WFIM_WINDOW_NAME);
            if (!windowId) {
                this.messagingService.openWindow(this.appConfigService.getConfig().externalAppConfig.im.url, WFIM_WINDOW_NAME);
            } else {
                this.messagingService.focusWindow(windowId);
            }
        }
    }

    public openNROFScreen() {
        let windowId = this.messagingService.getWindowId(WFIM_WINDOW_NAME);
        if (!windowId) {
            this.messagingService.openWindow(this.appConfigService.getConfig().externalAppConfig.im.url, WFIM_WINDOW_NAME);
        } else {
            this.messagingService.focusWindow(windowId);
        }
    }

    trackByIncidentLabel(index, incident) {
        return incident.incidentResource.incidentLabel;
    }

}
