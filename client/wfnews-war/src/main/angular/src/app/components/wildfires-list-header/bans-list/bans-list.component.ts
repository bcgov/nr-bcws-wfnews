import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import moment from 'moment';
import { AGOLService } from '../../../services/AGOL-service';
import { MatTableDataSource } from '@angular/material/table';
import {
  BreakpointState,
  Breakpoints,
  BreakpointObserver,
} from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  FilterByLocationDialogComponent,
  LocationData,
} from '../filter-by-location/filter-by-location-dialog.component';
import { ResourcesRoutes, convertToDateTime } from '@app/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'wf-bans-list',
  templateUrl: './bans-list.component.desktop.html',
  styleUrls: [
    '../../common/base-collection/collection.component.scss',
    './bans-list.component.desktop.scss',
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class BansListComponent implements OnInit {
  public dataSource = new MatTableDataSource<any>();
  public selectedSortValue = '';
  public selectedSortOrder = 'desc';
  public sortOptions = [
    { description: 'Fire Centre', code: 'fireCentre' },
    { description: 'Type', code: 'type' },
    { description: 'Details', code: 'details' },
    { description: 'Issued On', code: 'issuedOn' },
  ];
  public searchText;
  public category1 = true;
  public category2 = true;
  public category3 = true;
  public searchTimer;
  public searchingComplete = false;
  public columnsToDisplay = [
    'fireCentre',
    'type',
    'details',
    'issuedOn',
    'viewMap',
  ];

  public locationData: LocationData;
  convertToDateTime = convertToDateTime;
  private isExtraSmall: Observable<BreakpointState> =
    this.breakpointObserver.observe(Breakpoints.XSmall);

  constructor(
    private agolService: AGOLService,
    protected router: Router,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.search();
  }

  async search(location: LocationData | null = null) {
    this.searchingComplete = false;

    let whereString = '';

    if (this.searchText && this.searchText.length > 0) {
      whereString += `(ACCESS_PROHIBITION_DESCRIPTION LIKE '%${this.searchText}%' OR FIRE_CENTRE_NAME LIKE '%${this.searchText}%' OR TYPE LIKE '%${this.searchText}%') AND (`;
    }

    if (this.category1) {
      whereString +=
        '(ACCESS_PROHIBITION_DESCRIPTION LIKE \'%1%\' OR ACCESS_PROHIBITION_DESCRIPTION LIKE \'%Campfires%\')';
    }

    if (this.category2) {
      whereString += ' OR ACCESS_PROHIBITION_DESCRIPTION LIKE \'%2%\'';
    }

    if (this.category3) {
      whereString += ' OR ACCESS_PROHIBITION_DESCRIPTION LIKE \'%3%\'';
    }

    if (this.searchText && this.searchText.length > 0) {
      whereString += ')';
    }

    if (whereString.startsWith(' OR ')) {
whereString = whereString.substring(3);
}
    if (whereString.endsWith(' AND ()')) {
whereString = whereString.substring(0, whereString.length - 7);
}
    if (whereString === '') {
whereString = null;
}

    this.agolService
      .getBansAndProhibitions(
        whereString,
        location
          ? {
              x: location.longitude,
              y: location.latitude,
              radius: location.radius,
            }
          : null,
        { returnCentroid: true, returnGeometry: false },
      )
      .subscribe((bans) => {
        const banData = [];
        if (bans && bans.features) {
          for (const element of bans.features) {
            banData.push({
              id: element.attributes.PROT_BAP_SYSID,
              fireCentre: element.attributes.FIRE_CENTRE_NAME,
              type: element.attributes.TYPE,
              details: element.attributes.ACCESS_PROHIBITION_DESCRIPTION,
              issuedOn: this.convertToDateTime(
                element.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
              ),
              bulletinUrl: element.attributes.BULLETIN_URL,
              latitude: element.centroid.y,
              longitude: element.centroid.x,
            });
          }
        }

        if (this.selectedSortValue !== '') {
          this.selectedSortOrder =
            this.selectedSortOrder === 'asc' ? 'desc' : 'asc';
          const sortVal = this.selectedSortOrder === 'asc' ? 1 : -1;
          banData.sort((a, b) =>
            a[this.selectedSortValue] > b[this.selectedSortValue]
              ? sortVal
              : b[this.selectedSortValue] > a[this.selectedSortValue]
                ? sortVal * -1
                : 0,
          );
          this.selectedSortValue = '';
        }
        this.dataSource.data = banData;
        this.searchingComplete = true;
        this.cdr.detectChanges();
      });
  }

  viewMap(ban: any) {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          bans: true,
          identify: true,
          longitude: ban.longitude,
          latitude: ban.latitude,
        },
      });
    }, 100);
  }

  openLocationFilter() {
    const dialogRef = this.dialog.open(FilterByLocationDialogComponent, {
      width: '380px',
      height: '453px',
      maxWidth: '100vw',
      maxHeight: '100dvh',
      data: this.locationData,
    });

    const smallDialogSubscription = this.isExtraSmall.subscribe((size) => {
      if (size.matches) {
        dialogRef.updateSize('100%', '100%');
      } else {
        dialogRef.updateSize('380px', '453px');
      }
    });

    dialogRef.afterClosed().subscribe((result: LocationData | boolean) => {
      smallDialogSubscription.unsubscribe();
      if ((result as boolean) === false) {
        this.locationData = null;
      } else {
        this.locationData = result as LocationData;
      }
      this.search(result as LocationData);
    });
  }

  sortData(event: any) {
    this.selectedSortValue = event.active;
    this.search();
  }

  searchByText() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }

    this.searchTimer = setTimeout(() => {
      this.search();
    }, 1000);
  }
}
