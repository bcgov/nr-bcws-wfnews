import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { select } from '@ngrx/store';
import {
    DefaultSort,
    FilterConfig,
    SearchActions,
    SortOption,
    WFNROF_WINDOW_NAME
} from '@wf1/core-ui';
import {
    ProvisionalZoneResource
} from '@wf1/incidents-rest-api';
import { forkJoin } from 'rxjs';
import { MarkerLayerBaseComponent } from "../../../../components/marker-layer-base.component";
// import { selectMapCurrentState } from "../../../../store/map/map.selectors";
import * as NrofActions from '../../../../store/nrof/nrof.actions';
import { NROF_MAP_COMPONENT_ID } from "../../../../store/nrof/nrof.state";
import { formatFilter, formatFilterOptions, getOrgCodeOptions, isEmpty } from "../../../../utils";
import { NROFRoutes } from '../../nrof-route-definitions';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wfim-nrof-list',
    templateUrl: './nrof-list.component.html',
    styleUrls: ['./nrof-list.component.scss','../../../../components/marker-layer-base.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NROFListComponent extends MarkerLayerBaseComponent implements OnInit, OnDestroy, AfterViewInit {
    componentId = NROF_MAP_COMPONENT_ID; //Used to identify search component for managing multiple search stores
    nrofLayerId = 'nrofMap';

    loading: boolean = false;
    firstLoad = true;
    readonly defaultSort: DefaultSort = { param: 'effectiveTimeStamp', direction: 'DESC' };
    sortOptions: SortOption[] = [
        { label: 'Created Date', param: 'effectiveTimeStamp' },
        { label: 'NROF Number', param: 'provisionalZoneIdentifier' },
        { label: 'Fire Centre', param: 'fireCentreOrgUnitName' }
    ];

    filterOptions: FilterConfig[] = [];

    construct() {
        super.construct()

        this.router.events.subscribe( ( ev ) => {
            if ( !( ev instanceof NavigationEnd ) ) return

            let navEv = ev as NavigationEnd
            if ( navEv.urlAfterRedirects.endsWith( '/' + NROFRoutes.LIST ) ) {
                this.wfimMapService.setNrofsVisible( true )
            }
        } )
    }

    ngOnInit() {
        super.ngOnInit();
        this.getFilters();
        this.subscribeLoading();

        // this.store.select(selectMapCurrentState()).subscribe((state) => {
        //     if (state) {
        //         if (this.isNrofListRoute()) {
        //             this.mapPersistedState = state;

        //             this.wfimMapService.mapReady().then(() => {
        //                 if (this.nrofLayerVisible())
        //                     this.loadNRofMarkers();
        //             })
        //         }
        //     }
        // });

        setInterval(() => {
            this.updateProvisionalZones(this.nrofs);
        }, 20000);
    }

    ngAfterViewInit() {
        this.initSyncRefreshListAndMarkers();
        this.loadProvisionalZones();

        this.store.pipe(select('nrofMap', 'simpleNrofs')).subscribe((simpleNrofs: ProvisionalZoneResource[]) => {
            if (this.isNrofListRoute()) {
                this.simpleNrofs = simpleNrofs;
            }
        });

        this.store.pipe(select('nrofMap', 'newSimpleNrofs')).subscribe((simpleNrofs: ProvisionalZoneResource[]) => {
            if (this.isNrofListRoute()) {
                if (simpleNrofs && simpleNrofs.length > 0) {
                    let nrofs: ProvisionalZoneResource[] = [];
                    forkJoin(this.getBatchNoReportOfFire(simpleNrofs)).subscribe((values) => {
                        nrofs = values;
                        this.store.dispatch(new NrofActions.NROFSyncAction(nrofs));
                    });
                }
            }
        });
    }

    initSyncRefreshListAndMarkers() {
        this.store.pipe(select('nrofMap', 'nrofs')).subscribe((nrofs: ProvisionalZoneResource[]) => {
            if (this.isNrofListRoute()) {
                this.updateProvisionalZones(nrofs);

                this.wfimMapService.mapReady().then(() => {
                    if (this.nrofLayerVisible())
                        this.loadNRofMarkers();
                })
            }
        });
    }

    ngOnDestroy() {
        this.wfimMapService.clearHighlight()
    }

    setDefaultFilters() {
        this.store.dispatch(new SearchActions.UpdateActiveFiltersAction({}, this.componentId));
    }

    public openNrofScreen() {
        let windowId = this.messagingService.getWindowId(WFNROF_WINDOW_NAME);
        if (!windowId) {
            this.messagingService.openWindow(this.appConfigService.getConfig().externalAppConfig.nrof.url, WFNROF_WINDOW_NAME);
        } else {
            this.messagingService.focusWindow(windowId);
        }
    }

    setDefaultSort() {
        this.store.dispatch(new SearchActions.UpdateSortAction(this.defaultSort.param, this.defaultSort.direction, this.componentId));
    }

    getCustomDismissedFilters() {
        const options =
            [
                { label: 'Yes', value: "Yes" },
                { label: 'No', value: "No" },
            ]

        return formatFilter('Dismissed', 'dismissedInd', options, 'single');
    }

    getFilters() {
        this.filterOptions = [
            this.getCustomDismissedFilters(),
            formatFilter('Fire Centre', 'fireCentreOrgUnitIdentifier', formatFilterOptions(getOrgCodeOptions('FIRE_CENTRE_CODE'))),
        ];

        this.subscribeSearchFilters();
    }

    subscribeLoading() {
        this.store.pipe(select('nrofMap', 'loading')).subscribe(loading => {
            this.loading = loading;
            this.detectChanges();
        });
    }

    subscribeSearchFilters() {
        this.store.pipe(select(NROF_MAP_COMPONENT_ID, 'filters')).subscribe(
            filters => {
                if (this.firstLoad) {
                    if (!filters || isEmpty(filters)) {
                        this.setDefaultSort();
                        this.setDefaultFilters();
                    }
                }

                // if(!this.firstLoad) { this.retrievingNrofMarkers = true; }

                //
                if (this.firstLoad) {
                    this.firstLoad = false;
                    this.store.dispatch(new SearchActions.UpdateActiveFiltersAction(filters, this.componentId));
                }
            }
        );
    }

    trackByIncidentLabel(index, incident) {
        return incident.incidentResource.incidentLabel;
    }
}
