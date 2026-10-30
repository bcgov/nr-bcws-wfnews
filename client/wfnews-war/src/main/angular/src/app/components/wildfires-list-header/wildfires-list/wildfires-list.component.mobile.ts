import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { ResponsiveDialogService } from '@app/services/responsive-dialog.service';
import {
  ResourcesRoutes,
  convertFireNumber,
  convertToStageOfControlDescription,
  convertToDateYear
} from '@app/utils';
import moment from 'moment';
import {
  FilterByLocationDialogComponent,
  LocationData,
} from '../filter-by-location/filter-by-location-dialog.component';
import {
  FilterData,
  FilterOptionsDialogComponent,
} from '../filter-options-dialog/filter-options-dialog.component';

@Component({
  selector: 'wf-list-container-mobile',
  templateUrl: './wildfires-list.component.mobile.html',
  styleUrls: ['./wildfires-list.component.mobile.scss'],
})
export class WildFiresListComponentMobile {
  public dataSource = new MatTableDataSource<any>();
  public selectedSortValue = '';
  public selectedSortOrder = 'DESC';
  public searchText;
  public keepPaging = true;
  public loading = false;
  public page = 0;
  public rowCount = 10;

  /** An old WebView cannot watch the list end, so it keeps the button. */
  public readonly canScrollLoad = typeof IntersectionObserver !== 'undefined';

  public totalRowCount = 0;

  public order = true;
  public alert = true;

  public filters: FilterData;
  public lastLocation: LocationData;

  convertFireNumber = convertFireNumber;
  convertToStageOfControlDescription = convertToStageOfControlDescription;
  convertToDateYear = convertToDateYear;

  private searchTimer;

  /** A new search makes the old answer stale. Count the searches to know. */
  private searchToken = 0;

  constructor(
    private router: Router,
    private publishedIncidentService: PublishedIncidentService,
    private cdr: ChangeDetectorRef,
    private responsiveDialog: ResponsiveDialogService,
  ) {}

  ngOnInit(): void {
    this.search();
  }

  /** Start the list again. It also drops the answer of a request in flight. */
  private resetSearch() {
    this.searchToken += 1;
    this.dataSource.data = [];
    this.page = 0;
    this.keepPaging = true;
    this.loading = false;
  }

  async search() {
    if (this.keepPaging && !this.loading) {
      this.loading = true;
      this.page += 1;
      const token = this.searchToken;
      this.publishedIncidentService
        .fetchPublishedIncidentsList(
          this.page,
          this.rowCount,
          this.lastLocation,
          this.searchText === '' && this.searchText.length
            ? null
            : this.searchText,
          this.filters ? this.filters.fireOfNoteInd : null,
          this.filters?.stagesOfControl || [
            'OUT_CNTRL',
            'HOLDING',
            'UNDR_CNTRL',
          ],
          this.filters?.fireCentre || null,
          null,
          this.filters?.sortColumn
            ? `${this.filters.sortColumn}%20${this.filters.sortDirection}`
            : 'lastUpdatedTimestamp%20DESC',
        )
        .subscribe((incidents) => {
          if (token !== this.searchToken) {
            return;
          }

          const incidentData = [];
          if (incidents && incidents.collection) {
            this.totalRowCount = incidents.totalRowCount;
            for (const element of incidents.collection) {
              incidentData.push({
                incidentName: element.incidentName,
                incidentNumberLabel: element.incidentNumberLabel,
                stageOfControlCode: element.stageOfControlCode,
                traditionalTerritoryDetail: element.traditionalTerritoryDetail,
                fireOfNoteInd: element.fireOfNoteInd,
                fireCentreName: element.fireCentreName,
                discoveryDate: this.convertToDateYear(element.discoveryDate),
                fireYear: element.fireYear,
              });

              this.keepPaging = this.page !== incidents.totalPageCount;
            }
          } else {
            this.keepPaging = false;
          }

          this.dataSource.data = this.dataSource.data.concat(incidentData);
          this.loading = false;
          this.cdr.detectChanges();
        }, () => {
          if (token !== this.searchToken) {
            return;
          }

          // Give the page back, so the next scroll asks for it again.
          this.page -= 1;
          this.loading = false;
          this.cdr.detectChanges();
        });
    }
  }

  openLocationFilter() {
    const dialogRef = this.responsiveDialog.open(
      FilterByLocationDialogComponent,
      '380px',
      '453px',
      this.lastLocation,
    );

    dialogRef.afterClosed().subscribe((result: LocationData) => {
      this.resetSearch();
      this.lastLocation = result;
      this.search();
    });
  }

  searchByText() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }

    this.searchTimer = setTimeout(() => {
      this.resetSearch();
      this.lastLocation = null;
      this.search();
    }, 1000);
  }

  viewMap(incident: any) {}

  sortData(event: any) {
    this.cdr.detectChanges();
  }

  filterOptions() {
    const dialogRef = this.responsiveDialog.open(
      FilterOptionsDialogComponent,
      '450px',
      '650px',
      this.filters,
    );

    dialogRef.afterClosed().subscribe((result: FilterData | boolean) => {
      if ((result as boolean) !== false) {
        this.resetSearch();
        this.filters = result as FilterData;
        this.search();
      } else {
        this.filters = null;
        this.search();
      }
    });
  }

  selectIncident(incident: any) {
    this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
      queryParams: {
        fireYear: incident.fireYear,
        incidentNumber: incident.incidentNumberLabel,
        source: ResourcesRoutes.WILDFIRESLIST,
      },
    });
  }
}
