import { LayerSettings } from '@wf1/core-ui';

export function LayerDisplayConfig(layerSettings: LayerSettings) {
    return [
        {
            id: "incidents",
            isVisible: true
        },
        {
            type: "folder",
            id: "mobile-resources",
            title: "Mobile Resources",
            isVisible: false,
            items: [
                {
                    id: "resource-track",
                    isVisible: false
                },
                {
                    type: "folder",
                    id: "mobile-resources---british-columbia",
                    title: "British Columbia",
                    isVisible: false,
                    items: [
                        {
                            type: "folder",
                            id: "mobile-resources---british-columbia---vehicle",
                            title: "Vehicle",
                            isVisible: false,
                            items: [
                                {
                                    type: "folder",
                                    id: "mobile-resources---british-columbia---vehicle---hq",
                                    title: "HQ",
                                    isVisible: false,
                                    items: [
                                        {
                                            id: "bc-vehicle-hq-systems",
                                        },
                                        {
                                            id: "bc-vehicle-hq-wx-techs",
                                        },
                                        {
                                            id: "bc-vehicle-hq-camp-co-ord",
                                        }
                                    ],
                                },
                                {
                                    type: "folder",
                                    id: "mobile-resources---british-columbia---vehicle---kamloops",
                                    title: "Kamloops",
                                    isVisible: true,
                                    items: [
                                        {
                                            id: "bc-vehicle-kamloops-lillooet",
                                        },
                                        {
                                            id: "bc-vehicle-kamloops-merritt",
                                        },
                                        {
                                            id: "bc-vehicle-kamloops-penticton",
                                        },
                                        {
                                            id: "bc-vehicle-kamloops-clearwater",
                                        },
                                        {
                                            id: "bc-vehicle-kamloops-kamloops",
                                        },
                                        {
                                            id: "bc-vehicle-kamloops-vernon",
                                        },
                                        {
                                            id: "bc-vehicle-kamloops-salmon-arm",
                                        }
                                    ],
                                },
                                {
                                    type: "folder",
                                    id: "mobile-resources---british-columbia---vehicle---coastal",
                                    title: "Coastal",
                                    isVisible: false,
                                    items: [
                                        {
                                            id: "bc-vehicle-coastal-south-island",
                                        },
                                        {
                                            id: "bc-vehicle-coastal-north-island",
                                        },
                                        {
                                            id: "bc-vehicle-coastal-fraser",
                                        },
                                        {
                                            id: "bc-vehicle-coastal-mid-island",
                                        },
                                        {
                                            id: "bc-vehicle-coastal-sunshine-coast",
                                        },
                                        {
                                            id: "bc-vehicle-coastal-pemberton",
                                        }
                                    ],
                                },
                                {
                                    type: "folder",
                                    id: "mobile-resources---british-columbia---vehicle---south-east",
                                    title: "South East",
                                    isVisible: false,
                                    items: [
                                        {
                                            id: "bc-vehicle-south-east-arrow",
                                        },
                                        {
                                            id: "bc-vehicle-south-east-invermere",
                                        },
                                        {
                                            id: "bc-vehicle-south-east-cranbrook",
                                        },
                                        {
                                            id: "bc-vehicle-south-east-kootenay-lake",
                                        },
                                        {
                                            id: "bc-vehicle-south-east-boundary",
                                        },
                                        {
                                            id: "bc-vehicle-south-east-columbia",
                                        }
                                    ],
                                },
                                {
                                    type: "folder",
                                    id: "mobile-resources---british-columbia---vehicle---prince-george",
                                    title: "Prince George",
                                    isVisible: false,
                                    items: [
                                        {
                                            id: "bc-vehicle-prince-george-robson-valley",
                                        },
                                        {
                                            id: "bc-vehicle-prince-george-dawson-creek",
                                        },
                                        {
                                            id: "bc-vehicle-prince-george-fort-st-john",
                                        },
                                        {
                                            id: "bc-vehicle-prince-george-prince-george",
                                        },
                                        {
                                            id: "bc-vehicle-prince-george-mackenzie",
                                        }
                                    ]
                                },
                                {
                                    type: "folder",
                                    id: "mobile-resources---british-columbia---vehicle---cariboo",
                                    title: "Cariboo",
                                    isVisible: false,
                                    items: [
                                        {
                                            id: "bc-vehicle-cariboo-cifac",
                                        }
                                    ],
                                },
                                {
                                    type: "folder",
                                    id: "mobile-resources---british-columbia---vehicle---north-west",
                                    title: "North West",
                                    isVisible: false,
                                    items: [
                                        {
                                            id: "bc-vehicle-north-west-bulkley",
                                        }
                                    ],
                                }
                            ],
                        },
                        {
                            type: "folder",
                            id: "mobile-resources---british-columbia---other",
                            title: "Other",
                            isVisible: false,
                            items: [
                                {
                                    type: "folder",
                                    id: "mobile-resources---british-columbia---other---resources",
                                    title: "Resources",
                                    isVisible: false,
                                    items: [
                                        {
                                            id: "bc-other-resources-mrb",
                                        },
                                        {
                                            id: "bc-other-resources-tanker-truck",
                                        },
                                        {
                                            id: "bc-other-resources-fire-camp",
                                        },
                                        {
                                            id: "bc-other-resources-guam",
                                        },
                                        {
                                            id: "bc-other-resources-heart-beat",
                                        }
                                    ],
                                }
                            ],
                        },
                        {
                            type: "folder",
                            id: "mobile-resources---british-columbia---aircraft",
                            title: "Aircraft",
                            isVisible: false,
                            items: [
                                {
                                    type: "folder",
                                    id: "mobile-resources---british-columbia---aircraft---rotary-wing",
                                    title: "Rotary Wing",
                                    isVisible: false,
                                    items: [
                                        {
                                            id: "bc-aircraft-rotary-wing-other",
                                        },
                                        {
                                            id: "bc-aircraft-rotary-wing-intermediate",
                                        },
                                        {
                                            id: "bc-aircraft-rotary-wing-medium",
                                        },
                                        {
                                            id: "bc-aircraft-rotary-wing-medium-prov",
                                        },
                                        {
                                            id: "bc-aircraft-rotary-wing-light",
                                        },
                                        {
                                            id: "bc-aircraft-rotary-wing-heavy",
                                        },
                                        {
                                            id: "bc-aircraft-rotary-wing-rap-attack",
                                        }
                                    ],
                                },
                                {
                                    type: "folder",
                                    id: "mobile-resources---british-columbia---aircraft---fwt",
                                    title: "FWT",
                                    isVisible: false,
                                    items: [
                                        {
                                            id: "bc-aircraft-fwt-patrol",
                                        },
                                        {
                                            id: "bc-aircraft-fwt-transport",
                                        },
                                        {
                                            id: "bc-aircraft-fwt-crew-transport",
                                        }
                                    ],
                                },
                                {
                                    type: "folder",
                                    id: "mobile-resources---british-columbia---aircraft---fwb",
                                    title: "FWB",
                                    isVisible: false,
                                    items: [
                                        {
                                            id: "bc-aircraft-fwb-tanker",
                                        },
                                        {
                                            id: "bc-aircraft-fwb-bird-dog",
                                        }
                                    ],
                                },
                                {
                                    type: "folder",
                                    id: "mobile-resources---british-columbia---aircraft---fixed-wing",
                                    title: "Fixed Wing",
                                    isVisible: false,
                                    items: [
                                        {
                                            id: "bc-aircraft-fixed-wing-patrol",
                                        },
                                        {
                                            id: "bc-aircraft-fixed-wing-transport",
                                        },
                                        {
                                            id: "bc-aircraft-fixed-wing-tanker",
                                        },
                                        {
                                            id: "bc-aircraft-fixed-wing-bird-dog",
                                        }
                                    ],
                                }
                            ],
                        }
                    ],
                }
            ],
        },
        {
            type: "folder",
            id: "operational-planning",
            title: "Operational Planning",
            isVisible: false,
            items: [
                {
                    id: "in-current-fire-polygons",
                    isVisible: false
                },
                {
                    type: "folder",
                    id: "operational-planning---air-tanker-request",
                    title: "Air Tanker Request",
                    isVisible: false,
                    items: [
                        {
                            id: "atr-active",
                            isVisible: false
                        },
                        {
                            id: "atr-complete",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "operational-planning---heli-tanker-request",
                    title: "Heli Tanker Request",
                    isVisible: false,
                    items: [
                        {
                            id: "htr-active",
                            isVisible: false
                        },
                        {
                            id: "htr-complete",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "operational-planning---open-burning-registration-ofts",
                    title: "Open Burning Registration  (OFTS)",
                    isVisible: false,
                    items: [
                        {
                            id: "ofts-active",
                            isVisible: false
                        },
                        {
                            id: "ofts-expired",
                            isVisible: false
                        },
                        {
                            id: "ofts-invalid",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "operational-planning---camps-and-staging-areas",
                    title: "Camps and Staging Areas",
                    isVisible: false,
                    items: [
                        {
                            id: "ued-camp-complex",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "operational-planning---landmark",
                    title: "Landmark",
                    isVisible: false,
                    items: [
                        {
                            id: "ued-landmark",
                            isVisible: false
                        },
                        {
                            id: "whse-imagery-and-base-maps-mot-rest-areas-sp",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "operational-planning---caches",
                    title: "Caches",
                    isVisible: false,
                    items: [
                        {
                            id: "ued-fuel-cache",
                            isVisible: false
                        },
                        {
                            id: "ued-tool-cache",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "operational-planning---detection",
                    title: "Detection",
                    isVisible: false,
                    items: [
                        {
                            id: "ued-air-patrol-checkpoint",
                            isVisible: false
                        },
                        {
                            id: "ued-surface-patrol-checkpoint",
                            isVisible: false
                        }
                    ],
                }
            ],
        },
        {
            type: "folder",
            id: "fire-weather",
            title: "Fire Weather",
            isVisible: false,
            items: [
                {
                    id: "lightning",
                    isVisible: null
                },
                {
                    type: "folder",
                    id: "fire-weather---weather",
                    title: "Weather",
                    isVisible: false,
                    items: [
                        {
                            id: "sfms-temperature",
                            isVisible: false
                        },
                        {
                            id: "sfms-relative-humidity",
                            isVisible: false
                        },
                        {
                            id: "sfms-wind-speed",
                            isVisible: false
                        },
                        {
                            id: "sfms-wind-direction",
                            isVisible: false
                        },
                        {
                            id: "sfms-precipitation",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "fire-weather---fire-weather-indices",
                    title: "Fire Weather Indices",
                    isVisible: false,
                    items: [
                        {
                            id: "sfms-danger-rating",
                            isVisible: false
                        },
                        {
                            id: "sfms-fine-fuel-moisture-code",
                            isVisible: false
                        },
                        {
                            id: "sfms-duff-moisture-code",
                            isVisible: false
                        },
                        {
                            id: "sfms-drought-code",
                            isVisible: false
                        },
                        {
                            id: "sfms-initial-spread-index",
                            isVisible: false
                        },
                        {
                            id: "sfms-buildup-index",
                            isVisible: false
                        },
                        {
                            id: "sfms-fire-weather-index",
                            isVisible: false
                        },
                        {
                            id: "fw-danger-index-region",
                            isVisible: false
                        }
                    ],
                }
            ],
        },
        {
            type: "folder",
            id: "responder-safety",
            title: "Responder Safety",
            isVisible: false,
            items: [
                {
                    type: "folder",
                    id: "responder-safety---hazard",
                    title: "Hazard",
                    isVisible: false,
                    items: [
                        {
                            id: "ued-hazard",
                            isVisible: false
                        },
                        {
                            id: "wf1-refuse-site",
                            isVisible: false
                        },
                        {
                            id: "wf1-dnd-legacysites",
                            isVisible: false
                        }
                    ],
                }
            ],
        },
        {
            type: "folder",
            id: "human-life-and-safety",
            title: "Human Life and Safety",
            isVisible: false,
            items: [
                {
                    type: "folder",
                    id: "human-life-and-safety---evacuations-and-emergency-services",
                    title: "Evacuations and Emergency Services",
                    isVisible: false,
                    items: [
                        {
                            id: "whse-human-cultural-economic-emrg-order-and-alert-areas-sp",
                            isVisible: false
                        },
                        {
                            id: "ued-remote-structures",
                            isVisible: false
                        }
                    ],
                }
            ],
        },
        {
            type: "folder",
            id: "critical-infrastructure",
            title: "Critical Infrastructure",
            isVisible: false,
            items: [
                {
                    type: "folder",
                    id: "critical-infrastructure---energy-utilities-and-facilities",
                    title: "Energy, Utilities and Facilities",
                    isVisible: false,
                    items: [
                        {
                            id: "wf1-pipelines",
                            isVisible: false
                        },
                        {
                            id: "wf1-transmissionlines",
                            isVisible: true
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "critical-infrastructure---communication-and-information-tech",
                    title: "Communication and Information Tech",
                    isVisible: false,
                    items: [
                        {
                            id: "wf1-ci-flnro-radio-tower",
                            isVisible: false
                        },
                        {
                            id: "wf1-ci-other-radio-tower",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "critical-infrastructure---health-care",
                    title: "Health Care",
                    isVisible: false,
                    items: [
                        {
                            id: "whse-imagery-and-base-maps-gsr-hospitals-svw",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "critical-infrastructure---transportation---aviation",
                    title: "Transportation - Aviation",
                    isVisible: false,
                    items: [
                        {
                            id: "aviation-airport",
                            isVisible: false
                        },
                        {
                            id: "aviation-airstrip",
                            isVisible: false
                        },
                        {
                            id: "aviation-hospital-heliport",
                            isVisible: false
                        },
                        {
                            id: "aviation-helipad-heliport",
                            isVisible: false
                        },
                        {
                            id: "aviation-seaplane",
                            isVisible: false
                        },
                        {
                            id: "ued-airstrip",
                            isVisible: false
                        },
                        {
                            id: "ued-forward-tanker-base",
                            isVisible: false
                        },
                        {
                            id: "ued-helipad",
                            isVisible: false
                        },
                        {
                            id: "ued-medevac",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "critical-infrastructure---weather-infrastructure",
                    title: "Weather Infrastructure",
                    isVisible: false,
                    items: [
                        {
                            id: "fw-activereporting-wstn",
                            isVisible: false
                        },
                        {
                            id: "whse-imagery-and-base-maps-gsr-meteorological-stations-svw",
                            isVisible: false
                        }
                    ],
                }
            ],
        },
        {
            type: "folder",
            id: "high-environment-cultural-values",
            title: "High Environment Cultural Values",
            isVisible: false,
            items: [
                {
                    type: "folder",
                    id: "high-environment-cultural-values---water",
                    title: "Water",
                    isVisible: false,
                    items: [
                        {
                            id: "whse-water-management-wls-community-ws-pub-svw",
                            isVisible: false
                        }
                    ],
                }
            ],
        },
        {
            type: "folder",
            id: "place-and-terrain-names",
            title: "Place and Terrain Names",
            isVisible: false,
            items: [
                {
                    type: "folder",
                    id: "place-and-terrain-names---annotation-labels",
                    title: "Annotation / Labels",
                    isVisible: false,
                    items: [
                        {
                            id: "wf1-place-names",
                            isVisible: false
                        },
                        {
                            id: "wf1-terrain-names",
                            isVisible: false
                        }
                    ],
                }
            ],
        },
        {
            type: "folder",
            id: "boundaries",
            title: "Boundaries",
            isVisible: false,
            items: [
                {
                    type: "folder",
                    id: "boundaries---bc-wildfire",
                    title: "BC Wildfire",
                    isVisible: false,
                    items: [
                        {
                            id: "wildfire-org-unit-fire-centre",
                            isVisible: true
                        },
                        {
                            id: "wildfire-org-unit-fire-zone",
                            isVisible: true
                        },
                        {
                            id: "response-areas",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "boundaries---client-assets",
                    title: "Client Assets",
                    isVisible: false,
                    items: [
                        {
                            id: "client-asset-points",
                            isVisible: false
                        },
                        {
                            id: "client-asset-lines",
                            isVisible: false
                        },
                        {
                            id: "client-asset-polygons",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "boundaries---local-government",
                    title: "Local Government",
                    isVisible: false,
                    items: [
                        {
                            id: "bndy-fire-departments",
                            isVisible: true
                        },
                        {
                            id: "whse-legal-admin-boundaries-abms-regional-districts-sp",
                            isVisible: false
                        },
                        {
                            id: "whse-legal-admin-boundaries-abms-municipalities-sp",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "boundaries---flnro",
                    title: "FLNRO",
                    isVisible: false,
                    items: [
                        {
                            id: "whse-admin-boundaries-adm-nr-areas-spg",
                            isVisible: false
                        },
                        {
                            id: "whse-admin-boundaries-adm-nr-districts-spg",
                            isVisible: false
                        },
                        {
                            id: "whse-admin-boundaries-adm-nr-regions-spg",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "boundaries---tenures",
                    title: "Tenures",
                    isVisible: false,
                    items: [
                        {
                            id: "wf1-bndy-tfl",
                            isVisible: false
                        },
                        {
                            id: "reg-legal-and-admin-boundaries-rec-tenure-alpine-ski-areas-sp",
                            isVisible: false
                        },
                        {
                            id: "whse-forest-tenure-ften-recreation-poly-svw",
                            isVisible: false
                        },
                        {
                            id: "whse-forest-tenure-ften-managed-licence-poly-svw",
                            isVisible: false
                        }
                    ],
                }
            ],
        },
        {
            type: "folder",
            id: "land-ownership-status",
            title: "Land Ownership Status",
            isVisible: false,
            items: [
                {
                    type: "folder",
                    id: "land-ownership-status---first-nations",
                    title: "First Nations",
                    isVisible: false,
                    items: [
                        {
                            id: "whse-legal-admin-boundaries-fnt-treaty-land-sp",
                            isVisible: false
                        },
                        {
                            id: "wf1-fn-title-area",
                            isVisible: true
                        },
                        {
                            id: "whse-admin-boundaries-clab-indian-reserves",
                            isVisible: true
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "land-ownership-status---parks-and-protected-lands",
                    title: "Parks and Protected Lands",
                    isVisible: false,
                    items: [
                        {
                            id: "whse-admin-boundaries-clab-national-parks",
                            isVisible: true
                        },
                        {
                            id: "whse-tantalis-ta-park-ecores-pa-svw",
                            isVisible: true
                        },
                        {
                            id: "whse-tantalis-ta-wildlife-mgmt-areas-svw",
                            isVisible: false
                        },
                        {
                            id: "whse-tantalis-ta-conservancy-areas-svw",
                            isVisible: false
                        },
                        {
                            id: "whse-legal-admin-boundaries-wcl-conservation-lands-sp",
                            isVisible: false
                        },
                        {
                            id: "whse-legal-admin-boundaries-wcl-conservation-areas-ngo-sp",
                            isVisible: false
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "land-ownership-status---ownership",
                    title: "Ownership",
                    isVisible: false,
                    items: [
                        {
                            id: "wf1-cadastre",
                            isVisible: false
                        }
                    ],
                }
            ],
        },
        {
            type: "folder",
            id: "transportation-and-trails",
            title: "Transportation and Trails",
            isVisible: false,
            items: [
                {
                    type: "folder",
                    id: "transportation-and-trails---roads",
                    title: "Roads",
                    isVisible: false,
                    items: [
                        {
                            id: "wf1-forest-service-road",
                            isVisible: false
                        },
                        {
                            id: "wf1-roads-highways",
                            isVisible: true
                        },
                        {
                            id: "wf1-roads-secondaries",
                            isVisible: true
                        },
                        {
                            id: "wf1-roads-roughs",
                            isVisible: true
                        },
                        {
                            id: "wf1-roads-other",
                            isVisible: true
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "transportation-and-trails---railway",
                    title: "Railway",
                    isVisible: false,
                    items: [
                        {
                            id: "whse-basemapping-gba-railway-tracks-sp",
                            isVisible: true
                        }
                    ],
                },
                {
                    type: "folder",
                    id: "transportation-and-trails---trails-and-trailheads",
                    title: "Trails and Trailheads",
                    isVisible: false,
                    items: [
                        {
                            id: "wf1-trails",
                            isVisible: false
                        }
                    ],
                }
            ],
        },
        {
            type: "folder",
            id: "natural-features",
            title: "Natural Features",
            isVisible: false,
            items: [
                {
                    id: "whse-basemapping-fwa-stream-networks-sp",
                    isVisible: true
                },
                {
                    id: "whse-basemapping-fwa-lakes-poly",
                    isVisible: false
                },
                {
                    type: "folder",
                    id: "natural-features---contours",
                    title: "Contours",
                    isVisible: false,
                    items: [
                        {
                            id: "whse-basemapping-nts-bc-contour-lines-125m",
                            isVisible: false
                        },
                        {
                            id: "whse-basemapping-trim-contour-lines",
                            isVisible: false
                        }
                    ],
                }
            ],
        }
    ]
}
