import { NumberFormatStyle } from "@angular/common";
import { EventEmitter, Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { CapacitorService, CompassHeading } from "./capacitor-service";

const MAX_CACHE_AGE = 30 * 1000

export interface Coordinates {
    readonly accuracy: number;
    readonly altitude: number | null;
    readonly altitudeAccuracy: number | null;
    readonly heading: number | null;
    readonly latitude: number;
    readonly longitude: number;
    readonly speed: number | null;
}

export interface Position {
    readonly coords: Coordinates;
    readonly timestamp: NumberFormatStyle;
}

@Injectable({ providedIn: 'root' })
export class CommonUtilityService {
    private myLocation;

    private location
    private locationTime
    private getHeadingFromDeviceOrientationPromise: Promise<CompassHeading>

    constructor(
        protected snackbarService: MatSnackBar,
        protected capacitorService: CapacitorService
    ) {}

    preloadGeolocation() {
        //console.log('preloadGeolocation - 1');
        this.capacitorService.deviceProperties.then( p => {
            if (p.isMobilePlatform) {
                //console.log('preloadGeolocation - 2a');
                if (p.isAndroidPlatform || p.isIOSPlatform) { //use cordova plugin for ionic capacitor
                    navigator.geolocation.getCurrentPosition((position) => {
                        this.myLocation = position.coords;
                    }, error => {
                        console.error('Failed to preload my location');
                    },
                        { enableHighAccuracy: true }
                    );
                }
                else {
                    this.capacitorService.getCurrentPosition({ enableHighAccuracy: true })
                        .then((position) => {
                            //console.log('preloadGeolocation - 2b retrieved currPosition: ', position);
                            this.myLocation = position.coords;
                        },
                            (error) => {
                                console.error('Failed to preload my location');
                            });
                }


            }
            else {
                //console.log('preloadGeolocation - 3a');
                navigator.geolocation.getCurrentPosition((position) => {
                    this.myLocation = position.coords;
                }, error => {
                    //console.error('Failed to preload my location');
                },
                    { enableHighAccuracy: true }
                );
            }
        } )
    }

    getCurrentLocation(callback?: (p: Position) => void) {
        //console.log('getCurrentLocation - 1');
        this.capacitorService.deviceProperties.then( p => {
            if (p.isMobilePlatform) {
                if (p.isAndroidPlatform || p.isIOSPlatform) { //use cordova plugin for ionic capacitor
                    if (navigator && navigator.geolocation) {
                        return navigator.geolocation.getCurrentPosition((position) => {
                            this.myLocation = position ? position.coords : undefined;
                            if (callback) {
                                callback(position);
                            }
                            return position ? position.coords : undefined;
                        }, error => {
                            this.snackbarService.open('Unable to retrieve the current location.', '', {
                                duration: 5,
                                panelClass: 'snack-bar-warning'
                            });
                        },
                            { enableHighAccuracy: true }
                        );
                    }
                    else {
                        console.error('Unable to retrieve the current location.');
                        this.snackbarService.open('Unable to retrieve the current location.', '', {
                            duration: 5,
                            panelClass: 'snack-bar-warning'
                        });
                    }
                }
                else {
                    //console.log('getCurrentLocation - 2a');
                    this.capacitorService.getCurrentPosition({ enableHighAccuracy: true })
                        .then((position) => {
                            //console.log('getCurrentLocation - 2b retrieved currPosition: ', position);
                            this.myLocation = position ? position.coords : undefined;
                            if (callback) {
                                callback(position as Position);
                            }
                            return position ? position.coords : undefined;
                        },
                            (error) => {
                                console.error('Unable to retrieve the current location.');
                                this.snackbarService.open('Unable to retrieve the current location.', '', {
                                    duration: 5,
                                    panelClass: 'snack-bar-warning'
                                });
                            });
                }


            }
            else {
                //console.log('getCurrentLocation - 3a');
                if (navigator && navigator.geolocation) {
                    return navigator.geolocation.getCurrentPosition((position) => {
                        this.myLocation = position ? position.coords : undefined;
                        if (callback) {
                            callback(position);
                        }
                        return position ? position.coords : undefined;
                    }, error => {
                        this.snackbarService.open('Unable to retrieve the current location.', '', {
                            duration: 5,
                            panelClass: 'snack-bar-warning'
                        });
                    },
                        { enableHighAccuracy: true }
                    );
                }
                else {
                    console.warn('Unable to access geolocation');
                    this.snackbarService.open('Unable to access location services.', '', {
                        duration: 5,
                        panelClass: 'snack-bar-warning'
                    });
                }
            }
        } )
    }

    getCurrentLocationPromise(): Promise<Position> {
        var self = this

        var now = (new Date()).getTime()

        if (this.locationTime && (now - this.locationTime) < MAX_CACHE_AGE)
            return this.location

        this.locationTime = now
        this.location = new Promise<Position>(function (res, rej) {
            self.getCurrentLocation(res)
        })

        return this.location
    }

    getLastKnownLocation() {
        return this.myLocation;
    }

    getCompassHeading(): Promise<CompassHeading> {
        return this.capacitorService.deviceProperties.then( p => {
            if ( p.isIOSPlatform )
                return this.capacitorService.getCurrentHeading()

            if ( p.isAndroidPlatform )
                return this.getHeadingFromDeviceOrientation()

            return Promise.resolve( {
                error: 'heading not available'
            } )
        } )

    }

    getHeadingFromDeviceOrientation( timeout = 2000, maxSamples = 10 ) : Promise<CompassHeading> {
        if ( this.getHeadingFromDeviceOrientationPromise )
            return this.getHeadingFromDeviceOrientationPromise

        let headings = []

        let onDeviceOrientationResolve
        let onDeviceOrientation = ( event ) => {
            if ( !event ) return

            // console.log( event )
            headings.push( generateHeading( event.alpha, event.beta, event.gamma ) )
            if ( headings.length >= maxSamples ) onDeviceOrientationResolve()
        }

        this.getHeadingFromDeviceOrientationPromise = new Promise<void>( ( res, rej ) => {
            onDeviceOrientationResolve = res
            try {
                window.addEventListener( "deviceorientationabsolute", onDeviceOrientation, true )

                setTimeout( res, timeout )
            }
            catch ( e ) {
                rej( e )
            }
        } )
        .then( () => {
            if ( headings.length == 0 ) throw Error( 'no orientation events' )

            console.log( JSON.stringify( headings ) )
            let avg = headings.reduce( ( acc, h ) => acc + h, 0 ) / headings.length

            window.removeEventListener( "deviceorientationabsolute", onDeviceOrientation , true )
            this.getHeadingFromDeviceOrientationPromise = null

            return {
                trueHeading: avg
            }
        } )
        .catch( ( e ) => {
            window.removeEventListener( "deviceorientationabsolute", onDeviceOrientation , true )
            this.getHeadingFromDeviceOrientationPromise = null

            return {
                error: '' + e
            }
        } )

        return this.getHeadingFromDeviceOrientationPromise
    }
}

function generateHeading(alpha, beta, gamma){
    // Convert degrees to radians
    var alphaRad = alpha * Math.PI / 180;
    var betaRad = beta * Math.PI / 180;
    var gammaRad = gamma * Math.PI / 180;

    // Calculate equation components
    var cA = Math.cos(alphaRad);
    var sA = Math.sin(alphaRad);
    var cB = Math.cos(betaRad);
    var sB = Math.sin(betaRad);
    var cG = Math.cos(gammaRad);
    var sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    var rA = - cA * sG - sA * sB * cG;
    var rB = - sA * sG + cA * sB * cG;
    // var rC = - cB * cG;

    // Calculate compass heading
    var compassHeading = Math.atan(rA / rB);

    // Convert from half unit circle to whole unit circle
    if ( rB < 0 ) {
      compassHeading += Math.PI;
    }
    else if ( rA < 0 ) {
      compassHeading += 2 * Math.PI;
    }

    // Convert radians to degrees
    compassHeading *= 180 / Math.PI;

    return compassHeading;
}
