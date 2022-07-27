import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '@wf1/core-ui';
import { UtilHash } from '../hash-util';

export interface MapState {
    version: any;
    viewer: any;
}

export const mapPersistKeyPrefix = 'WFML-';
export const mapPersistKey = 'wfim';
export const mapStateKeyPrefix = mapPersistKeyPrefix + mapPersistKey;

const MAX_PREF_SIZE = 4000; // bytes
const MINIMUM_WRITE_DELAY = 2000; // ms

@Injectable( {
    providedIn: 'root'
} )
export class MapStatePersistenceService {
    private userPrefsUrl: string;
    private mapUserPrefsRead: Promise<MapState>; // = Promise.reject( Error( 'not read yet' ) )
    private nonMapUserPrefsRead: Promise<any>; //= Promise.reject( Error( 'not read yet' ) )
    private lastWrite: number;
    private savingInProgress: boolean;
    private lastMapStateHash: string;

    constructor(
        private appConfig: AppConfigService,
        private httpClient: HttpClient,
        private injector: Injector
    ) {
        this.appConfig.loadAppConfig().then( () => {
            this.userPrefsUrl = this.appConfig.getConfig()['userPreferences']['preferencesUrl'];
            if ( this.userPrefsUrl ) {
                // prevents circular dependency

                const fetchUserPrefs = this.httpClient.get( this.userPrefsUrl ).toPromise();

                this.mapUserPrefsRead = fetchUserPrefs.then( ( result ) => this.parseMapUserPrefs( result ) );
                this.nonMapUserPrefsRead = fetchUserPrefs.then( ( result ) => this.parseNonMapUserPrefs( result ) );
            } else {
                this.mapUserPrefsRead = Promise.reject( Error( 'no user prefs url' ) );
                this.nonMapUserPrefsRead = Promise.reject( Error( 'no user prefs url' ) );
            }
        } );
    }

    getMapState(): Promise<MapState> {
        if ( !this.mapUserPrefsRead ) {
return Promise.reject( Error( 'not read yet' ) );
}

        return this.mapUserPrefsRead.catch( ( e ) => {
            console.warn( e, 'failed reading user prefs, reading map state from localstoreage' );
            return JSON.parse( window.localStorage.getItem( mapStateKeyPrefix ) );
        } )
        .catch( ( e ) => {
            console.warn( e, 'failed reading localstoreage' );
            return {};
        } )
        .then( ( s ) => {
            return s
        } )
    }

    putMapState( mapState: MapState ): Promise<void> {
        if ( this.savingInProgress ) {
return Promise.reject( Error( 'save in progress' ) );
}

        const now = (new Date()).getTime();
        if ( this.lastWrite && ( now - this.lastWrite ) < MINIMUM_WRITE_DELAY ) {
return Promise.reject( Error( 'not enough time since last save' ) );
}

        const newStateHash = UtilHash( mapState );
        if ( this.lastMapStateHash == newStateHash ) {
return Promise.reject( Error( 'same hash as last save' ) );
}

        this.savingInProgress = true;
        this.lastMapStateHash = newStateHash;

        return this.writeMapUserPrefs( mapState )
            .catch( ( e ) => {
                // console.warn( e, 'failed saving map state' )
            } )
            .finally( () => {
                window.localStorage.setItem( mapStateKeyPrefix, JSON.stringify( mapState ) );
                this.lastWrite = (new Date()).getTime();
                this.savingInProgress = false;
            } );
    }

    getNonMapPrefs(): Promise<any> {
        if ( !this.nonMapUserPrefsRead ) {
return Promise.reject( Error( 'not read yet' ) );
}
        return this.nonMapUserPrefsRead;
    }

    private parseMapUserPrefs( result: any ): MapState {
        if ( !result[ 'preferences' ] ) {
throw Error( 'preferences missing' );
}

        const pref = result[ 'preferences' ].reduce( (acc, p) => {
            if (p.setName.startsWith(mapStateKeyPrefix)) {
                acc[p.setName] = p;
            }
            return acc;
        }, {});

        const mapPrefHeader = pref[mapStateKeyPrefix + '-header'];
        if (mapPrefHeader) {
            try {
                const pieces = JSON.parse(mapPrefHeader.value);
                const mapPref = pieces.reduce((acc, p) => {
                    acc += pref[p].value;
                    return acc;
                }, '');

                return JSON.parse(mapPref);
            } catch (e) {
                console.warn(e);
                throw e;
            }
        }
    }

    private parseNonMapUserPrefs( result: any ) {
        if ( !result[ 'preferences' ] ) {
throw Error( 'preferences missing' );
}

        return result[ 'preferences' ].reduce( (acc, p) => {
            if ( !p.setName.startsWith( mapStateKeyPrefix ) ) {
                acc.push( p );
            }
            return acc;
        }, [] );
    }

    private writeMapUserPrefs( mapState: MapState ): Promise<any> {
        if ( !this.userPrefsUrl ) {
return Promise.reject( Error( 'no user prefs url' ) );
}

        const state = JSON.stringify( mapState );
        const pieces = Math.trunc( state.length / MAX_PREF_SIZE ) + 1;
        const statePieces = Array( pieces ).fill( 0 ).map( ( v, i ) => state.substr( i * MAX_PREF_SIZE, MAX_PREF_SIZE ) );

        const piecePrefs = statePieces.map( ( v, i ) => ({
                applicationCode: 'WFIM',
                componentId: `${ mapStateKeyPrefix }-piece-${ i }`,
                name: 'most.recently.used',
                value: v,
            }) );

        const headerPref = {
            applicationCode: 'WFIM',
            componentId: mapStateKeyPrefix + '-header',
            name: 'most.recently.used',
            value: JSON.stringify( piecePrefs.map( ( p ) => p.componentId ) ),
        };

        // // suitable for copying to stubUserPrefs.json
        // console.log( JSON.stringify( [
        //     asUserPref( headerPref ),
        //     ...piecePrefs.map( ( p ) => asUserPref( p ) )
        // ], null, '  '  ) )

        return this.httpClient.post( this.userPrefsUrl, headerPref ).toPromise()
            .then( () => Promise.all( piecePrefs.map( ( p ) => this.httpClient.post( this.userPrefsUrl, p ).toPromise() ) ) );
    }

}

function asUserPref( pref ) {
    const p = clone( pref );
    p.setName = p.componentId;
    delete p.componentId;

    return {
        cacheExpiresMillis: null,
        links: [
            {
                rel: 'self',
                href: 'https://d1api.vividsolutions.com/webade-api/v1/usertypes/GOV/users/A416A1783D964058AF31D381952B2B67/preferences/1E5B77AC1F846336F86754697DED6FFE',
                method: 'GET'
            }
        ],
        guid: '1E5B77AC1F846336F86754697DED6FFE',
        flag: 'A',
        typeCode: 'USR',
        subTypeCode: 'bootstrap-config',
        dataTypeCode: 'STRING',
        sensitiveData: false,
        selfLink: 'https://d1api.vividsolutions.com/webade-api/v1/usertypes/GOV/users/A416A1783D964058AF31D381952B2B67/preferences/1E5B77AC1F846336F86754697DED6FFE',
        quotedETag: null,
        unquotedETag: null,
        ...p
    };
}

function clone( o ) {
 return JSON.parse( JSON.stringify( o ) ); 
}
