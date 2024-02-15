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
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
} from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  FilterByLocationDialogComponent,
  LocationData,
} from '../filter-by-location/filter-by-location-dialog.component';
import { Router } from '@angular/router';
import { ResourcesRoutes, convertToDateTime } from '@app/utils';

@Component({
  selector: 'wf-area-restriction-list',
  templateUrl: './area-restriction-list.component.desktop.html',
  styleUrls: [
    '../../common/base-collection/collection.component.scss',
    './area-restriction-list.component.desktop.scss',
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AreaRestrictionListComponent implements OnInit {
  public dataSource = new MatTableDataSource<any>();
  public selectedSortValue = '';
  public selectedSortOrder = 'desc';
  public sortOptions = [
    { description: 'Fire Centre', code: 'fireCentre' },
    { description: 'Name', code: 'name' },
    { description: 'Issued On', code: 'issuedOn' },
  ];
  public searchText;
  public searchTimer;
  public searchingComplete = false;
  public columnsToDisplay = [
    'name',
    'issuedOn',
    'fireCentre',
    'distance',
    'viewMap',
  ];

  public locationData: LocationData;
  convertToDateTime = convertToDateTime;

  private isExtraSmall: Observable<BreakpointState> =
    this.breakpointObserver.observe(Breakpoints.XSmall);

  constructor(
    private agolService: AGOLService,
    private cdr: ChangeDetectorRef,
    private commonUtilityService: CommonUtilityService,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    protected router: Router,
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

    const whereString =
      this.searchText && this.searchText.length > 0
        ? `NAME LIKE '%${this.searchText}%' OR FIRE_CENTRE_NAME LIKE '%${this.searchText}%'`
        : null;

    this.agolService
      .getAreaRestrictions(
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
      .subscribe((areaRestrictions) => {
        const areaRestrictionData = [];
        if (areaRestrictions && areaRestrictions.features) {
          for (const element of areaRestrictions.features) {
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
            areaRestrictionData.push({
              protRsSysID: element.attributes.PROT_RA_SYSID,
              name: element.attributes.NAME,
              issuedOn: this.convertToDateTime(
                element.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
              ),
              fireCentre: element.attributes.FIRE_CENTRE_NAME,
              fireZone: element.attributes.FIRE_ZONE_NAME,
              bulletinUrl: element.attributes.BULLETIN_URL,
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
          areaRestrictionData.sort((a, b) =>
            a[this.selectedSortValue] > b[this.selectedSortValue]
              ? sortVal
              : b[this.selectedSortValue] > a[this.selectedSortValue]
                ? sortVal * -1
                : 0,
          );
          this.selectedSortValue = '';
        }
        this.dataSource.data = areaRestrictionData;
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

  viewMap(restriction: any) {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          areaRestriction: true,
          identify: true,
          longitude: restriction.longitude,
          latitude: restriction.latitude,
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
