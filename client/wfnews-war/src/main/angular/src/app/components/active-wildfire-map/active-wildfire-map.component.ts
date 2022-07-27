import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { AppConfigService } from '@wf1/core-ui';
import { MapConfigService } from "../../services/map-config.service";
import { SmkApi } from "../../utils/smk";

export type SelectedLayer =
    'evacuation-orders-and-alerts' |
    'area-restrictions' |
    'bans-and-prohibitions' |
    'smoke-forecast' |
    'fire-danger' |
    'local-authorities' |
    'routes-impacted'

@Component({
    selector: 'active-wildfire-map',
    templateUrl: './active-wildfire-map.component.html',
    styleUrls: ['./active-wildfire-map.component.scss'],
})
export class ActiveWildfireMapComponent implements OnInit, OnChanges {
    @Input() incidents: any;

    activeFireCount: number
    incidentsServiceUrl: string
    mapConfig = null
    smkApi: SmkApi

    constructor(
        private http: HttpClient,
        private appConfig: AppConfigService,
        private mapConfigService: MapConfigService,
    ) {
        this.incidentsServiceUrl = this.appConfig.getConfig().rest['newsLocal']
    }

    ngOnInit() {
        this.getActiveFireCounts();
        console.log(this.incidentsServiceUrl)

        this.appConfig.configEmitter.subscribe((config) => {
            let mapConfig = []
            // this.checkMapServiceStatus()
            // .then( ( mapServiceStatus ) => {
            // console.log(mapServiceStatus)
            // this.wfnewsMapService.mapServiceStatus = mapServiceStatus

            this.mapConfigService.getMapConfig() // this.applicationConfig.device )
                // .then((config) => {
                //     mapConfig.push(config)

                //     return this.mapStatePersistenceService.getMapState()
                // })
                .then((mapState) => {
                    console.log('map state version', mapState?.version)
                    // if (!mapState || !mapState.version) return
                    // if (mapState.version.app != this.applicationConfig.version.short) return
                    // if (mapState.version.build != config.application.buildNumber) return
                    // console.log('using map state')

                    // eachDisplayContextItem( mapState.viewer.displayContext, ( item ) => {
                    // if ( item.id == 'resource-track' )
                    // item.isVisible = false
                    // delete item.isEnabled
                    // } )

                    mapConfig.push(mapState)
                })
                .then(() => {
                    let deviceConfig = { viewer: { device: 'desktop' } }

                    this.mapConfig = [...mapConfig, deviceConfig, 'theme=wf', '?']
                })

            // this.wfnewsMapService.setMapStateSaveHandler((state) => {
            //     state.version = {
            //         app: this.applicationConfig.version.short,
            //         build: config.application.buildNumber
            //     }

            //     this.mapStatePersistenceService.putMapState(state)
            //         .then(() => { console.log('map state saved') })
            //         .catch((e) => {
            //             // console.warn( e, 'failed saving map state' )
            //         })
            // })
        });

    }

    ngOnChanges(changes: SimpleChanges) {
    }

    getActiveFireCounts() {
        setTimeout(() => {
            let url = this.incidentsServiceUrl + '/incidents';
            let headers = new HttpHeaders();
            headers.append('Access-Control-Allow-Origin', '*');
            headers.append('Accept', '*/*');
            this.http.get<any>(url, { headers }).subscribe(response => {
                console.log(response)
                this.activeFireCount = response.collection.length;
            })
        }, 2000)
    }

    initMap(smk: any) {
        this.smkApi = new SmkApi(smk)
        // this.wfnewsMapService.setSmkInstance(smk, this.bespokeContainerRef, this.mapConfig[0].viewer.location.extent)

        // this.updateMapSize = function () {
        //     this.storeViewportSize()
        //     smk.updateMapSize();
        // };

        // window[ 'SPLASH_SCREEN' ].remove()
    }

    onSelectLayer(selectedLayer: SelectedLayer) {
        let layers = [
            /* 00 */ { itemId: "active-wildfires", visible: false },
            /* 01 */ { itemId: "evacuation-orders-and-alerts-wms", visible: false },
            /* 02 */ { itemId: "evacuation-orders-and-alerts-wms-highlight", visible: false },
            /* 03 */ { itemId: "danger-rating", visible: false },
            /* 04 */ { itemId: "bans-and-prohibitions", visible: false },
            /* 05 */ { itemId: "bans-and-prohibitions-highlight", visible: false },
            /* 06 */ { itemId: "area-restrictions", visible: false },
            /* 07 */ { itemId: "area-restrictions-highlight", visible: false },
            /* 08 */ { itemId: "fire-perimeters", visible: false },
            /* 09 */ { itemId: "bcws-activefires-publicview-inactive", visible: false },
            /* 10 */ { itemId: "closed-recreation-sites", visible: false },
            /* 11 */ { itemId: "drive-bc-active-events", visible: false },
            /* 12 */ { itemId: "bc-fire-centres", visible: false },
            /* 13 */ { itemId: "prescribed-fire", visible: false }
        ]

        switch (selectedLayer) {
            case 'evacuation-orders-and-alerts':
                layers[ 1 ].visible = true
                layers[ 2 ].visible = true
                break

            case 'area-restrictions':
                layers[ 6 ].visible = true
                layers[ 7 ].visible = true
                break

            case 'bans-and-prohibitions':
                layers[ 4 ].visible = true
                layers[ 5 ].visible = true
                break

            case 'smoke-forecast':
                // layers[ 2 ].visible = true
                break

            case 'fire-danger':
                layers[ 0 ].visible = true
                layers[ 3 ].visible = true
                break

            case 'local-authorities':
                layers[ 12 ].visible = true
                break

            case 'routes-impacted':
                layers[ 11 ].visible = true
                break
        }

        return this.smkApi.setDisplayContextItemsVisible( ...layers )
    }

}