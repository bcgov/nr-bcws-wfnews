/*
* This is a local config file which can be used to override config settings.
* It can be omitted if not used
*/
LAYER_CONFIG.services.xwf = {
        name: "Wildfire-GS",
        url: "https://d1geo.vividsolutions.com/geoserver/wms"
};

LAYER_CONFIG.layers.unshift(
    {  title: "Active Fires",
        id: "ACTIVE_FIRES",
        folder: "PORTAL",
        service: "wf",
        visible: true,
        layers: "INCIDENT_ACTIVE_FIRE",
        "attributes": [
             { "name": "INCIDENT_NUMBER_LABEL", "title": "Fire Number" }
            ,{ "name": "DiscoveryDate",  "title": "Date of Discovery" }
            ,{ "name": "GENERAL_INCIDENT_CAUSE_CAT", "title": "Suspected Cause" }
            ,{ "name": "FIRE_SIZE_HA", "title": "Estimated Size (ha)" }
            ,{ "name": "STAGE_OF_CONTROL_DESC", "title": "Stage of Control" }
            ,{ "name": "INCIDENT_TYPE_DESC", "title": "Incident Type" }
            ,{ "name": "FIRE_CLASSIFICATION_DESC", "title": "Classification" }
            ,{ "name": "INCIDENT_COMMANDER_NAME", "title": "Incident Commander" }
            ,{ "name": "GEOGRAPHIC_DESCRIPTION", "title": "Approx Location" }
            ,{ "name": "FIRE_CTR_ORG_UNIT_NAME", "title": "Fire Centre" }
            ,{ "name": "FIRE_ZONE_ORG_UNIT_NAME", "title": "Zone" }
        ]
    }
);