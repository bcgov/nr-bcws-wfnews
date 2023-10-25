import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AGOLService } from '@app/services/AGOL-service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { convertToDateYear, getStageOfControlLabel, getStageOfControlIcon } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';
import * as L from 'leaflet';
import { FullDetailsComponent } from '../full-details.component';

@Component({
  selector: 'wfnews-area-restrictions-full-details',
  templateUrl: './area-restrictions-full-details.component.html',
  styleUrls: ['./area-restrictions-full-details.component.scss']
})
export class AreaRestrictionsFullDetailsComponent extends FullDetailsComponent implements OnInit {
  name: string;
  issuedDate: string;
  fireCentre: string;
  map: any;
  currentRestrictionsUrl: string;
  recSiteTrailsClosuresUrl: string;
  parksClosuresUrl: string;
  incident: any = { };
  incidentName: string;
  incidentNumber: string;
  wildfireYear: string;
  getStageOfControlLabel = getStageOfControlLabel;
  getStageOfControlIcon = getStageOfControlIcon;


  constructor(private cdr: ChangeDetectorRef, 
    private httpClient: HttpClient, 
    private appConfigService: AppConfigService, 
    router: ActivatedRoute, 
    private fullDetails: FullDetailsComponent, 
    private agolService: AGOLService,
    private publishedIncidentService: PublishedIncidentService) {
    super(router);
    this.restrictionID = fullDetails.restrictionID;
    this.agolService = agolService;
  }

 ngOnInit(): void {
  this.populateAreaRestrictionByID(this.restrictionID)
  this.populateIncident()
  this.populateUrls()
 } 

 initMap(latitude: string, longitude: string): void {
    this.cdr.detectChanges()

    // Create map and append data to the map component
    const location = [Number(latitude), Number(longitude)]

    this.map = L.map('map', {
    attributionControl: false,
    zoomControl: false,
    dragging: false,
    doubleClickZoom: false,
    boxZoom: false,
    trackResize: false,
    scrollWheelZoom: false,
    }).setView(location, 9)
    // configure map data
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

    if(this.incident.fireOfNoteInd) {
      L.marker(location, {icon: fireOfNoteIcon}).addTo(this.map);
    }else{
      let colorToDisplay;
      switch(this.incident.stageOfControlCode) {
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
      L.circleMarker(location,{radius:15,fillOpacity:1,color:'black', fillColor:colorToDisplay}).addTo(this.map)
    }
    this.cdr.detectChanges()
  }

 populateAreaRestrictionByID(id: string) {
    let areaRestrict = this.agolService.getAreaRestrictionsByID(id).toPromise().then((response) => {
      if (response.features && response.features[0] && response.features[0].attributes) {
          let name: string = response.features[0].attributes.NAME;
          name = name.replace("Area Restriction", "").trim();
          this.name = name + " Restricted Area"
          this.fireCentre = response.features[0].attributes.FIRE_CENTRE_NAME + " Fire Centre";
          this.issuedDate = convertToDateYear(response.features[0].attributes.ACCESS_STATUS_EFFECTIVE_DATE);
      }
   })
 }

 populateIncident() {
  // Using these values as a stub until preview page is complete to pass the incident number from. 
  this.publishedIncidentService.fetchPublishedIncident("N15401", "2023").toPromise().then(async result => {
    this.incident = result
    this.incident.discoveryDate = convertToDateYear(result.discoveryDate)
    let fireName = result.incidentName
    fireName = fireName.replace("Fire", "").trim();
    this.incidentName = fireName + " Wildfire";
    this.initMap(result.latitude, result.longitude)
  })
 }

 populateUrls() {
  let currentRestrictions = this.appConfigService.getConfig().externalAppConfig['currentRestrictions'].toString()
  let recSiteTrailsClosures = this.appConfigService.getConfig().externalAppConfig['recSiteTrailsClosures'].toString()
  let parksClosures = this.appConfigService.getConfig().externalAppConfig['parksClosures'].toString()
  this.currentRestrictionsUrl = currentRestrictions;
  this.recSiteTrailsClosuresUrl = recSiteTrailsClosures;
  this.parksClosuresUrl = parksClosures;
 }

}
