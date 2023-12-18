import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CapacitorService } from '@app/services/capacitor-service';
import {
  AndroidSettings,
  IOSSettings,
  NativeSettings,
} from 'capacitor-native-settings';

@Component({
  selector: 'wfnews-dialog-location',
  templateUrl: './dialog-location.component.html',
  styleUrls: ['./dialog-location.component.scss'],
})
export class DialogLocationComponent {
  showSettingsButton = false;

  constructor(
    private dialogRef: MatDialogRef<DialogLocationComponent>,
    private capacitorService: CapacitorService,
  ) {
    this.checkOperatingSystem();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  async checkOperatingSystem() {
    const device = await this.capacitorService.checkDeviceSystem();
    this.showSettingsButton =
      (device.operatingSystem === 'ios' ||
        device.operatingSystem === 'android') &&
      device.platform !== 'web';
  }

  async goToSetting() {
    const device = await this.capacitorService.checkDeviceSystem();
    if (device.operatingSystem === 'ios') {
      NativeSettings.openIOS({
        option: IOSSettings.App,
      });
    } else if (device.operatingSystem === 'android') {
      NativeSettings.openAndroid({
        option: AndroidSettings.ApplicationDetails,
      });
    }
    this.dialogRef.close();
  }
}
