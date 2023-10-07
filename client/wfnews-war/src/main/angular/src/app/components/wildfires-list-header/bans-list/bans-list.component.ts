import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import moment from 'moment';
import { AGOLService } from '../../../services/AGOL-service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'wf-bans-list',
  templateUrl: './bans-list.component.desktop.html',
  styleUrls: ['../../common/base-collection/collection.component.scss', './bans-list.component.desktop.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class BansListComponent implements OnChanges, OnInit, AfterViewInit {
  public dataSource = new MatTableDataSource<any>();
  public searchState = {
    sortParam: 'fireCentre',
    sortDirection: 'DESC'
  };

  public category1 = true
  public category2 = true
  public category3 = true

  columnsToDisplay = ["fireCentre", "type", "details", "issuedOn"];

  constructor ( private agolService: AGOLService, private cdr: ChangeDetectorRef ) {}

  ngOnInit(): void {
    this.agolService.getBansAndProhibitions(null, { returnCentroid: false, returnGeometry: false}).subscribe(bans => {
        const banData = []
        for (const element of bans.features) {
          banData.push({
            id: element.attributes.PROT_BAP_SYSID,
            fireCentre: element.attributes.FIRE_CENTRE_NAME,
            type: element.attributes.TYPE,
            details: element.attributes.ACCESS_PROHIBITION_DESCRIPTION,
            issuedOn: element.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
            bulletinUrl: element.attributes.BULLETIN_URL
          })
        }
        banData.sort((a,b) => (a.fireCentre > b.fireCentre) ? 1 : ((b.fireCentre > a.fireCentre) ? -1 : 0))
        this.dataSource.data = banData
        this.cdr.detectChanges()
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('change detected')
  }
  ngAfterViewInit(): void {
    console.log('View initialized')
  }

  async loadPage() {
  }

  async search() {
    const data = this.dataSource.data
    const cat1 = data.filter(b => b.details.toLowerCase().includes('1') || b.details.toLowerCase().includes('campfires'))
    const cat2 = data.filter(b => b.details.toLowerCase().includes('2'))
    const cat3 = data.filter(b => b.details.toLowerCase().includes('3'))
    this.dataSource.data = []

    console.log(cat1, cat2, cat3)

    if (this.category1) {
      for (const c1 of cat1) {
        if (!this.dataSource.data.find(b => b.id === c1.id)) {
          this.dataSource.data.push(c1)
        }
      }
    }

    if (this.category2) {
      for (const c2 of cat2) {
        if (!this.dataSource.data.find(b => b.id === c2.id)) {
          this.dataSource.data.push(c2)
        }
      }
    }

    if (this.category3) {
      for (const c3 of cat3) {
        if (!this.dataSource.data.find(b => b.id === c3.id)) {
          this.dataSource.data.push(c3)
        }
      }
    }

    this.cdr.detectChanges()
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
