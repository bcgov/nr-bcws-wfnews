import { ChangeDetectorRef, Component, HostListener } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { PublishedIncidentService } from "@app/services/published-incident-service";
import { ResourcesRoutes, convertFireNumber, convertToStageOfControlDescription } from "@app/utils";
import moment from "moment";

@Component({
    selector: 'wf-list-container-mobile',
    templateUrl: './wildfires-list.component.mobile.html',
    styleUrls: ['./wildfires-list.component.mobile.scss']
  })
@HostListener("window:scroll", ["$event"])
export class WildFiresListComponentMobile {
  public dataSource = new MatTableDataSource<any>();
  public selectedSortValue = ''
  public selectedSortOrder = 'DESC'
  public searchText
  public keepPaging = true
  public page = 0
  public rowCount = 9999

  public order = true
  public alert = true

  convertFireNumber = convertFireNumber;
  convertToStageOfControlDescription = convertToStageOfControlDescription


  constructor ( private router: Router, private publishedIncidentService: PublishedIncidentService, private cdr: ChangeDetectorRef ) { }

  ngOnInit(): void {
    this.search()
  }

  async search() {
    if (this.keepPaging) {
      this.publishedIncidentService.fetchPublishedIncidentsList(this.page, this.rowCount, this.searchText === '' && this.searchText.length ? null : this.searchText, true).subscribe(incidents => {
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
          }
        }

        this.dataSource.data = this.dataSource.data.concat(incidentData)
        this.cdr.detectChanges()
      });
    }
  }

  searchByLocation() {
    // get location
    // pass to search
    this.dataSource.data = []
    this.page = 0
    this.search()
  }

  searchByText() {
    this.dataSource.data = []
    this.page = 0
    this.search()
  }

  convertToDate(value: string) {
    if (value) {
      return moment(value).format('YYYY-MM-DD HH:mm:ss')
    }
  }

  viewMap(ban: any) {
  }

  showDetails(ban: any) {

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
