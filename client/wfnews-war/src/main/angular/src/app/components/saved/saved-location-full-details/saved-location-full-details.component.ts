import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NotificationService } from '@app/services/notification.service';
import { PointIdService } from '@app/services/point-id.service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import {
  ResourcesRoutes,
  convertToDateTimeTimeZone,
  convertToDateYear,
  displayDangerRatingDes,
  getStageOfControlIcon,
  getStageOfControlLabel,
  isMobileView,
} from '@app/utils';
import { SpatialUtilsService } from '@wf1/core-ui';
import { LocationData } from '../add-saved-location/add-saved-location.component';
import { AGOLService } from '@app/services/AGOL-service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/saved/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WatchlistService } from '@app/services/watchlist-service';
import { CommonUtilityService } from '@app/services/common-utility.service';

@Component({
  selector: 'wfnews-saved-location-full-details',
  templateUrl: './saved-location-full-details.component.html',
  styleUrls: ['./saved-location-full-details.component.scss'],
})
export class SavedLocationFullDetailsComponent implements OnInit {
  @Input() name;
  location: any;
  params: ParamMap;
  public distanceInKm = 1;
  public station: any = [];
  public hours: any = [];
  public stationName = '';
  public stationHour = '';
  public fireCentre: string;
  public dangerRatingLabel: string;
  public fireBans: any[];
  public evacOrders: any[] = [];
  public evacAlerts: any[] = [];
  public nearbyWildfires: any[];
  public userAllNotificationsPreferences: any;
  public evacsPopulated: boolean;

  displayDangerRatingDes = displayDangerRatingDes;
  convertToDateYear = convertToDateYear;
  getStageOfControlIcon = getStageOfControlIcon;
  getStageOfControlLabel = getStageOfControlLabel;
  convertToDateTimeTimeZone = convertToDateTimeTimeZone;
  isMobileView = isMobileView;

  constructor(
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private spatialUtilService: SpatialUtilsService,
    private pointIdService: PointIdService,
    private publishedIncidentService: PublishedIncidentService,
    private agolService: AGOLService,
    protected dialog: MatDialog,
    protected snackbarService: MatSnackBar,
    private watchlistService: WatchlistService,
    private commonUtilityService: CommonUtilityService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params: ParamMap) => {
      this.params = params;
    });
    this.notificationService
      .getUserNotificationPreferences()
      .then((response) => {
        if (response) {
          this.userAllNotificationsPreferences = response.notifications;
          this.location = this.fetchSavedLocation(response);
          this.getFireCentre(this.location);
          this.fetchWeather(this.location);
          this.fetchFireBans(this.location);
          this.fetchDangerRating(this.location);
          this.fetchEvacs(this.location);
          this.fetchNearbyWildfires(this.location);
        }
      });
  }

  fetchSavedLocation(notificationSettings) {
    try {
      if (this.params && this.params['name']) {
        for (const item of notificationSettings.notifications) {
          const longitude = Number(this.params['longitude']);
          const latitude = Number(this.params['latitude']);

          // Check if name, longitude, and latitude are valid
          if (
            item?.notificationName === this.params['name'] &&
            !isNaN(longitude) &&
            !isNaN(latitude) &&
            Number(item?.point?.coordinates[0]) === longitude &&
            Number(item?.point?.coordinates[1]) === latitude
          ) {
            return item;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching saved location', error);
    }
  }

  backToSaved() {
    this.router.navigate([ResourcesRoutes.SAVED]);
  }

  getFormattedCoords(coords): string {
    return this.spatialUtilService.formatCoordinates([coords[0], coords[1]]);
  }

  getFireCentre(location) {
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
    this.notificationService
      .getFireCentreByLocation(rectangleCoordinates)
      .then((response) => {
        if (response.data) {
          response = response.data;
        }
        if (response.features) {
          const fireCentre =
            response.features[0].properties.MOF_FIRE_CENTRE_NAME;
          this.fireCentre = fireCentre;
          this.cdr.markForCheck();
        }
      }).catch(err => {
        console.error('Could not retrieve fire centre for saved location', err);
      });
  }

  fetchWeather(location) {
    if (location && location.point && location.point.coordinates) {
      try {
        this.pointIdService
          .fetchNearestWeatherStation(
            location.point.coordinates[1],
            location.point.coordinates[0],
          )
          .then((response) => {
            if (response?.stationName) {
              this.stationName = response.stationName;
}
            for (const hours of response.hourly) {
              if (hours.temp !== null) {
                this.station = hours;
                if (this.station?.hour) {
                  this.stationHour = this.station?.hour.slice(-2) + ':00';
                }
                break;
              }
            }
          });
      } catch (error) {
        console.error('Error retrieving weather station', error);
      }
    }
  }

  fetchFireBans(location) {
    try {
      if (
        location &&
        location.point &&
        location.point.coordinates &&
        location.radius
      ) {
this.agolService
          .getBansAndProhibitions(null, {
            x: location.point.coordinates[0],
            y: location.point.coordinates[1],
            radius: 0.01,
          })
          .toPromise()
          .then((bans) => {
            if (bans?.features) {
              this.fireBans = [];
              for (const item of bans.features) {
                const attributePresent = this.commonUtilityService.isAttributePresent(
                  this.fireBans,
                  'ACCESS_PROHIBITION_DESCRIPTION',
                  item.attributes.ACCESS_PROHIBITION_DESCRIPTION
                );

                if (!attributePresent) {
                  this.fireBans.push(item);
                }          
              }
            }
          });
}
    } catch (err) {
      console.error('Could not retrieve fire bans for saved location', err);
    }
  }

  fetchDangerRating(location) {
      if (location?.point?.coordinates && location?.radius) {
      this.pointIdService
        .fetchNearby(
          location.point.coordinates[1],
          location.point.coordinates[0],
          location.radius,
        )
        .then((response) => {
          if (
            response?.features[0] &&
            response?.features[0].British_Columbia_Danger_Rating &&
            response?.features[0].British_Columbia_Danger_Rating[0] &&
            response?.features[0].British_Columbia_Danger_Rating[0].label
          ) {
            this.dangerRatingLabel =
              response.features[0].British_Columbia_Danger_Rating[0].label;
          }
        }).catch(err => {
          console.error('Could not retrieve danger rating for saved location', err);
        });
    }
  }

  fetchEvacs(location) {
    try {
      if (
        location &&
        location.point &&
        location.point.coordinates &&
        location.radius
      ) {
this.agolService
          .getEvacOrders(null, {
            x: location.point.coordinates[0],
            y: location.point.coordinates[1],
            radius: location.radius,
          })
          .toPromise()
          .then((evacs) => {
            if (evacs && evacs.features) {
              this.evacOrders = [];
              this.evacAlerts = [];
              for (const item of evacs.features) {
                this.evacsPopulated = true;
                if (item.attributes.ORDER_ALERT_STATUS === 'Alert') {
                  this.evacAlerts.push(item);
                } else if (item.attributes.ORDER_ALERT_STATUS === 'Order') {
                  this.evacOrders.push(item);
                }
              }
            }
          });
}
    } catch (err) {
      console.error('Could not retrieve evacuations for saved location', err);
    }
  }

  async fetchNearbyWildfires(location) {
    try {
      if (
        location &&
        location.point &&
        location.point.coordinates &&
        location.radius
      ) {
        const locationData = new LocationData();
        locationData.latitude = Number(location.point.coordinates[1]);
        locationData.longitude = Number(location.point.coordinates[0]);
        locationData.radius = location.radius;
        const stageOfControlCodes = ['OUT_CNTRL', 'HOLDING', 'UNDR_CNTRL'];
        const incidents = await this.publishedIncidentService
          .fetchPublishedIncidentsList(
            0,
            9999,
            locationData,
            null,
            null,
            stageOfControlCodes,
          )
          .toPromise();
        if (incidents?.collection && incidents?.collection?.length > 0) {
          this.nearbyWildfires = [];
          for (const item of incidents.collection) {
            this.nearbyWildfires.push(item);
          }
        }
      }
    } catch (err) {
      console.error(
        'Could not retrieve surrounding incidents for saved location',
        err,
      );
    }
    this.cdr.detectChanges();
  }

  navToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.location.point.coordinates[0],
          latitude: this.location.point.coordinates[1],
          savedLocation: true,
        },
      });
    }, 200);
  }

  delete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      autoFocus: false,
      width: '80vw',
      data: {
        title: 'Delete saved location',
        text: 'You won\'t be able to undo this action',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result['confirm']) {
        const locations = this.userAllNotificationsPreferences.filter(
          (item) =>
            item.notificationName !== this.location.notificationName &&
            item.point.coordinates[0] !== this.location.point.coordinates[0] &&
            item.point.coordinates[1] !== this.location.point.coordinates[1],
        );

        this.notificationService
          .updateUserNotificationPreferences(null, locations)
          .then(() => {
            this.cdr.markForCheck();
            this.router.navigateByUrl('/saved');
          })
          .catch((e) => {
            console.warn('saveNotificationPreferences fail', e);
            this.cdr.markForCheck();
            this.snackbarService.open(
              'Failed to save location',
              'OK',
              { duration: 10000, panelClass: 'snackbar-error' },
            );
          });

        this.cdr.markForCheck();
      }
    });
  }

  edit() {
    this.router.navigate([ResourcesRoutes.ADD_LOCATION], {
      queryParams: { location: JSON.stringify(this.location) },
    });
    // to be implemented
  }

  navigateToWeather() {
    if (
      this.location &&
      this.location.point &&
      this.location.point.coordinates
    ) {
      this.router.navigate([ResourcesRoutes.WEATHER_DETAILS], {
        queryParams: {
          latitude: this.location.point.coordinates[1],
          longitude: this.location.point.coordinates[0],
          name: this.location.notificationName,
        },
      });
    }
  }

  navigateToEvac(item) {
    if (
      item &&
      item.attributes &&
      item.attributes.EMRG_OAA_SYSID &&
      item.attributes.ORDER_ALERT_STATUS &&
      this.location &&
      this.location.notificationName &&
      this.location.point
    ) {
      let type = '';
      if (item.attributes.ORDER_ALERT_STATUS === 'Alert') {
type = 'evac-alert';
} else if (item.attributes.ORDER_ALERT_STATUS === 'Order') {
type = 'evac-order';
}
      this.router.navigate([ResourcesRoutes.FULL_DETAILS], {
        queryParams: {
          type,
          id: item.attributes.EMRG_OAA_SYSID,
          source: [ResourcesRoutes.SAVED_LOCATION],
          sourceName: this.location.notificationName,
          sourceLongitude: this.location.point.coordinates[0],
          sourceLatitude: this.location.point.coordinates[1],
        },
      });
    }
  }

  navigateToFullDetails(incident) {
    if (
      incident &&
      incident.fireYear &&
      incident.incidentNumberLabel &&
      this.location &&
      this.location.notificationName &&
      this.location.point
    ) {
      this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
        queryParams: {
          fireYear: incident.fireYear,
          incidentNumber: incident.incidentNumberLabel,
          source: [ResourcesRoutes.SAVED_LOCATION],
          sourceName: this.location.notificationName,
          sourceLongitude: this.location.point.coordinates[0],
          sourceLatitude: this.location.point.coordinates[1],
        },
      });
    }
  }

  onWatchlist(incident): boolean {
    return this.watchlistService
      .getWatchlist()
      .includes(incident.fireYear + ':' + incident.incidentNumberLabel);
  }

  addToWatchlist(incident) {
    if (!this.onWatchlist(incident)) {
      this.watchlistService.saveToWatchlist(
        incident.fireYear,
        incident.incidentNumberLabel,
      );
    }
  }
}
