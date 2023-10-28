import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router as Route } from '@angular/router';
import { AGOLService, AgolOptions } from '@app/services/AGOL-service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { ResourcesRoutes, convertToDateYear, getStageOfControlIcon, getStageOfControlLabel } from '@app/utils';
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
  discoveryDate: string
  map: any;
  currentRestrictionsUrl: string;
  recSiteTrailsClosuresUrl: string;
  parksClosuresUrl: string;
  bulletinUrl: string;
  incidentName: string;
  incidentNumber: string;
  wildfireYear: string;
  centroidLongitude: string;
  centroidLatitude: string;
  stageOfControlCode: string;
  stageOfControlLabel: string;
  stageOfControlIcon: string;
  fireOfNoteInd: boolean;
  getStageOfControlLabel = getStageOfControlLabel;
  getStageOfControlIcon = getStageOfControlIcon;


  constructor(private cdr: ChangeDetectorRef, 
    private httpClient: HttpClient, 
    private appConfigService: AppConfigService, 
    router: ActivatedRoute, 
    private fullDetails: FullDetailsComponent, 
    private agolService: AGOLService,
    private publishedIncidentService: PublishedIncidentService,
    private route: Route) {
    super(router);
    this.restrictionID = fullDetails.restrictionID;
    this.agolService = agolService;
  }

 ngOnInit(): void {
  let options: AgolOptions = {}
  options.returnGeometry = true;
  options.returnCentroid = true;
  this.populateAreaRestrictionByID(this.restrictionID, options)
  this.populateUrls()
 } 

 initMap(): void {
    this.cdr.detectChanges()

    // Create map and append data to the map component
    const location = [Number(this.centroidLatitude), Number(this.centroidLongitude)]

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
    if(this.fireOfNoteInd) {
      L.marker(location, {icon: fireOfNoteIcon}).addTo(this.map);
    }else{
      let colorToDisplay;
      switch(this.stageOfControlCode) {
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

 populateAreaRestrictionByID(id: string, options: AgolOptions = null) {
    let areaRestrict = this.agolService.getAreaRestrictionsByID(id, options).toPromise().then((response) => {
      if (response.features && response.features[0] && response.features[0].attributes) {
          let name: string = response.features[0].attributes.NAME;
          name = name.replace("Area Restriction", "").trim();
          this.name = name + " Restricted Area"
          this.fireCentre = response.features[0].attributes.FIRE_CENTRE_NAME + " Fire Centre";
          this.issuedDate = convertToDateYear(response.features[0].attributes.ACCESS_STATUS_EFFECTIVE_DATE);
          this.bulletinUrl = response.features[0].attributes.BULLETIN_URL;
          this.centroidLatitude = response.features[0].centroid.y;
          this.centroidLongitude = response.features[0].centroid.x;
          let restrictionPolygon = response.features[0].geometry.rings;
          this.populateIncident(restrictionPolygon)
      }
   })
 }

 populateIncident(restrictionPolygon: [][]) {
  let poly: number [][] = restrictionPolygon[0]
  let polyArray:Array<number> [] = [];
 
  poly.forEach(value => {
    polyArray.push(value)
  })
  
  let multiPolyArray = [polyArray];
  let turf = window['turf']
  let bufferedPolygon = turf.polygon(multiPolyArray)
  let buffer = turf.buffer(bufferedPolygon, 10, {
    units: 'kilometers'
  });

  let xArray: number [] = [];
  let yArray: number [] = [];

  buffer.geometry.coordinates[0].forEach((value) => {
     xArray.push(value[0]);
     yArray.push(value[1]);
   })

  // get max and min coords for bbox
  let minX = Math.min(...xArray)
  let minY = Math.min(...yArray)
  let maxX = Math.max(...xArray)
  let maxY = Math.max(...yArray)

  let bbox: string = minX.toString() + "," + minY.toString() + "," + maxX.toString() + "," + maxY.toString();
  let stageOfControlCodes = ['OUT_CNTRL', 'HOLDING', 'UNDR_CNTRL'];
  
  // find incidents within the area restriction polygon
 this.publishedIncidentService.fetchPublishedIncidentsList(0, 1000, null, null, null, stageOfControlCodes, null, bbox).subscribe(incidents => {

     if (incidents && incidents.collection && incidents.collection[0]) {
        this.discoveryDate = convertToDateYear(incidents.collection[0].discoveryDate)
        let fireName = incidents.collection[0].incidentName
        fireName = fireName.replace("Fire", "").trim();
        this.incidentName = fireName + " Wildfire";
        this.fireOfNoteInd = incidents.collection[0].fireOfNoteInd;
        this.stageOfControlCode = incidents.collection[0].stageOfControlCode;
        this.stageOfControlIcon = getStageOfControlIcon(incidents.collection[0].stageOfControlCode)
        this.stageOfControlLabel = getStageOfControlLabel(incidents.collection[0].stageOfControlCode)
        this.initMap();
     }    
    });
 }

 populateUrls() {
  let currentRestrictions = this.appConfigService.getConfig().externalAppConfig['currentRestrictions'].toString()
  let recSiteTrailsClosures = this.appConfigService.getConfig().externalAppConfig['recSiteTrailsClosures'].toString()
  let parksClosures = this.appConfigService.getConfig().externalAppConfig['parksClosures'].toString()
  this.currentRestrictionsUrl = currentRestrictions;
  this.recSiteTrailsClosuresUrl = recSiteTrailsClosures;
  this.parksClosuresUrl = parksClosures;
 }

 navToMap() {
  setTimeout(() => {
    this.route.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], { queryParams: {longitude: this.centroidLongitude, latitude: this.centroidLatitude, areaRestriction: true} });
  }, 100);
 }

 navToCurrentRestrictions() {
  window.open(this.currentRestrictionsUrl, '_blank')
 }

 navToRecClosures() {
  window.open(this.recSiteTrailsClosuresUrl, '_blank')
 }

 navToParksClosures() {
  window.open(this.parksClosuresUrl, '_blank')

 }

 navToBulletinUrl() {
  window.open(this.bulletinUrl, '_blank')
 }


}
