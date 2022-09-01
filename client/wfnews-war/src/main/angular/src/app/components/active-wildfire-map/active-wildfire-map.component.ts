import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { AppConfigService } from '@wf1/core-ui';
import { AGOLService } from '../../services/AGOL-service';
import { CommonUtilityService } from '../../services/common-utility.service';
import { MapConfigService } from '../../services/map-config.service';
import { WFMapService } from '../../services/wf-map.service';
import { SmkApi } from '../../utils/smk';

export type SelectedLayer =
    'evacuation-orders-and-alerts' |
    'area-restrictions' |
    'bans-and-prohibitions' |
    'smoke-forecast' |
    'fire-danger' |
    'local-authorities' |
    'routes-impacted' |
    'wildfire-stage-of-control';

@Component({
    selector: 'active-wildfire-map',
    templateUrl: './active-wildfire-map.component.html',
    styleUrls: ['./active-wildfire-map.component.scss'],
})
export class ActiveWildfireMapComponent implements OnInit, OnChanges {
    @Input() incidents: any;

    @ViewChild('WildfireStageOfControl') wildfireStageOfControlPanel: MatExpansionPanel;
    @ViewChild('EvacuationOrdersAndAlerts') evacuationOrdersAndAlertsPanel: MatExpansionPanel;
    @ViewChild('AreaRestrictions') areaRestrictionsPanel: MatExpansionPanel;
    @ViewChild('BansAndProhibitions') bansAndProhibitionsPanel: MatExpansionPanel;
    @ViewChild('SmokeForecast') smokeForecastPanel: MatExpansionPanel;
    @ViewChild('FireDanger') fireDangerPanel: MatExpansionPanel;
    @ViewChild('LocalAuthorities') localAuthoritiesPanel: MatExpansionPanel;
    @ViewChild('RoutesImpacted') routesImpactedPanel: MatExpansionPanel;

    incidentsServiceUrl: string;
    mapConfig = null;
    smkApi: SmkApi;
    activeFireCountPromise;
    selectedLayer: SelectedLayer;
    selectedPanel = 'wildfire-stage-of-control'
    showAccordion: boolean;
    searchText = undefined;


    constructor(
        private http: HttpClient,
        private appConfig: AppConfigService,
        private mapConfigService: MapConfigService,
        private agolService: AGOLService,
        private commonUtilityService: CommonUtilityService,
        private wfMapService: WFMapService,
    ) {
        this.incidentsServiceUrl = this.appConfig.getConfig().rest['newsLocal'];
        // console.log(this.incidentsServiceUrl)
    }

    ngOnInit() {
        this.showAccordion = true;
        this.appConfig.configEmitter.subscribe((config) => {
            const mapConfig = [];
            // this.checkMapServiceStatus()
            // .then( ( mapServiceStatus ) => {
            // console.log(mapServiceStatus)
            // this.wfnewsMapService.mapServiceStatus = mapServiceStatus

            this.mapConfigService.getMapConfig() // this.applicationConfig.device )
                // .then((config) => {
                //     mapConfig.push(config)

                // })
                .then((mapState) => {
                    console.log('map state version', mapState?.version);
                    // if (!mapState || !mapState.version) return
                    // if (mapState.version.app != this.applicationConfig.version.short) return
                    // if (mapState.version.build != config.application.buildNumber) return
                    // console.log('using map state')

                    // eachDisplayContextItem( mapState.viewer.displayContext, ( item ) => {
                    // if ( item.id == 'resource-track' )
                    // item.isVisible = false
                    // delete item.isEnabled
                    // } )

                    mapConfig.push(mapState);
                })
                .then(() => {
                    const deviceConfig = { viewer: { device: 'desktop' } };

                    this.mapConfig = [...mapConfig, deviceConfig, 'theme=wf', '?'];
                });
        });

    }

    ngOnChanges(changes: SimpleChanges) {
    }

    get activeFireCount(): Promise<number> {
      if ( this.activeFireCountPromise ) {
        return this.activeFireCountPromise;
      }
      this.activeFireCountPromise = this.agolService.getActiveFireCount().toPromise()
        .then( ( resp: any ) => {
            return resp?.features[0].attributes.value;
        }).catch( ( e ) => {
          console.error('COUNTSTATS-FAIL' );
            return 123;
        });

        return this.activeFireCountPromise;
    }

    initMap(smk: any) {
        this.smkApi = new SmkApi(smk);
        // this.wfnewsMapService.setSmkInstance(smk, this.bespokeContainerRef, this.mapConfig[0].viewer.location.extent)

        // this.updateMapSize = function () {
        //     this.storeViewportSize()
        //     smk.updateMapSize();
        // };

        // window[ 'SPLASH_SCREEN' ].remove()
    }

    onToggleAccordion() {
        this.showAccordion = !this.showAccordion;
    }

    onSelectLayer(selectedLayer: SelectedLayer) {
        this.selectedLayer = selectedLayer;
        this.selectedPanel = selectedLayer

        const layers = [
            /* 00 */ { itemId: 'active-wildfires', visible: true },
            /* 01 */ { itemId: 'evacuation-orders-and-alerts-wms', visible: false },
            /* 02 */ { itemId: 'evacuation-orders-and-alerts-wms-highlight', visible: false },
            /* 03 */ { itemId: 'danger-rating', visible: false },
            /* 04 */ { itemId: 'bans-and-prohibitions', visible: false },
            /* 05 */ { itemId: 'bans-and-prohibitions-highlight', visible: false },
            /* 06 */ { itemId: 'area-restrictions', visible: false },
            /* 07 */ { itemId: 'area-restrictions-highlight', visible: false },
            /* 08 */ { itemId: 'fire-perimeters', visible: false },
            /* 09 */ { itemId: 'bcws-activefires-publicview-inactive', visible: false },
            /* 10 */ { itemId: 'closed-recreation-sites', visible: false },
            /* 11 */ { itemId: 'drive-bc-active-events', visible: false },
            /* 12 */ { itemId: 'bc-fire-centres', visible: true },
            /* 13 */ { itemId: 'prescribed-fire', visible: false },
            /* 14 */ { itemId: 'hourly-currentforecast-firesmoke', visible: false }
        ];

        switch (selectedLayer) {
            case 'evacuation-orders-and-alerts':
                layers[ 2 ].visible = true;
                break;

            case 'area-restrictions':
                layers[ 6 ].visible = true;
                layers[ 7 ].visible = true;
                break;

            case 'bans-and-prohibitions':
                layers[ 4 ].visible = true;
                layers[ 5 ].visible = true;
                break;

            case 'smoke-forecast':
                layers[ 14 ].visible = true
                break;

            case 'fire-danger':
                layers[ 0 ].visible = true;
                layers[ 3 ].visible = true;
                break;

            case 'local-authorities':
                layers[ 12 ].visible = true;
                break;

            case 'routes-impacted':
                layers[ 11 ].visible = true;
                break;
        }

        return this.smkApi.setDisplayContextItemsVisible( ...layers );
    }

    useMyCurrentLocation(){
        this.searchText = undefined;
        this.commonUtilityService.getCurrentLocationPromise()
        this.wfMapService.setHandler('nearme','activated',null)

    }

    searchTextUpdated(){
        // will need to call News API to fetch the results
        console.log(this.searchText)
    }

}
