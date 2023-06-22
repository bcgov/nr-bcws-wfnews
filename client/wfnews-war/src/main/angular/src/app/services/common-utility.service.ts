import { NumberFormatStyle } from "@angular/common";
import { Injectable } from "@angular/core";
import { CapacitorService } from "./capacitor-service";
import { MatLegacySnackBar as MatSnackBar } from "@angular/material/legacy-snack-bar";

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

@Injectable()
export class CommonUtilityService {
    private myLocation;
    private locationTime;
    private location;

    constructor (
        protected snackbarService : MatSnackBar,
        protected capacitorService: CapacitorService
     ) {}

     getCurrentLocationPromise(): Promise<Position> {
        const self = this
        const now = Date.now()
        if (this.locationTime && (now - this.locationTime) < MAX_CACHE_AGE){
            return this.location
        }

        this.locationTime = now
        this.location = new Promise<Position>(function (res, rej) {
            self.getCurrentLocation(res)
        })
        return this.location
    }

    getCurrentLocation(callback?: (p: Position) => void) {
        if (this.capacitorService.isMobilePlatform()) {
            this.determineCurrentLocation()
        }
    }

    preloadGeolocation() {
        if (this.capacitorService.isMobilePlatform()) {
            this.preloadMobileGeolocation();         
        }
        else {
           this.preloadDesktopGeolocation();
        }
    }

    checkIfAndroidIOSPlatform(): boolean {
        return (this.capacitorService.isAndroid() || this.capacitorService.isIOS()) ?  true : false;
    }

    determineCurrentLocation() {
        if (this.checkIfAndroidIOSPlatform()) { //use cordova plugin for ionic capacitor
            this.getMobileCurrentLocation();
        } else {       
                this.getAlternativeCurrentLocation();
        }
    }

    getMobileCurrentLocation(callback?: (p: Position) => void) {
        if (navigator?.geolocation) {
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

    getAlternativeCurrentLocation(callback?: (p: Position) => void) {
        if (navigator?.geolocation) {
            return navigator.geolocation.getCurrentPosition((position) => {
                this.myLocation = position ? position.coords : undefined;
                if (callback) {
                    callback(position);
                }
                return position ? position.coords : undefined;
            }, error => {
                this.snackbarService.open('Unable to retrieve the current location.', '', {
                    duration: 5,
                });
            },
                { enableHighAccuracy: true }
            );
        }
        else {
            console.warn('Unable to access geolocation');
            this.snackbarService.open('Unable to access location services.', '', {
                duration: 5,
            });
        }
    }

    preloadMobileGeolocation() {
        if (this.checkIfAndroidIOSPlatform()) { //use cordova plugin for ionic capacitor
            this.preloadMobileGeolocationIOSAndroid();
        }
        else {
            this.preloadMobileGeolocationGoogle();
        }
    }

    preloadMobileGeolocationIOSAndroid() {
        navigator.geolocation.getCurrentPosition((position) => {
            this.myLocation = position.coords;
        }, error => {
            console.error('Failed to preload my location');
        },
            { enableHighAccuracy: true }
        );
    }

    preloadMobileGeolocationGoogle() {
        this.capacitorService.getCurrentPosition({ enableHighAccuracy: true })
                    .then((position) => {
                        this.myLocation = position.coords;
                },
                (error) => {
                    console.error('Failed to preload my location');
                });
    }

    preloadDesktopGeolocation() {
        navigator.geolocation.getCurrentPosition((position) => {
            this.myLocation = position.coords;
        }, error => {
            this.snackbarService.open('Unable to retrieve the current location','Cancel', {
                duration: 5000
            })
            },
            { enableHighAccuracy: true }
        );
    }

    sortAddressList(results: any, value: string) {
        let address = null;
        let trimmedAddress = null;
        let valueLength = null;
        let valueMatch = null;
        results.forEach((result) => {
            address = this.getFullAddress(result);
            result.address = address.trim();
            trimmedAddress = result.address;
            valueLength = value.length;
            if (trimmedAddress != null) valueMatch = trimmedAddress.substring(0, valueLength);

            if (address != null && valueLength != null && valueMatch != null &&
              (value.toUpperCase() === address.toUpperCase() || value.toUpperCase() === valueMatch.toUpperCase())) {
                const index = results.indexOf(result);
                if (index !== -1) {
                  results.splice(index, 1);
                }
                let resultToBeUnshifted = result;

                results.unshift(resultToBeUnshifted);
            }

          });

          return results;
          
    } 

    getFullAddress(location) {
        let result = "";
    
        if(location.civicNumber) {
            result += location.civicNumber
        }
    
        if(location.streetName) {
            result += " " + location.streetName
        }
    
        if(location.streetQualifier) {
            result += " " + location.streetQualifier
        }
    
        if(location.streetType) {
            result += " " + location.streetType
        }
    
        return result;
      }

}
