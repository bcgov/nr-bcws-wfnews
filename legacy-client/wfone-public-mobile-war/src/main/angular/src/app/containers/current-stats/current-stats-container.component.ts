import {BaseContainer} from "../base/base-container.component";
import {AfterViewInit, Component, OnInit} from "@angular/core";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";
import {
    selectActiveFiresByFireCentresChartInfo,
    selectOverviewActiveFiresStats,
    selectOverviewCurrentYearFiresStats
} from "../../store/current-stats/current-stats.selectors";
import {VmFireChartInfo, VmOverviewActiveFireStats, VmOverviewCurrentYearFireStats} from "../../conversion/models";
import {Observable} from "rxjs";
import {select} from "@ngrx/store";


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'current-stats-container',
    template: '',
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
// tslint:disable-next-line:component-class-suffix
export class CurrentStatsContainer extends BaseContainer implements AfterViewInit, OnInit {

    overviewActiveFireStats$: Observable<VmOverviewActiveFireStats>
        = this.store.pipe(select(selectOverviewActiveFiresStats()));
    overviewCurrentYearFireStats$: Observable<VmOverviewCurrentYearFireStats>
        = this.store.pipe(select(selectOverviewCurrentYearFiresStats()));
    selectedFireChartInfo$: Observable<VmFireChartInfo>
        = this.store.pipe(select(selectActiveFiresByFireCentresChartInfo()));

    ngOnInit() {
    }

    ngAfterViewInit(): void {

    }
}
