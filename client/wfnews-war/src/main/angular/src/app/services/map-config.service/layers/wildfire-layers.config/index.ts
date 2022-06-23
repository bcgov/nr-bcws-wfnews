import { LayerConfig } from "..";
import { AtrActiveLayerConfig } from "./atr-active.config";
import { AtrCompleteLayerConfig } from "./atr-complete.config";
import { BndyFireDepartmentsLayerConfig } from "./bndy-fire-departments.config";
import { ClientAssetLinesLayerConfig } from "./client-asset-lines.config";
import { ClientAssetPointsLayerConfig } from "./client-asset-points.config";
import { ClientAssetPolygonsLayerConfig } from "./client-asset-polygons.config";
import { FwActivereportingWstnLayerConfig } from "./fw-activereporting-wstn.config";
import { FwDangerIndexRegionLayerConfig } from "./fw-danger-index-region.config";
import { HtrActiveLayerConfig } from "./htr-active.config";
import { HtrCompleteLayerConfig } from "./htr-complete.config";
import { InCurrentFirePolygonsLayerConfig } from "./in-current-fire-polygons.config";
import { LightningLayerConfig } from "./lightning.config";
import { OftsActiveLayerConfig } from "./ofts-active.config";
import { OftsExpiredLayerConfig } from "./ofts-expired.config";
import { OftsInvalidLayerConfig } from "./ofts-invalid.config";
import { RegLegalAndAdminBoundariesRecTenureAlpineSkiAreasSpLayerConfig } from "./reg-legal-and-admin-boundaries-rec-tenure-alpine-ski-areas-sp.config";
import { ResponseAreasLayerConfig } from "./response-areas.config";
import { SfmsBuildupIndexLayerConfig } from "./sfms-buildup-index.config";
import { SfmsDangerRatingLayerConfig } from "./sfms-danger-rating.config";
import { SfmsDroughtCodeLayerConfig } from "./sfms-drought-code.config";
import { SfmsDuffMoistureCodeLayerConfig } from "./sfms-duff-moisture-code.config";
import { SfmsFineFuelMoistureCodeLayerConfig } from "./sfms-fine-fuel-moisture-code.config";
import { SfmsFireWeatherIndexLayerConfig } from "./sfms-fire-weather-index.config";
import { SfmsInitialSpreadIndexLayerConfig } from "./sfms-initial-spread-index.config";
import { SfmsPrecipitationLayerConfig } from "./sfms-precipitation.config";
import { SfmsRelativeHumidityLayerConfig } from "./sfms-relative-humidity.config";
import { SfmsTemperatureLayerConfig } from "./sfms-temperature.config";
import { SfmsWindDirectionLayerConfig } from "./sfms-wind-direction.config";
import { SfmsWindSpeedLayerConfig } from "./sfms-wind-speed.config";
import { UedAirPatrolCheckpointLayerConfig } from "./ued-air-patrol-checkpoint.config";
import { UedAirstripLayerConfig } from "./ued-airstrip.config";
import { UedCampComplexLayerConfig } from "./ued-camp-complex.config";
import { UedForwardTankerBaseLayerConfig } from "./ued-forward-tanker-base.config";
import { UedFuelCacheLayerConfig } from "./ued-fuel-cache.config";
import { UedHazardLayerConfig } from "./ued-hazard.config";
import { UedHelipadLayerConfig } from "./ued-helipad.config";
import { UedLandmarkLayerConfig } from "./ued-landmark.config";
import { UedMedevacLayerConfig } from "./ued-medevac.config";
import { UedRemoteStructuresLayerConfig } from "./ued-remote-structures.config";
import { UedSurfacePatrolCheckpointLayerConfig } from "./ued-surface-patrol-checkpoint.config";
import { UedToolCacheLayerConfig } from "./ued-tool-cache.config";
import { Wf1BndyTflLayerConfig } from "./wf1-bndy-tfl.config";
import { Wf1CadastreLayerConfig } from "./wf1-cadastre.config";
import { Wf1CiFlnroRadioTowerLayerConfig } from "./wf1-ci-flnro-radio-tower.config";
import { Wf1CiOtherRadioTowerLayerConfig } from "./wf1-ci-other-radio-tower.config";
import { WildfireOrgUnitFireCentreLayerConfig } from "./wildfire-org-unit-fire-centre.config";
import { WildfireOrgUnitFireZoneLayerConfig } from "./wildfire-org-unit-fire-zone.config";
import { Wf1FnTitleAreaLayerConfig } from "./wf1-fn-title-area.config";
import { Wf1ForestServiceRoadLayerConfig } from "./wf1-forest-service-road.config";
import { Wf1PipelinesLayerConfig } from "./wf1-pipelines.config";
import { Wf1PlaceNamesLayerConfig } from "./wf1-place-names.config";
import { Wf1RefuseSiteLayerConfig } from "./wf1-refuse-site.config";
import { Wf1RoadsHighwaysLayerConfig } from "./wf1-roads-highways.config";
import { Wf1RoadsSecondariesLayerConfig } from "./wf1-roads-secondaries.config";
import { Wf1RoadsRoughsLayerConfig } from "./wf1-roads-roughs.config";
import { Wf1RoadsOtherLayerConfig } from "./wf1-roads-other.config";
import { Wf1DndLegacySitesConfig } from "./wf1-dnd-legacysites.config";
import { Wf1TerrainNamesLayerConfig } from "./wf1-terrain-names.config";
import { Wf1TrailsLayerConfig } from "./wf1-trails.config";
import { Wf1TransmissionlinesLayerConfig } from "./wf1-transmissionlines.config";

export function WildfireLayersConfig(layerConfig: LayerConfig) {
    const uedStart = [
        {
            "title": "Name",
            "name": "NAME"
        },
        {
            "title": "Location",
            "value": "<%= $$.formatLatLon( $.wf_computed_latitude, $.wf_computed_longitude ) %>"
        },
        {
            "title": "Geographic",
            "name": "DESCRIPTION"
        },
        {
            "title": "Comments",
            "name": "INSTRUCTIONS"
        }
    ]

    const uedEnd = [
        {
            "title": "Fire Centre",
            "value": "<%= $$.formatFireCentre( $.FIRE_CTR_NAME ) %>"
        },
        {
            "title": "Fire Zone",
            "value": "<%= $$.formatFireZone( $.FIRE_ZONE_NAME ) %>"
        }
    ]

    return [
        ATRLayer(AtrActiveLayerConfig()),
        ATRLayer(AtrCompleteLayerConfig()),
        wildfireLayer(BndyFireDepartmentsLayerConfig()),
        clientAssetLayer(ClientAssetLinesLayerConfig()),
        clientAssetLayer(ClientAssetPointsLayerConfig()),
        clientAssetLayer(ClientAssetPolygonsLayerConfig()),
        wildfireLayer(FwActivereportingWstnLayerConfig()),
        wildfireLayer(FwDangerIndexRegionLayerConfig()),
        HTRLayer(HtrActiveLayerConfig()),
        HTRLayer(HtrCompleteLayerConfig()),
        wildfireLayer(InCurrentFirePolygonsLayerConfig()),
        wildfireLayer(LightningLayerConfig()),
        wildfireLayer(OftsActiveLayerConfig()),
        wildfireLayer(OftsExpiredLayerConfig()),
        wildfireLayer(OftsInvalidLayerConfig()),
        wildfireLayer(RegLegalAndAdminBoundariesRecTenureAlpineSkiAreasSpLayerConfig()),
        wildfireLayer(ResponseAreasLayerConfig()),
        wildfireLayer(SfmsBuildupIndexLayerConfig()),
        wildfireLayer(SfmsDangerRatingLayerConfig()),
        wildfireLayer(SfmsDroughtCodeLayerConfig()),
        wildfireLayer(SfmsDuffMoistureCodeLayerConfig()),
        wildfireLayer(SfmsFineFuelMoistureCodeLayerConfig()),
        wildfireLayer(SfmsFireWeatherIndexLayerConfig()),
        wildfireLayer(SfmsInitialSpreadIndexLayerConfig()),
        wildfireLayer(SfmsPrecipitationLayerConfig()),
        wildfireLayer(SfmsRelativeHumidityLayerConfig()),
        wildfireLayer(SfmsTemperatureLayerConfig()),
        wildfireLayer(SfmsWindDirectionLayerConfig()),
        wildfireLayer(SfmsWindSpeedLayerConfig()),
        UEDLayer(UedAirPatrolCheckpointLayerConfig()),
        UEDLayer(UedAirstripLayerConfig()),
        UEDLayer(UedCampComplexLayerConfig()),
        UEDLayer(UedForwardTankerBaseLayerConfig()),
        UEDLayer(UedFuelCacheLayerConfig()),
        UEDLayer(UedHazardLayerConfig()),
        UEDLayer(UedHelipadLayerConfig()),
        UEDLayer(UedLandmarkLayerConfig()),
        UEDLayer(UedMedevacLayerConfig()),
        UEDLayer(UedRemoteStructuresLayerConfig()),
        UEDLayer(UedSurfacePatrolCheckpointLayerConfig()),
        UEDLayer(UedToolCacheLayerConfig()),
        wildfireLayer(Wf1BndyTflLayerConfig()),
        wildfireLayer(Wf1CadastreLayerConfig()),
        wildfireLayer(Wf1CiFlnroRadioTowerLayerConfig()),
        wildfireLayer(Wf1CiOtherRadioTowerLayerConfig()),
        wildfireLayer(WildfireOrgUnitFireCentreLayerConfig()),
        wildfireLayer(WildfireOrgUnitFireZoneLayerConfig()),
        wildfireLayer(Wf1FnTitleAreaLayerConfig()),
        wildfireLayer(Wf1ForestServiceRoadLayerConfig()),
        wildfireLayer(Wf1PipelinesLayerConfig()),
        wildfireLayer(Wf1PlaceNamesLayerConfig()),
        wildfireLayer(Wf1RefuseSiteLayerConfig()),
        roadsLayer(Wf1RoadsHighwaysLayerConfig()),
        roadsLayer(Wf1RoadsSecondariesLayerConfig()),
        roadsLayer(Wf1RoadsRoughsLayerConfig()),
        roadsLayer(Wf1RoadsOtherLayerConfig()),
        wildfireLayer(Wf1DndLegacySitesConfig()),
        wildfireLayer(Wf1TerrainNamesLayerConfig()),
        wildfireLayer(Wf1TrailsLayerConfig()),
        wildfireLayer(Wf1TransmissionlinesLayerConfig())
    ]

    function wildfireLayer(config: any): any {
        let cfg = {
            serviceUrl: layerConfig.layerServices.wildfire.url,
            ...config
        }

        if ( layerConfig.token )
            cfg.header = { 'Authorization': `Bearer ${ layerConfig.token }` }

        return cfg
    }

    function ATRHTRLayer(config: any): any {
        return {
            "isQueryable": true,
            "geometryAttribute": "GEOM",
            ...wildfireLayer(config)
        }
    }

    function roadsLayer(config: any): any {
        return {
            "isQueryable": false,
            "geometryAttribute": "SHAPE",
            "visible": true,
            "type": "wms",
            "titleFormat": "<%= $.ROAD_NAME_FULL || `Unnamed ${$.WF1_DISPLAY_TYPE}` %>",
            "attributes": [
                {
                    "title": "Name",
                    "name": "ROAD_NAME_FULL"
                },
                {
                    "title": "Type",
                    "name": "WF1_DISPLAY_TYPE"
                }
            ],
            ...wildfireLayer(config)
        }
    }
    function ATRHTRAckAttribute(): any {
        return {
            "title": "Acknowledgement",
            "value":  "<%= $.ACKNOWLEDGEDBY ? ($.ACKNOWLEDGEDBY+' : '+$$.formatLocalTime( $$.parseIsoDateTime( $.ACKNOWLEDGEMENTDATE ))) : 'Unacknowledged' %>"
        }
    }

    function ATRLayer(config: any): any {
        return {
            "titleFormat": "ATR:<%= $.incidentNumber || $.atrid %>",
            "attributes": [
                {
                    "title": "ATRid",
                    "name": "ATRID"
                },
                {
                    "title": "Incident Number",
                    "name": "INCIDENTNUMBER"
                },
                {
                    "title": "Category",
                    "name": "FCCATEGORY"
                },
                {
                    "title": "Status",
                    "value": "<%= $.STATUS ? ($.STATUS + ($.STATUSQUALIFIER ? (' : '+$.STATUSQUALIFIER) : '')) : 'N/A'%>"
                },
                {
                    "title": "Location",
                    "value": "<%= $$.formatLatLon( $.LATITUDE, $.LONGITUDE ) %>"
                },
                ATRHTRAckAttribute(),
                {
                    "title": "Size",
                    "name": "SIZE"
                },
                {
                    "title": "Fuel",
                    "name": "FUEL"
                },
                {
                    "title": "Values at Risk",
                    "name": "VALUESATRISK"
                },
                {
                    "title": "Bird Dog",
                    "name": "BIRDDOGNUMBER"
                },
                {
                    "title": "AAO",
                    "name": "AAO"
                }
            ],
            ...ATRHTRLayer(config)
        }
    }
    function HTRLayer(config: any): any {
        return {
            "titleFormat": "HTR:<%= $.incidentNumber || $.ATRid %>",
            "attributes": [
                {
                    "title": "ATRid",
                    "name": "ATRID"
                },
                {
                    "title": "Incident Number",
                    "name": "INCIDENTNUMBER"
                },
                {
                    "title": "Category",
                    "name": "FCCATEGORY"
                },
                {
                    "title": "Status",
                    "name": "STATUS"
                },
                {
                    "title": "Location",
                    "value": "<%= $$.formatLatLon( $.LATITUDE, $.LONGITUDE ) %>"
                },
                ATRHTRAckAttribute(),
                {
                    "title": "Size",
                    "name": "SIZE"
                },
                {
                    "title": "Fuel",
                    "name": "FUEL"
                },
                {
                    "title": "Heli Callsign",
                    "name": "RAPATTACKCALLSIGN"
                },
                {
                    "title": "Ops Tech",
                    "name": "OPSTECH"
                },
                {
                    "title": "Rap Crew",
                    "name": "RAPCREW"
                }
            ],
            ...ATRHTRLayer(config)
        }
    }

    function clientAssetLayer(config: any): any {
        var result =  {
            "titleFormat": "<%= $.CLIENT_NAME %>",
            "type": "wms",
            "isQueryable": true,
            ...wildfireLayer(config)
        }
        result.attributes = [
            {
                "title": "Client Name",
                "name": "CLIENT_NAME"
            },
            {
                "title": "Asset Type",
                "name": "ASSET_TYPE"
            },
            {
                "title": "Contact Information",
                "name": "CONTACT_INFORMATION"
            },
            {
                "title": "FP Priority",
                "name": "FP_PRIORITY"
            },
            {
                "title": "Update Date",
                "value": "<%= $$.formatLocalTime( $$.parseIsoDateTime( $.UPDATE_DATE )) %>"
            }
        ]
        return result
    }

    function UEDLayer(config: any): any {
        var result =  {
            "titleFormat": "<%= $.LABEL %>",
            "type": "wms",
            "isQueryable": true,
            ...wildfireLayer(config)
        }
        result.attributes = [
            ...uedStart,
            ...(result.attributes || []),
            ...uedEnd
        ]
        return result
    }
}
