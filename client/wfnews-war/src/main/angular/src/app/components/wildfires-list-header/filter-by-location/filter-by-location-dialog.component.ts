import { Component, Inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { PlaceData } from '@app/services/wfnews-map.service/place-data';
import { debounceTime } from 'rxjs/operators';

export class LocationData {
  public latitude: number
  public longitude: number
  public radius: number = 50
  public searchText: string
  public useUserLocation = false
}

@Component({
    selector: 'filter-by-location-dialog',
    templateUrl: 'filter-by-location-dialog.component.html',
    styleUrls: ['./filter-by-location-dialog.component.scss']
})
export class FilterByLocationDialogComponent {
  public searchText
  public filteredOptions = []
  public searchByLocationControl = new UntypedFormControl
  public locationData = new LocationData

  private placeData: PlaceData
  private sortedAddressList: string[] = []

  constructor(private dialogRef: MatDialogRef<FilterByLocationDialogComponent>, private commonUtilityService: CommonUtilityService, @Inject(MAT_DIALOG_DATA) public data: LocationData) {
    this.locationData = data || new LocationData
    this.placeData = new PlaceData();
    let self = this;
    this.searchByLocationControl.valueChanges.pipe(debounceTime(200)).subscribe((val:string)=>{

      if(!val) {
          this.filteredOptions = [];
          this.locationData.latitude = this.locationData?.latitude || undefined;
          this.locationData.longitude = this.locationData?.longitude || undefined;
          this.searchText = this.locationData?.searchText || undefined;
          return;
      }

      if (val.length > 2) {
        this.filteredOptions = [];
        this.placeData.searchAddresses(val).then(function (results) {
          if (results) {
            results.forEach(() => {
              self.sortedAddressList = self.commonUtilityService.sortAddressList(results, val);
            });
            self.filteredOptions = self.sortedAddressList;
          }
        });
      }
    });
  }

  onLocationSelected(selectedOption) {
    const locationControlValue = selectedOption.address ? selectedOption.address : selectedOption.localityName;
    this.searchByLocationControl.setValue(locationControlValue.trim(), { onlySelf: true, emitEvent: false });

    this.locationData.latitude = selectedOption.loc[1]
    this.locationData.longitude = selectedOption.loc[0]
    this.locationData.searchText = this.searchText
  }

  setRadius (radius: number) {
    this.locationData.radius = radius
  }

  async useUserLocation () {
    this.locationData.useUserLocation = !this.locationData.useUserLocation

    if (this.locationData.useUserLocation) {
      this.searchText = undefined

      const location = await this.commonUtilityService.getCurrentLocationPromise()
      this.locationData.latitude = location.coords.latitude
      this.locationData.longitude = location.coords.longitude
      this.searchText = this.locationData.latitude.toString() + ', ' + this.locationData.longitude.toString()
    } else {
      this.searchText = null
    }

    this.locationData.searchText = this.searchText
  }
}
