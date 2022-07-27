import { WfDevice } from '@wf1/wfcc-application-ui';
import { MapServices, MapServiceStatus } from '.';
import { LayerDisplayConfig } from './layer-display.config';
import { LayerConfig } from './layers';

export function mapConfig( mapServices: MapServices, serviceStatus: MapServiceStatus, device: WfDevice ) {
    return {
        viewer: {
            type: "leaflet",
            device: device,
            location: {
                extent: [ -136.3, 49, -116, 60.2 ],
            },
            baseMap: 'imagery',
            minZoom: 4,
        //     displayContext: [
        //         {
        //             id: 'layers',
        //             items: LayerDisplayConfig(mapServices)
        //         },
        //         // {
        //         //     id: 'current-location',
        //         //     items: [
        //         //         {
        //         //             id: 'CurrentLocationTool',
        //         //             showItem: false,
        //         //             showLegend: false,
        //         //             items: [
        //         //                 {
        //         //                     id: 'CurrentLocationTool--current-location',
        //         //                     showItem: false,
        //         //                     showLegend: false,
        //         //                 }
        //         //             ]
        //         //         }
        //         //     ]
        //         // },
        //         // {
        //         //     id: 'identify',
        //         //     items: [
        //         //         {
        //         //             id: 'IdentifyListTool',
        //         //             showItem: false,
        //         //             showLegend: false,
        //         //         }
        //         //     ]
        //         // }
        //     ]
        },
        tools: [
            // {
            //     type: "location",
            //     title: "Location",
            //     position: "toolbar",
            //     enabled: false
            // },
			{
				type: "layers",
				enabled: true,
				showTitle: false,
				position: "shortcut-menu",
				glyph: {
					visible: "check_box",
					hidden: "check_box_outline_blank"
				},
				command: {
					allVisibility: false,
					filter: false,
					legend: false
				},
				legend: true,
				order: 2,
				display: LayerDisplayConfig( mapServices )
			},

            // {
            //     type: "layers",
            //     enabled: true,
            //     showTitle: false,
            //     position: "shortcut-menu",
            //     glyph: {
            //         visible: "check_box",
            //         hidden: "check_box_outline_blank"
            //     },
            //     command: {
            //         allVisibility: true,
            //         filter: true,
            //         legend: true,
            //         // themes: [
            //         //     {
            //         //         icon: "layers",
            //         //         title: "OFTS",
            //         //         layers: [
            //         //             "ofts-active",
            //         //             "ofts-expired",
            //         //             "whse-human-cultural-economic-emrg-order-and-alert-areas-sp"
            //         //         ]
            //         //     },
            //         //     {
            //         //         icon: "layers",
            //         //         title: "Reports\xA0of\xA0Fire",
            //         //         layers: [
            //         //             "rofs",
            //         //             "temporary-rof",
            //         //             "wf1-transmissionlines",
            //         //             "wf1-fire-centre-spg",
            //         //             "wf1-fire-zone-spg",
            //         //             "bndy-fire-departments",
            //         //             "whse-admin-boundaries-clab-indian-reserves",
            //         //             "whse-admin-boundaries-clab-national-parks",
            //         //             "whse-tantalis-ta-park-ecores-pa-svw",
            //         //             "wf1-roads",
            //         //             "whse-basemapping-gba-railway-tracks-sp",
            //         //             "whse-basemapping-fwa-stream-networks-sp"
            //         //         ]
            //         //     },
            //         //     {
            //         //         icon: "layers",
            //         //         title: "Incidents",
            //         //         layers: [
            //         //             "incidents",
            //         //             "temporary-incident",
            //         //             "in-current-fire-polygons",
            //         //             "wf1-fire-centre-spg",
            //         //             "wf1-fire-zone-spg",
            //         //             "whse-legal-admin-boundaries-fnt-treaty-land-sp",
            //         //             "whse-admin-boundaries-clab-indian-reserves",
            //         //             "whse-admin-boundaries-clab-national-parks",
            //         //             "whse-tantalis-ta-park-ecores-pa-svw",
            //         //             "whse-tantalis-ta-wildlife-mgmt-areas-svw",
            //         //             "whse-tantalis-ta-conservancy-areas-svw",
            //         //             "whse-legal-admin-boundaries-wcl-conservation-lands-sp",
            //         //             "whse-legal-admin-boundaries-wcl-conservation-areas-ngo-sp",
            //         //             "wf1-cadastre"
            //         //         ]
            //         //     }
            //         // ]
            //     },
            //     legend: true,
            //     order: 2,
            // },
            {
                type: "identify",
                title: "Identify",
                enabled: true,
                showTitle: false,
                showWidget: false,
                showPanel: true,
                radius: 20,
                command: {
                    attributeMode: false,
                    clear: false,
                    nearBy: false,
                    zoom: true,
                    custom: true
                },
                internalLayers: [
                   {
                        id: 'search-area',
                        style: {
                            stroke: false,
                            fill: true,
                            fillColor: "white",
                            fillOpacity: 0.1,
                        },
                    },
                    {
                        id: 'search-border-1',
                        style: {
                            strokeWidth: 1,
                            strokeColor: "black",
                            strokeOpacity: 1,
                            strokeCap: "butt",
                        },
                    },
                    {
                        id: 'search-border-2',
                        style: {
                            strokeWidth: 1,
                            strokeColor: "white",
                            strokeOpacity: 1,
                            strokeCap: "butt",
                        }
                    },
                    {
                        id: 'location',
                        title: "Identify Location",
                        style: {
                            markerUrl: null,
                        },
                        legend: {
                        }
                    },
                    {
                        id: 'edit-search-area',
                        style: {
                            strokeWidth: 3,
                            strokeColor: "red",
                            strokeOpacity: 1
                        }
                    }
                ]
            },
            {
                type: "pan",
                enabled: true
            },
            {
                type: "zoom",
                enabled: true,
                mouseWheel: true,
                doubleClick: true,
                box: true,
                control: true
            },
            {
                type: "baseMaps",
                enabled: true,
                showTitle: false,
                showPanel: true,
                icon: "apps",
                choices: [],
                mapStyle: {
                    width: "240px",
                    height: "80px"
                },
                order: 3
            },
            // {
            //     type: "search",
            //     enabled: 'mobile',
            //     position: "toolbar",
            //     showDropdown: true,
            //     order: 2,
            //     command: {
            //         identify: false
            //     }
            // },
            // {
            //     type: "search-location",
            //     enabled: false
            // },
            // {
            //     type: "time-dimension",
            //     enabled: false,
            //     timeDimensionOptions: {
            //     }
            // },
            // {
            //     type: "scale",
            //     enabled: 'desktop',
            //     showZoom: true,
            //     order: 2
            // },
            // {
            //     type: "minimap",
            //     enabled: 'desktop',
            //     option: {
            //         minimized: true
            //     }
            // },
            // {
            //     type: "coordinate",
            //     enabled: 'desktop',
            //     order: 3,
            //     format: 'DDM'
            // },
            // {
            //     type: "measure",
            //     enabled: 'desktop',
            //     unit: 'kilometers'
            // },
            // {
            //     type: "current-location",
            //     enabled: true,
            //     order: 4
            // },
            // {
            //     type: "bespoke",
            //     instance: "full-extent",
            //     title: "Zoom to Full Extent",
            //     enabled: true,
            //     position: "actionbar",
            //     showTitle: false,
            //     showPanel: false,
            //     icon: "zoom_out_map",
            //     order: 5
            // },
            // {
            //     type: "bespoke",
            //     instance: "zoom-to-box",
            //     title: "Zoom to Box",
            //     enabled: 'desktop',
            //     position: "actionbar",
            //     showTitle: false,
            //     showPanel: false,
            //     icon: "highlight_alt",
            //     order: 6,
            //     component: true
            // },
            // {
            //     type: "bespoke",
            //     instance: "time-dimension",
            //     title: "Time Dimension",
            //     enabled: true,
            //     position: "toolbar",
            //     showTitle: false,
            //     showPanel: true,
            //     icon: "access_time",
            //     order: 7
            // },
            // {
            //     type: "bespoke",
            //     instance: "refresh-layers",
            //     title: "Reload Visible Layers",
            //     enabled: true,
            //     position: "toolbar",
            //     showTitle: false,
            //     showPanel: false,
            //     icon: "refresh",
            //     order: 8
            // }
        ],
        layers: LayerConfig(mapServices,serviceStatus)
    }
}
