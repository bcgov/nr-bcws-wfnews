import { AppResourcesConfig } from "../../app-config.service";

export function ActiveWildfiresOutOfControlLayerConfig(res: AppResourcesConfig) {
    return [
        {
            type: 'vector-legend',
            id: 'active-wildfires-out-of-control',
            title: 'BC Wildfires - Out of Control',
            isQueryable: true,
            useClustering: false,
            dataUrl: res.wfnewsUrl + "/publicPublishedIncident/features?stageOfControl=OUT_CNTRL",
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
                url: "assets/images/redcircle.png",
            },
            style: {
                strokeWidth: "7",
                strokeStyle: "1",
                strokeColor: "#00000069",
                strokeOpacity: "1",
                fillColor: "#FF0000",
                fillOpacity: "1",
                fill: true
            }
        },

    ]
}