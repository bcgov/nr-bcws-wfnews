import { ChangeDetectorRef, Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NotificationService } from '@app/services/notification.service';
import { PointIdService } from '@app/services/point-id.service';
import { ResourcesRoutes, displayDangerRatingDes, convertToDateYear, getStageOfControlIcon, getStageOfControlLabel, convertToDateTimeTimeZone } from '@app/utils';
import { SpatialUtilsService } from '@wf1/core-ui';
import { LocationData } from '../add-saved-location/add-saved-location.component';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { AGOLService } from '@app/services/AGOL-service';

@Component({
  selector: 'wfnews-saved-location-full-details',
  templateUrl: './saved-location-full-details.component.html',
  styleUrls: ['./saved-location-full-details.component.scss']
})
export class SavedLocationFullDetailsComponent implements OnInit {
  @Input() name;
  location: any;
  params: ParamMap;
  public distanceInKm: number = 1;
  public station: any = [];
  public hours: any = [];
  public stationName: string= "";
  public stationHour: string= "";
  public fireCentre: string;
  public dangerRatingLabel: string;
  public fireBans: any[];
  public evacOrders: any[] = [];
  public evacAlerts: any[] = [];
  public nearbyWildfires: any[];

  displayDangerRatingDes = displayDangerRatingDes
  convertToDateYear = convertToDateYear
  getStageOfControlIcon = getStageOfControlIcon
  getStageOfControlLabel = getStageOfControlLabel
  convertToDateTimeTimeZone = convertToDateTimeTimeZone

  constructor(private route: ActivatedRoute, private notificationService: NotificationService, private cdr: ChangeDetectorRef,
    private router: Router, private spatialUtilService: SpatialUtilsService, private pointIdService: PointIdService,
    private publishedIncidentService: PublishedIncidentService, private agolService: AGOLService) {

  }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe((params: ParamMap) => {
      this.params = params
    })
    await this.fetchSavedLocation()
    await this.fetchWeather()
    await this.fetchFireBans()
    this.fetchDangerRating()
    await this.fetchEvacs()
    await this.fetchNearbyWildfires()
    this.getFireCentre(this.location)
  }

  async fetchSavedLocation() {
    if (this.params && this.params['name']) {
      await this.notificationService.getUserNotificationPreferences().then(response => {
        if (response.notifications) {
          for (const item of response.notifications) {
            if (item?.notificationName === this.params['name'])
            this.location = item;
          }
        }
        this.cdr.detectChanges()
      }).catch(error => {
        console.error(error)
      })

    }

  }

  backToSaved() {
    this.router.navigate([ResourcesRoutes.SAVED])
  }

  getFormattedCoords(coords): string {
    return this.spatialUtilService.formatCoordinates([coords[0], coords[1]]);
  }

  getFireCentre(location) {
    const degreesPerPixel = 0.009; // rough estimation of the conversion factor from kilometers to degrees of latitude or longitude
    const distanceInDegrees = this.distanceInKm * degreesPerPixel;
      let latitude = location.point.coordinates[1];
      let longitude = location.point.coordinates[0];
      const minLongitude = longitude - distanceInDegrees;
      const maxLongitude = longitude + distanceInDegrees;
      const minLatitude = latitude - distanceInDegrees;
      const maxLatitude = latitude + distanceInDegrees;
      const rectangleCoordinates = [
        { latitude: maxLatitude, longitude: minLongitude }, // Top-left corner
        { latitude: maxLatitude, longitude: maxLongitude }, // Top-right corner
        { latitude: minLatitude, longitude: maxLongitude }, // Bottom-right corner
        { latitude: minLatitude, longitude: minLongitude }, // Bottom-left corner
        { latitude: maxLatitude, longitude: minLongitude }  // Closing the polygon
      ];
      this.notificationService.getFireCentreByLocation(rectangleCoordinates).then(
        response => {
          if (response.features) {
            const fireCentre = response.features[0].properties.MOF_FIRE_CENTRE_NAME;
            this.fireCentre = fireCentre;
            this.cdr.markForCheck()
          }
        }
      ).catch (error => {
        console.error('Could not retrieve fire centre for saved location', error)
      })
  }


  async fetchWeather() {
    if (this.location && this.location.point && this.location.point.coordinates) {
      try {
        await this.pointIdService.fetchNearestWeatherStation(this.location.point.coordinates[1], this.location.point.coordinates[0])
          .then(response => {
            if (response?.stationName) this.stationName = response.stationName;
            for (const hours of response?.hourly) {
              if (hours.temp !== null) {
                this.station = hours;
                if (this.station?.hour) {
                   this.stationHour = this.station?.hour.slice(-2) + ":00"
                 }
                break;
              }
            }
          });

      } catch (error) {
        console.error('Error retrieving weather station', error)
      }
    }

  }

  async fetchFireBans() {
  try {
    if (this.location && this.location.point && this.location.point.coordinates && this.location.radius)
      await this.agolService.getBansAndProhibitions(null, { x: this.location.point.coordinates[0], y: this.location.point.coordinates[1], radius: this.location.radius }).toPromise().then(bans => {
        if (bans && bans.features) {
          this.fireBans = []
          for (const item of bans.features) {
            this.fireBans.push(item)
          }
        }
      });

  } catch (err) {
    console.error('Could not retrieve fire bans for saved location', err)
  }

}

  fetchDangerRating() {
    try {
      if (this.location && this.location.point && this.location.point.coordinates && this.location.radius) {
        this.pointIdService.fetchNearby(this.location.point.coordinates[1], this.location.point.coordinates[0], this.location.radius).then(response => {
            if (response && response.features && response.features[0] 
              && response.features[0].British_Columbia_Danger_Rating && response.features[0].British_Columbia_Danger_Rating 
              && response.features[0].British_Columbia_Danger_Rating[0] && response.features[0].British_Columbia_Danger_Rating[0].label) {
              this.dangerRatingLabel = response.features[0].British_Columbia_Danger_Rating[0].label;
            }
        });         
      }
    }catch(err) {
      console.error('Could not retrieve danger rating for saved location', err)
    }

  }

  async fetchEvacs() {
    try {
      if (this.location && this.location.point && this.location.point.coordinates && this.location.radius)
        await this.agolService.getEvacOrders(null, { x: this.location.point.coordinates[0], y: this.location.point.coordinates[1], radius: this.location.radius }).toPromise().then(evacs => {
          if (evacs && evacs.features) {
            this.evacOrders = []
            this.evacAlerts = []
            for (const item of evacs.features) {
              if (item.attributes.ORDER_ALERT_STATUS === 'Alert'){
                this.evacAlerts.push(item)
              } else if (item.attributes.ORDER_ALERT_STATUS === 'Order'){
                this.evacOrders.push(item)
              }
              
            }
          }
        });

    } catch (err) {
      console.error('Could not retrieve evacuations for saved location', err)
    }

  }

  async fetchNearbyWildfires() {
    try {
      if (this.location && this.location.point && this.location.point.coordinates && this.location.radius) {
        const locationData = new LocationData()
        locationData.latitude = Number(this.location.point.coordinates[1]);
        locationData.longitude = Number(this.location.point.coordinates[0]);
        locationData.radius = this.location.radius;
        const stageOfControlCodes = ['OUT_CNTRL', 'HOLDING', 'UNDR_CNTRL'];
        const incidents = await this.publishedIncidentService.fetchPublishedIncidentsList(0, 9999, locationData, null, null, stageOfControlCodes).toPromise()
        if (incidents?.collection && incidents?.collection?.length > 0) {
          this.nearbyWildfires = []
          for (const item of incidents.collection) {
            this.nearbyWildfires.push(item)
          }
        }
      }
    } catch (err) {
      console.error('Could not retrieve surrounding incidents for saved location', err)
    }
    this.cdr.detectChanges()
  }

  navToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], { queryParams: { longitude: this.location.point.coordinates[0], latitude: this.location.point.coordinates[1], savedLocation: true } });
    }, 200);
  }

  delete() {
    // to be implemented
  }

  edit() {
    // to be implemented
  }

  navigateToEvac(item) {
    if (item && item.attributes && item.attributes.EMRG_OAA_SYSID && item.attributes.ORDER_ALERT_STATUS) {
      let type: string = "";
        if (item.attributes.ORDER_ALERT_STATUS === 'Alert') type = "evac-alert";
        else if (item.attributes.ORDER_ALERT_STATUS  === 'Order') type = "evac-order";
        this.router.navigate([ResourcesRoutes.FULL_DETAILS], { queryParams: { type: type, id: item.attributes.EMRG_OAA_SYSID, source: [ResourcesRoutes.SAVED_LOCATION] } });
      }
    }

    navigateToFullDetails(incident) {
      if(incident && incident.fireYear && incident.incidentNumberLabel) {
        this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], { queryParams: { fireYear: incident.fireYear, incidentNumber: incident.incidentNumberLabel, source: [ResourcesRoutes.SAVED_LOCATION]  } })
      }

    }




}


