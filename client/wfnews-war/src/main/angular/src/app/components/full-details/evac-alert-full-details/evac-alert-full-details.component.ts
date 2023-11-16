import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AGOLService, AgolOptions } from '@app/services/AGOL-service';
import { PublishedIncidentService, SimpleIncident } from '@app/services/published-incident-service';
import { ResourcesRoutes, convertToDateTime } from '@app/utils';
import L from 'leaflet';
import { setDisplayColor } from "../../../utils"
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AppConfigService } from '@wf1/core-ui';
import { Router } from '@angular/router';

export class EvacData {
  public name: string;
  public issuedDate: string;
  public bulletinUrl: string;
  public issuingAgency: string;
  public centroidLongitude: string;
  public centroidLatitude: string;
}

@Component({
  selector: 'wfnews-evac-alert-full-details',
  templateUrl: './evac-alert-full-details.component.html',
  styleUrls: ['./evac-alert-full-details.component.scss']
})
export class EvacAlertFullDetailsComponent implements OnInit {
  @Input() id: string
  public evacData: EvacData;
  public incident: SimpleIncident | null
  public map: any;
  public localAuthoritiesUrl: string;
  public wildfirePreparednessUrl: string;
  public buildEmergencyKitUrl: string;

  convertToDateTime = convertToDateTime;

  constructor(private agolService: AGOLService, private publishedIncidentService: PublishedIncidentService, private appConfigService: AppConfigService, private cdr: ChangeDetectorRef, private router: Router) {

  }

  async ngOnInit(): Promise<void> {
    await this.populateEvacByID({ returnGeometry: true, returnCentroid: true, returnExtent: false })
    this.initMap()
  }

  async initMap() {
    // Create map and append data to the map component
    const location = [Number(this.evacData.centroidLatitude), Number(this.evacData.centroidLongitude)]

    this.map = L.map('restrictions-map', {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      trackResize: false,
      scrollWheelZoom: false
    }).setView(location, 9)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map)

    const databcUrl = this.appConfigService.getConfig()['mapServices']['openmapsBaseUrl'].toString()
    L.tileLayer.wms(databcUrl, {
      layers: 'WHSE_HUMAN_CULTURAL_ECONOMIC.EMRG_ORDER_AND_ALERT_AREAS_SP',
      styles: '6885',
      format: 'image/png',
      transparent: true,
      version: '1.1.1'
    }).addTo(this.map);
    L.tileLayer.wms(databcUrl, {
      layers: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_CURRENT_FIRE_POLYS_SP',
      styles: '1751_1752',
      format: 'image/png',
      transparent: true,
      version: '1.1.1'
    }).addTo(this.map);

    const fireOfNoteIcon = L.icon({
      iconUrl: "/assets/images/local_fire_department.png",
      iconSize: [35, 35],
      shadowAnchor: [4, 62],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    if (this.incident) {
      if (this.incident.fireOfNoteInd) {
        L.marker(location, { icon: fireOfNoteIcon }).addTo(this.map);
      } else {
        const colorToDisplay = setDisplayColor(this.incident.stageOfControlCode)
        L.circleMarker(location, { radius: 5, fillOpacity: 1, color: 'black', fillColor: colorToDisplay }).addTo(this.map)
      }
    }

    // now fetch the rest of the incidents in the area and display on map
    try {
      const locationData = new LocationData()
      locationData.latitude = Number(this.evacData.centroidLatitude);
      locationData.longitude = Number(this.evacData.centroidLongitude);
      locationData.radius = 10;
      const stageOfControlCodes = ['OUT_CNTRL', 'HOLDING', 'UNDR_CNTRL'];
      const incidents = await this.publishedIncidentService.fetchPublishedIncidentsList(0, 9999, locationData, null, null, stageOfControlCodes).toPromise()
      if (incidents?.collection && incidents?.collection?.length > 0) {
        for (const item of incidents.collection) {
          const location = [Number(item.latitude), Number(item.longitude)]
          if (item.fireOfNoteInd) {
            L.marker(location, { icon: fireOfNoteIcon }).addTo(this.map);
          } else {
            const colorToDisplay = setDisplayColor(item.stageOfControlCode)
            L.circleMarker(location, { radius: 5, fillOpacity: 1, color: 'black', fillColor: colorToDisplay }).addTo(this.map)
          }
        }
      }
    } catch (err) {
      console.error('Could not retrieve surrounding incidents for evacuation alert')
    }
    this.cdr.detectChanges()
  }

  async populateEvacByID(options: AgolOptions = null) {
    this.evacData = null
    const response = await this.agolService.getEvacOrdersByID(this.id, options).toPromise()
    if (response?.features[0]?.attributes) {
      const evac = response.features[0]

      this.evacData = new EvacData

      this.evacData.name = evac.attributes.EVENT_NAME;
      this.evacData.issuingAgency = evac.attributes.ISSUING_AGENCY;
      this.evacData.issuedDate = evac.attributes.DATE_MODIFIED;
      this.evacData.bulletinUrl = evac.attributes.BULLETIN_URL;
      this.evacData.centroidLatitude = evac.centroid.y;
      this.evacData.centroidLongitude = evac.centroid.x;

      await this.populateIncident(evac.geometry.rings)
    } else {
      console.error('Could not populate evacuation order by ID: ' + this.id)
    }
  }

  async populateIncident(polygon: [][]) {
    try {
      this.incident = await this.publishedIncidentService.populateIncidentByPoint(polygon)
    } catch (error) {
      console.log('Caught error while populating associated incident for evacuation: ' + error)
    }
  }


  navToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], { queryParams: { longitude: this.evacData.centroidLongitude, latitude: this.evacData.centroidLatitude, evacuationAlert: true } });
    }, 200);
  }


  navToIncident(incident: SimpleIncident) {
    this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT],
      { queryParams: { fireYear: incident.fireYear, incidentNumber: incident.incidentNumberLabel, source: [ResourcesRoutes.FULL_DETAILS] } })
  }

  openLink(link: string) {
    window.open(this.appConfigService.getConfig().externalAppConfig[link] as unknown as string, '_blank')
  }

  navToBulletinUrl() {
    if (this.evacData && this.evacData.bulletinUrl) window.open(this.evacData.bulletinUrl)
  }


}
