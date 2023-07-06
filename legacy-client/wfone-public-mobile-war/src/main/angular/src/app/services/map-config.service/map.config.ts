import { LayerConfig, nearMeItemLayerConfig, notificationDetailLayerConfig } from './layers'
import { LayerDisplayConfig } from './layer-display.config'
import { ApplicationStateService } from '../application-state.service';
import { AppResourcesConfig } from '../app-config.service';
import { NearMeItem } from '../point-id.service';

export function mapConfig( app: ApplicationStateService, res: AppResourcesConfig ) {
	let deviceMode = app.getIsMobileResolution() ? 'mobile' : 'desktop';

	return {
		viewer: {
			type: "leaflet",
			device: deviceMode,
			location: {
				extent: [ -139.1782, 47.6039, -110.3533, 60.5939 ],
			},
			baseMap: "",
			minZoom: 4
		},
		tools: [
			{
				type: "bespoke",
				title: "Near Me",
				instance: "nearme",
				position: "shortcut-menu",
				enabled: true,
				showTitle: false,
				icon: "my_location",
				order: 80,
				showSwipe: false
			},
			{
				type: "bespoke",
				title: "Incident",
				instance: "incident",
				position: "shortcut-menu",
                showWidget: false,
				order: 1,
			},
			{
				type: "bespoke",
				instance: "nearme-weather-detail",
				title: "Weather Detail",
				position: "shortcut-menu",
				// showTitle: false,
                showWidget: false,
				// icon: "menu",
				order: 1,
                parentId: "BespokeTool--nearme"
			},
			{
				type: "bespoke",
				instance: "active-wildfire-detail",
				title: "Weather Detail",
				position: "shortcut-menu",
				// showTitle: false,
                showWidget: false,
				// icon: "menu",
				order: 1,
                parentId: "BespokeTool--activeWildfire"
			},
			{
				type: "bespoke",
				instance: "nearme-weather-history",
				title: "Weather History",
				position: "shortcut-menu",
				// showTitle: false,
                showWidget: false,
				// icon: "menu",
				order: 1,
                parentId: "BespokeTool--nearme-weather-detail"
			},
			{
				type: "location",
				title: "Location",
				position: "toolbar",
				enabled: false
			},
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
				display: LayerDisplayConfig( res )
			},
			{
				type: "identify",
				title: "Learn More",
				enabled: true,
				showTitle: false,
				showWidget: false,
				showPanel: true,
				radius: 20,
				command: {
					attributeMode: false,
					clear: false,
					nearBy: false,
                    zoom: false
				},
				internalLayer: {
					'search-area': {
						style: {
							stroke:             false,
							fill:               true,
							fillColor:          "white",
							fillOpacity:        0.1,
						},
					},
					'search-border-1': {
						style: {
							strokeWidth:        1,
							strokeColor:        "black",
							strokeOpacity:      1,
							strokeCap:          "butt",
						},
					},
					'search-border-2': {
						style: {
							strokeWidth:        1,
							strokeColor:        "white",
							strokeOpacity:      1,
							strokeCap:          "butt",
						}
					},
					'location': {
						title: "Identify Location",
						style: {
							markerUrl: null,
						},
						legend: {
						}
					},
					'edit-search-area': {
						style: {
							strokeWidth:        3,
							strokeColor:        "red",
							strokeOpacity:      1
						}
					}
				}
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
				control: "desktop"
			},
			{
				type: "baseMaps",
				enabled: true,
				showTitle: false,
				showPanel: false,
				choices: [
					// "topographic",
					// "topographic-2x",
					// "imagery",
					// "imagery-2x",
                    // "national-geographic",
                    // "national-geographic-2x",
                    // "shaded-relief",
                    // "shaded-relief-2x"
                    // "NationalGeographic",
                    // "ShadedRelief",
                    // "Terrain",
                    // "Physical",
					// "Imagery"
				],
				position: "shortcut-menu",
				mapStyle: {
					width: "60px",
					height: "100px"
				},
				order: 3
			},
			{
				type: "menu",
				icon: "search",
				title: "Search",
				position: "toolbar",
				enabled: false,
				showTitle: "mobile",
				order: 1
			},
			{
				type: "search",
				enabled: true,
				position: "toolbar",
				showDropdown: true,
				order: 2,
				command: {
					identify: false
				}
			},
			{
				type: "search-location",
				enabled: false
			},
			{
				type: "query-place",
				icon: "search",
				enabled: false,
				showTitle: true,
				position: "menu",
				command: {
					attributeMode: false,
					clear: false,
					zoom: false
				},
				order: 200
			},
			{
				type: "query",
				icon: "search",
				instance: "31071--fire",
				enabled: false,
				showTitle: true,
				position: "menu",
				command: {
					attributeMode: false,
					clear: false
				},
				order: 100
			},
			{
				type: "list-menu",
				icon: "more_horiz",
				title: "More",
				position: "toolbar",
				enabled: false,
				showTitle: false,
				order: 99
			},
			{
				type: "markup",
				enabled: false
			},
			{
				type: "shortcut-menu",
				enabled: "mobile"
			},
			{
				type: "bespoke",
				instance: "menu",
				title: "Menu",
				enabled: "mobile",
				position: "toolbar",
				showTitle: false,
				icon: "menu",
				order: 1
			},
			{
				type: "time-dimension",
				enabled: true,
				timeDimensionOptions: {
				}
			},
			{
				type: "bespoke",
				instance: "identify-weather-history",
				title: "Weather History",
				position: "toolbar",
				// showTitle: false,
                showWidget: false,
				// icon: "menu",
				order: 1,
                parentId: "IdentifyFeatureTool"
			},
			{
				type: "scale",
				enabled: false,
                showZoom: true
			},
		],
		layers: LayerConfig( res )
	}
}

export function notificationDetailMapConfig(
	app: ApplicationStateService,
	res: AppResourcesConfig,
	movement: boolean,
	center?: number[],
	zoom?: number
) {
	let deviceMode = app.getIsMobileResolution() ? 'mobile' : 'desktop';

	return {
		viewer: {
			type: "leaflet",
			device: deviceMode,
			location: {
				center: center,
				zoom: zoom,
				extent: [ -139.1782, 47.6039, -110.3533, 60.5939 ],
			},
			baseMap: "Topographic",
			minZoom: 4
		},
		tools: [
			{
				type: "pan",
				enabled: movement
			},
			{
				type: "zoom",
				enabled: movement,
				mouseWheel: true,
				doubleClick: true,
				box: true,
				control: "desktop"
			},
			{
				type: "baseMaps",
				enabled: false,
				showTitle: false,
				showPanel: false,
				choices: [
					"Topographic",
					"Imagery"
				],
				position: "toolbar",
				mapStyle: {
					width: "60px",
					height: "100px"
				},
				order: 3
			},
			{
				type: "search",
				enabled: false,
				position: "toolbar",
				showDropdown: true,
				order: 2
			},
			{
				type: "search-location",
				enabled: false
			},
			{
				type: "markup",
				enabled: false
			},
			{
				type: "shortcut-menu",
				enabled: "mobile"
			},
			{
				type: "location",
				enabled: false
			},
			{
				type: "scale",
				enabled: true
			},
		],
		layers: notificationDetailLayerConfig( res )
	}
}

export function nearMeItemMapConfig(
    app: ApplicationStateService,
    res: AppResourcesConfig,
    movement: boolean,
    nearMeItem: NearMeItem
) {
    let deviceMode = app.getIsMobileResolution() ? 'mobile' : 'desktop';

    let turf = window[ 'turf' ],
        poly = turf.bboxPolygon( nearMeItem.bbox ),
        exp = turf.transformScale( poly, 1.10 ),
        bbox = turf.bbox( exp )

    return {
        viewer: {
            type: "leaflet",
            device: deviceMode,
            location: {
                extent: bbox
            },
            baseMap: "Topographic",
            minZoom: 4
        },
        tools: [
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
                control: "desktop"
            },
            {
                type: "baseMaps",
                enabled: false,
            },
            {
                type: "search",
                enabled: false,
            },
            {
                type: "search-location",
                enabled: false
            },
            {
                type: "markup",
                enabled: false
            },
            {
                type: "location",
                enabled: false
            },
            {
                type: "scale",
                enabled: true
            },
        ],
        layers: nearMeItemLayerConfig( res, nearMeItem )
    }
}

export function reportOfFireMapConfig(
    app: ApplicationStateService,
    res: AppResourcesConfig
) {
    let deviceMode = app.getIsMobileResolution() ? 'mobile' : 'desktop';

    let turf = window[ 'turf' ]
        // poly = turf.bboxPolygon( nearMeItem.bbox ),
        // exp = turf.transformScale( poly, 1.10 ),
        // bbox = turf.bbox( exp )

    return {
        viewer: {
            type: "leaflet",
            device: deviceMode,
            // location: {
            //     extent: bbox
            // },
            baseMap: "imagery-2x",
            minZoom: 4
        },
        tools: [
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
                enabled: false,
            },
            {
                type: "search",
                enabled: false,
            },
            {
                type: "search-location",
                enabled: false
            },
            {
                type: "markup",
                enabled: false
            },
            {
                type: "location",
                enabled: false
            },
            {
                type: "scale",
                enabled: true
            },
        ]
        // layers: nearMeItemLayerConfig( res, nearMeItem )
    }
}