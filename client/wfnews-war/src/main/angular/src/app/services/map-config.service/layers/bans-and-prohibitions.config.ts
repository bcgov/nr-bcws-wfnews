import { layerSettings } from '.';

export function BansAndProhibitionsLayerConfig(ls: layerSettings) {
    return [
        {
            type: 'wms',
            id: 'bans-and-prohibitions',
            title: 'BC Wildfire Bans and Prohibitions',
            serviceUrl: ls.openmapsBaseUrl,
            layerName: 'pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP',
            styleName: '7733',
            opacity: 0.2,
            titleAttribute: 'ACCESS_PROHIBITION_DESCRIPTION',
            geometryAttribute: 'SHAPE',
            popupTemplate: '<div class="smk-popup"><div class="popup-header"><mat-icon role="img" class="mat-icon notranslate material-icons mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font">block</mat-icon><span class="title-label">Wildfire Bans and Prohibitions</span></div><div class="popup-title">{{feature.properties["TYPE"]}}</div><div class="popup-attributes"><div class="label">Date Active:</div><div class="attribute">{{new Date(feature.properties["ACCESS_STATUS_EFFECTIVE_DATE"]).toISOString().slice(0, 10)}}</div></div><div class="popup-attributes"><div class="label">Fire Centre:</div><div class="attribute">{{feature.properties["FIRE_CENTRE_NAME"]}}</div></div><div class="popup-attributes"><div class="label">Fire Bans:</div><div class="attribute attribute-red">{{feature.properties["ACCESS_PROHIBITION_DESCRIPTION"]}}</div></div><div class="popup-button-container"><a v-if="feature.properties[\'FIRE_CENTRE_NAME\'] === \'Prince George\'" class="popup-button" target="_blank" rel="noopener" href="https://www2.gov.bc.ca/gov/content/safety/wildfire-status/fire-bans-and-restrictions/prince-george-fire-centre-bans">Learn More</a><a v-else-if="feature.properties[\'FIRE_CENTRE_NAME\'] === \'Cariboo\'" class="popup-button" target="_blank" rel="noopener" href="https://www2.gov.bc.ca/gov/content/safety/wildfire-status/fire-bans-and-restrictions/cariboo-fire-centre-bans">Learn More</a><a v-else-if="feature.properties[\'FIRE_CENTRE_NAME\'] === \'Kamloops\'" class="popup-button" target="_blank" rel="noopener" href="https://www2.gov.bc.ca/gov/content/safety/wildfire-status/fire-bans-and-restrictions/kamloops-fire-centre-bans">Learn More</a><a v-else-if="feature.properties[\'FIRE_CENTRE_NAME\'] === \'Northwest\'" class="popup-button" target="_blank" rel="noopener" href="https://www2.gov.bc.ca/gov/content/safety/wildfire-status/fire-bans-and-restrictions/northwest-fire-centre-bans">Learn More</a><a v-else-if="feature.properties[\'FIRE_CENTRE_NAME\'] === \'Southeast\'" class="popup-button" target="_blank" rel="noopener" href="https://www2.gov.bc.ca/gov/content/safety/wildfire-status/fire-bans-and-restrictions/southeast-fire-centre-bans">Learn More</a><a v-else-if="feature.properties[\'FIRE_CENTRE_NAME\'] === \'Coastal\'" class="popup-button" target="_blank" rel="noopener" href="https://www2.gov.bc.ca/gov/content/safety/wildfire-status/fire-bans-and-restrictions/coastal-fire-centre-bans">Learn More</a><a v-else class="popup-button" target="_blank" rel="noopener" href="https://www2.gov.bc.ca/gov/content/safety/wildfire-status/fire-bans-and-restrictions">Learn More</a></div></div>',
            attributes: [
                {
                    name: 'FIRE_CENTRE_NAME',
                    title: 'Fire Centre'
                },
                {
                    name: 'ACCESS_STATUS_EFFECTIVE_DATE',
                    title: 'Date Active',
                },
                {
                    name: 'TYPE',
                    title: 'Type'
                },
                {
                    name: 'ACCESS_PROHIBITION_DESCRIPTION',
                    title: 'Comments'
                },
                {
                    name: 'BULLETIN_URL',
                    title: 'More Information',
                    value: 'See Here',
                }
            ]
        },

        {
            type: 'wms',
            id: 'bans-and-prohibitions-highlight',
            title: 'BC Wildfire Bans and Prohibitions',
            serviceUrl: ls.openmapsBaseUrl,
            // "serviceUrl": "https://delivery.openmaps.gov.bc.ca/geo/pub/ows",
            // "#serviceUrl": "https://openmaps.gov.bc.ca/geo/pub/ows",
            layerName: 'pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP',
            opacity: 0.8,
            sld: `@${window.location.protocol}//${window.location.host}/assets/js/smk/bans-and-prohibitions-highlight.sld`
        }

    ];
}
