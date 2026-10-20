import { layerSettings } from '.';

export function ActiveWildfiresLayerConfig(ls: layerSettings, key: string) {
  return [
    {
      type: 'vector',
      id: 'active-wildfires-fire-of-note',
      title: 'Wildfires of Note',
      isQueryable: true,
      useClustering: false,
      dataUrl:
        ls.wfnewsUrl +
        '/publicPublishedIncident/features?stageOfControl=FIRE_OF_NOTE',
      titleAttribute: 'incident_name',
      popupTemplate: '@wf-incident-feature',
      header: { apiKey: key },
      attributes: [
        {
          name: 'incident_name',
          title: 'Fire Name',
          visible: true,
        },
      ],
      style: {
        markerSize: ['30', '30'],
        markerOffset: ['15', '15'],
        markerUrl: '/assets/images/map-markers/wildfire-of-note.png',
      },
    },
    {
      type: 'vector',
      id: 'active-wildfires-out-of-control',
      title: 'Out of Control Wildfires',
      isQueryable: true,
      useClustering: false,
      dataUrl:
        ls.wfnewsUrl +
        '/publicPublishedIncident/features?stageOfControl=OUT_CNTRL',
      titleAttribute: 'incident_name',
      popupTemplate: '@wf-incident-feature',
      header: { apiKey: key },
      attributes: [
        {
          name: 'incident_name',
          title: 'Fire Name',
          visible: true,
        },
      ],
      // A circle layer cannot draw the soft shadow, so the marker is an image.
      style: {
        markerSize: ['20', '20'],
        markerOffset: ['10', '10'],
        markerUrl: '/assets/images/map-markers/wildfire-out-of-control.png',
      },
    },
    {
      type: 'vector',
      id: 'active-wildfires-holding',
      title: 'Being Held Wildfires',
      isQueryable: true,
      useClustering: false,
      dataUrl:
        ls.wfnewsUrl +
        '/publicPublishedIncident/features?stageOfControl=HOLDING',
      titleAttribute: 'incident_name',
      popupTemplate: '@wf-incident-feature',
      header: { apiKey: key },
      attributes: [
        {
          name: 'incident_name',
          title: 'Fire Name',
          visible: true,
        },
      ],
      style: {
        markerSize: ['20', '20'],
        markerOffset: ['10', '10'],
        markerUrl: '/assets/images/map-markers/wildfire-holding.png',
      },
    },
    {
      type: 'vector',
      id: 'active-wildfires-under-control',
      title: 'Under Control Wildfires',
      isQueryable: true,
      useClustering: false,
      dataUrl:
        ls.wfnewsUrl +
        '/publicPublishedIncident/features?stageOfControl=UNDR_CNTRL',
      titleAttribute: 'incident_name',
      popupTemplate: '@wf-incident-feature',
      header: { apiKey: key },
      attributes: [
        {
          name: 'incident_name',
          title: 'Fire Name',
          visible: true,
        },
      ],
      style: {
        markerSize: ['20', '20'],
        markerOffset: ['10', '10'],
        markerUrl: '/assets/images/map-markers/wildfire-under-control.png',
      },
    },
  ];
}
