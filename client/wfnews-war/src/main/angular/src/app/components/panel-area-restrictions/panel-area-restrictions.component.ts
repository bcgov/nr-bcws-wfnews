import { Component, OnInit } from '@angular/core';
import { AreaRestrictionsOption } from '../../conversion/models';
import { AGOLService } from '../../services/AGOL-service';
import { MapConfigService } from '../../services/map-config.service';
import L from 'leaflet';

@Component({
    selector: 'panel-area-restrictions',
    templateUrl: './panel-area-restrictions.component.html',
    styleUrls: ['./panel-area-restrictions.component.scss'],
})
export class PanelAreaRestrictionsComponent implements OnInit {
  areaRestrictions : AreaRestrictionsOption[] = []

  constructor(private agolService: AGOLService,
              private mapConfigService: MapConfigService,) {
  }

  ngOnInit() {
    this.getAreaRestrictions();
  }

  zoomToArea (area) {
    this.mapConfigService.getMapConfig().then(() => {
      const SMK = window['SMK'];
      const viewer = SMK.MAP[1].$viewer;
      viewer.panToFeature(window['turf'].point([area.centroid.x, area.centroid.y]), 10)

      const map = viewer.map;
      let latlngPoint = new L.LatLng(area.centroid.y, area.centroid.x);
      map.fireEvent('click', {
        latlng: latlngPoint,
        layerPoint: map.latLngToLayerPoint(latlngPoint),
        containerPoint: map.latLngToContainerPoint(latlngPoint)
      });

      setTimeout(() => {
        for (const set in viewer.identified.featureSet) {
          if (Object.prototype.hasOwnProperty.call(viewer.identified.featureSet, set)) {
            const feature = viewer.identified.featureSet[set]
            if (feature.type === 'Feature' && feature.layerId === 'area-restrictions') {
              viewer.identified.pick(feature.id)
              break;
            }
          }
        }
      }, 1000)
      viewer.identified.remove('weather-stations')
    })
  }

  getAreaRestrictions () {
    this.agolService.getAreaRestrictions(null, { returnCentroid: true, returnGeometry: false}).subscribe(response => {
      if (response.features) {
        for (const element of response.features) {
          this.areaRestrictions.push({
            protRsSysID: element.attributes.PROT_RA_SYSID,
            name: element.attributes.NAME,
            accessStatusEffectiveDate: element.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
            fireCentre: element.attributes.FIRE_CENTRE_NAME,
            fireZone: element.attributes.FIRE_ZONE_NAME,
            bulletinUrl: element.attributes.BULLETIN_URL,
            centroid: element.centroid
          })
        }
      }
    })
  }
}
