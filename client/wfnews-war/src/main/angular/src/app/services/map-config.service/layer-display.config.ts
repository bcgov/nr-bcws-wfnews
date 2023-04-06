import { MapServices } from '.';

export function LayerDisplayConfig(mapServices: MapServices) {
    return [
        {
          id: "fire-group",
          type: "group",
          title: "BC Wildfires - Active Fires",
          isVisible: true,
          items: [
            {
              id: 'active-wildfires-fire-of-note',
              isVisible: true,
              alwaysShowLegend: false
            },
            {
              id: 'active-wildfires-out-of-control',
              isVisible: true,
              alwaysShowLegend: false
            },
            {
              id: 'active-wildfires-holding',
              isVisible: true,
              alwaysShowLegend: false
            },
            {
              id: 'active-wildfires-under-control',
              isVisible: true,
              alwaysShowLegend: false
            }
          ]
        },
        {
            id: 'evacuation-orders-and-alerts-wms',
            isVisible: true,
            alwaysShowLegend: false
        },
        {
            id: 'evacuation-orders-and-alerts-wms-highlight',
            isVisible: false,
            showItem: false
        },
        {
            id: 'danger-rating',
            isVisible: false,
            alwaysShowLegend: false
        },
        {
            id: 'bans-and-prohibitions',
            isVisible: false,
            class: 'smk-inline-legend'
        },
        {
            id: 'bans-and-prohibitions-highlight',
            isVisible: false,
            showItem: false
        },
        {
            id: 'area-restrictions',
            isVisible: false,
            class: 'smk-inline-legend'
        },
        {
            id: 'area-restrictions-highlight',
            isVisible: false,
            showItem: false
        },
        {
            id: "hourly-currentforecast-firesmoke",
            isVisible: false
        },
        {
            id: 'fire-perimeters',
            isVisible: true,
            class: 'smk-inline-legend'
        },
        {
            id: 'bcws-activefires-publicview-inactive',
            isVisible: false,
            class: 'smk-inline-legend'
        },
        {
            id: 'protected-lands-access-restrictions',
            isVisible: false
        },
        {
            id: 'closed-recreation-sites',
            isVisible: false,
            class: 'smk-inline-legend'
        },
        {
            id: 'drive-bc-active-events',
            isVisible: false
        },
        {
          id: 'bc-fsr',
          isVisible: false
        },
        {
            id: "radar-1km-rrai--radarurpprecipr14-linear",
            isVisible: false
        },
        {
            id: "precipitation",
            isVisible: false
        },
        {
            id: "current-conditions--default",
            isVisible: false
        },
        {
            id: 'bc-fire-centres',
            isVisible: true,
            class: 'smk-inline-legend'
        },
        //{
        //    id: 'prescribed-fire',
        //   isVisible: false,
        //   class: 'smk-inline-legend'
        //},
        //{
        //  id: 'active-wildfires-heatmap',
        //  isVisible: false
        //},
        {
            id: "weather-stations",
            isVisible: false,
            showItem: true  // false to hide in layer list
        },
        {
            id: "clab-indian-reserves",
            isVisible: false,
            class: 'smk-inline-legend'
        },
        {
            id: "fnt-treaty-land",
            isVisible: false,
            class: 'smk-inline-legend'
        },
        {
            id: "abms-municipalities",
            isVisible: false,
            class: 'smk-inline-legend'
        },
        {
            id: "abms-regional-districts",
            isVisible: false,
            class: 'smk-inline-legend'
        }
    ];
}
