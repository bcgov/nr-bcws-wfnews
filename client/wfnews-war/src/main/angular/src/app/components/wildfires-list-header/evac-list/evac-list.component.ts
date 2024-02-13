import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import moment from 'moment';
import { AGOLService } from '../../../services/AGOL-service';
import { MatTableDataSource } from '@angular/material/table';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { haversineDistance } from '@app/services/wfnews-map.service/util';
import {
  FilterByLocationDialogComponent,
  LocationData,
} from '../filter-by-location/filter-by-location-dialog.component';
import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
} from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ResourcesRoutes, convertToDateTime } from '@app/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'wf-evac-list',
  templateUrl: './evac-list.component.desktop.html',
  styleUrls: [
    '../../common/base-collection/collection.component.scss',
    './evac-list.component.desktop.scss',
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class EvacListComponent implements OnInit {
  public dataSource = new MatTableDataSource<any>();
  public selectedSortValue = '';
  public selectedSortOrder = 'desc';
  public sortOptions = [
    { description: 'Name', code: 'name' },
    { description: 'Status', code: 'status' },
    { description: 'Agency', code: 'agency' },
    { description: 'Issued On', code: 'issuedOn' },
  ];
  public searchText;
  public searchTimer;
  public order = true;
  public alert = true;
  public searchingComplete = false;
  public columnsToDisplay = [
    'name',
    'status',
    'issuedOn',
    'agency',
    'distance',
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
    private commonUtilityService: CommonUtilityService,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.search();
  }

  async search(location: LocationData | null = null) {
    this.searchingComplete = false;
    let userLocation;
    try {
      userLocation = await this.commonUtilityService.getCurrentLocationPromise();
    } catch (error) {
      console.error('Error getting current location:', error);
    }

    let whereString = '';

    if (this.searchText && this.searchText.length > 0) {
      whereString += `(EVENT_NAME LIKE '%${this.searchText}%' OR ORDER_ALERT_STATUS LIKE '%${this.searchText}%' OR ISSUING_AGENCY LIKE '%${this.searchText}%') AND (`;
    }

    if (this.order) {
      whereString += 'ORDER_ALERT_STATUS LIKE \'%Order%\'';
    }

    if (this.alert) {
      whereString += ' OR ORDER_ALERT_STATUS LIKE \'%Alert%\'';
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
      .getEvacOrders(
        whereString,
        location
          ? {
              x: location.longitude,
              y: location.latitude,
              radius: location.radius,
            }
          : null,
        { returnCentroid: userLocation !== null, returnGeometry: false },
      )
      .subscribe((evacs) => {
        const evacData = [];
        if (evacs && evacs.features) {
          for (const element of evacs.features.filter(
            (e) => e.attributes.EVENT_TYPE.toLowerCase() === 'wildfire' || e.attributes.EVENT_TYPE.toLowerCase() === 'fire',
          )) {
            let distance = null;
            if (userLocation) {
              const currentLat = Number(userLocation.coords.latitude);
              const currentLong = Number(userLocation.coords.longitude);

              if (element.centroid) {
                distance = (
                  haversineDistance(
                    element.centroid.y,
                    currentLat,
                    element.centroid.x,
                    currentLong,
                  ) / 1000
                ).toFixed(2);
              }
            }
            evacData.push({
              name: element.attributes.EVENT_NAME,
              eventType: element.attributes.EVENT_TYPE,
              status: element.attributes.ORDER_ALERT_STATUS,
              agency: element.attributes.ISSUING_AGENCY,
              preOcCode: element.attributes.PREOC_CODE,
              emrgOAAsysID: element.attributes.EMRG_OAA_SYSID,
              issuedOn: this.convertToDateTime(element.attributes.DATE_MODIFIED),
              distance,
              latitude: element.centroid.y,
              longitude: element.centroid.x,
            });
          }
        }
        if (this.selectedSortValue !== '') {
          this.selectedSortOrder =
            this.selectedSortOrder === 'asc' ? 'desc' : 'asc';
          const sortVal = this.selectedSortOrder === 'asc' ? 1 : -1;
          evacData.sort((a, b) =>
            a[this.selectedSortValue] > b[this.selectedSortValue]
              ? sortVal
              : b[this.selectedSortValue] > a[this.selectedSortValue]
                ? sortVal * -1
                : 0,
          );
          this.selectedSortValue = '';
        }
        this.dataSource.data = evacData;
        this.searchingComplete = true;
        this.cdr.detectChanges();
      });
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

  viewMap(evac: any) {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          evac: true,
          identify: true,
          longitude: evac.longitude,
          latitude: evac.latitude,
        },
      });
    }, 100);
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
