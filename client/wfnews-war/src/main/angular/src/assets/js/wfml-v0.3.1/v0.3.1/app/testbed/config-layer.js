
LAYER_CONFIG = {
services: {
    bcgw: {
        name: "BCGW",
        url: "https://openmaps.gov.bc.ca/geo/pub/wms"
    },
    wf: {
        name: "Wildfire-GS",
        url: "https://wf1geoi.nrs.gov.bc.ca/geoserver/wms"
    },
    wfgwc: {
        name: "WF-GWC",
        tiled: true,
        url: "https://wf1geoi.nrs.gov.bc.ca/geoserver/gwc/service/wms"
    }

},
layers: [
    {  title: "Active Fires",
        id: "ACTIVE_FIRES",
        folder: "Portal",
        service: "wf",
        visible: true,
        layers: "ACTIVE_FIRES",
        "attributes": [
             { "name": "FireNumber", "title": "Fire Number" }
            ,{ "name": "DiscoveryDate",  "title": "Date of Discovery" }
            ,{ "name": "CauseGeneralOriginal", "title": "Suspected Cause" }
            ,{ "name": "CurrentSize", "title": "Estimated Size (ha)" }
            ,{ "name": "IncidentStatus", "title": "Stage of Control" }
            ,{ "name": "IncidentType", "title": "Incident Type" }
            ,{ "name": "FireClass", "title": "Classification" }
            ,{ "name": "IC", "title": "Incident Commander" }
            ,{ "name": "Geographic", "title": "Approx Location" }
            ,{ "name": "FireCentreName", "title": "Fire Centre" }
            ,{ "name": "ZoneName", "title": "Zone" }
        ]
    }
    ,{ 	title: "Fire Zone Bans",
        id: "FIRE_ZONE_BAN",
        folder: [ "Alerts & Bans" ],
        service: "bcgw",
        visible: true,
        layers: 'pub:WHSE_LEGAL_ADMIN_BOUNDARIES.DRP_MOF_FIRE_ZONES_SP'
    }
    ,{  title: "Air Patrol Checkpoint",
        id: "aircheck",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "AIR_PAT_CHECKPT_PT_SVW"
    }
    ,{  title: "AIRNET_POINT_SVW",
        id: "AIRNET_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "AIRNET_POINT_SVW"
    }
    ,{  title: "AIRSTRIP_POINT_SVW",
        id: "AIRSTRIP_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "AIRSTRIP_POINT_SVW"
    }
    ,{  title: "CAMP_COMPLEX_POINT_SVW",
        id: "CAMP_COMPLEX_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "CAMP_COMPLEX_POINT_SVW"
    }
    ,{  title: "COAST_GUARD_BASE_POINT_SVW",
        id: "COAST_GUARD_BASE_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "COAST_GUARD_BASE_POINT_SVW"
    }
    ,{  title: "FORWARD_TANKER_BASE_POINT_SVW",
        id: "FORWARD_TANKER_BASE_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "FORWARD_TANKER_BASE_POINT_SVW"
    }
    ,{  title: "FUEL_CACHE_POINT_SVW",
        id: "FUEL_CACHE_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "FUEL_CACHE_POINT_SVW"
    }
    ,{  title: "HAZARD_POINT_SVW",
        id: "HAZARD_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "HAZARD_POINT_SVW"
    }
    ,{  title: "HELIPAD_POINT_SVW",
        id: "HELIPAD_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "HELIPAD_POINT_SVW"
    }
    ,{  title: "INDUSTRIAL_ACTIVITY_POINT_SVW",
        id: "INDUSTRIAL_ACTIVITY_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "INDUSTRIAL_ACTIVITY_POINT_SVW"
    }
    ,{   title: "Landmarks",
        id: "landmark",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "LANDMARK_POINT_SVW"
    }
    ,{  title: "MEDEVAC_POINT_SVW",
        id: "MEDEVAC_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "MEDEVAC_POINT_SVW"
    }
    ,{  title: "OUT_OF_PROV_AIRPORT_POINT_SVW",
        id: "OUT_OF_PROV_AIRPORT_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "OUT_OF_PROV_AIRPORT_POINT_SVW"
    }
    ,{  title: "RCMP Radio Repeaters",
        id: "rcmpradio",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "RDO_TWR_RCMP_POINT_SVW"
    }
    ,{  title: "REMOTE_STRUCTURE_POINT_SVW",
        id: "REMOTE_STRUCTURE_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "REMOTE_STRUCTURE_POINT_SVW"
    }
    ,{  title: "STAGING_AREA_POINT_SVW",
        id: "STAGING_AREA_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "STAGING_AREA_POINT_SVW"
    }
    ,{  title: "Surface Patrol Checkpoint",
        id: "surfacecheck",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "SURF_PAT_CHKPT_POINT_SVW"
    }
    ,{  title: "TOOL_EQUIP_CACHE_POINT_SVW",
        id: "TOOL_EQUIP_CACHE_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "TOOL_EQUIP_CACHE_POINT_SVW"
    }
    ,{  title: "VOR_POINT_SVW",
        id: "VOR_POINT_SVW",
        folder: "UED",
        service: "wf",
        visible: false,
        layers: "VOR_POINT_SVW"
    }
    ,{  title: "Major Roads (1:7,500,000)",
        folder: ["Ref", "Roads"],
        service: "bcgw",
        visible: false,
        layers: 'WHSE_BASEMAPPING.DBM_BC_7H_MIL_ROADS_LINE'
    }
    ,{  title: "Transportation - Roads, etc. (1:2,000,000)",
        folder: ["Ref", "Roads"],
        service: "bcgw",
        visible: false,
        layers: 'WHSE_BASEMAPPING.BC_TRANSPORT_LINES_500M'
    }
    ,{  title: "Transportation - Roads, etc. (1:250,000)",
        folder: ["Ref", "Roads"],
        service: "bcgw",
        visible: false,
        layers: 'WHSE_BASEMAPPING.NTS_BC_TRANSPORT_LINES_125M'
    }
    ,{ 	title: "Fire Zone Boundary",
        folder: [ "Ref", "Boundaries", "BC Wildfire" ],
        service: "bcgw",
        visible: false,
        layers: 'WHSE_LEGAL_ADMIN_BOUNDARIES.DRP_MOF_FIRE_ZONES_SP'
    }
    ,{ 	title: "Natural Resource Districts",
        folder: [ "Ref", "Boundaries", "BC Wildfire" ],
        service: "bcgw",
        visible: false,
        layers: 'WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG'
    }
    ,{ 	title: "WF Base",
        folder: [ "Ref", "Base" ],
        service: "wfgwc",
        visible: false,
        layers: 'wf:WF_BASE'
    }
]

};


