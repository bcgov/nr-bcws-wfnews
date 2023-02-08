import { Component, OnInit } from '@angular/core';
import { AreaRestrictionsOption } from '../../conversion/models';
import { AGOLService } from '../../services/AGOL-service';
import { MapConfigService } from '../../services/map-config.service';
import { snowPlowHelper } from '../../utils';
import L from 'leaflet';
import { AppConfigService } from '@wf1/core-ui';
import { Router } from '@angular/router';

@Component({
    selector: 'panel-area-restrictions',
    templateUrl: './panel-area-restrictions.component.html',
    styleUrls: ['./panel-area-restrictions.component.scss'],
})
export class PanelAreaRestrictionsComponent implements OnInit {
  areaRestrictions : AreaRestrictionsOption[] = []
  public snowPlowHelper = snowPlowHelper

  constructor(private agolService: AGOLService,
              private mapConfigService: MapConfigService,
              private appConfigService: AppConfigService,
              private router: Router) {
  }

  ngOnInit() {
    this.getAreaRestrictions();
  }

  zoomToArea (area) {
    this.snowplow('area_restriction_map_click', `${area.protRsSysID}:${area.name}`)
    this.mapConfigService.getMapConfig().then(() => {
      const SMK = window['SMK'];
      let viewer = null;
      for (const smkMap in SMK.MAP) {
        if (Object.prototype.hasOwnProperty.call(SMK.MAP, smkMap)) {
          viewer = SMK.MAP[smkMap].$viewer;
        }
      }
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

  async snowplow (action: string, link: string) {
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1)
    this.snowPlowHelper(url, {
      action: action,
      text: link
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
