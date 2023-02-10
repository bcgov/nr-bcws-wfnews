import { direction, distance, fetchJsonP, LonLat } from './util';

const EPSILON = 0.01;

export interface Location {
    name: string;
    type: string;
    dist: number;
    loc: LonLat;
    direction?: string;
    isAnchor?: boolean;
};

export class PlaceData {
    private anchorPoint?: LonLat;
    private maxDistance?: number;
    private callback?: any;
    private searchState: {
        placeText?: string;
        places?: Location[];
        roadText?: string;
        roads?: Location[];
        intersectionsText?: [ string, string ];
        intersections?: Location[];
    } = {};

    init() {
        return this.updateResults();
    }

    setResultHandler( callback ) {
        if ( callback != null && typeof( callback ) != 'function' ) {
return;
}

        this.callback = callback;
    }

    setMaximumDistance( distance: number ) {
        this.maxDistance = distance;
        return this.updateResults();
    }
    getMaximumDistance(): number {
        return this.maxDistance;
    }

    setAnchor( point: LonLat ) {
        this.anchorPoint = point;
        return this.updateResults();
    }
    getAnchor(): LonLat {
        return this.anchorPoint;
    }

    getSearchState() {
        return this.searchState;
    }

    findPlace( text: string ) {
        this.searchState.places = [];
        this.searchState.placeText = text;

        return this.updateResults();
    }

    findRoad( text: string ) {
        this.searchState.roads = [];
        this.searchState.roadText = text;
        // don't search for intersections
        this.searchState.intersections = [];
        this.searchState.intersectionsText = null;

        return this.updateResults();
    }

    findIntersection( text1, text2 ) {
        this.searchState.intersections = [];
        this.searchState.intersectionsText = [ text1, text2 ];
        // don't search for roads
        this.searchState.roads = [];
        this.searchState.roadText = null;

        return this.updateResults();
    }

    searchAddresses( txt: string ) {
        const query = {
            ver:            1.2,
            maxResults:     10,
            outputSRS:      4326,
            addressString:  txt,
            autoComplete:   true
        };
    
        return fetchJsonP( 'https://geocoder.api.gov.bc.ca/addresses.geojsonp', query ).response
            .then( function( result ) {
                const resultLoc = result.features
                    .map( function( feature ) {
                        if ( !feature.geometry.coordinates ) {
                            return;
                        }
    
                        // exclude whole province match
                        if ( feature.properties.fullAddress == 'BC' ) {
                            return;
                        }
                        
                        const loc = {
                            streetName: feature.properties.streetName,
                            streetQualifier: feature.properties.streetQualifier,
                            streetType: feature.properties.streetType,
                            localityName: feature.properties.localityName,
                            localityType: feature.properties.localityType,
                            civicNumber: feature.properties.civicNumber,
                            dist: null,
                            dir: null,
                            loc: feature.geometry.coordinates
                        };

                        return loc;
                    } )
                    .filter( function( item ) {
                        return item;
                    } );
                    return resultLoc;
            } )
            .catch( function( e ) {
                console.warn( 'address match:', e );
            } );
    }

    updateResults(): Promise<any> {
        const self = this;

        if ( !this.callback ) {
return Promise.resolve();
}

        return Promise.resolve()
            .then( function() {
 return searchPlaces( self );
} )
            .then( function() {
 return searchRoads( self );
} )
            .then( function() {
 return searchOccupants( self );
} )
            .then( function() {
 return searchAddresses( self );
} )
            .then( function() {
 return searchIntersections( self );
} )
            .then(
                function() {
                    if ( !self.callback ) {
return;
}

                    self.callback.call( null, Object.assign( {
                        anchorPt:       self.anchorPoint,
                        maxDistance:    self.maxDistance,
                    }, self.searchState ) );
                },
                function( e ) {
                    if ( !self.callback ) {
return;
}
                    self.callback.call( null, Object.assign( {
                        error:          e,
                        anchorPt:       self.anchorPoint,
                        maxDistance:    self.maxDistance,
                    }, self.searchState ) );
                }
            );
    }
}

//---------------------------------------------------------------

const fetchCache: { [url: string]: Promise<any> } = {};

function fetchData( url: string ): Promise<any> {
    if ( fetchCache[ url ] ) {
return fetchCache[ url ];
}

    return fetchCache[ url ] = fetch( url, { credentials: 'same-origin' } )
        .then( function( res ) {
            if ( res.ok ) {
return res.json();
}

            throw new Error( `fetching ${ url }: ${ res.statusText }` );
        } );
}

function searchPlaces( data: PlaceData ) {
    if ( data.getSearchState().placeText ) {
return fetchData( 'assets/place-data/wf-search-places.json' )
            .then( function( places: { n: string; t: string; x: number; y: number }[] ) {
                data.getSearchState().places = sortData( searchData( places, data.getSearchState().placeText, data.getAnchor() ) );
            } )
            .catch( function( e ) {
                console.warn( 'place match:', e );
            } );
} else {
data.getSearchState().places = [];
}
}

function searchRoads( data: PlaceData ) {
    if ( data.getSearchState().roadText ) {
return fetchData( 'assets/place-data/wf-search-roads.json' )
            .then( function( roads: { n: string; x: number; y: number }[] ) {
                data.getSearchState().roads = sortData( searchData( roads, data.getSearchState().roadText, data.getAnchor(), data.getMaximumDistance() ) );
            } )
            .catch( function( e ) {
                console.warn( 'road match:', e );
            } );
} else {
data.getSearchState().roads = [];
}
}

function searchData( source: { n: string; t?: string; x: number; y: number }[], text: string, anchorPt: LonLat, maxDist?: number ): Location[] {
    const locs = [];
    if ( !text || !text.trim() ) {
return locs;
}

    const t = text.toLowerCase();
    // var strIn = ' ' + strLow;

    for (let i = 0; i < source.length; i++) {
        const place = source[i];
        if ( place.n.toLowerCase().startsWith( t ) ) {
            const location = {
                name: place.n,
                type: place.t,
                dist: null,
                loc: [ place.x, place.y ] as LonLat
            };

            setAnchorData( anchorPt, location );

            if ( maxDist && location.dist > maxDist ) {
continue;
}

            locs.push(location);
        }
    }

    return locs;
}

function sortData( locations ) {
    const sorted = locations.sort( function( a, b ) {
        if ( a.dist == null || b.dist == null ) {
return a.name > b.name ? 1 : -1;
}

        return a.dist - b.dist;
    } );
    return sorted;
}

function removeDuplicateIntersections( locations ) {
    // remove contiguous entries with duplicate names (which will be close to one another)
    const uniq = [];
    for (let i = 0; i < locations.length; i++) {
        const candidate = locations[i];
        if (i > 0) {
            const current = uniq[uniq.length-1];
            // skip if duplicate
            if (isDuplicateIntersection(current, candidate)) {
continue;
}
        }
        // keep this one
        uniq.push( candidate );
    }
    return uniq;
}

function isDuplicateIntersection(intLoc1, intLoc2) {
    if (intLoc1.name !== intLoc2.name) {
return false;
}
    if (intLoc1.dist && intLoc2.dist) {
        const distanceBetween = intLoc1.dist - intLoc2.dist;
        if (distanceBetween > 1) {
return false;
}
    }
    return true;
}

function setAnchorData( anchorPt: LonLat, location: Location ) {
    if ( ! anchorPt ) {
return;
}
    location.dist = distance( anchorPt, location.loc ); // / 1000.0;
    location.direction = direction( anchorPt, location.loc );
    // MD not sure about this logic, since there can be more than one result with same coordinate
    if ( location.dist < EPSILON ) {
location.isAnchor = true;
}
}

function searchIntersections( data: PlaceData ) {
    if ( !data.getSearchState().intersectionsText ) {
        data.getSearchState().intersections = [];
        return;
    }

    const query = {
        ver:            1.2,
        maxResults:     1000,
        outputSRS:      4326,
        addressString:  data.getSearchState().intersectionsText.join( ' and ' ),
        matchPrecision: 'INTERSECTION',
        autoComplete:   true
    };

    return fetchJsonP( 'https://geocoder.api.gov.bc.ca/addresses.geojsonp', query ).response
        .then( function( result ) {
            const resultLoc = result.features
                .map( function( feature ) {
                    if ( !feature.geometry.coordinates ) {
return;
}

                    // exclude whole province match
                    if ( feature.properties.fullAddress == 'BC' ) {
return;
}
                    // only return intersections
                    if ( ! feature.properties.intersectionName ) {
return;
}

                    const loc = {
                        name: feature.properties.fullAddress,
                        type: 'intersection',
                        dist: null,
                        dir: null,
                        loc: feature.geometry.coordinates
                    };
                    setAnchorData(data.getAnchor(), loc);
                    return loc;
                } )
                .filter( function( item ) {
 return item;
} );
            data.getSearchState().intersections = removeDuplicateIntersections( sortData( resultLoc ));
        } )
        .catch( function( e ) {
            console.warn( 'intersection match:', e );
        } );
}

function searchAddresses( data: PlaceData ) {
    if ( data.getSearchState().roads.length > 0 || !data.getSearchState().roadText || !data.getSearchState().roadText.trim() ) {
        return;
    }

    const query = {
        ver:            1.2,
        maxResults:     10,
        outputSRS:      4326,
        addressString:  data.getSearchState().roadText,
        autoComplete:   true
    };

    return fetchJsonP( 'https://geocoder.api.gov.bc.ca/addresses.geojsonp', query ).response
        .then( function( result ) {
            const resultLoc = result.features
                .map( function( feature ) {
                    if ( !feature.geometry.coordinates ) {
return;
}

                    // exclude whole province match
                    if ( feature.properties.fullAddress == 'BC' ) {
return;
}

                    const loc = {
                        name: feature.properties.fullAddress,
                        type: null,
                        dist: null,
                        dir: null,
                        loc: feature.geometry.coordinates
                    };
                    setAnchorData(data.getAnchor(), loc);
                    return loc;
                } )
                .filter( function( item ) {
 return item;
} );
            data.getSearchState().roads = removeDuplicateIntersections( sortData( resultLoc ));
        } )
        .catch( function( e ) {
            console.warn( 'address match:', e );
        } );
}

function searchOccupants( data: PlaceData ) {
    if ( data.getSearchState().places.length > 0 || !data.getSearchState().placeText || !data.getSearchState().placeText.trim() ) {
        return;
    }

    const query = {
        ver:            1.2,
        maxResults:     100,
        outputSRS:      4326,
        addressString:  data.getSearchState().placeText,
        autoComplete:   true
    };

    return fetchJsonP( 'https://geocoder.api.gov.bc.ca/occupants/addresses.geojsonp', query ).response
        .then( function( result ) {
            const resultLoc = result.features
                .map( function( feature ) {
                    if ( !feature.geometry.coordinates ) {
return;
}

                    // exclude whole province match
                    if ( feature.properties.fullAddress == 'BC' ) {
return;
}

                    const loc = {
                        name: feature.properties.fullAddress,
                        type: null,
                        dist: null,
                        dir: null,
                        loc: feature.geometry.coordinates
                    };
                    setAnchorData(data.getAnchor(), loc);
                    return loc;
                } )
                .filter( function( item ) {
 return item;
} );
            data.getSearchState().places = removeDuplicateIntersections( sortData( resultLoc ));
        } )
        .catch( function( e ) {
            console.warn( 'occupant match:', e );
        } );
}
