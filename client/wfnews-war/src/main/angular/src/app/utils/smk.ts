// import { GeoJsonTypes } from 'geojson'

export type SmkMap = any

export class SmkApi {
    constructor(
        private smkMap: SmkMap
    ) {}

    with<T>( block: ( smk: SmkMap ) => T, fail?: T ) {
        if ( !this.smkMap ) return fail

        return block( this.smkMap )
    }

    // showFeature( acetate: string, geometry?: GeoJsonTypes, opt?: object): void {
    //     if ( !this.smkMap ) return

    //     this.smkMap.showFeature( acetate, geometry, opt )
    // }

    // panToFeature( geometry: GeoJsonTypes, zoomIn? ) {
    //     if ( !this.smkMap ) return

    //     this.smkMap.$viewer.panToFeature( geometry, zoomIn )
    // }

    setDisplayContextItemsVisible( ...layerVisibilities: { itemId: string, visible: boolean, reload?: boolean }[] ): Promise<any> {
        if ( !this.smkMap ) return Promise.reject()

        layerVisibilities.forEach( ( { itemId: id, visible, reload } ) => {
            this.smkMap.$viewer.displayContext.layers.setItemVisible( id, visible )

            if ( reload )
                this.smkMap.$viewer.layerIdPromise[ id ] = null
        } )

        return this.smkMap.$viewer.updateLayersVisible()
    }

    withLayerConfig( layerId: string, block: ( config ) => void ) {
        if ( !this.smkMap ) return

        block( this.smkMap.$viewer.layerId[ layerId ].config )
    }

}