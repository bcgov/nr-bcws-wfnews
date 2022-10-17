import { layerSettings } from '.';

export function ActiveWildfiresHeatmapLayerConfig(ls: layerSettings) {
    return [
        {
          type: 'vector',
          id: 'active-wildfires-heatmap',
          title: 'BC Wildfires - Active Fires Heatmap',
          isQueryable: false,
          useClustering: false,
          useHeatmap: true,
          dataUrl: ls.wfnewsUrl + "/publicPublishedIncident/features?cacheBust=" + Math.floor(new Date().getTime() / 600000),
          titleAttribute: "incident_name",
          attributes: []
        }
    ];
}
