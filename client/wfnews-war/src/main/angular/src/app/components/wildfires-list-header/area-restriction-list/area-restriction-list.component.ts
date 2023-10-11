import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import moment from 'moment';
import { AGOLService } from '../../../services/AGOL-service';
import { MatTableDataSource } from '@angular/material/table';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { haversineDistance } from '@app/services/wfnews-map.service/util';

@Component({
  selector: 'wf-area-restriction-list',
  templateUrl: './area-restriction-list.component.desktop.html',
  styleUrls: ['../../common/base-collection/collection.component.scss', './area-restriction-list.component.desktop.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AreaRestrictionListComponent implements OnInit {
  public dataSource = new MatTableDataSource<any>();
  public selectedSortValue = ''
  public selectedSortOrder = 'DESC'
  public sortOptions = [{ description: 'Fire Centre', code: 'fireCentre'}, { description: 'Name', code: 'name'}, { description: 'Issued On', code: 'issuedOn'}]
  public searchText
  public searchTimer
  columnsToDisplay = ["name", "issuedOn", "fireCentre", "distance", "viewMap", "details"];

  constructor ( private agolService: AGOLService, private cdr: ChangeDetectorRef, private commonUtilityService: CommonUtilityService ) {}

  ngOnInit(): void {
    this.search()
  }

  async search() {
    const location = await this.commonUtilityService.getCurrentLocationPromise()

    const whereString = this.searchText && this.searchText.length > 0 ? `NAME LIKE '%${this.searchText}%' OR FIRE_CENTRE_NAME LIKE '%${this.searchText}%'` : null

    this.agolService.getAreaRestrictions(whereString, null, { returnCentroid: true, returnGeometry: false}).subscribe(areaRestrictions => {
      const areaRestrictionData = []
      if (areaRestrictions && areaRestrictions.features) {
        for (const element of areaRestrictions.features) {
          let distance = null
          if (location) {
              const currentLat = Number(location.coords.latitude);
              const currentLong = Number(location.coords.longitude);

              if (element.centroid) {
                distance = (haversineDistance(element.centroid.y, currentLat, element.centroid.x, currentLong) / 1000).toFixed(2);
              }
          }
          areaRestrictionData.push({
              protRsSysID: element.attributes.PROT_RA_SYSID,
              name: element.attributes.NAME,
              issuedOn: this.convertToDate(element.attributes.ACCESS_STATUS_EFFECTIVE_DATE),
              fireCentre: element.attributes.FIRE_CENTRE_NAME,
              fireZone: element.attributes.FIRE_ZONE_NAME,
              bulletinUrl: element.attributes.BULLETIN_URL,
              distance: distance
          })
        }
      }
      if (this.selectedSortValue !== '') {
        this.selectedSortOrder = this.selectedSortOrder === 'ASC' ? 'DESC' : 'ASC'
        const sortVal = this.selectedSortOrder === 'ASC' ? 1 : -1
        areaRestrictionData.sort((a,b) =>(a[this.selectedSortValue] > b[this.selectedSortValue]) ? sortVal : ((b[this.selectedSortValue] > a[this.selectedSortValue]) ? sortVal * -1 : 0))
        this.selectedSortValue = ''
      }
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

  searchByText() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
      this.searchTimer = null
    }

    this.searchTimer = setTimeout(() => {
      this.search()
    }, 1000)
  }
}
