import { layerSettings } from '.';

export function ActiveWildfiresHeatmapLayerConfig(ls: layerSettings) {
  return [
    {
      type: 'vector',
      id: 'active-wildfires-heatmap',
      title: 'BC Wildfires - Out of Control Fires Heatmap',
      isQueryable: false,
      useClustering: false,
      useHeatmap: true,
      dataUrl:
        ls.wfnewsUrl +
        '/publicPublishedIncident/features?stageOfControl=OUT_CNTRL',
      titleAttribute: 'incident_name',
      attributes: [],
    },
  ];
}
