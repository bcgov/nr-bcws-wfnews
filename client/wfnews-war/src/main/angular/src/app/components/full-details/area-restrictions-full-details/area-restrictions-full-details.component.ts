import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router as Route } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AGOLService, AgolOptions } from '@app/services/AGOL-service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { ResourcesRoutes, convertToDateYear, getStageOfControlIcon, getStageOfControlLabel } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';
import * as L from 'leaflet';

export class AreaRestriction {
  public name: string;
  public issuedDate: string;
  public bulletinUrl: string;
  public wildfireYear: string;
  public centroidLongitude: string;
  public centroidLatitude: string;
  public fireCentre: string;
}

export class SimpleIncident {
  public incidentName: string;
  public incidentNumber: string;
  public discoveryDate: string
  public stageOfControlCode: string;
  public stageOfControlLabel: string;
  public stageOfControlIcon: string;
  public fireOfNoteInd: boolean;
}

@Component({
  selector: 'wfnews-area-restrictions-full-details',
  templateUrl: './area-restrictions-full-details.component.html',
  styleUrls: ['./area-restrictions-full-details.component.scss']
})
export class AreaRestrictionsFullDetailsComponent implements OnInit {
  @Input() id: string

  public restrictionData: AreaRestriction | null
  public incident: SimpleIncident | null
  public map: any;

  public getStageOfControlLabel = getStageOfControlLabel;
  public getStageOfControlIcon = getStageOfControlIcon;

  constructor(private cdr: ChangeDetectorRef, private appConfigService: AppConfigService, private agolService: AGOLService, private publishedIncidentService: PublishedIncidentService, private route: Route) { }

  async ngOnInit(): Promise<void> {
    await this.populateAreaRestrictionByID({ returnGeometry: true, returnCentroid: true, returnExtent: false })
    this.initMap()
  }

  async initMap() {
    // Create map and append data to the map component
    const location = [Number(this.restrictionData.centroidLatitude), Number(this.restrictionData.centroidLongitude)]

    // this code is duplicated in a few places now. Might make sense to move into
    // a specific component or util factory class
    this.map = L.map('restrictions-map', {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      trackResize: false,
      scrollWheelZoom: false
    }).setView(location, 9)
    // configure map  - change from osm to ESRI eventually. Needs to be done elsewhere too
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map)

    const databcUrl = this.appConfigService.getConfig()['mapServices']['openmapsBaseUrl'].toString()
    L.tileLayer.wms(databcUrl, {
      layers: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_RESTRICTED_AREAS_SP ',
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
      opacity: 0.5
    }).addTo(this.map)

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
        const colorToDisplay = this.setDisplayColor(this.incident.stageOfControlCode)
        L.circleMarker(location, { radius: 15, fillOpacity: 1, color: 'black', fillColor: colorToDisplay }).addTo(this.map)
      }
    }

    // now fetch the rest of the incidents in the area and display on map
    try {
        const locationData = new LocationData()
        locationData.latitude = Number(this.restrictionData.centroidLatitude);
        locationData.longitude = Number(this.restrictionData.centroidLongitude);
        locationData.radius = 10;
        const stageOfControlCodes = ['OUT_CNTRL', 'HOLDING', 'UNDR_CNTRL'];
        const incidents = await this.publishedIncidentService.fetchPublishedIncidentsList(0, 9999, locationData, null, null, stageOfControlCodes).toPromise()
        if (incidents?.collection && incidents?.collection?.length > 0){
          for (const item of incidents.collection) {
            const location = [Number(item.latitude), Number(item.longitude)]
            if (item.fireOfNoteInd) {
              L.marker(location, { icon: fireOfNoteIcon }).addTo(this.map);
            } else {
              const colorToDisplay = this.setDisplayColor(item.stageOfControlCode)
              L.circleMarker(location, { radius: 5, fillOpacity: 1, color: 'black', fillColor: colorToDisplay }).addTo(this.map)
            }
          }
      }
    } catch(err){
      console.log('Could not retrieve surroundung incidents for area restriction')
    } 
    this.cdr.detectChanges()
  }

  async populateAreaRestrictionByID(options: AgolOptions = null) {
    this.restrictionData = null
    const response = await this.agolService.getAreaRestrictionsByID(this.id, options).toPromise()
    // could also do response length === 1
    if (response?.features[0]?.attributes) {
      const areaRestriction = response.features[0]

      this.restrictionData = new AreaRestriction

      this.restrictionData.name = areaRestriction.attributes.NAME.replace("Area Restriction", "").trim() + " Restricted Area"
      this.restrictionData.fireCentre = areaRestriction.attributes.FIRE_CENTRE_NAME + " Fire Centre";
      this.restrictionData.issuedDate = convertToDateYear(areaRestriction.attributes.ACCESS_STATUS_EFFECTIVE_DATE);
      this.restrictionData.bulletinUrl = areaRestriction.attributes.BULLETIN_URL;
      this.restrictionData.centroidLatitude = areaRestriction.centroid.y;
      this.restrictionData.centroidLongitude = areaRestriction.centroid.x;

      await this.populateIncident(areaRestriction.geometry.rings)
    } else {
      // What happens when this fails?
    }
  }

  async populateIncident(restrictionPolygon: [][]) {
    const turf = window['turf']

    const poly: number[][] = restrictionPolygon[0]
    const polyArray: Array<number>[] = [];

    for (let item of poly) {
      polyArray.push(item)
    }

    const multiPolyArray = [polyArray];
    const bufferedPolygon = turf.polygon(multiPolyArray)
    const buffer = turf.buffer(bufferedPolygon, 10, {
      units: 'kilometers'
    });

    const bbox = turf.bbox(buffer)
    const stageOfControlCodes = ['OUT_CNTRL', 'HOLDING', 'UNDR_CNTRL'];

    // find incidents within the area restriction polygon
    // If we're only expecting 1, why fetch 1000 and only use the first?
    // what happens if there are more than one?
    this.incident = null
    const incidents = await this.publishedIncidentService.fetchPublishedIncidentsList(0, 1, null, null, null, stageOfControlCodes, null, bbox).toPromise()
    if (incidents?.collection && incidents?.collection?.length === 1) {
      const firstIncident = incidents.collection[0]
      const fireName = firstIncident.incidentName.replace("Fire", "").trim()

      this.incident = new SimpleIncident

      this.incident.discoveryDate = convertToDateYear(firstIncident.discoveryDate)
      this.incident.incidentName = fireName + " Wildfire"
      this.incident.fireOfNoteInd = firstIncident.fireOfNoteInd
      this.incident.stageOfControlCode = firstIncident.stageOfControlCode
      this.incident.stageOfControlIcon = getStageOfControlIcon(firstIncident.stageOfControlCode)
      this.incident.stageOfControlLabel = getStageOfControlLabel(firstIncident.stageOfControlCode)
    } else {
      // what happens when this fails?
    }
  }

  setDisplayColor(stageOfControlCode: string){
    let colorToDisplay;
        switch (stageOfControlCode) {
          case 'OUT_CNTRL':
            colorToDisplay = '#FF0000'
            break;
          case 'HOLDING':
            colorToDisplay = '#ffff00'
            break;
          case 'UNDR_CNTRL':
            colorToDisplay = '#98E600'
            break;
          case 'OUT':
            colorToDisplay = '#999999'
            break;
          default:
            colorToDisplay = 'white';
        }
    return colorToDisplay;
  }

  navToMap() {
    setTimeout(() => {
      this.route.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], { queryParams: { longitude: this.restrictionData.centroidLongitude, latitude: this.restrictionData.centroidLatitude, areaRestriction: true } });
    }, 200);
  }

  navToCurrentRestrictions() {
    window.open(this.appConfigService.getConfig().externalAppConfig['currentRestrictions'] as unknown as string, '_blank')
  }

  navToRecClosures() {
    window.open(this.appConfigService.getConfig().externalAppConfig['recSiteTrailsClosures'] as unknown as string, '_blank')
  }

  navToParksClosures() {
    window.open(this.appConfigService.getConfig().externalAppConfig['parksClosures'] as unknown as string, '_blank')
  }

  navToBulletinUrl() {
    window.open(this.restrictionData.bulletinUrl, '_blank')
  }
}
