import { layerSettings } from '.';

export function EvacuationOrdersLayerConfig(ls: layerSettings) {
    return [
        {
            type: 'esri-feature',
            attribution: 'Copyright 117 DataBC, Government of British Columbia',
            serviceUrl: 'https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/Evacuation_Orders_and_Alerts/FeatureServer/0',
            where: 'ORDER_ALERT_STATUS <> \'All Clear\' and EVENT_TYPE = \'Fire\'',
            id: 'evacuation-orders-and-alerts-wms',
            title: 'Fire Evacuation Orders and Alerts',
            isQueryable: true,
            opacity: 0.65,
            titleAttribute: 'EVENT_NAME',
            popupTemplate: '<div class="smk-popup"><div class="popup-header"><mat-icon role="img" class="mat-icon notranslate material-icons mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font">error</mat-icon><span class="title-label">Evacuation Orders and Alerts</span></div><div class="popup-title">{{feature.properties["EVENT_NAME"]}}</div><div class="popup-attributes"><div class="label">Date Active:</div><div class="attribute">{{new Date(feature.properties["DATE_MODIFIED"]).toISOString().slice(0, 10)}}</div></div><div class="popup-attributes"><div class="label">Agency:</div><div class="attribute">{{feature.properties["ISSUING_AGENCY"]}}</div></div><div class="popup-attributes"><div class="label">Status:</div><div class="attribute attribute-red">{{feature.properties["ORDER_ALERT_STATUS"]}}</div></div><div class="popup-button-container"><a class="popup-button" target="_blank" rel="noopener" v-if="feature.properties[\'BULLETIN_URL\']" v-bind:href="feature.properties[\'BULLETIN_URL\']">Learn More</a></div></div>',
            attributes: [
                {
                    name: 'EVENT_NAME',
                    title: 'Name'
                },
                {
                    name: 'EVENT_TYPE',
                    title: 'Type'
                },
                {
                    name: 'DATE_MODIFIED',
                    title: 'Date',
                },
                {
                    name: 'ISSUING_AGENCY',
                    title: 'Issuing Agency'
                },
                {
                    name: 'ORDER_ALERT_STATUS',
                    title: 'Status'
                }
            ],
            legend: {
                clipHeight: 60
            }
        }
    ];
}
