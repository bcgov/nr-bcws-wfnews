import { Component, ChangeDetectionStrategy, Input, AfterViewInit } from "@angular/core"
import { EvacOrderOption } from "../../../conversion/models"
import * as L from 'leaflet'
import { AppConfigService } from "@wf1/core-ui"

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

  private map: any

  constructor (private appConfigService: AppConfigService) {
    /* Empty, just here for injection */
  }

  ngAfterViewInit(): void {
    // Configure the map
    const location = [Number(this.incident.latitude), Number(this.incident.longitude)]
    this.map = L.map('map', {
      attributionControl: false,
      zoomControl: true,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      trackResize: false
    }).setView(location, 12)
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

    L.marker(location, {icon: icon}).addTo(this.map);

    if (this.extent) {
      this.map.fitBounds(new L.LatLngBounds([this.extent.ymin, this.extent.xmin], [this.extent.ymax, this.extent.xmax]));
    }
  }
}
