import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CapacitorService } from '@app/services/capacitor-service';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';


@Component({
  selector: 'wfnews-dialog-location',
  templateUrl: './dialog-location.component.html',
  styleUrls: ['./dialog-location.component.scss']
})
export class DialogLocationComponent {
  constructor(private dialogRef: MatDialogRef<DialogLocationComponent>, private capacitorService: CapacitorService) { }

  closeDialog() {
    this.dialogRef.close();
  }
  
  async goToSetting() {
    let device = (await this.capacitorService.checkDeviceSystem())
    if (device.operatingSystem === 'ios') {
      NativeSettings.openIOS({
        option: IOSSettings.App,
      });

    }
    else if (device.operatingSystem === 'android') {
      NativeSettings.openAndroid({
        option: AndroidSettings.ApplicationDetails,
      });
    }
    this.dialogRef.close()
  }
}
