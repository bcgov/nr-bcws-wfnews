import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
} from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import {
  ResourcesRoutes,
  convertFireNumber,
  convertToStageOfControlDescription,
  convertToDateTime
} from '@app/utils';
import moment from 'moment';
import { Observable } from 'rxjs';
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
  public page = 0;
  public rowCount = 10;

  public totalRowCount = 0;

  public order = true;
  public alert = true;

  public filters: FilterData;
  public lastLocation: LocationData;

  convertFireNumber = convertFireNumber;
  convertToStageOfControlDescription = convertToStageOfControlDescription;
  convertToDateTime = convertToDateTime;

  private searchTimer;

  private isExtraSmall: Observable<BreakpointState> =
    this.breakpointObserver.observe(Breakpoints.XSmall);

  constructor(
    private router: Router,
    private publishedIncidentService: PublishedIncidentService,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.search();
  }

  async search() {
    if (this.keepPaging) {
      this.page += 1;
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
                discoveryDate: this.convertToDateTime(element.discoveryDate),
                fireYear: element.fireYear,
              });

              this.keepPaging = this.page !== incidents.totalPageCount;
            }
          } else {
            this.keepPaging = false;
          }

          this.dataSource.data = this.dataSource.data.concat(incidentData);
          this.cdr.detectChanges();
        });
    }
  }

  openLocationFilter() {
    const dialogRef = this.dialog.open(FilterByLocationDialogComponent, {
      width: '380px',
      height: '453px',
      maxWidth: '100vw',
      maxHeight: '100dvh',
      data: this.lastLocation,
    });

    const smallDialogSubscription = this.isExtraSmall.subscribe((size) => {
      if (size.matches) {
        dialogRef.updateSize('100%', '100%');
      } else {
        dialogRef.updateSize('380px', '453px');
      }
    });

    dialogRef.afterClosed().subscribe((result: LocationData) => {
      smallDialogSubscription.unsubscribe();
      this.dataSource.data = [];
      this.page = 0;
      this.keepPaging = true;
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
      this.dataSource.data = [];
      this.page = 0;
      this.keepPaging = true;
      this.lastLocation = null;
      this.search();
    }, 1000);
  }

  viewMap(incident: any) {}

  sortData(event: any) {
    this.cdr.detectChanges();
  }

  filterOptions() {
    const dialogRef = this.dialog.open(FilterOptionsDialogComponent, {
      width: '450px',
      height: '650px',
      maxWidth: '100vw',
      maxHeight: '100dvh',
      data: this.filters,
    });

    const smallDialogSubscription = this.isExtraSmall.subscribe((size) => {
      if (size.matches) {
        dialogRef.updateSize('100%', '100%');
      } else {
        dialogRef.updateSize('450px', '650px');
      }
    });

    dialogRef.afterClosed().subscribe((result: FilterData | boolean) => {
      smallDialogSubscription.unsubscribe();
      if ((result as boolean) !== false) {
        this.dataSource.data = [];
        this.page = 0;
        this.keepPaging = true;

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
        source: [ResourcesRoutes.WILDFIRESLIST],
      },
    });
  }
}
