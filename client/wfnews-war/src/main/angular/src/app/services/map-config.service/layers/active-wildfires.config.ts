import { layerSettings } from '.';

export function ActiveWildfiresLayerConfig(ls: layerSettings) {
    return [
        {
          type: 'vector',
          id: 'active-wildfires-fire-of-note',
          title: 'BC Wildfires - Active Fires - Fire of Note',
          isQueryable: true,
          useClustering: false,
          dataUrl: ls.wfnewsUrl + "/publicPublishedIncident/features?stageOfControl=FIRE_OF_NOTE",
          titleAttribute: "incidentName",
          attributes: [
            {
                name: "incidentName",
                title: "Fire Name",
                visible: true
            }
          ],
          style:{
           markerSize:[
              "24",
              "24"
           ],
           markerOffset:[
              "12",
              "12"
           ],
           markerUrl: "/assets/images/local_fire_department.png"
          }
        },
        {
          type: 'vector',
          id: 'active-wildfires-out-of-control',
          title: 'BC Wildfires - Active Fires - Out of Control',
          isQueryable: true,
          useClustering: false,
          dataUrl: ls.wfnewsUrl + "/publicPublishedIncident/features?stageOfControl=OUT_CNTRL",
          titleAttribute: "incidentName",
          attributes: [
            {
                name: "incidentName",
                title: "Fire Name",
                visible: true
            }
          ],
          style:{
            strokeWidth:"7",
            strokeStyle:"1",
            strokeColor:"#aa0d0d",
            strokeOpacity:"1",
            fillColor:"#aa0d0d",
            fillOpacity:"1",
            fill: true
          }
        },
        {
          type: 'vector',
          id: 'active-wildfires-holding',
          title: 'BC Wildfires - Active Fires - Being Held',
          isQueryable: true,
          useClustering: false,
          dataUrl: ls.wfnewsUrl + "/publicPublishedIncident/features?stageOfControl=HOLDING",
          titleAttribute: "incidentName",
          attributes: [
            {
                name: "incidentName",
                title: "Fire Name",
                visible: true
            }
          ],
          style:{
            strokeWidth:"7",
            strokeStyle:"1",
            strokeColor:"#ffd966",
            strokeOpacity:"1",
            fillColor:"#ffd966",
            fillOpacity:"1",
            fill: true
          }
        },
        {
          type: 'vector',
          id: 'active-wildfires-under-control',
          title: 'BC Wildfires - Active Fires - Under Control',
          isQueryable: true,
          useClustering: false,
          dataUrl: ls.wfnewsUrl + "/publicPublishedIncident/features?stageOfControl=UNDR_CNTRL",
          titleAttribute: "incidentName",
          popupTemplate: '@wf-incident-feature',
          attributes: [
            {
                name: "incidentName",
                title: "Fire Name",
                visible: true
            }
          ],
          style:{
            strokeWidth:"7",
            strokeStyle:"1",
            strokeColor:"#207148",
            strokeOpacity:"1",
            fillColor:"#207148",
            fillOpacity:"1",
            fill: true
          }
        }
    ];
}
