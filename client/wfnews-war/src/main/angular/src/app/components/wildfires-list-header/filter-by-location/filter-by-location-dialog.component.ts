import { Component } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { PlaceData } from '@app/services/wfnews-map.service/place-data';
import { debounceTime } from 'rxjs/operators';

export class LocationData {
  public latitude: number
  public longitude: number
  public radius: number = 50
}

@Component({
    selector: 'filter-by-location-dialog',
    templateUrl: 'filter-by-location-dialog.component.html',
    styleUrls: ['./filter-by-location-dialog.component.scss']
})
export class FilterByLocationDialogComponent {
  public searchText
  public useLocationSelected = false
  public filteredOptions = []
  public searchByLocationControl = new UntypedFormControl
  public locationData = new LocationData

  private placeData: PlaceData
  private sortedAddressList: string[] = []

  constructor(private dialogRef: MatDialogRef<FilterByLocationDialogComponent>, private commonUtilityService: CommonUtilityService) {
    this.placeData = new PlaceData();
    let self = this;
    this.searchByLocationControl.valueChanges.pipe(debounceTime(200)).subscribe((val:string)=>{

      if(!val) {
          this.filteredOptions = [];
          this.locationData.latitude = undefined;
          this.locationData.longitude = undefined;
          this.searchText = undefined;
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
  }

  setRadius (radius: number) {
    this.locationData.radius = radius
  }

  async useUserLocation () {
    this.useLocationSelected = !this.useLocationSelected

    if (this.useLocationSelected) {
      this.searchText = undefined

      const location = await this.commonUtilityService.getCurrentLocationPromise()
      this.locationData.latitude = location.coords.latitude
      this.locationData.longitude = location.coords.longitude
      this.searchText = this.locationData.latitude.toString() + ', ' + this.locationData.longitude.toString()
    }
  }
}
