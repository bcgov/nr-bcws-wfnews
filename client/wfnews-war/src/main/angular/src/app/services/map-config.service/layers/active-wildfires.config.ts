import { layerSettings } from '.';

export function ActiveWildfiresLayerConfig(ls: layerSettings) {
    return [
        {
          type: 'vector',
          id: 'active-wildfires-fire-of-note',
          title: 'BC Wildfires - Active Fires - Fire of Note',
          isQueryable: true,
          useClustering: false,
          dataUrl: ls.wfnewsUrl + "/publicPublishedIncident/features?stageOfControl=FIRE_OF_NOTE&cachBust=" + Math.floor(new Date().getTime() / 600000),
          titleAttribute: "incident_name",
          popupTemplate: '@wf-incident-feature',
          attributes: [
            {
                name: "incident_name",
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
          dataUrl: ls.wfnewsUrl + "/publicPublishedIncident/features?stageOfControl=OUT_CNTRL&cachBust=" + Math.floor(new Date().getTime() / 600000),
          titleAttribute: "incident_name",
          popupTemplate: '@wf-incident-feature',
          attributes: [
            {
                name: "incident_name",
                title: "Fire Name",
                visible: true
            }
          ],
          style:{
            strokeWidth:"7",
            strokeStyle:"1",
            strokeColor:"#00000069",
            strokeOpacity:"1",
            fillColor:"#FF0000",
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
          dataUrl: ls.wfnewsUrl + "/publicPublishedIncident/features?stageOfControl=HOLDING&cachBust=" + Math.floor(new Date().getTime() / 600000),
          titleAttribute: "incident_name",
          popupTemplate: '@wf-incident-feature',
          attributes: [
            {
                name: "incident_name",
                title: "Fire Name",
                visible: true
            }
          ],
          style:{
            strokeWidth:"7",
            strokeStyle:"1",
            strokeColor:"#00000069",
            strokeOpacity:"1",
            fillColor:"#FFFF00",
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
          dataUrl: ls.wfnewsUrl + "/publicPublishedIncident/features?stageOfControl=UNDR_CNTRL&cachBust=" + Math.floor(new Date().getTime() / 600000),
          titleAttribute: "incident_name",
          popupTemplate: '@wf-incident-feature',
          attributes: [
            {
                name: "incident_name",
                title: "Fire Name",
                visible: true
            }
          ],
          style:{
            strokeWidth:"7",
            strokeStyle:"1",
            strokeColor:"#00000069",
            strokeOpacity:"1",
            fillColor:"#98E600",
            fillOpacity:"1",
            fill: true
          }
        }
    ];
}
