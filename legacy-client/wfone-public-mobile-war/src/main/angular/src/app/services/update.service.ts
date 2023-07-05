import {Injectable} from "@angular/core";
import {SwUpdate} from "@angular/service-worker";
import {MatSnackBar} from "@angular/material";
import {interval} from "rxjs";

@Injectable({providedIn: 'root'})
export class UpdateService {
    constructor(public swUpdate: SwUpdate, public snackbar: MatSnackBar) {
        console.log('wfone-public-mobile swUpdate, enabled:', swUpdate.isEnabled);
        if (swUpdate.isEnabled) {
            swUpdate.checkForUpdate(); // Check on load up, then check every interval
            interval(30000).subscribe(() => {
                console.log('UpdateService - checking for swUpdate');
                return swUpdate.checkForUpdate();
            });
        }
    }

    public checkForUpdates(): void {
        if (this.swUpdate.isEnabled) {
            this.swUpdate.available.subscribe(event => {
                console.log('current version is', event.current);
                console.log('available version is', event.available);

                this.snackbar.open('A new version is available', 'Update Now').onAction().subscribe(
                  () => {
                      this.swUpdate.activateUpdate().then(() => document.location.reload());
                  }
                );
            });
        }
    }
}
