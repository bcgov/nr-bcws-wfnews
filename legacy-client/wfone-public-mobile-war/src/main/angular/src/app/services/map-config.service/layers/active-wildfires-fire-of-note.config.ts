import { AppResourcesConfig } from "../../app-config.service";

export function ActiveWildfiresOfNoteLayerConfig(res: AppResourcesConfig) {
    return [
        {
            type: 'vector-legend',
            id: 'active-wildfires-fire-of-note',
            title: 'BC Wildfires - Fire of Note',
            isQueryable: true,
            useClustering: false,
            dataUrl: res.wfnewsUrl + "/publicPublishedIncident/features?stageOfControl=FIRE_OF_NOTE",
            titleAttribute: "incident_name",
            popupTemplate: '@wf-incident-detail-feature',
            header: { "apiKey": res.apiKey },
            attributes: [
                {
                    name: "incident_name",
                    title: "Fire Name",
                },
                {
                    name: "incident_number_label",
                    title: "Fire Number",
                },
            ],
            legend: {
                title: ' ',
                url: "assets/images/local_fire_department.png",
            },
            style: {
                markerSize: [
                    "24",
                    "24"
                ],
                markerOffset: [
                    "12",
                    "12"
                ],
                markerUrl: "/assets/images/local_fire_department.png"
            }
        }
    ]
}