import { Component, Inject, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PERMISSION_DIALOG } from '@app/components/common/permission-banner/permission-banner.constants';
import { PermissionDialogService } from '@app/components/common/permission-dialog/permission-dialog.service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { PlaceData } from '@app/services/wfnews-map.service/place-data';
import { debounceTime } from 'rxjs/operators';

export class LocationData {
  public latitude: number;
  public longitude: number;
  public radius = 50;
  public searchText: string;
  public useUserLocation = false;
}

@Component({
  selector: 'filter-by-location-dialog',
  templateUrl: 'filter-by-location-dialog.component.html',
  styleUrls: ['./filter-by-location-dialog.component.scss'],
})
export class FilterByLocationDialogComponent implements OnDestroy {
  public searchText;
  public filteredOptions = [];
  public searchByLocationControl = new UntypedFormControl();
  public locationData = new LocationData();

  private placeData: PlaceData;
  private sortedAddressList: string[] = [];
  private locating: AbortController;

  constructor(
    private dialogRef: MatDialogRef<FilterByLocationDialogComponent>,
    private commonUtilityService: CommonUtilityService,
    private permissionDialog: PermissionDialogService,
    @Inject(MAT_DIALOG_DATA) public data: LocationData,
  ) {
    this.locationData = data || new LocationData();
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

  setRadius(radius: number) {
    this.locationData.radius = radius;
  }

  async useUserLocation() {
    if (this.locationData.useUserLocation) {
      // Off ends any wait, so a late position cannot turn the choice back on.
      this.locating?.abort();
      this.locationData.useUserLocation = false;
      this.searchText = null;
      this.locationData.searchText = this.searchText;
      return;
    }

    // The choice shows as on while the app asks and waits.
    this.locationData.useUserLocation = true;
    this.searchText = undefined;
    this.locationData.searchText = this.searchText;
    const reason = PERMISSION_DIALOG.location.reason.useLocation;
    if ((await this.permissionDialog.ensure('location', { reason })) !== 'granted') {
      this.locationData.useUserLocation = false;
      return;
    }

    const locating = (this.locating = new AbortController());
    const location = await this.commonUtilityService.findPosition(locating.signal);
    // The clear button can also turn the choice off without a tap here.
    if (locating.signal.aborted || !this.locationData.useUserLocation) {
      return;
    }
    if (!location) {
      // The choice does not hold, so put the switch back.
      this.locationData.useUserLocation = false;
      return;
    }
    this.locationData.latitude = location.coords.latitude;
    this.locationData.longitude = location.coords.longitude;
    this.searchText =
      this.locationData.latitude.toString() +
      ', ' +
      this.locationData.longitude.toString();
    this.locationData.searchText = this.searchText;
  }

  ngOnDestroy(): void {
    this.locating?.abort();
  }

  // The Button cannot carry [mat-dialog-close], so the dialog closes itself. The close X
  // still returns false, which the callers read as "clear the filter".
  showResults() {
    this.dialogRef.close(this.locationData);
  }
}
