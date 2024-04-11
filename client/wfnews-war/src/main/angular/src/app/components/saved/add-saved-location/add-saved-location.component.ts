import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogExitComponent } from '@app/components/report-of-fire/dialog-exit/dialog-exit.component';
import { DialogLocationComponent } from '@app/components/report-of-fire/dialog-location/dialog-location.component';
import { notificationMapComponent } from '@app/components/saved/add-saved-location/notification-map/notification-map.component';
import { CapacitorService } from '@app/services/capacitor-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { NotificationService } from '@app/services/notification.service';
import { PlaceData } from '@app/services/wfnews-map.service/place-data';
import { isMobileView } from '@app/utils';
import { debounceTime } from 'rxjs/operators';

export class LocationData {
  public notificationName: string;
  public latitude: number;
  public longitude: number;
  public radius = 50;
  public searchText: string;
  public useUserLocation = false;
  public chooseLocationOnMap = false;
  public pushNotificationsWildfires = true;
  public pushNotificationsFireBans = true;
  public inAppNotificationsWildfires = true;
  public inAppNotificationsFireBans = true;
}

@Component({
  selector: 'wfnews-add-saved-location',
  templateUrl: './add-saved-location.component.html',
  styleUrls: ['./add-saved-location.component.scss'],
})
export class AddSavedLocationComponent implements OnInit {
  searchText = undefined;
  public filteredOptions = [];
  public locationData = new LocationData();
  currentLocation: any;
  radiusDistance: number;
  notificationName: string;
  public searchByLocationControl = new UntypedFormControl();
  savedLocation: any[] = [];
  locationToEditOrDelete;
  isEdit: boolean;
  isMobileView = isMobileView;

  private placeData: PlaceData;
  private sortedAddressList: string[] = [];

  constructor(
    private commonUtilityService: CommonUtilityService,
    protected dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    protected snackbarService: MatSnackBar,
    private route: ActivatedRoute,
    private capacitor: CapacitorService,
  ) {
    this.locationData = new LocationData();
    this.placeData = new PlaceData();
    const self = this;

    this.searchByLocationControl.valueChanges
      .pipe(debounceTime(200))
      .subscribe((val: string) => {
        if (!val) {
          this.filteredOptions = [];
          this.locationData.latitude = this.locationData?.latitude || undefined;
          this.locationData.longitude =
            this.locationData?.longitude || undefined;
          this.searchText = this.locationData?.searchText || undefined;
          return;
        }

        if (val.length > 2) {
          this.filteredOptions = [];
          this.placeData.searchAddresses(val).then(function(results) {
            if (results) {
              results.forEach(() => {
                self.sortedAddressList =
                  self.commonUtilityService.sortAddressList(results, val);
              });
              self.filteredOptions = self.sortedAddressList;
            }
          });
        }
      });
  }

  isWebDevice() {
    return this.capacitor.isWebPlatform;
  }

  ngOnInit(): void {
    this.useMyCurrentLocation();
    this.route.queryParams.subscribe((params) => {
      if (params && params.location) {
        const location = JSON.parse(params.location);
        this.locationToEditOrDelete = location;
        this.isEdit = true;
        this.locationData.notificationName =
          this.locationToEditOrDelete.notificationName;
        this.locationData.searchText =
          this.locationToEditOrDelete.point.coordinates[1] +
          ',' +
          this.locationToEditOrDelete.point.coordinates[0];
        if (this.locationToEditOrDelete.topics.length) {
          if (
            this.locationToEditOrDelete.topics.includes(
              'BCWS_ActiveFires_PublicView',
            ) &&
            this.locationToEditOrDelete.topics.includes(
              'Evacuation_Orders_and_Alerts',
            )
          ) {
            this.locationData.pushNotificationsWildfires = true;
          }
          if (
            this.locationToEditOrDelete.topics.includes(
              'British_Columbia_Bans_and_Prohibition_Areas',
            ) &&
            this.locationToEditOrDelete.topics.includes(
              'British_Columbia_Area_Restrictions',
            )
          ) {
            this.locationData.pushNotificationsFireBans = true;
          }
        } else {
          this.locationData.pushNotificationsFireBans = false;
          this.locationData.pushNotificationsWildfires = false;
        }
        this.locationData.radius = this.locationToEditOrDelete.radius;
        this.locationData.latitude =
          this.locationToEditOrDelete.point.coordinates[1];
        this.locationData.longitude =
          this.locationToEditOrDelete.point.coordinates[0];
      }
    });
  }

  async useMyCurrentLocation() {
    this.currentLocation =
      await this.commonUtilityService.getCurrentLocationPromise();
  }

  onLocationSelected(selectedOption) {
    const locationControlValue = selectedOption.address
      ? selectedOption.address
      : selectedOption.localityName;
    this.searchByLocationControl.setValue(locationControlValue.trim(), {
      onlySelf: true,
      emitEvent: false,
    });

    this.locationData.latitude = selectedOption.loc[1];
    this.locationData.longitude = selectedOption.loc[0];
    this.locationData.searchText = this.searchText;
  }

  async useUserLocation() {
    this.commonUtilityService
      .checkLocationServiceStatus()
      .then(async (enabled) => {
        if (!enabled) {
          const dialogRef = this.dialog.open(DialogLocationComponent, {
            autoFocus: false,
            width: '80vw',
          });
        } else {
          this.locationData.useUserLocation = true;

          if (this.locationData.useUserLocation) {
            this.searchText = undefined;

            const location =
              await this.commonUtilityService.getCurrentLocationPromise();
            this.locationData.latitude = location.coords.latitude;
            this.locationData.longitude = location.coords.longitude;
            this.searchText =
              this.locationData.latitude.toFixed(2).toString() +
              ', ' +
              this.locationData.longitude.toFixed(2).toString();
          } else {
            this.searchText = null;
          }

          this.locationData.searchText = this.searchText;
        }
      });
    this.cdr.detectChanges();
  }

  chooseOnMap() {
    const dialogRef = this.dialog.open(notificationMapComponent, {
      autoFocus: false,
      width: '100dvw',
      minWidth: '100dvw',
      height: '100dvh',
      data: {
        currentLocation: this.currentLocation,
        title: 'Choose location on the map',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result['exit'] && result['location']) {
        this.locationData.chooseLocationOnMap = true;
        this.locationData.latitude = Number(result['location'].lat);
        this.locationData.longitude = Number(result['location'].lng);
        // this.searchText = result['location'].lat.toString() + ', ' + result['location'].lng.toString();
      }
    });
  }

  closeLocationOnMap(event: Event): void {
    event.stopPropagation();
    this.locationData.chooseLocationOnMap = false;
    this.locationData.latitude = null;
    this.locationData.longitude = null;
  }

  closeUserLocation(event: Event): void {
    event.stopPropagation();
    this.locationData.useUserLocation = false;
    this.locationData.latitude = null;
    this.locationData.longitude = null;
  }

  chooseRadiusOnMap() {
    const dialogRef = this.dialog.open(notificationMapComponent, {
      autoFocus: false,
      width: '100dvw',
      minWidth: '100dvw',
      height: '100dvh',
      data: {
        currentLocation: this.currentLocation,
        title: 'Notification Radius',
        lat: this.locationData.latitude,
        long: this.locationData.longitude,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result['exit'] && result['location']) {
        this.locationData.chooseLocationOnMap = true;
        this.locationData.latitude = Number(result['location'].lat);
        this.locationData.longitude = Number(result['location'].lng);
      }
      if (result['radius']) {
        this.locationData.radius = result['radius'];
      }
    });
  }

  saveLocation() {
    this.fetchSavedLocation().then(() => {
      if (this.isEdit) {
        this.savedLocation = this.savedLocation.filter(
          (item) =>
            item.notificationName !==
              this.locationToEditOrDelete.notificationName &&
            item.point.coordinates[0] !==
              this.locationToEditOrDelete.point.coordinates[0] &&
            item.point.coordinates[1] !==
              this.locationToEditOrDelete.point.coordinates[1],
        );
      }
      this.notificationService
        .updateUserNotificationPreferences(
          this.locationData,
          this.savedLocation,
        )
        .then(() => {
          this.cdr.markForCheck();
          this.router.navigateByUrl('/saved');
        })
        .catch((e) => {
          console.warn('saveNotificationPreferences fail', e);
          this.cdr.markForCheck();
          this.snackbarService.open(
            'Failed to save location',
            'OK',
            { duration: 10000, panelClass: 'snackbar-error' },
          );
        });
    });
  }

  fetchSavedLocation(): Promise<any> {
    return this.notificationService
      .getUserNotificationPreferences()
      .then((response) => {
        if (response?.notifications?.length) {
          this.savedLocation = response.notifications;
        }
      })
      .catch((err) => {
        this.snackbarService.open(
          'Failed to fetch saved locations',
          'OK',
          { duration: 10000, panelClass: 'snackbar-error' },
        );
        console.error('error on fetch notifications', err);
      });
  }

  disableSaveButton() {
    // To Save, a user must:
    // Choose a name
    // Choose a location
    // Choose a radius
    if (
      this.locationData.notificationName &&
      this.locationData.notificationName.length &&
      this.locationData.latitude &&
      this.locationData.longitude &&
      this.locationData.radius
    ) {
      return false;
    } else {
      return true;
    }
  }

  leavePage() {
    const dialogRef = this.dialog.open(DialogExitComponent, {
      autoFocus: false,
      width: '80vw',
      data: {
        confirmButton: 'Back',
        text: 'If you exit now, your progress will be lost.',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result['exit']) {
        this.router.navigateByUrl('/saved');
      }
    });
  }

  onToggleChangeActiveWildfires(event: any, pushNotifications: boolean) {
    if (pushNotifications) {
      //Push notifications
      this.locationData.pushNotificationsWildfires = event.checked;
    } else {
      //In-App notifications
      this.locationData.inAppNotificationsWildfires = event.checked;
    }
  }

  onToggleChangeFireBans(event: any, pushNotifications: boolean) {
    if (pushNotifications) {
      //Push notifications
      this.locationData.pushNotificationsFireBans = event.checked;
    } else {
      //In-App notifications
      this.locationData.inAppNotificationsFireBans = event.checked;
    }
  }

  toggleButton(distance: number) {
    this.locationData.radius = distance;
  }

  onNotificationNameChange() {
    this.locationData.notificationName = this.notificationName;
  }
}
