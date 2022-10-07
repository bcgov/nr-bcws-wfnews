import { layerSettings } from '.';

export function WildfiresInactiveLayerConfig(ls: layerSettings) {
    return [
        {
            type: 'esri-feature',
            id: 'bcws-activefires-publicview-inactive',
            title: 'BC Wildfires - Declared Out',
            attribution: 'Copyright 117 DataBC, Government of British Columbia',
            serviceUrl: 'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0',
            where: 'FIRE_STATUS = \'Out\'',
            opacity: 1,
            drawingInfo: {
                renderer: {
                    type: 'uniqueValue',
                    field1: 'FIRE_STATUS',
                    defaultSymbol: null,
                    uniqueValueInfos: [
                        {
                            value: 'Out',
                            symbol: {
                                color: [
                                    153,
                                    153,
                                    153,
                                    255
                                ],
                                size: 6.75,
                                angle: 0,
                                xoffset: 0,
                                yoffset: 0,
                                type: 'esriSMS',
                                style: 'esriSMSCircle',
                                outline: {
                                    color: [
                                        26,
                                        26,
                                        26,
                                        255
                                    ],
                                    width: 0.75,
                                    type: 'esriSLS',
                                    style: 'esriSLSSolid'
                                }
                            },
                            label: 'Out'
                        }
                    ]
                },
                transparency: 0
            },
            attributes: [
                {
                    name: 'FIRE_NUMBER',
                    title: 'Fire Number'
                },
                {
                    name: "IGNITION_DATE",
                    title: 'Date of Discovery'
                },
                {
                    name: 'FIRE_CAUSE',
                    title: 'Suspected Cause'
                },
                {
                    name: 'GEOGRAPHIC_DESCRIPTION',
                    title: 'Approximate Location'
                },
                {
                    name: 'CURRENT_SIZE',
                    title: 'Estimated Size',
                },
                {
                    name: 'FIRE_STATUS',
                    title: 'Stage of Control'
                },
                {
                    name: 'FIRE_OF_NOTE_NAME',
                    title: 'Fire of Note Information'
                }
            ],
            titleAttribute: 'FIRE_NUMBER',
            popupTemplate: '@wf-incident-feature'
        }
    ];
}
