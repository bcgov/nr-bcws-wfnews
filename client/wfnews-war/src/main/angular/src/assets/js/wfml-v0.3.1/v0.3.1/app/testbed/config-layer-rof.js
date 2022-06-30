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
        url: "https://wf1geod.nrs.gov.bc.ca/geoserver/gwc/service/wms"
    }
},

layers: [
  { "title": "Incidents",
    "id": "incident",
    "folder": [  ],
    "source": "WFML.Markers",
    "visible": false,
  }
  ,{ "title": "Report of Fire",
    "id": "rof",
    "folder": [  ],
    "source": "WFML.Markers",
    "visible": false,
  }

  ,{ "title": "Fire Perimeter",
    "folder": [ "Operational Planning" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.8,
    "layers": "IN_CURRENT_FIRE_POLYGONS"
  }
  ,{ "title": "Active ATR",
    "folder": [ "Operational Planning", "Air Tanker Request" ],
    "service": "wf",
    "visible": false,
    "layers": "ATR_ACTIVE"
  }
  ,{ "title": "Completed ATR",
    "folder": [ "Operational Planning", "Air Tanker Request" ],
    "service": "wf",
    "visible": false,
    "layers": "ATR_COMPLETE"
  }
  ,{ "title": "Active HTR",
    "folder": [ "Operational Planning", "Heli Tanker Request" ],
    "service": "wf",
    "visible": false,
    "layers": "HTR_ACTIVE"
  }
  ,{ "title": "Completed HTR",
    "folder": [ "Operational Planning", "Heli Tanker Request" ],
    "service": "wf",
    "visible": false,
    "layers": "HTR_COMPLETE"
  }
  ,{
    "id": "OFTS_ACTIVE",
     "title": "Active OFTS",
    "folder": [ "Operational Planning", "Open Burning Registration  (OFTS)" ],
    "service": "wf",
    "visible": false,
    "layers": "OFTS_ACTIVE",
    "attributes": [
      { "name":"id",                    "title":"Ref #" }, 
      { "name":"FireCentre",            "title":"Fire Centre" }, 
      { "name":"ExpiryTimeStamp",       "title":"Expiry Date" }, 
      { "name":"Latitude",              "title":"Latitude" }, 
      { "name":"Longitude",             "title":"Longitude" }, 
      { "name":"GeographicDescription", "title":"Geographic" }, 
      { "name":"ClFirstName",           "title":"Client First Name" }, 
      { "name":"ClLastName",            "title":"Client Last Name" }, 
      { "name":"ClAreaCode",            "title":"Phone Area Code" }, 
      { "name":"ClPhone",               "title":"Phone Number" }, 
      { "name":"ClPhoneExt",            "title":"Phone Extension" }, 
      { "name":"BurnCategoryCode",      "title":"Burn Category" }, 
      { "name":"BurnArea",              "title":"Burn Area" }, 
      { "name":"PilesWindrows",         "title":"Number of Fires" }, 
    ]
  }
  ,{ 
    "id": "OFTS_EXPIRED",
    "title": "Expired OFTS",
    "folder": [ "Operational Planning", "Open Burning Registration  (OFTS)" ],
    "service": "wf",
    "visible": false,
    "layers": "OFTS_EXPIRED",
    "attributes": [
      { "name":"id",                    "title":"Ref #" }, 
      { "name":"FireCentre",            "title":"Fire Centre" }, 
      { "name":"ExpiryTimeStamp",       "title":"Expiry Date" }, 
      { "name":"Latitude",              "title":"Latitude" }, 
      { "name":"Longitude",             "title":"Longitude" }, 
      { "name":"GeographicDescription", "title":"Geographic" }, 
      { "name":"ClFirstName",           "title":"Client First Name" }, 
      { "name":"ClLastName",            "title":"Client Last Name" }, 
      { "name":"ClAreaCode",            "title":"Phone Area Code" }, 
      { "name":"ClPhone",               "title":"Phone Number" }, 
      { "name":"ClPhoneExt",            "title":"Phone Extension" }, 
      { "name":"BurnCategoryCode",      "title":"Burn Category" }, 
      { "name":"BurnArea",              "title":"Burn Area" }, 
      { "name":"PilesWindrows",         "title":"Number of Fires" }, 
    ]
  }
  ,{ 
    "id": "OFTS_INVALID",
    "title": "Invalid OFTS",
    "folder": [ "Operational Planning", "Open Burning Registration  (OFTS)" ],
    "service": "wf",
    "visible": false,
    "layers": "OFTS_INVALID",
    "attributes": [
      { "name":"id",                    "title":"Ref #" }, 
      { "name":"FireCentre",            "title":"Fire Centre" }, 
      { "name":"ExpiryTimeStamp",       "title":"Expiry Date" }, 
      { "name":"Latitude",              "title":"Latitude" }, 
      { "name":"Longitude",             "title":"Longitude" }, 
      { "name":"GeographicDescription", "title":"Geographic" }, 
      { "name":"ClFirstName",           "title":"Client First Name" }, 
      { "name":"ClLastName",            "title":"Client Last Name" }, 
      { "name":"ClAreaCode",            "title":"Phone Area Code" }, 
      { "name":"ClPhone",               "title":"Phone Number" }, 
      { "name":"ClPhoneExt",            "title":"Phone Extension" }, 
      { "name":"BurnCategoryCode",      "title":"Burn Category" }, 
      { "name":"BurnArea",              "title":"Burn Area" }, 
      { "name":"PilesWindrows",         "title":"Number of Fires" }, 
    ]
  }
  ,{ "title": "Staging Area - Dispatch",
    "folder": [ "Operational Planning", "Camps and Staging Areas" ],
    "service": "wf",
    "visible": false,
    "layers": "UDO_STAGING_AREA"
  }
  ,{ "title": "Camp / Complex - Dispatch",
    "folder": [ "Operational Planning", "Camps and Staging Areas" ],
    "service": "wf",
    "visible": false,
    "layers": "UDO_CAMP_COMPLEX"
  }
  ,{ "title": "Landmark - Dispatch",
    "folder": [ "Operational Planning", "Landmark" ],
    "id": "landmark",
    "service": "wf",
    "visible": false,
    "layers": "UDO_LANDMARK"
  }
  ,{ "title": "Highway Rest Stop",
    "folder": [ "Operational Planning", "Landmark" ],
    "service": "bcgw",
    "visible": false,
    "layers": "WHSE_IMAGERY_AND_BASE_MAPS.MOT_REST_AREAS_SP"
  }
  ,{ "title": "Fuel Cache - Dispatch",
    "folder": [ "Operational Planning", "Caches" ],
    "service": "wf",
    "visible": false,
    "layers": "UDO_FUEL_CACHE"
  }
  ,{ "title": "Tool Cache - Dispatch",
    "folder": [ "Operational Planning", "Caches" ],
    "service": "wf",
    "visible": false,
    "layers": "UDO_TOOL_CACHE"
  }
  ,{ "title": "Air Patrol Checkpoint - Dispatch",
    "folder": [ "Operational Planning", "Detection" ],
    "service": "wf",
    "visible": false,
    "layers": "UDO_AIR_PATROL_CHECKPOINT"
  }
  ,{ "title": "Surface Patrol Checkpoint - Dispatch",
    "folder": [ "Operational Planning", "Detection" ],
    "service": "wf",
    "visible": false,
    "layers": "UDO_SURFACE_PATROL_CHECKPOINT"
  }
  ,{ "title": "Temperature - Daily",
    "folder": [ "Fire Weather", "Weather" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.5,
    "layers": "SFMS_TEMPERATURE"
  }
  ,{ "title": "Relative Humidity - Daily",
    "folder": [ "Fire Weather", "Weather" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.5,
    "layers": "SFMS_RELATIVE_HUMIDITY"
  }
  ,{ "title": "Wind Speed - Daily",
    "folder": [ "Fire Weather", "Weather" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.5,
    "layers": "SFMS_WIND_SPEED"
  }
  ,{ "title": "Wind Direction - Daily",
    "folder": [ "Fire Weather", "Weather" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.5,
    "layers": "SFMS_WIND_DIRECTION"
  }
  ,{ "title": "Precipitation - Daily",
    "folder": [ "Fire Weather", "Weather" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.5,
    "layers": "SFMS_PRECIPITATION"
  }
  ,{ "title": "Danger Rating",
    "folder": [ "Fire Weather", "Fire Weather Indices" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.5,
    "layers": "SFMS_DANGER_RATING"
  }
  ,{ "title": "Fine Fuel Moisture Code",
    "folder": [ "Fire Weather", "Fire Weather Indices" ],
    "service": "wf",
    "visible": false,
    "layers": "SFMS_FINE_FUEL_MOISTURE_CODE"
  }
  ,{ "title": "Duff Moisture Code",
    "folder": [ "Fire Weather", "Fire Weather Indices" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.5,
    "layers": "SFMS_DUFF_MOISTURE_CODE"
  }
  ,{ "title": "Drought Code",
    "folder": [ "Fire Weather", "Fire Weather Indices" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.5,
    "layers": "SFMS_DROUGHT_CODE"
  }
  ,{ "title": "Initial Spread Index",
    "folder": [ "Fire Weather", "Fire Weather Indices" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.5,
    "layers": "SFMS_INITIAL_SPREAD_INDEX"
  }
  ,{ "title": "Buildup Index",
    "folder": [ "Fire Weather", "Fire Weather Indices" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.5,
    "layers": "SFMS_BUILDUP_INDEX"
  }
  ,{ "title": "Fire Weather Index",
    "folder": [ "Fire Weather", "Fire Weather Indices" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.5,
    "layers": "SFMS_FIRE_WEATHER_INDEX"
  }
  ,{ "title": "Hazards - Dispatch",
    "folder": [ "Responder Safety", "Hazard" ],
    "service": "wf",
    "visible": false,
    "layers": "UDO_HAZARD"
  }
  ,{ "title": "Refuse Site",
    "folder": [ "Responder Safety", "Hazard" ],
    "service": "wf",
    "visible": false,
    "layers": "WF1_REFUSE_SITE"
  }
  ,{ "title": "Evacuation Order and Alert Areas",
    "folder": [ "Human Life and Safety", "Evacuations and Emergency Services" ],
    "service": "bcgw",
    "visible": false,
    "opacity": 0.7,
    "layers": "WHSE_HUMAN_CULTURAL_ECONOMIC.EMRG_ORDER_AND_ALERT_AREAS_SP"
  }
  ,{ "title": "Industrial Activity - Dispatch",
    "folder": [ "Critical Infrastructure", "Energy, Utilities and Facilities" ],
    "service": "wf",
    "visible": false,
    "layers": "UDO_INDUSTRIAL_ACTIVITY"
  }
  ,{ "title": "Oil and Gas - Pipeline",
    "folder": [ "Critical Infrastructure", "Energy, Utilities and Facilities" ],
    "service": "wf",
    "visible": false,
    "layers": "WF1_PIPELINES"
  }
  ,{ "title": "Transmission Line",
    "folder": [ "Critical Infrastructure", "Energy, Utilities and Facilities" ],
    "service": "wf",
    "visible": true,
    "layers": "WF1_TRANSMISSIONLINES"
  }
  ,{ "title": "Radio Tower - FLNRO",
    "folder": [ "Critical Infrastructure", "Communication and Information Tech" ],
    "service": "wf",
    "visible": false,
    "layers": "WF1_CI_FLNRO_RADIO_TOWER"
  }
  ,{ "title": "Radio Tower - Other",
    "folder": [ "Critical Infrastructure", "Communication and Information Tech" ],
    "service": "wf",
    "visible": false,
    "layers": "WF1_CI_OTHER_RADIO_TOWER"
  }
  ,{ 
    "title": "Hospital",
    "folder": [ "Critical Infrastructure", "Health Care" ],
    "service": "bcgw",
    "visible": false,
    "layers": "WHSE_IMAGERY_AND_BASE_MAPS.GSR_HOSPITALS_SVW"
  }
  ,{ "title": "Airport",
    "folder": [ "Critical Infrastructure", "Transportation - Aviation" ],
    "service": "wf",
    "visible": false,
    "layers": "WF1_AVIATION_AIRPORT"
  }
  ,{ "title": "Airstrip or Other Facility",
    "folder": [ "Critical Infrastructure", "Transportation - Aviation" ],
    "service": "wf",
    "visible": false,
    "layers": "WF1_AVIATION_AIRSTRIP"
  }
  ,{ "title": "Hospital Heliport",
    "folder": [ "Critical Infrastructure", "Transportation - Aviation" ],
    "service": "wf",
    "visible": false,
    "layers": "WF1_AVIATION_HOSPITAL_HELIPORT"
  }
  ,{ "title": "Heliport & Helipad",
    "folder": [ "Critical Infrastructure", "Transportation - Aviation" ],
    "service": "wf",
    "visible": false,
    "layers": "WF1_AVIATION_HELIPAD_HELIPORT"
  }
  ,{ "title": "Seaplane Facility",
    "folder": [ "Critical Infrastructure", "Transportation - Aviation" ],
    "service": "wf",
    "visible": false,
    "layers": "WF1_AVIATION_SEAPLANE"
  }
  ,{ "title": "Weather Station - Active",
    "folder": [ "Critical Infrastructure", "Weather Infrastructure" ],
    "service": "wf",
    "visible": false,
    "layers": "FW_ACTIVEREPORTING_WSTN"
  }
  ,{
    "title": "Climate Station",
    "folder": [ "Critical Infrastructure", "Weather Infrastructure" ],
    "service": "bcgw",
    "visible": false,
    "layers": "WHSE_IMAGERY_AND_BASE_MAPS.GSR_CLIMATE_STATIONS_SVW",
  }
  ,{ "title": "Community Watershed",
    "folder": [ "High Environment Cultural Values", "Water" ],
    "service": "bcgw",
    "visible": false,
    "layers": "WHSE_WATER_MANAGEMENT.WLS_COMMUNITY_WS_PUB_SVW"
  }
  ,{ "title": "Place Name",
    "folder": [ "Place and Terrain Names", "Annotation / Labels" ],
    "service": "wf",
    "visible": false,
    "layers": "WF1_PLACE_NAMES"
  }
  ,{ "title": "Terrain Name",
    "folder": [ "Place and Terrain Names", "Annotation / Labels" ],
    "service": "wf",
    "visible": false,
    "layers": "WF1_TERRAIN_NAMES"
  }
  ,{ "title": "Fire Centre",
    "folder": [ "Boundaries", "BC Wildfire" ],
    "service": "wf",
    "visible": true,
    "layers": "WF1_FIRE_CENTRE_SPG"
  }
  ,{ "title": "Fire Zone",
    "folder": [ "Boundaries", "BC Wildfire" ],
    "service": "wf",
    "visible": true,
    "scaleMax": 2000000,
    "layers": "WF1_FIRE_ZONE_SPG"
  }
  ,{ "title": "Natural Resource Area",
    "folder": [ "Boundaries", "FLNRO" ],
    "service": "bcgw",
    "visible": false,
    "styles": "Natural_Resource_Areas_Outlined",
    "layers": "WHSE_ADMIN_BOUNDARIES.ADM_NR_AREAS_SPG"
  }
  ,{ "title": "Natural Resource District",
    "folder": [ "Boundaries", "FLNRO" ],
    "service": "bcgw",
    "visible": false,
    "styles": "Natural_Resource_Districts_Outlined",
    "layers": "WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG"
  }
  ,{ "title": "Natural Resource Region",
    "folder": [ "Boundaries", "FLNRO" ],
    "service": "bcgw",
    "visible": false,
    "styles": "Natural_Resource_Regions_Outlined",
    "layers": "WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG"
  }
  ,{ "title": "Regional District",
    "folder": [ "Boundaries", "Local Government" ],
    "service": "bcgw",
    "visible": false,
    "styles": "Regional_Districts_Tantalis_Outlined",
    "layers": "WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP"
  }
  ,{ "title": "Municipality",
    "folder": [ "Boundaries", "Local Government" ],
    "service": "bcgw",
    "visible": false,
    "opacity": 0.5,
    "styles": "Municipalities_ABMS_Outlined",
    "layers": "WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_MUNICIPALITIES_SP"
  }
  ,{ "title": "Fire Department ",
    "folder": [ "Boundaries", "Local Government" ],
    "service": "wf",
    "visible": true,
    "layers": "BNDY_FIRE_DEPARTMENTS"
  }
  ,{ "title": "Tree Farm Licence (TFL)",
    "folder": [ "Boundaries", "Tenures" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.8,
    "layers": "WF1_BNDY_TFL"
  }
  ,{ "title": "Alpine Ski Area ",
    "folder": [ "Boundaries", "Tenures" ],
    "service": "bcgw",
    "visible": false,
    "layers": "REG_LEGAL_AND_ADMIN_BOUNDARIES.REC_TENURE_ALPINE_SKI_AREAS_SP"
  }
  ,{ "title": "Recreation Area  (RSTBC)",
    "folder": [ "Boundaries", "Tenures" ],
    "service": "bcgw",
    "visible": false,
    "layers": "WHSE_FOREST_TENURE.FTEN_RECREATION_POLY_SVW"
  }
  ,{ "title": "Woodlot (Active or Pending)",
    "folder": [ "Boundaries", "Tenures" ],
    "service": "bcgw",
    "visible": false,
    "layers": "WHSE_FOREST_TENURE.FTEN_MANAGED_LICENCE_POLY_SVW"
  }
  ,{ "title": "First Nation Treaty Land",
    "folder": [ "Land Ownership Status", "First Nations" ],
    "service": "bcgw",
    "visible": false,
    "opacity": 0.6,
    "layers": "WHSE_LEGAL_ADMIN_BOUNDARIES.FNT_TREATY_LAND_SP"
  }
  ,{ "title": "First Nation Title Area",
    "folder": [ "Land Ownership Status", "First Nations" ],
    "service": "wf",
    "visible": true,
    "opacity": 0.6,
    "layers": "WF1_FN_TITLE_AREA"
  }
  ,{ "title": "Indian Reserve",
    "folder": [ "Land Ownership Status", "First Nations" ],
    "service": "bcgw",
    "visible": true,
    "opacity": 0.6,
    "layers": "WHSE_ADMIN_BOUNDARIES.CLAB_INDIAN_RESERVES"
  }
  ,{ "title": "National Park (BC)",
    "folder": [ "Land Ownership Status", "Parks and Protected Lands" ],
    "service": "bcgw",
    "visible": true,
    "opacity": 0.6,
    "layers": "WHSE_ADMIN_BOUNDARIES.CLAB_NATIONAL_PARKS"
  }
  ,{ "title": "BC Parks and Protected Areas",
    "folder": [ "Land Ownership Status", "Parks and Protected Lands" ],
    "service": "bcgw",
    "visible": true,
    "opacity": 0.6,
    "scaleMax": 1000000,
    "layers": "WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW"
  }
  ,{ "title": "Wildlife Management Area",
    "folder": [ "Land Ownership Status", "Parks and Protected Lands" ],
    "service": "bcgw",
    "visible": false,
    "opacity": 0.6,
    "layers": "WHSE_TANTALIS.TA_WILDLIFE_MGMT_AREAS_SVW"
  }
  ,{ "title": "Conservancy Area",
    "folder": [ "Land Ownership Status", "Parks and Protected Lands" ],
    "service": "bcgw",
    "visible": false,
    "opacity": 0.6,
    "layers": "WHSE_TANTALIS.TA_CONSERVANCY_AREAS_SVW"
  }
  ,{ "title": "Conservation Land",
    "folder": [ "Land Ownership Status", "Parks and Protected Lands" ],
    "service": "bcgw",
    "visible": false,
    "opacity": 0.6,
    "layers": "WHSE_LEGAL_ADMIN_BOUNDARIES.WCL_CONSERVATION_LANDS_SP"
  }
  ,{ "title": "Conservation Land (NGO)",
    "folder": [ "Land Ownership Status", "Parks and Protected Lands" ],
    "service": "bcgw",
    "visible": false,
    "opacity": 0.6,
    "layers": "WHSE_LEGAL_ADMIN_BOUNDARIES.WCL_CONSERVATION_AREAS_NGO_SP"
  }
  ,{ "title": "Cadastre",
    "folder": [ "Land Ownership Status", "Ownership" ],
    "service": "wf",
    "visible": false,
    "layers": "WF1_CADASTRE"
  }
  ,{ "title": "Road",
    "folder": [ "Transportation and Trails", "Roads" ],
    "service": "wf",
    "visible": true,
    "layers": "WF1_ROADS"
  }
  ,{ "title": "Railway ",
    "folder": [ "Transportation and Trails", "Railway" ],
    "service": "bcgw",
    "scaleMax": 1000000,
    "visible": true,
    "layers": "WHSE_BASEMAPPING.GBA_RAILWAY_TRACKS_SP"
  }
  ,{ "title": "Trail",
    "folder": [ "Transportation and Trails", "Trails and Trailheads" ],
    "service": "wf",
    "visible": false,
    "layers": "WF1_TRAILS"
  }
  ,{ "title": "Rivers & Streams",
    "folder": [ "Natural Features" ],
    "service": "bcgw",
    "visible": true,
    "scaleMax": 70000,
    "layers": "WHSE_BASEMAPPING.FWA_STREAM_NETWORKS_SP"
  }
  ,{ "title": "Lakes",
    "folder": [ "Natural Features" ],
    "service": "bcgw",
    "visible": false,
    "scaleMax": 140000,
    "layers": "WHSE_BASEMAPPING.FWA_LAKES_POLY"
  }
  ,{ "title": "Contours NTS (80,000 to 500,000)",
    "folder": [ "Natural Features", "Contours" ],
    "service": "bcgw",
    "visible": false,
    "scaleMax": 600000,
    "scaleMin": 80000,
    "layers": "WHSE_BASEMAPPING.NTS_BC_CONTOUR_LINES_125M"
  }
  ,{ "title": "Contours TRIM (1 to 80,000)",
    "folder": [ "Natural Features", "Contours" ],
    "service": "bcgw",
    "visible": false,
    "scaleMax": 80000,
    "layers": "WHSE_BASEMAPPING.TRIM_CONTOUR_LINES"
  }
  /*
  ,{ 	title: "Wildfire Base",
        folder: [  ],
        service: "wfgwc",
        visible: false,
        layers: 'wf:WF_BASE'
    }
    */
],

  hoverIdentify: [
    "OFTS_ACTIVE",
    "OFTS_EXPIRED",
    "OFTS_INVALID",
  ]


};