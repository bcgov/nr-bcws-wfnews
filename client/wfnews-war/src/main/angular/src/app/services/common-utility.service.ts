import { NumberFormatStyle } from "@angular/common";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

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
        protected snackbarService : MatSnackBar
     ) {}

     getCurrentLocationPromise(): Promise<Position> {
        var self = this
        var now = (new Date()).getTime()
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

    preloadGeolocation() {
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

}