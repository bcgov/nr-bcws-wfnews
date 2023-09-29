import { NumberFormatStyle } from "@angular/common";
import { Injectable } from "@angular/core";
import { Geolocation } from '@capacitor/geolocation';
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { AppConfigService } from "@wf1/core-ui";
import { of } from 'rxjs'

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
        private http: HttpClient,
        private appConfigService: AppConfigService
        ) {}

     getCurrentLocationPromise(): Promise<Position> {
        const self = this
        const now = Date.now()
        if (this.locationTime && (now - this.locationTime) < MAX_CACHE_AGE){
            return this.location
        }

        this.locationTime = now
        this.location = Geolocation.getCurrentPosition();
        return this.location
    }

    getCurrentLocation(callback?: (p: Position) => void) {
        if (navigator && navigator.geolocation) {
            return Geolocation.getCurrentPosition().then((position) => {
                this.myLocation = position ? position.coords : undefined;
                if (callback) {
                    callback(position);
                }
                return position ? position.coords : undefined;
            }, error => {
                this.snackbarService.open('Unable to retrieve the current location.', '', {
                    duration: 5,
                });
            });
        }
        else {
            console.warn('Unable to access geolocation');
            this.snackbarService.open('Unable to access location services.', '', {
                duration: 5,
            });
        }
    }

    preloadGeolocation() {
      Geolocation.getCurrentPosition().then((position) => {
            this.myLocation = position.coords;
        }, error => {
            this.snackbarService.open('Unable to retrieve the current location','Cancel', {
                duration: 5000
            })
        });
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

    isIPhone(): boolean {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone/.test(userAgent);
    }

    checkLocationServiceStatus(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                // Location service is enabled
                resolve(true);
              },
              (error) => {
                // Location service is disabled or the user denied access
                resolve(false);
              }
            );
          } else {
            // Geolocation is not supported by the browser
            resolve(false);
          }
        });
      }

    pingSerivce(): Observable<any> {
        // const url = this.appConfigService.getConfig().rest['wfnews'];
        // return this.http.get(url)
        return of(true);
    }

}
