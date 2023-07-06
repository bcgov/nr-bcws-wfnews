import { AppResourcesConfig } from "../../app-config.service";

export function ActiveWildfiresUnderControlLayerConfig(res: AppResourcesConfig) {
  return [
    {
      type: 'vector-legend',
      id: 'active-wildfires-under-control',
      title: 'BC Wildfires - Under Control',
      isQueryable: true,
      useClustering: false,
      dataUrl: res.wfnewsUrl + "/publicPublishedIncident/features?stageOfControl=UNDR_CNTRL",
      titleAttribute: "incident_name",
      popupTemplate: '@wf-incident-detail-feature',
      header: { "apiKey": res.apiKey },
      attributes: [
        {
          name: "incident_name",
          title: "Fire Name",
          visible: true
        }
      ],
      legend: {
        title: ' ',
        url: "assets/images/limegreencircle.png",
      },
      style: {
        strokeWidth: "7",
        strokeStyle: "1",
        strokeColor: "#00000069",
        strokeOpacity: "1",
        fillColor: "#98E600",
        fillOpacity: "1",
        fill: true
      }
    }
  ];
}
