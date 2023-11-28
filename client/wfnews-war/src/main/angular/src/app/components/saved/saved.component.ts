import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AGOLService } from '@app/services/AGOL-service';
import { NotificationService } from '@app/services/notification.service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { ResourcesRoutes } from '@app/utils';
import { SpatialUtilsService } from '@wf1/core-ui';

@Component({
  selector: 'wfnews-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})

export class SavedComponent implements OnInit {
  public savedLocations: any = [];
  public savedWildfires: any = [];
  public distanceInKm: number = 1;

  constructor(
    protected router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    protected spatialUtilService: SpatialUtilsService,
    private agolService: AGOLService,
    private publishedIncidentService: PublishedIncidentService

  ) {
  }

  ngOnInit(): void {
      // Fetch the notificationSettings.
      this.notificationService.getUserNotificationPreferences().then(response =>{
        if (response.notifications){
          this.savedLocations = response.notifications;
          this.getFireBans(this.savedLocations);
          this.getFireCentre(this.savedLocations);
          this.getEvacs(this.savedLocations);
          this.getWildfires(this.savedLocations);
        }
        this.cdr.detectChanges()
      }). catch(error => {
        console.error(error)
      }
    )
  }
  addNewLocation() {
    this.router.navigate([ResourcesRoutes.ADD_LOCATION]);
  }

  getFormattedCoords(coords): string {
    return this.spatialUtilService.formatCoordinates([coords[0],coords[1]]);
  }

  getFireBans(locations) {
    locations.forEach((location, outerIndex) => {
      this.agolService.getBansAndProhibitions(
        null,
        { x: location.point.coordinates[0], y: location.point.coordinates[1], radius: location.radius },
        { returnCentroid: true, returnGeometry: false }
      )
      .subscribe(bans => {
        this.savedLocations[outerIndex].bans = [];
        for (const innerIndex in bans.features) {
          const element = bans.features[innerIndex];  
          this.savedLocations[outerIndex].bans.push(element);
          this.cdr.detectChanges()
        }
      });
    });
  }

  getFireCentre(locations) {
    const degreesPerPixel = 0.009; // rough estimation of the conversion factor from kilometers to degrees of latitude or longitude
    const distanceInDegrees = this.distanceInKm * degreesPerPixel;
    locations.forEach((location, outerIndex) => {
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
            this.savedLocations[outerIndex].fireCentre = fireCentre;
            this.cdr.detectChanges()
          }
        }
      ).catch (error => {
        console.error('can not get fire centre', error)
      })
    });
  }

  
  getEvacs(locations) {
    locations.forEach((location, outerIndex) => {
      this.agolService.getEvacOrders(
        null,
        { x: location.point.coordinates[0], y: location.point.coordinates[1], radius: location.radius },
        { returnCentroid: true, returnGeometry: false }
      )
      .subscribe(result => {
        this.savedLocations[outerIndex].evacs = [];
        for (const innerIndex in result.features) {
          const element = result.features[innerIndex];  
          this.savedLocations[outerIndex].evacs.push(element);
          this.cdr.detectChanges()
        }
      });
    });
  }

  getWildfires(locations) {
    locations.forEach((location, outerIndex) => {
      const locationData : LocationData = {
        latitude : location.point.coordinates[1],
        longitude : location.point.coordinates[0],
        radius : location.radius,
        searchText : null,
        useUserLocation : null
      }
      this.publishedIncidentService.fetchPublishedIncidentsList(1, 10, locationData, null, true, ['OUT_CNTRL', 'HOLDING', 'UNDR_CNTRL'])
      .subscribe(result => {
        this.savedLocations[outerIndex].wildfires = [];
        result.collection.forEach(element => {
          this.savedLocations[outerIndex].wildfires.push(element);
          this.cdr.detectChanges()
        });
      })
    });
  }


  enterDetail(location) {
    console.log('detail not implemented ')
  }
}
