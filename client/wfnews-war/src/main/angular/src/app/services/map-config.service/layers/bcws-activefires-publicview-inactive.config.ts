import { layerSettings } from '.';

export function WildfiresInactiveLayerConfig(ls: layerSettings) {
  return [
    {
      type: 'vector',
      id: 'active-wildfires-out',
      title: 'BC Wildfires - Declared Out',
      isQueryable: true,
      useClustering: true,
      useHeatmap: false,
      dataUrl:
        ls.wfnewsUrl + '/publicPublishedIncident/features?stageOfControl=OUT',
      titleAttribute: 'incident_name',
      popupTemplate: '@wf-incident-feature',
      maxZoom: 30,
      attributes: [
        {
          name: 'incident_name',
          title: 'Fire Name',
          visible: true,
        },
      ],
      style: {
        strokeWidth: '7',
        strokeStyle: '1',
        strokeColor: '#5c6671',
        strokeOpacity: '1',
        fillColor: '#5c6671',
        fillOpacity: '1',
        fill: true,
        // The cluster bubble keeps the colours above; a single fire is the image.
        markerSize: ['20', '20'],
        markerOffset: ['10', '10'],
        markerUrl: '/assets/images/map-markers/wildfire-out.png',
      },
    },
  ];
}
