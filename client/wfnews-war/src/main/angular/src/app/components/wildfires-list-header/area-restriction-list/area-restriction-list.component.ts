import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import moment from 'moment';
import { AGOLService } from '../../../services/AGOL-service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'wf-area-restriction-list',
  templateUrl: './area-restriction-list.component.desktop.html',
  styleUrls: ['../../common/base-collection/collection.component.scss', './area-restriction-list.component.desktop.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AreaRestrictionListComponent implements OnInit {
  public dataSource = new MatTableDataSource<any>();
  public searchState = {
    sortParam: 'name',
    sortDirection: 'DESC'
  };

  public searchText

  columnsToDisplay = ["name", "issuedOn", "fireCentre"];

  constructor ( private agolService: AGOLService, private cdr: ChangeDetectorRef ) {}

  ngOnInit(): void {
    this.search()
  }

  async search() {

    const whereString = this.searchText && this.searchText.length > 0 ? `NAME LIKE '%${this.searchText}%' OR FIRE_CENTRE_NAME LIKE '%${this.searchText}%'` : null

    this.agolService.getAreaRestrictions(whereString, null, { returnCentroid: false, returnGeometry: false}).subscribe(areaRestrictions => {
      const areaRestrictionData = []
      if (areaRestrictions && areaRestrictions.features) {
        for (const element of areaRestrictions.features) {
          areaRestrictionData.push({
              protRsSysID: element.attributes.PROT_RA_SYSID,
              name: element.attributes.NAME,
              issuedOn: this.convertToDate(element.attributes.ACCESS_STATUS_EFFECTIVE_DATE),
              fireCentre: element.attributes.FIRE_CENTRE_NAME,
              fireZone: element.attributes.FIRE_ZONE_NAME,
              bulletinUrl: element.attributes.BULLETIN_URL
          })
        }
      }
      areaRestrictionData.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
      this.dataSource.data = areaRestrictionData
      this.cdr.detectChanges()
    });
  }

  searchByLocation() {
    // get location
    // pass to search
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
}
