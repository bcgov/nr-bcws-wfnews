import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable()
export class CommonUtilityService {
    private myLocation;

    constructor (
        protected snackbarService : MatSnackBar
     ) {}

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