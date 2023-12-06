import { layerSettings } from '.';

export function FireCentresLayerConfig(ls: layerSettings) {
    return [
        /*{
          type: 'esri-tiled',
          id: 'bc-fire-centres',
          title: 'BC Wildfire Fire Centres',
          isQueryable: false,
          attribution: 'Copyright 117 DataBC, Government of British Columbia',
          serviceUrl: 'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_FireCenterBdys2/MapServer',
          opacity: 1
        }*/
        {
          type: 'wms',
          id: 'bc-fire-centres',
          title: 'BC Wildfire Fire Centres',
          serviceUrl: ls.openmapsBaseUrl,
          layerName: 'pub:WHSE_LEGAL_ADMIN_BOUNDARIES.DRP_MOF_FIRE_CENTRES_SP',
          styleName: '3458',
          opacity: 0.5,
          attributes: [],
          isQueryable: false,
          titleAttribute: 'MOF_FIRE_CENTRE_NAME',
          geometryAttribute: 'GEOMETRY',
          attribution: 'Copyright 117 DataBC, Government of British Columbia'
        },
        {
          type: 'wms',
          id: 'bc-fire-centres-labels',
          title: 'BC Wildfire Fire Centres Labels',
          serviceUrl: ls.openmapsBaseUrl,
          layerName: 'pub:WHSE_LEGAL_ADMIN_BOUNDARIES.DRP_MOF_FIRE_CENTRES_SP',
          styleName: '4837',
          opacity: 0.8,
          attributes: [],
          isQueryable: false,
          titleAttribute: 'MOF_FIRE_CENTRE_NAME',
          geometryAttribute: 'GEOMETRY',
          attribution: 'Copyright 117 DataBC, Government of British Columbia'
        },
        {
          type: 'wms',
          id: 'bc-fire-zones',
          title: 'BC Wildfire Fire Zones',
          serviceUrl: ls.openmapsBaseUrl,
          layerName: 'pub:WHSE_LEGAL_ADMIN_BOUNDARIES.DRP_MOF_FIRE_ZONES_SP',
          styleName: '3460',
          opacity: 0.5,
          attributes: [],
          isQueryable: false,
          titleAttribute: 'MOF_FIRE_CENTRE_NAME',
          geometryAttribute: 'GEOMETRY',
          attribution: 'Copyright 117 DataBC, Government of British Columbia'
        },
        {
          type: 'wms',
          id: 'bc-fire-zones-labels',
          title: 'BC Wildfire Fire Zones Labels',
          serviceUrl: ls.openmapsBaseUrl,
          layerName: 'pub:WHSE_LEGAL_ADMIN_BOUNDARIES.DRP_MOF_FIRE_ZONES_SP',
          styleName: '4840',
          opacity: 0.8,
          attributes: [],
          isQueryable: false,
          titleAttribute: 'MOF_FIRE_CENTRE_NAME',
          geometryAttribute: 'GEOMETRY',
          attribution: 'Copyright 117 DataBC, Government of British Columbia'
        }
    ];
}
