import { LayerConfig } from "..";
import { WhseAdminBoundariesAdmNrAreasSpgLayerConfig } from "./whse-admin-boundaries-adm-nr-areas-spg.config";
import { WhseAdminBoundariesAdmNrDistrictsSpgLayerConfig } from "./whse-admin-boundaries-adm-nr-districts-spg.config";
import { WhseAdminBoundariesAdmNrRegionsSpgLayerConfig } from "./whse-admin-boundaries-adm-nr-regions-spg.config";
import { WhseAdminBoundariesClabIndianReservesLayerConfig } from "./whse-admin-boundaries-clab-indian-reserves.config";
import { WhseAdminBoundariesClabNationalParksLayerConfig } from "./whse-admin-boundaries-clab-national-parks.config";
import { WhseBasemappingFwaLakesPolyLayerConfig } from "./whse-basemapping-fwa-lakes-poly.config";
import { WhseBasemappingFwaStreamNetworksSpLayerConfig } from "./whse-basemapping-fwa-stream-networks-sp.config";
import { WhseBasemappingGbaRailwayTracksSpLayerConfig } from "./whse-basemapping-gba-railway-tracks-sp.config";
import { WhseBasemappingNtsBcContourLines125mLayerConfig } from "./whse-basemapping-nts-bc-contour-lines-125m.config";
import { WhseBasemappingTrimContourLinesLayerConfig } from "./whse-basemapping-trim-contour-lines.config";
import { WhseForestTenureFtenManagedLicencePolySvwLayerConfig } from "./whse-forest-tenure-ften-managed-licence-poly-svw.config";
import { WhseForestTenureFtenRecreationPolySvwLayerConfig } from "./whse-forest-tenure-ften-recreation-poly-svw.config";
import { WhseHumanCulturalEconomicEmrgOrderAndAlertAreasSpLayerConfig } from "./whse-human-cultural-economic-emrg-order-and-alert-areas-sp.config";
import { WhseImageryAndBaseMapsGsrHospitalsSvwLayerConfig } from "./whse-imagery-and-base-maps-gsr-hospitals-svw.config";
import { WhseImageryAndBaseMapsGsrMeteorologicalStationsSvwLayerConfig } from "./whse-imagery-and-base-maps-gsr-meteorological-stations-svw.config";
import { WhseImageryAndBaseMapsMotRestAreasSpLayerConfig } from "./whse-imagery-and-base-maps-mot-rest-areas-sp.config";
import { WhseLegalAdminBoundariesAbmsMunicipalitiesSpLayerConfig } from "./whse-legal-admin-boundaries-abms-municipalities-sp.config";
import { WhseLegalAdminBoundariesAbmsRegionalDistrictsSpLayerConfig } from "./whse-legal-admin-boundaries-abms-regional-districts-sp.config";
import { WhseLegalAdminBoundariesFntTreatyLandSpLayerConfig } from "./whse-legal-admin-boundaries-fnt-treaty-land-sp.config";
import { WhseLegalAdminBoundariesWclConservationAreasNgoSpLayerConfig } from "./whse-legal-admin-boundaries-wcl-conservation-areas-ngo-sp.config";
import { WhseLegalAdminBoundariesWclConservationLandsSpLayerConfig } from "./whse-legal-admin-boundaries-wcl-conservation-lands-sp.config";
import { WhseTantalisTaConservancyAreasSvwLayerConfig } from "./whse-tantalis-ta-conservancy-areas-svw.config";
import { WhseTantalisTaParkEcoresPaSvwLayerConfig } from "./whse-tantalis-ta-park-ecores-pa-svw.config";
import { WhseTantalisTaWildlifeMgmtAreasSvwLayerConfig } from "./whse-tantalis-ta-wildlife-mgmt-areas-svw.config";
import { WhseWaterManagementWlsCommunityWsPubSvwLayerConfig } from "./whse-water-management-wls-community-ws-pub-svw.config";
import { AviationAirportLayerConfig } from "./aviation-airport.config";
import { AviationAirstripLayerConfig } from "./aviation-airstrip.config";
import { AviationHelipadHeliportLayerConfig } from "./aviation-helipad-heliport.config";
import { AviationHospitalHeliportLayerConfig } from "./aviation-hospital-heliport.config";
import { AviationSeaplaneLayerConfig } from "./aviation-seaplane.config";

export function BcgwLayersConfig(layerConfig: LayerConfig) {
    return [
        bcgwLayer(WhseImageryAndBaseMapsMotRestAreasSpLayerConfig()),
        bcgwLayer(WhseHumanCulturalEconomicEmrgOrderAndAlertAreasSpLayerConfig()),
        bcgwLayer(WhseImageryAndBaseMapsGsrHospitalsSvwLayerConfig()),
        bcgwLayer(WhseImageryAndBaseMapsGsrMeteorologicalStationsSvwLayerConfig()),
        bcgwLayer(WhseWaterManagementWlsCommunityWsPubSvwLayerConfig()),
        bcgwLayer(WhseLegalAdminBoundariesAbmsRegionalDistrictsSpLayerConfig()),
        bcgwLayer(WhseLegalAdminBoundariesAbmsMunicipalitiesSpLayerConfig()),
        bcgwLayer(WhseAdminBoundariesAdmNrAreasSpgLayerConfig()),
        bcgwLayer(WhseAdminBoundariesAdmNrDistrictsSpgLayerConfig()),
        bcgwLayer(WhseAdminBoundariesAdmNrRegionsSpgLayerConfig()),
        bcgwLayer(WhseForestTenureFtenRecreationPolySvwLayerConfig()),
        bcgwLayer(WhseForestTenureFtenManagedLicencePolySvwLayerConfig()),
        bcgwLayer(WhseLegalAdminBoundariesFntTreatyLandSpLayerConfig()),
        bcgwLayer(WhseAdminBoundariesClabIndianReservesLayerConfig()),
        bcgwLayer(WhseAdminBoundariesClabNationalParksLayerConfig()),
        bcgwLayer(WhseTantalisTaParkEcoresPaSvwLayerConfig()),
        bcgwLayer(WhseTantalisTaWildlifeMgmtAreasSvwLayerConfig()),
        bcgwLayer(WhseTantalisTaConservancyAreasSvwLayerConfig()),
        bcgwLayer(WhseLegalAdminBoundariesWclConservationLandsSpLayerConfig()),
        bcgwLayer(WhseLegalAdminBoundariesWclConservationAreasNgoSpLayerConfig()),
        bcgwLayer(WhseBasemappingGbaRailwayTracksSpLayerConfig()),
        bcgwLayer(WhseBasemappingFwaStreamNetworksSpLayerConfig()),
        bcgwLayer(WhseBasemappingFwaLakesPolyLayerConfig()),
        bcgwLayer(WhseBasemappingNtsBcContourLines125mLayerConfig()),
        bcgwLayer(WhseBasemappingTrimContourLinesLayerConfig()),
        aviationLayer(AviationAirportLayerConfig()),
        aviationLayer(AviationAirstripLayerConfig()),
        aviationLayer(AviationHelipadHeliportLayerConfig()),
        aviationLayer(AviationHospitalHeliportLayerConfig()),
        aviationLayer(AviationSeaplaneLayerConfig())

    ]

    function bcgwLayer(config: any): any {
        let cfg = {
            serviceUrl: layerConfig.layerServices.bcgw.url,
            ...config
        }

        if ( layerConfig.token )
            cfg.header = { 'Authorization': `Bearer ${ layerConfig.token }` }

        return cfg
    }

    function aviationLayer(config: any): any {
        return {
            "titleFormat": "<%= $.AIRPORT_NAME %>",
            "attributes": [
                {
                    "title": "Name",
                    "name": "AIRPORT_NAME"
                },
                {
                    "title": "Location",
                    "value": "<%= $$.formatLatLon( $.LATITUDE, $.LONGITUDE ) %>"
                },
                {
                    "title": "ICAO",
                    "name": "ICAO_CODE"
                },
                {
                    "title": "Geographic",
                    "name": "LOCALITY"
                },
                {
                    "title": "Elevation",
                    "value": "<%= $$.formatMultipleUnits( $.ELEVATION, 'm', 'm', 'ft' ) || 'Unknown' %>",
                    "format": "HTML"
                },
                {
                    "title": "Contact Phone",
                    "value": "<%= $$.formatPhoneHtml( $.CONTACT_PHONE ) || 'N/A' %>",
                    "format": "HTML"
                }
            ],
            "isQueryable": true,
            ...bcgwLayer(config)
        }
    }
}
