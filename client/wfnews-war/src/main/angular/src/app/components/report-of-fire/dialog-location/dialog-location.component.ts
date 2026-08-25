import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CapacitorService } from '@app/services/capacitor-service';

/**
 * The answer to a tap that needs a position and cannot get one. A tap deserves a
 * modal reply. A screen that asks on its own uses a banner instead.
 */
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

  /** Two states, two settings pages, so two messages. Naming the wrong one sends the
   * user to a switch that is already on. */
  get servicesOff(): boolean {
    return this.capacitorService.locationPermission.value === 'services-off';
  }

  get title(): string {
    return this.servicesOff
      ? 'Your location services are turned off'
      : 'This app cannot use your location';
  }

  get message(): string {
    return this.servicesOff
      ? 'To use this feature, turn on location services in your device settings.'
      : 'To use this feature, give this app permission to use your location.';
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
    // The state picks the page: the app permission, or the phone location setting.
    await this.capacitorService.openLocationSettings(
      this.capacitorService.locationPermission.value,
    );
    this.dialogRef.close();
  }
}
