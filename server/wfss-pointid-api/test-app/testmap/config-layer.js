LAYER_CONFIG = {

services: {
    bcgw: {
        name: "BCGW",
        url: "https://openmaps.gov.bc.ca/geo/pub/wms"
    },
    wf: {
        name: "Wildfire-GS",
        url: "https://wf1geot.nrs.gov.bc.ca/geoserver/wms"
    },
},

layers: [


  { "title": "Fuel Type",
    "folder": [ "Geography", "Wildfire" ],
    "service": "wf",
    "visible": false,
    opacity: 0.5,
    "layers": "FM_FUEL_TYPE_BC"
  }
  ,{ "title": "Slope",
    "folder": [ "Geography", "Wildfire" ],
    "service": "wf",
    opacity: 0.5,
    "visible": false,
    "layers": "BC_SLOPE"
  }
  ,{ "title": "Aspect",
    "folder": [ "Geography", "Wildfire" ],
    "service": "wf",
    opacity: 0.5,
    "visible": false,
    "layers": "BC_ASPECT"
  }
  ,{ "title": "Elevation",
    "folder": [ "Geography", "Wildfire" ],
    "service": "wf",
    opacity: 0.5,
    "visible": false,
    "layers": "BC_DEM"
  }
  ,{ "title": "Mapsheet 1:20K",
    "folder": [ "Geography", "BCGW" ],
    "service": "bcgw",
    "visible": false,
    "layers": "WHSE_BASEMAPPING.BCGS_20K_GRID"
  }
  ,{ "title": "Veg",
    "folder": [ "Geography", "BCGW" ],
    "service": "bcgw",
    "visible": false,
    opacity: 0.5,
    "layers": "WHSE_FOREST_VEGETATION.VEG_COMP_LYR_R1_POLY"
  }
  ,{ "title": "BioGeo",
    "folder": [ "Geography", "BCGW" ],
    "service": "bcgw",
    "visible": false,
    "layers": "WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_ZONE_2M_SPG"
  }
  ,{ "title": "Fire Centre",
    "folder": [ "Ownership", "Wildfire" ],
    "service": "wf",
    "visible": true,
    "layers": "WF1_FIRE_CENTRE_SPG"
  }
  ,{ "title": "Fire Zone",
    "folder": [ "Ownership", "Wildfire" ],
    "service": "wf",
    "visible": true,
    "scaleMax": 2000000,
    "layers": "WF1_FIRE_ZONE_SPG"
  }
  ,{ "title": "Fire Department ",
    "folder": [ "Ownership", "Wildfire" ],
    "service": "wf",
    "visible": true,
    "layers": "BNDY_FIRE_DEPARTMENTS"
  }
  ,{ "title": "First Nation Title Area",
    "folder": [ "Ownership", "Wildfire" ],
    "service": "wf",
    "visible": true,
    "opacity": 0.6,
    "layers": "WF1_FN_TITLE_AREA"
  }
  ,{ "title": "Tree Farm Licence (TFL)",
    "folder": [ "Ownership", "Wildfire" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.8,
    "layers": "WF1_BNDY_TFL"
  }
  ,{ "title": "Client Assets - Polygons",
    "folder": [ "Ownership", "Wildfire" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.8,
    "layers": "CLT_CLIENT_ASSETS_POLYGONS"
  }
    ,{ "title": "Client Assets - Lines",
    "folder": [ "Ownership", "Wildfire" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.8,
    "layers": "CLT_CLIENT_ASSETS_LINES"
  }
    ,{ "title": "Client Assets - Points",
    "folder": [ "Ownership", "Wildfire" ],
    "service": "wf",
    "visible": false,
    "opacity": 0.8,
    "layers": "CLT_CLIENT_ASSETS_POINTS"
  }

  ,{ "title": "Natural Resource District",
    "folder": [ "Ownership", "BCGW" ],
    "service": "bcgw",
    "visible": false,
    "styles": "Natural_Resource_Districts_Outlined",
    "layers": "WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG"
  }
  ,{ "title": "Woodlot (Active or Pending)",
    "folder": [ "Ownership", "BCGW" ],
    "service": "bcgw",
    "visible": false,
    "layers": "WHSE_FOREST_TENURE.FTEN_MANAGED_LICENCE_POLY_SVW"
  }
  ,{ "title": "Cadastre - PMBC",
    "folder": [ "Ownership", "BCGW" ],
    "service": "bcgw",
    "visible": false,
    "layers": "WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_FA_SVW"
  }
  ,{ "title": "Indian Reserve",
    "folder": [ "Ownership", "BCGW" ],
    "service": "bcgw",
    "visible": true,
    "opacity": 0.6,
    "layers": "WHSE_ADMIN_BOUNDARIES.CLAB_INDIAN_RESERVES"
  }
  ,{ "title": "Municipality",
    "folder": [ "Ownership", "BCGW" ],
    "service": "bcgw",
    "visible": false,
    "opacity": 0.5,
    "styles": "Municipalities_ABMS_Outlined",
    "layers": "WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_MUNICIPALITIES_SP"
  }
  ,{ "title": "Regional District",
    "folder": [ "Ownership", "BCGW" ],
    "service": "bcgw",
    "visible": false,
    "styles": "Regional_Districts_Tantalis_Outlined",
    "layers": "WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP"
  }
  ,{ "title": "Community Watershed",
    "folder": [ "Ownership", "BCGW" ],
    "service": "bcgw",
    "visible": true,
    "layers": "WHSE_WATER_MANAGEMENT.WLS_COMMUNITY_WS_PUB_SVW"
  }
  ,{ "title": "National Park (BC)",
    "folder": [ "Ownership", "BCGW" ],
    "service": "bcgw",
    "visible": true,
    "opacity": 0.6,
    "layers": "WHSE_ADMIN_BOUNDARIES.CLAB_NATIONAL_PARKS"
  }
  ,{ "title": "BC Parks and Protected Areas",
    "folder": [ "Ownership", "BCGW" ],
    "service": "bcgw",
    "visible": true,
    "opacity": 0.6,
    "scaleMax": 1000000,
    "layers": "WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW"
  }
  ,{ "title": "Wildlife Management Area",
    "folder": [ "Ownership", "BCGW" ],
    "service": "bcgw",
    "visible": false,
    "opacity": 0.6,
    "layers": "WHSE_TANTALIS.TA_WILDLIFE_MGMT_AREAS_SVW"
  }
  ,{ "title": "Conservation Land",
    "folder": [ "Ownership", "BCGW" ],
    "service": "bcgw",
    "visible": false,
    "opacity": 0.6,
    "layers": "WHSE_LEGAL_ADMIN_BOUNDARIES.WCL_CONSERVATION_LANDS_SP"
  }
  ,{ "title": "Weather Station - Active",
    "folder": [ "Weather" ],
    "service": "wf",
    "visible": true,
    "layers": "FW_ACTIVEREPORTING_WSTN"
  }
  
]
};