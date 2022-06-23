import { ResourcesTrackLayerConfig } from "./resources-track.config";
import { BcVehicleHqSystemsLayerConfig } from "./bc-vehicle-hq-systems.config";
import { BcVehicleHqWxTechsLayerConfig } from "./bc-vehicle-hq-wx-techs.config";
import { BcVehicleHqCampCoOrdLayerConfig } from "./bc-vehicle-hq-camp-co-ord.config";
import { BcVehicleKamloopsLillooetLayerConfig } from "./bc-vehicle-kamloops-lillooet.config";
import { BcVehicleKamloopsMerrittLayerConfig } from "./bc-vehicle-kamloops-merritt.config";
import { BcVehicleKamloopsPentictonLayerConfig } from "./bc-vehicle-kamloops-penticton.config";
import { BcVehicleKamloopsClearwaterLayerConfig } from "./bc-vehicle-kamloops-clearwater.config";
import { BcVehicleKamloopsKamloopsLayerConfig } from "./bc-vehicle-kamloops-kamloops.config";
import { BcVehicleKamloopsVernonLayerConfig } from "./bc-vehicle-kamloops-vernon.config";
import { BcVehicleKamloopsSalmonArmLayerConfig } from "./bc-vehicle-kamloops-salmon-arm.config";
import { BcVehicleCoastalSouthIslandLayerConfig } from "./bc-vehicle-coastal-south-island.config";
import { BcVehicleCoastalNorthIslandLayerConfig } from "./bc-vehicle-coastal-north-island.config";
import { BcVehicleCoastalFraserLayerConfig } from "./bc-vehicle-coastal-fraser.config";
import { BcVehicleCoastalMidIslandLayerConfig } from "./bc-vehicle-coastal-mid-island.config";
import { BcVehicleCoastalSunshineCoastLayerConfig } from "./bc-vehicle-coastal-sunshine-coast.config";
import { BcVehicleCoastalPembertonLayerConfig } from "./bc-vehicle-coastal-pemberton.config";
import { BcVehicleSouthEastArrowLayerConfig } from "./bc-vehicle-south-east-arrow.config";
import { BcVehicleSouthEastInvermereLayerConfig } from "./bc-vehicle-south-east-invermere.config";
import { BcVehicleSouthEastCranbrookLayerConfig } from "./bc-vehicle-south-east-cranbrook.config";
import { BcVehicleSouthEastKootenayLakeLayerConfig } from "./bc-vehicle-south-east-kootenay-lake.config";
import { BcVehicleSouthEastBoundaryLayerConfig } from "./bc-vehicle-south-east-boundary.config";
import { BcVehicleSouthEastColumbiaLayerConfig } from "./bc-vehicle-south-east-columbia.config";
import { BcVehiclePrinceGeorgeRobsonValleyLayerConfig } from "./bc-vehicle-prince-george-robson-valley.config";
import { BcVehiclePrinceGeorgeDawsonCreekLayerConfig } from "./bc-vehicle-prince-george-dawson-creek.config";
import { BcVehiclePrinceGeorgeFortStJohnLayerConfig } from "./bc-vehicle-prince-george-fort-st-john.config";
import { BcVehiclePrinceGeorgePrinceGeorgeLayerConfig } from "./bc-vehicle-prince-george-prince-george.config";
import { BcVehiclePrinceGeorgeMackenzieLayerConfig } from "./bc-vehicle-prince-george-mackenzie.config";
import { BcVehicleCaribooCifacLayerConfig } from "./bc-vehicle-cariboo-cifac.config";
import { BcVehicleNorthWestBulkleyLayerConfig } from "./bc-vehicle-north-west-bulkley.config";
import { BcOtherResourcesMrbLayerConfig } from "./bc-other-resources-mrb.config";
import { BcOtherResourcesTankerTruckLayerConfig } from "./bc-other-resources-tanker-truck.config";
import { BcOtherResourcesFireCampLayerConfig } from "./bc-other-resources-fire-camp.config";
import { BcOtherResourcesGuamLayerConfig } from "./bc-other-resources-guam.config";
import { BcOtherResourcesHeartBeatLayerConfig } from "./bc-other-resources-heart-beat.config";
import { BcAircraftRotaryWingOtherLayerConfig } from "./bc-aircraft-rotary-wing-other.config";
import { BcAircraftRotaryWingIntermediateLayerConfig } from "./bc-aircraft-rotary-wing-intermediate.config";
import { BcAircraftRotaryWingMediumLayerConfig } from "./bc-aircraft-rotary-wing-medium.config";
import { BcAircraftRotaryWingMediumProvLayerConfig } from "./bc-aircraft-rotary-wing-medium-prov.config";
import { BcAircraftRotaryWingLightLayerConfig } from "./bc-aircraft-rotary-wing-light.config";
import { BcAircraftRotaryWingHeavyLayerConfig } from "./bc-aircraft-rotary-wing-heavy.config";
import { BcAircraftRotaryWingRapAttackLayerConfig } from "./bc-aircraft-rotary-wing-rap-attack.config";
import { BcAircraftFwtPatrolLayerConfig } from "./bc-aircraft-fwt-patrol.config";
import { BcAircraftFwtTransportLayerConfig } from "./bc-aircraft-fwt-transport.config";
import { BcAircraftFwtCrewTransportLayerConfig } from "./bc-aircraft-fwt-crew-transport.config";
import { BcAircraftFwbTankerLayerConfig } from "./bc-aircraft-fwb-tanker.config";
import { BcAircraftFwbBirdDogLayerConfig } from "./bc-aircraft-fwb-bird-dog.config";
import { BcAircraftFixedWingPatrolLayerConfig } from "./bc-aircraft-fixed-wing-patrol.config";
import { BcAircraftFixedWingTransportLayerConfig } from "./bc-aircraft-fixed-wing-transport.config";
import { BcAircraftFixedWingTankerLayerConfig } from "./bc-aircraft-fixed-wing-tanker.config";
import { BcAircraftFixedWingBirdDogLayerConfig } from "./bc-aircraft-fixed-wing-bird-dog.config";

import { LayerConfig } from "..";

export function MobileResourcesLayersConfig(layerConfig: LayerConfig) {
    return [
        {
            serviceUrl: layerConfig.layerServices.mobileResource.url,
            header: { 'Authorization': `Bearer ${ layerConfig.token }` },
            ...ResourcesTrackLayerConfig(),
        },
        ResourceLayer(BcVehicleHqSystemsLayerConfig()),
        ResourceLayer(BcVehicleHqWxTechsLayerConfig()),
        ResourceLayer(BcVehicleHqCampCoOrdLayerConfig()),
        ResourceLayer(BcVehicleKamloopsLillooetLayerConfig()),
        ResourceLayer(BcVehicleKamloopsMerrittLayerConfig()),
        ResourceLayer(BcVehicleKamloopsPentictonLayerConfig()),
        ResourceLayer(BcVehicleKamloopsClearwaterLayerConfig()),
        ResourceLayer(BcVehicleKamloopsKamloopsLayerConfig()),
        ResourceLayer(BcVehicleKamloopsVernonLayerConfig()),
        ResourceLayer(BcVehicleKamloopsSalmonArmLayerConfig()),
        ResourceLayer(BcVehicleCoastalSouthIslandLayerConfig()),
        ResourceLayer(BcVehicleCoastalNorthIslandLayerConfig()),
        ResourceLayer(BcVehicleCoastalFraserLayerConfig()),
        ResourceLayer(BcVehicleCoastalMidIslandLayerConfig()),
        ResourceLayer(BcVehicleCoastalSunshineCoastLayerConfig()),
        ResourceLayer(BcVehicleCoastalPembertonLayerConfig()),
        ResourceLayer(BcVehicleSouthEastArrowLayerConfig()),
        ResourceLayer(BcVehicleSouthEastInvermereLayerConfig()),
        ResourceLayer(BcVehicleSouthEastCranbrookLayerConfig()),
        ResourceLayer(BcVehicleSouthEastKootenayLakeLayerConfig()),
        ResourceLayer(BcVehicleSouthEastBoundaryLayerConfig()),
        ResourceLayer(BcVehicleSouthEastColumbiaLayerConfig()),
        ResourceLayer(BcVehiclePrinceGeorgeRobsonValleyLayerConfig()),
        ResourceLayer(BcVehiclePrinceGeorgeDawsonCreekLayerConfig()),
        ResourceLayer(BcVehiclePrinceGeorgeFortStJohnLayerConfig()),
        ResourceLayer(BcVehiclePrinceGeorgePrinceGeorgeLayerConfig()),
        ResourceLayer(BcVehiclePrinceGeorgeMackenzieLayerConfig()),
        ResourceLayer(BcVehicleCaribooCifacLayerConfig()),
        ResourceLayer(BcVehicleNorthWestBulkleyLayerConfig()),
        ResourceLayer(BcOtherResourcesMrbLayerConfig()),
        ResourceLayer(BcOtherResourcesTankerTruckLayerConfig()),
        ResourceLayer(BcOtherResourcesFireCampLayerConfig()),
        ResourceLayer(BcOtherResourcesGuamLayerConfig()),
        ResourceLayer(BcOtherResourcesHeartBeatLayerConfig()),
        ResourceLayer(BcAircraftRotaryWingOtherLayerConfig()),
        ResourceLayer(BcAircraftRotaryWingIntermediateLayerConfig()),
        ResourceLayer(BcAircraftRotaryWingMediumLayerConfig()),
        ResourceLayer(BcAircraftRotaryWingMediumProvLayerConfig()),
        ResourceLayer(BcAircraftRotaryWingLightLayerConfig()),
        ResourceLayer(BcAircraftRotaryWingHeavyLayerConfig()),
        ResourceLayer(BcAircraftRotaryWingRapAttackLayerConfig()),
        ResourceLayer(BcAircraftFwtPatrolLayerConfig()),
        ResourceLayer(BcAircraftFwtTransportLayerConfig()),
        ResourceLayer(BcAircraftFwtCrewTransportLayerConfig()),
        ResourceLayer(BcAircraftFwbTankerLayerConfig()),
        ResourceLayer(BcAircraftFwbBirdDogLayerConfig()),
        ResourceLayer(BcAircraftFixedWingPatrolLayerConfig()),
        ResourceLayer(BcAircraftFixedWingTransportLayerConfig()),
        ResourceLayer(BcAircraftFixedWingTankerLayerConfig()),
        ResourceLayer(BcAircraftFixedWingBirdDogLayerConfig())
    ]

    function ResourceLayer(config: any): any {
        let cfg = {
            "type": "mobile-resources",
            "isQueryable": false,
            "layerName": "wf:ResourceStatus_svw",
            "serviceUrl": layerConfig.layerServices.mobileResource.url,
            "titleAttribute": "CALL_SIGN",
            "live": true,
            "attributes": [
                {
                    "title": "See track",
                    "action": "resource-track"
                },
                {
                    "name": "AGENCY",
                    "title": "Agency"
                },
                {
                    "name": "CALL_SIGN",
                    "title": "Call Sign"
                },
                {
                    "name": "OPERATIONALFUNCTION",
                    "title": "Function"
                },
                {
                    "name": "REGISTRATION",
                    "title": "Registration"
                },
                {
                    "title": "Location",
                    "value": "<%= $$.formatLatLon($.LATITUDE,$.LONGITUDE) %>"
                },
                {
                    "title": "Speed",
                    "value": "<%=$$.formatUnit($.SPEED, 'kn') %>",
                    "format": "HTML"
                },
                {
                    "title": "Heading",
                    "value": "<%= $$.formatAngle($.HEADING) || 'N/A' %>",
                    "format": "HTML"
                },
                {
                    "title": "Altitude",
                    "value": "<%=$$.formatUnit($.ALTITUDE, 'ft') %>",
                    "format": "HTML"
                },
                {
                    "name": "ALERT_STATUS",
                    "title": "Alert Status"
                },
                {
                    "value": "<%= $$.formatLocalTime($.position_timestamp) %>",
                    "title": "position_timestamp"
                },
                {
                    "value": "<%= $$.formatLocalTime($.server_timestamp) %>",
                    "title": "server_timestamp"
                },
                {
                    "name": "MAKE",
                    "title": "Make"
                },
                {
                    "name": "MODEL",
                    "title": "Model"
                },
                {
                    "name": "OWNER",
                    "title": "Owner"
                },
                {
                    "name": "RESOURCECLASS",
                    "title": "Class"
                },
                {
                    "name": "RESOURCESUBCLASS",
                    "title": "SubClass"
                },
                {
                    "name": "PHONE_NUMBER",
                    "title": "Phone Number"
                },
                {
                    "name": "COUNTRY",
                    "title": "Country"
                },
                {
                    "name": "REGISTRATION_COMMENTS",
                    "title": "Comments"
                },
                {
                    "name": "ESN",
                    "title": "esn"
                },
                {
                    "name": "SOURCE",
                    "title": "Source"
                },
                {
                    "name": "MESSAGABLE",
                    "title": "messagable"
                },
                {
                    "name": "EMERGENCY_ON",
                    "title": "emergency_on"
                },
                {
                    "name": "EMERGENCY_OFF",
                    "title": "emergency_off"
                },
                {
                    "name": "EMERGENCY_POS",
                    "title": "emergency_pos"
                },
                {
                    "name": "AT_BASE",
                    "title": "at_base"
                },
                {
                    "name": "DESIGNATOR",
                    "title": "designator"
                },
                {
                    "name": "ONCONTRACT",
                    "title": "oncontract"
                }
            ],
            ...config
        }

        if ( layerConfig.token )
            cfg.header = { 'Authorization': `Bearer ${ layerConfig.token }` }

        return cfg
    }

}
