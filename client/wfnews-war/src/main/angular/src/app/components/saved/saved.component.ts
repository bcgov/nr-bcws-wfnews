import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/saved/confirmation-dialog/confirmation-dialog.component';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AGOLService } from '@app/services/AGOL-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { NotificationService } from '@app/services/notification.service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { WatchlistService } from '@app/services/watchlist-service';
import {
  ResourcesRoutes,
  convertToDateYear,
  convertToStageOfControlDescription,
  isMobileView,
} from '@app/utils';
import { SpatialUtilsService } from '@wf1/core-ui';
import { Capacitor } from '@capacitor/core';


@Component({
  selector: 'wfnews-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss'],
})
export class SavedComponent implements OnInit {
  public savedLocations: any = [];
  public savedWildfires: any = [];
  public distanceInKm = 1;
  public wildFireWatchlist: any[] = [];
  public errorString: string;
  public notificationsTitle: string;
  public notificationsSubTitle: string;
  convertToStageOfControlDescription = convertToStageOfControlDescription;
  convertToDateYear = convertToDateYear;
  isMobileView = isMobileView;

  constructor(
    protected router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    protected spatialUtilService: SpatialUtilsService,
    private agolService: AGOLService,
    private publishedIncidentService: PublishedIncidentService,
    private watchlistService: WatchlistService,
    protected dialog: MatDialog,
    private commonUtilityService: CommonUtilityService
  ) {}

  ngOnInit(): void {
    // Fetch the notificationSettings.
    this.notificationService
      .getUserNotificationPreferences()
      .then((response) => {
        if (response.notifications) {
          this.savedLocations = response.notifications;
          this.getFireBans(this.savedLocations);
          this.getFireCentre(this.savedLocations);
          this.getEvacs(this.savedLocations);
          this.getWildfires(this.savedLocations);
          this.getDangerRatings(this.savedLocations);
        }
        this.cdr.detectChanges();
      })
      .catch((error) => {
        console.error(error);
      });

    this.loadWatchlist();

    const isNative = Capacitor.isNativePlatform();
    this.notificationsTitle = isNative ? 'Saved Locations & Notifications' : 'Saved Locations';
    this.notificationsSubTitle = isNative ? 'Add a saved location to receive notifications' : 'Add a saved location';
  }

  addNewLocation() {
    this.router.navigate([ResourcesRoutes.ADD_LOCATION]);
  }

  getFormattedCoords(coords): string {
    return this.spatialUtilService.formatCoordinates([coords[0], coords[1]]);
  }

  getFireBans(locations) {
    locations.forEach((location, outerIndex) => {
      this.agolService
        .getBansAndProhibitions(
          null,
          {
            x: location.point.coordinates[0],
            y: location.point.coordinates[1],
            radius: 0.01,
          },
          { returnCentroid: true, returnGeometry: false },
        )
        .subscribe((bans) => {
          this.savedLocations[outerIndex].bans = [];
          for (const innerIndex in bans?.features) {
            if (Object.hasOwn(bans?.features, innerIndex)) {
              const element = bans.features[innerIndex];

              const attributePresent = this.commonUtilityService.isAttributePresent(
                this.savedLocations[outerIndex].bans,
                'ACCESS_PROHIBITION_DESCRIPTION',
                element.attributes.ACCESS_PROHIBITION_DESCRIPTION
                );
          
              if (!attributePresent) {
                this.savedLocations[outerIndex].bans.push(element);
                this.cdr.markForCheck();
              }
            }
          }
        });
    });
  }

  getDangerRatings(locations) {
    try {
      locations.forEach((location, outerIndex) => {
        const rectangleCoordinates = this.bboxHelper(location);
        this.notificationService
          .getDangerRatingByLocation(rectangleCoordinates)
          .then((dangerRatings) => {
            if (dangerRatings.data) {
              dangerRatings = dangerRatings.data;
            }
            if (dangerRatings.features) {
              const element =
                dangerRatings.features[0].properties.DANGER_RATING_DESC;
              this.savedLocations[outerIndex].dangerRatings = element;
              this.cdr.markForCheck();
            }
          });
      });
    } catch (error) {
      console.error('can not get danger rating', error);
    }
  }

  bboxHelper(location) {
    const degreesPerPixel = 0.009; // rough estimation of the conversion factor from kilometers to degrees of latitude or longitude
    const distanceInDegrees = this.distanceInKm * degreesPerPixel;
    const latitude = location.point.coordinates[1];
    const longitude = location.point.coordinates[0];
    const minLongitude = longitude - distanceInDegrees;
    const maxLongitude = longitude + distanceInDegrees;
    const minLatitude = latitude - distanceInDegrees;
    const maxLatitude = latitude + distanceInDegrees;
    const rectangleCoordinates = [
      { latitude: maxLatitude, longitude: minLongitude }, // Top-left corner
      { latitude: maxLatitude, longitude: maxLongitude }, // Top-right corner
      { latitude: minLatitude, longitude: maxLongitude }, // Bottom-right corner
      { latitude: minLatitude, longitude: minLongitude }, // Bottom-left corner
      { latitude: maxLatitude, longitude: minLongitude }, // Closing the polygon
    ];
    return rectangleCoordinates;
  }

  getFireCentre(locations) {
    // const degreesPerPixel = 0.009; // rough estimation of the conversion factor from kilometers to degrees of latitude or longitude
    // const distanceInDegrees = this.distanceInKm * degreesPerPixel;
    try {
      locations.forEach((location, outerIndex) => {
        const rectangleCoordinates = this.bboxHelper(location);
        this.notificationService
          .getFireCentreByLocation(rectangleCoordinates)
          .then((response) => {
            if (response.data) {
              response = response.data;
            }
            if (response.features) {
              const fireCentre =
                response.features[0].properties.MOF_FIRE_CENTRE_NAME;
              this.savedLocations[outerIndex].fireCentre = fireCentre;
              this.cdr.markForCheck();
            }
          });
      });
    } catch (error) {
      console.error('can not get fire centre', error);
    }
  }

  getEvacs(locations) {
    locations.forEach((location, outerIndex) => {
      this.agolService
        .getEvacOrders(
          null,
          {
            x: location.point.coordinates[0],
            y: location.point.coordinates[1],
            radius: location.radius,
          },
          { returnCentroid: true, returnGeometry: false }
        )
        .subscribe((result) => {
          this.savedLocations[outerIndex].evacs = [];
          for (const innerIndex in result?.features) {
            const element = result?.features[innerIndex];
            this.savedLocations[outerIndex].evacs.push(element);
            this.cdr.markForCheck();
          }
        });
    });
  }

  getWildfires(locations) {
    locations.forEach((location, outerIndex) => {
      const locationData: LocationData = {
        latitude: location.point.coordinates[1],
        longitude: location.point.coordinates[0],
        radius: location.radius,
        searchText: null,
        useUserLocation: null,
      };
      this.publishedIncidentService
        .fetchPublishedIncidentsList(1, 10, locationData, null, true, [
          'OUT_CNTRL',
          'HOLDING',
          'UNDR_CNTRL',
        ])
        .subscribe((result) => {
          this.savedLocations[outerIndex].wildfires = [];
          result.collection.forEach((element) => {
            this.savedLocations[outerIndex].wildfires.push(element);
            this.cdr.markForCheck();
          });
        });
    });
  }

  enterDetail(location) {
    console.log('detail not implemented ');
  }

  navToFullDetails(location: any) {
    if (
      location?.notificationName &&
      location?.point &&
      location?.point?.coordinates
    ) {
      this.router.navigate([ResourcesRoutes.SAVED_LOCATION], {
        queryParams: {
          type: 'saved-location',
          name: location.notificationName,
          latitude: location.point.coordinates[1],
          longitude: location.point.coordinates[0],
        },
      });
    }
  }

  async loadWatchlist() {
    this.wildFireWatchlist = [];
    const watchlistItems = this.watchlistService.getWatchlist();
    for (const item of watchlistItems) {
      const fireYear = item.split(':')[0];
      const incidentNumber = item.split(':')[1];
      const incident = await this.publishedIncidentService
        .fetchPublishedIncident(incidentNumber, fireYear)
        .toPromise();
      if (incident) {
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };
        incident.lastUpdatedTimestamp = new Date(
          incident.lastUpdatedTimestamp,
        ).toLocaleTimeString('en-US', options);
        this.wildFireWatchlist.push(incident);
      }
    }
    this.cdr.detectChanges();
  }

  navigatToWildfireFullDetail(wildFire: any) {
    this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
      queryParams: {
        fireYear: wildFire.fireYear,
        incidentNumber: wildFire.incidentNumberLabel,
        source: [ResourcesRoutes.SAVED],
      },
    });
  }

  deleteFromWatchList(event: Event, wildFire: any) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      autoFocus: false,
      width: '80vw',
      data: {
        title: 'Confirmation',
        text: 'Are you sure you want to remove this Wildfire from your Saved Wildfires?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result['confirm']) {
        this.wildFireWatchlist = this.wildFireWatchlist.filter(
          (item) =>
            !(
              item.fireYear === wildFire.fireYear &&
              item.incidentNumberLabel === wildFire.incidentNumberLabel
            ),
        );
        this.watchlistService.removeFromWatchlist(
          wildFire.fireYear,
          wildFire.incidentNumberLabel,
        );
        this.cdr.markForCheck();
      }
    });
  }
}
