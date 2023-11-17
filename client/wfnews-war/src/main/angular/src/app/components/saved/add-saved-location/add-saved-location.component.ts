import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogExitComponent } from '@app/components/report-of-fire/dialog-exit/dialog-exit.component';
import { DialogLocationComponent } from '@app/components/report-of-fire/dialog-location/dialog-location.component';
import { notificatinoMapComponent } from '@app/components/saved/add-saved-location/notificatnio-map/notification-map.component';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { PlaceData } from '@app/services/wfnews-map.service/place-data';
import { ResourcesRoutes } from '@app/utils';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'wfnews-add-saved-location',
  templateUrl: './add-saved-location.component.html',
  styleUrls: ['./add-saved-location.component.scss']
})
export class AddSavedLocationComponent implements OnInit{
  searchText = undefined;
  public filteredOptions = [];
  private sortedAddressList: string[] = [];
  public locationData = new LocationData;
  private placeData: PlaceData;
  currentLocation: any;



  public searchByLocationControl = new UntypedFormControl

  constructor( private commonUtilityService: CommonUtilityService,protected dialog: MatDialog, private router: Router, private cdr: ChangeDetectorRef,
    ) {
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


  ngOnInit(): void {
    this.useMyCurrentLocation()
  }

  async useMyCurrentLocation() {
    this.currentLocation = await this.commonUtilityService.getCurrentLocationPromise()
  }

  onLocationSelected(selectedOption) {
    const locationControlValue = selectedOption.address ? selectedOption.address : selectedOption.localityName;
    this.searchByLocationControl.setValue(locationControlValue.trim(), { onlySelf: true, emitEvent: false });

    this.locationData.latitude = selectedOption.loc[1]
    this.locationData.longitude = selectedOption.loc[0]
    this.locationData.searchText = this.searchText
  }

  async useUserLocation () {

    this.commonUtilityService.checkLocationServiceStatus().then(async (enabled) => {
      if (!enabled) {
        let dialogRef = this.dialog.open(DialogLocationComponent, {
          autoFocus: false,
          width: '80vw',
        });
      }else {
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
    });
    this.cdr.detectChanges()

  }

  chooseOnMap(){
    let dialogRef = this.dialog.open(notificatinoMapComponent, {
      autoFocus: false,
      minWidth: '100vw',
      height: '100vh',
      data:{
        currentLocation: this.currentLocation
      }
    });

  }

  chooseRadiusOnMap(){

  }

  saveLocation(){

  }

  leavePage(){
    let dialogRef = this.dialog.open(DialogExitComponent, {
      autoFocus: false,
      width: '80vw',
      data: {
        confirmButton: 'Back',
        text: 'If you exit now, your progress will be lost.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result['exit']) {
        this.router.navigateByUrl('/saved')
      }
    });
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
