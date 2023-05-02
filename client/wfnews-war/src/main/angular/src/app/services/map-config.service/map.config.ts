import { AppConfigService } from '@wf1/core-ui';
import { WfDevice } from '@wf1/wfcc-application-ui';
import { MapServices, MapServiceStatus } from '.';
import { LayerDisplayConfig } from './layer-display.config';
import { LayerConfig } from './layers';

export function mapConfig( mapServices: MapServices, serviceStatus: MapServiceStatus, device: WfDevice, appConfigService: AppConfigService ) {
    return {
        viewer: {
            type: 'leaflet',
            device,
            location: {
                extent: [ -136.3, 49, -116, 60.2 ],
            },
            baseMap: 'topographic',
            minZoom: 4,
        },
        tools: [
            {
                type: 'location',
                enabled: false
            },
			{
				type: 'layers',
				enabled: true,
				showTitle: false,
				position: 'shortcut-menu',
				glyph: {
					visible: 'check_box',
					hidden: 'check_box_outline_blank'
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
            {
                type: 'identify',
                title: 'Learn More',
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
                            fillColor: 'white',
                            fillOpacity: 0.1,
                        },
                    },
                    {
                        id: 'search-border-1',
                        style: {
                            strokeWidth: 1,
                            strokeColor: 'black',
                            strokeOpacity: 1,
                            strokeCap: 'butt',
                        },
                    },
                    {
                        id: 'search-border-2',
                        style: {
                            strokeWidth: 1,
                            strokeColor: 'white',
                            strokeOpacity: 1,
                            strokeCap: 'butt',
                        }
                    },
                    {
                        id: 'location',
                        title: 'Identify Location',
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
                            strokeColor: 'red',
                            strokeOpacity: 1
                        }
                    }
                ]
            },
            {
                type: 'pan',
                enabled: true
            },
            {
                type: 'zoom',
                enabled: true,
                mouseWheel: true,
                doubleClick: true,
                box: true,
                control: true
            },
			{
				type: 'baseMaps',
				enabled: true,
				showTitle: false,
				showPanel: false,
				choices: [
				],
				position: 'shortcut-menu',
				mapStyle: {
					width: '60px',
					height: '100px'
				},
				order: 3
			},
      {
				type: "time-dimension",
				enabled: true,
				timeDimensionOptions: {
				}
			},
      {
        type: "scale",
        enabled: 'desktop',
        showZoom: true,
        order: 2
    },
    {
        type: "coordinate",
        enabled: 'desktop',
        order: 3,
        format: 'DDM'
    },
    {
        type: "measure",
        enabled: 'desktop',
        unit: 'kilometers',
        order: 5
    },
    {
        type: 'search',
        enabled: false
    },
],
        layers: LayerConfig(mapServices, serviceStatus, appConfigService)
    };
}
