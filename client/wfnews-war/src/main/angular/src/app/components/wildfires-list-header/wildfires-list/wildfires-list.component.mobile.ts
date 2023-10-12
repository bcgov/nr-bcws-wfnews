import { BreakpointObserver, BreakpointState, Breakpoints } from "@angular/cdk/layout";
import { ChangeDetectorRef, Component, HostListener } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { PublishedIncidentService } from "@app/services/published-incident-service";
import { ResourcesRoutes, convertFireNumber, convertToStageOfControlDescription } from "@app/utils";
import moment from "moment";
import { Observable } from "rxjs";
import { FilterByLocationDialogComponent, LocationData } from "../filter-by-location/filter-by-location-dialog.component";

@Component({
  selector: 'wf-list-container-mobile',
  templateUrl: './wildfires-list.component.mobile.html',
  styleUrls: ['./wildfires-list.component.mobile.scss']
})
export class WildFiresListComponentMobile {
  public dataSource = new MatTableDataSource<any>();
  public selectedSortValue = ''
  public selectedSortOrder = 'DESC'
  public searchText
  public keepPaging = true
  public page = 0
  public rowCount = 10

  public order = true
  public alert = true

  private searchTimer

  convertFireNumber = convertFireNumber;
  convertToStageOfControlDescription = convertToStageOfControlDescription

  private isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.XSmall);

  constructor ( private router: Router, private publishedIncidentService: PublishedIncidentService, private cdr: ChangeDetectorRef, private breakpointObserver: BreakpointObserver, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.search()
  }

  async search(location: LocationData | null = null) {
    if (this.keepPaging) {
      this.page += 1
      this.publishedIncidentService.fetchPublishedIncidentsList(this.page, this.rowCount, location, this.searchText === '' && this.searchText.length ? null : this.searchText, true).subscribe(incidents => {
        console.log(incidents);
        const incidentData = []
        if (incidents && incidents.collection) {
          for (const element of incidents.collection) {
            incidentData.push({
              incidentName: element.incidentName,
              incidentNumberLabel: element.incidentNumberLabel,
              stageOfControlCode: element.stageOfControlCode,
              traditionalTerritoryDetail: element.traditionalTerritoryDetail,
              fireOfNoteInd: element.fireOfNoteInd,
              fireCentreName: element.fireCentreName,
              discoveryDate: this.convertToDate(element.discoveryDate),
              fireYear: element.fireYear
            })

            this.keepPaging = this.page !== incidents.totalPageCount
          }
        } else {
          this.keepPaging = false
        }

        this.dataSource.data = this.dataSource.data.concat(incidentData)
        this.cdr.detectChanges()
      });
    }
  }

  openLocationFilter () {
    const dialogRef = this.dialog.open(FilterByLocationDialogComponent, {
      width: '311px',
      height: '453px',
      maxWidth: '100vw',
      maxHeight: '100vh',
    });

    const smallDialogSubscription = this.isExtraSmall.subscribe(size => {
      if (size.matches) {
        dialogRef.updateSize('100%', '100%');
      } else {
        dialogRef.updateSize('311px', '453px');
      }
    });

    dialogRef.afterClosed().subscribe((result: LocationData) => {
      smallDialogSubscription.unsubscribe();
      this.dataSource.data = []
      this.page = 0
      this.keepPaging = true
      this.search(result)
    });
  }

  searchByText() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
      this.searchTimer = null
    }

    this.searchTimer = setTimeout(() => {
      this.dataSource.data = []
      this.page = 0
      this.keepPaging = true
      this.search()
    }, 1000)
  }

  convertToDate(value: string) {
    if (value) {
      return moment(value).format('YYYY-MM-DD HH:mm:ss')
    }
  }

  viewMap(incident: any) {
  }

  sortData (event: any) {
    this.cdr.detectChanges()
  }

  selectIncident(incident: any) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree([ResourcesRoutes.PUBLIC_INCIDENT], { queryParams: { fireYear: incident.fireYear, incidentNumber: incident.incidentNumberLabel } })
    )
    window.open(url, '_blank')
}
}
