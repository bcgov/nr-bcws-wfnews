import { AppResourcesConfig } from "../../app-config.service";

export function ActiveWildfiresHoldingLayerConfig(res: AppResourcesConfig) {
    return [
        {
            type: 'vector-legend',
            id: 'active-wildfires-holding',
            title: 'BC Wildfires - Being Held',
            isQueryable: true,
            useClustering: false,
            dataUrl: res.wfnewsUrl + "/publicPublishedIncident/features?stageOfControl=HOLDING",
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
                url: "assets/images/yellowcircle.png",
            },
            style: {
                strokeWidth: "7",
                strokeStyle: "1",
                strokeColor: "#00000069",
                strokeOpacity: "1",
                fillColor: "#FFFF00",
                fillOpacity: "1",
                fill: true
            }
        },
    ]

}