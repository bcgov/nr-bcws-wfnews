import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import moment from 'moment';
import { AGOLService } from '../../../services/AGOL-service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'wf-evac-list',
  templateUrl: './evac-list.component.desktop.html',
  styleUrls: ['../../common/base-collection/collection.component.scss', './evac-list.component.desktop.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class EvacListComponent implements OnInit {
  public dataSource = new MatTableDataSource<any>();
  public searchState = {
    sortParam: 'fireCentre',
    sortDirection: 'DESC'
  };

  public searchText

  public order = true
  public alert = true

  columnsToDisplay = ["name", "status", "issuedOn", "agency"];

  constructor ( private agolService: AGOLService, private cdr: ChangeDetectorRef ) {}

  ngOnInit(): void {
    this.search()
  }

  async search() {

    let whereString = ''

    if (this.searchText && this.searchText.length > 0) {
      whereString += `(EVENT_NAME LIKE '%${this.searchText}%' OR ORDER_ALERT_STATUS LIKE '%${this.searchText}%' OR ISSUING_AGENCY LIKE '%${this.searchText}%') AND (`
    }

    if (this.order) {
      whereString += 'ORDER_ALERT_STATUS LIKE \'%Order%\''
    }

    if (this.alert) {
      whereString += ' OR ORDER_ALERT_STATUS LIKE \'%Alert%\''
    }

    if (this.searchText && this.searchText.length > 0) {
      whereString += ')'
    }

    if (whereString.startsWith(' OR ')) whereString = whereString.substring(3)
    if (whereString.endsWith(' AND ()')) whereString = whereString.substring(0, whereString.length - 7)
    if (whereString === '') whereString = null

    this.agolService.getEvacOrders(whereString, null, { returnCentroid: false, returnGeometry: false}).subscribe(evacs => {
      const evacData = []
      if (evacs && evacs.features) {
        console.log(evacs.features)
        for (const element of evacs.features) {
          evacData.push({
            name: element.attributes.EVENT_NAME,
            eventType: element.attributes.EVENT_TYPE,
            status: element.attributes.ORDER_ALERT_STATUS,
            agency: element.attributes.ISSUING_AGENCY,
            preOcCode: element.attributes.PREOC_CODE,
            emrgOAAsysID: element.attributes.EMRG_OAA_SYSID,
            issuedOn: this.convertToDate(element.attributes.DATE_MODIFIED)
          })
        }
      }
      evacData.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
      this.dataSource.data = evacData
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
