import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import moment from 'moment';
import { AGOLService } from '../../../services/AGOL-service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'wf-bans-list',
  templateUrl: './bans-list.component.desktop.html',
  styleUrls: ['../../common/base-collection/collection.component.scss', './bans-list.component.desktop.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class BansListComponent implements OnInit {
  public dataSource = new MatTableDataSource<any>();
  public selectedSortOrder = ''
  public sortOptions = [{ description: 'Fire Centre', code: 'fireCentre'}, { description: 'Type', code: 'type'}, { description: 'Details', code: 'details'}, { description: 'Issued On', code: 'issuedOn'}]
  public searchText
  public category1 = true
  public category2 = true
  public category3 = true

  columnsToDisplay = ["fireCentre", "type", "details", "issuedOn", "viewMap", "fullDetails"];

  constructor ( private agolService: AGOLService, private cdr: ChangeDetectorRef ) {}

  ngOnInit(): void {
    this.search()
  }

  async search() {

    let whereString = ''

    if (this.searchText && this.searchText.length > 0) {
      whereString += `(ACCESS_PROHIBITION_DESCRIPTION LIKE '%${this.searchText}%' OR FIRE_CENTRE_NAME LIKE '%${this.searchText}%' OR TYPE LIKE '%${this.searchText}%') AND (`
    }

    if (this.category1) {
      whereString += '(ACCESS_PROHIBITION_DESCRIPTION LIKE \'%1%\' OR ACCESS_PROHIBITION_DESCRIPTION LIKE \'%Campfires%\')'
    }

    if (this.category2) {
      whereString += ' OR ACCESS_PROHIBITION_DESCRIPTION LIKE \'%2%\''
    }

    if (this.category3) {
      whereString += ' OR ACCESS_PROHIBITION_DESCRIPTION LIKE \'%3%\''
    }

    if (this.searchText && this.searchText.length > 0) {
      whereString += ')'
    }

    if (whereString.startsWith(' OR ')) whereString = whereString.substring(3)
    if (whereString.endsWith(' AND ()')) whereString = whereString.substring(0, whereString.length - 7)
    if (whereString === '') whereString = null

    this.agolService.getBansAndProhibitions(whereString, null, { returnCentroid: false, returnGeometry: false}).subscribe(bans => {
      const banData = []
      if (bans && bans.features) {
        for (const element of bans.features) {
          banData.push({
            id: element.attributes.PROT_BAP_SYSID,
            fireCentre: element.attributes.FIRE_CENTRE_NAME,
            type: element.attributes.TYPE,
            details: element.attributes.ACCESS_PROHIBITION_DESCRIPTION,
            issuedOn: this.convertToDate(element.attributes.ACCESS_STATUS_EFFECTIVE_DATE),
            bulletinUrl: element.attributes.BULLETIN_URL
          })
        }
      }

      if (this.selectedSortOrder !== '') {
        banData.sort((a,b) => (a[this.selectedSortOrder] > b[this.selectedSortOrder]) ? 1 : ((b[this.selectedSortOrder] > a[this.selectedSortOrder]) ? -1 : 0))
      }
      this.dataSource.data = banData
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
