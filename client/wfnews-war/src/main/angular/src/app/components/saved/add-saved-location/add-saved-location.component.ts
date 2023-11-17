import { Component } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { PlaceData } from '@app/services/wfnews-map.service/place-data';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'wfnews-add-saved-location',
  templateUrl: './add-saved-location.component.html',
  styleUrls: ['./add-saved-location.component.scss']
})
export class AddSavedLocationComponent {
  searchText = undefined;
  public filteredOptions = [];
  private sortedAddressList: string[] = []
  public locationData = new LocationData
  private placeData: PlaceData


  public searchByLocationControl = new UntypedFormControl

  constructor( private commonUtilityService: CommonUtilityService) {
    this.locationData = new LocationData
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

  useUserLocation(){

  }

  chooseOnMap(){

  }

  chooseRadiusOnMap(){

  }

  saveLocation(){

  }

  leavePage(){
    
  }

  onToggleChangeActiveWildfires(event:any, pushNotifications:boolean){
    if(pushNotifications){
      //Push notifications
    } else{
      //In-App notifications
    }
  }

  onToggleChangeFireBans(event:any, pushNotifications:boolean){
    if(pushNotifications){
      //Push notifications
    } else{
      //In-App notifications
    }
  }

}
