import { AppResourcesConfig } from "../../app-config.service";

export function WildfiresInactiveLayerConfig( res: AppResourcesConfig) {
    return [
        {
          type: 'vector-legend',
          id: 'bcws-activefires-publicview-inactive',
          title: 'BC Wildfires - Declared Out',
          isQueryable: true,
          useClustering: true,
          useHeatmap: false,
          dataUrl: res.wfnewsUrl + "/publicPublishedIncident/features?stageOfControl=OUT",
          titleAttribute: "incident_name",
          popupTemplate: '@wf-incident-feature',
          attributes: [
            {
                name: "incident_name",
                title: "Fire Name",
                visible: true
            }
        ],
        legend: {
          title: ' ',
          url: "assets/images/greycircle.png",
        },
          style:{
            strokeWidth:"7",
            strokeStyle:"1",
            strokeColor:"#5c6671",
            strokeOpacity:"1",
            fillColor:"#5c6671",
            fillOpacity:"1",
            fill: true
          }
        }
    ];
}
