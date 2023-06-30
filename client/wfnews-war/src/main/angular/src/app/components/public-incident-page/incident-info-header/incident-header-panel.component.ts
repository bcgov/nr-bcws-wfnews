import { Component, ChangeDetectionStrategy, Input, AfterViewInit, HostListener } from "@angular/core"
import { EvacOrderOption } from "../../../conversion/models"
import * as L from 'leaflet'
import { AppConfigService } from "@wf1/core-ui"
import { WatchlistService } from "../../../services/watchlist-service"
import { convertToFireCentreDescription, convertFireNumber, ResourcesRoutes } from "../../../utils"
import * as moment from "moment"
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog"
import { ContactUsDialogComponent } from "../../admin-incident-form/contact-us-dialog/contact-us-dialog.component"
import { Router } from "@angular/router"
import { Location } from '@angular/common';


@Component({
  selector: 'incident-header-panel',
  templateUrl: './incident-header-panel.component.html',
  styleUrls: ['./incident-header-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentHeaderPanel implements AfterViewInit {
  @Input() public incident: any
  @Input() public evacOrders: EvacOrderOption[] = []
  @Input() public extent: any
  convertToFireCentreDescription = convertToFireCentreDescription
  convertFireNumber = convertFireNumber

  private map: any

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.map.invalidateSize();
  }

  constructor (private appConfigService: AppConfigService, private watchlistService: WatchlistService, private dialog: MatDialog, private router: Router, private location: Location
    ) {
    /* Empty, just here for injection */
  }

  ngAfterViewInit(): void {
    // Configure the map
    const location = [Number(this.incident.latitude), Number(this.incident.longitude)]
    this.map = L.map('map', {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      trackResize: false,
      scrollWheelZoom: false
    }).setView(location, 9)
    // configure map data
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    let databcUrl = this.appConfigService.getConfig()['mapServices']['openmapsBaseUrl'].toString()
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

    const icon = L.icon({
      iconUrl: "/assets/images/local_fire_department.png",
      iconSize: [35, 35],
      shadowAnchor: [4, 62],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    if(this.incident.fireOfNoteInd) {
      L.marker(location, {icon: icon}).addTo(this.map);
    }
    else{
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

    if (this.extent) {
      this.map.fitBounds(new L.LatLngBounds([this.extent.ymin, this.extent.xmin], [this.extent.ymax, this.extent.xmax]));
    }
  }

  onWatchlist (): boolean {
    return this.watchlistService.getWatchlist().includes(this.incident.fireYear + ':' + this.incident.incidentNumberLabel)
  }

  addToWatchlist () {
    this.watchlistService.saveToWatchlist(this.incident.fireYear, this.incident.incidentNumberLabel)
  }

  removeFromWatchlist () {
    this.watchlistService.removeFromWatchlist(this.incident.fireYear, this.incident.incidentNumberLabel)
  }

  displaySizeType (incidentSizeDetail: string) {
    if (incidentSizeDetail && incidentSizeDetail.includes('estimated')) {
      return '(Estimated)'
    }
    else if (incidentSizeDetail && incidentSizeDetail.includes('mapped')) {
      return '(Mapped)'
    }
    else {
      return null;
    }
  }

  isMobileView() {
    return ((window.innerWidth < 768 && window.innerHeight < 1024) || (window.innerWidth < 1024 && window.innerHeight < 768))
  }

  convertToMobileFormat (dateString) {
    // Should probably be MMM for month formats to prevent long strings
    const formattedDate = moment(dateString, "dddd, MMMM D, YYYY [at] h:mm:ss A").format("MMMM D, YYYY");
    return formattedDate

  }

  openContactUsWindow() {
    this.dialog.open(ContactUsDialogComponent, {
      width: '350px',
      data: {
        fireCentre: convertToFireCentreDescription(this.incident.contactOrgUnitIdentifer || this.incident.fireCentreName || this.incident.fireCentreCode || this.incident.fireCentre),
        email: this.incident.contactEmailAddress,
        phoneNumber: this.incident.contactPhoneNumber
      }
    });
  }

  backToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP]);
    }, 100);
  }

  shareContent() {
    const currentUrl = this.location.path();
    if (navigator.share) {
      navigator.share({
        url: currentUrl // The URL user wants to share
      })
        .then(() => console.log('Sharing succeeded.'))
        .catch((error) => console.error('Error sharing:', error));
    }
  }

}
