import { MapServices } from '.';

export function LayerDisplayConfig(mapServices: MapServices) {
  return [
    {
      id: 'active-wildfires-fire-of-note',
      isVisible: true,
      alwaysShowLegend: false,
    },
    {
      id: 'active-wildfires-out-of-control',
      isVisible: true,
      alwaysShowLegend: false,
    },
    {
      id: 'active-wildfires-holding',
      isVisible: true,
      alwaysShowLegend: false,
    },
    {
      id: 'active-wildfires-under-control',
      isVisible: true,
      alwaysShowLegend: false,
    },
    {
      id: 'active-wildfires-out',
      isVisible: false,
      class: 'smk-inline-legend',
    },
    {
      id: 'evacuation-orders-and-alerts-wms',
      isVisible: true,
      alwaysShowLegend: false,
    },
    {
      id: 'evacuation-orders-and-alerts-wms-highlight',
      isVisible: false,
      showItem: false,
    },
    {
      id: 'danger-rating',
      isVisible: false,
      alwaysShowLegend: false,
    },
    {
      id: 'bans-and-prohibitions-cat1',
      isVisible: false,
      class: 'smk-inline-legend',
    },
    {
      id: 'bans-and-prohibitions-cat2',
      isVisible: false,
      class: 'smk-inline-legend',
    },
    {
      id: 'bans-and-prohibitions-cat3',
      isVisible: false,
      class: 'smk-inline-legend',
    },
    {
      id: 'bans-and-prohibitions-highlight',
      isVisible: false,
      showItem: false,
    },
    {
      id: 'area-restrictions',
      isVisible: false,
      class: 'smk-inline-legend',
    },
    {
      id: 'area-restrictions-highlight',
      isVisible: false,
      showItem: false,
    },
    {
      id: 'hourly-currentforecast-firesmoke',
      isVisible: false,
    },
    {
      id: 'fire-perimeters',
      isVisible: true,
      class: 'smk-inline-legend',
    },
    {
      id: 'protected-lands-access-restrictions',
      isVisible: false,
    },
    {
      id: 'closed-recreation-sites',
      isVisible: false,
      class: 'smk-inline-legend',
    },
    {
      id: 'drive-bc-active-events',
      isVisible: false,
    },
    {
      id: 'radar-1km-rrai--radarurpprecipr14-linear',
      isVisible: false,
    },
    {
      id: 'precipitation',
      isVisible: false,
    },
    {
      id: 'current-conditions--default',
      isVisible: false,
    },
    {
      id: 'bc-hillshade',
      isVisible: true,
    },
    // use tilecache centres. we can go back to wms and add zones
    // once the cache is setup
    {
      id: 'bc-fire-centres',
      isVisible: true,
      class: 'smk-inline-legend',
    },
    /*{
      id: 'fire-centre-group',
      type: 'group',
      title: 'BC Wildfire Centres',
      isVisible: true,
      items: [
        {
          id: 'bc-fire-centres',
          isVisible: true,
          alwaysShowLegend: false,
        },
        {
          id: 'bc-fire-centres-labels',
          isVisible: true,
          alwaysShowLegend: false,
        },
      ],
    },
    {
      id: 'fire-zone-group',
      type: 'group',
      title: 'BC Wildfire Zones',
      isVisible: true,
      items: [
        {
          id: 'bc-fire-zones',
          isVisible: true,
          alwaysShowLegend: false,
        },
        {
          id: 'bc-fire-zones-labels',
          isVisible: true,
          alwaysShowLegend: false,
        },
      ],
    }, */
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
      id: 'weather-stations',
      isVisible: false,
      showItem: true, // false to hide in layer list
    },
    {
      id: 'clab-indian-reserves',
      isVisible: false,
      class: 'smk-inline-legend',
    },
    {
      id: 'fnt-treaty-land',
      isVisible: false,
      class: 'smk-inline-legend',
    },
    {
      id: 'abms-municipalities',
      isVisible: false,
      class: 'smk-inline-legend',
    },
    {
      id: 'abms-regional-districts',
      isVisible: false,
      class: 'smk-inline-legend',
    },
    //{
    //  id: 'fuel-treatment',
    //  isVisible: false,
    //  class: 'smk-inline-legend',
    //},
  ];
}
