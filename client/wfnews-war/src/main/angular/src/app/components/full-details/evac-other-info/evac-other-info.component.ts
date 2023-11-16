import { Component } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'wfnews-evac-other-info',
  templateUrl: './evac-other-info.component.html',
  styleUrls: ['./evac-other-info.component.scss']
})
export class EvacOtherInfoComponent {

  constructor(private appConfigService: AppConfigService) {

  }

  wildfirePreparedness() {
    window.open(this.appConfigService.getConfig().externalAppConfig['wildfirePreparednessUrl'] as unknown as string, '_blank')
  }

  preparedBC() {
    window.open(this.appConfigService.getConfig().externalAppConfig['preparedBCUrl'] as unknown as string, '_blank')
  }

  preparedBCFacebook() {
    window.open(this.appConfigService.getConfig().externalAppConfig['preparedBCFacebook'] as unknown as string, '_blank')
  }

  preparedBCTwitter() {
    window.open(this.appConfigService.getConfig().externalAppConfig['preparedBCTwitter'] as unknown as string, '_blank')
  }

  embcWebsite() {
    window.open(this.appConfigService.getConfig().externalAppConfig['embcUrl'] as unknown as string, '_blank')
  }

  embcTwitter() {
    window.open(this.appConfigService.getConfig().externalAppConfig['embcTwitter'] as unknown as string, '_blank')
  }

  bcwsFacebook() {
    window.open(this.appConfigService.getConfig().externalAppConfig['contactInformation']['socialMedia']['facebook'] as unknown as string, '_blank')
  }

  bcwsTwitter() {
    window.open(this.appConfigService.getConfig().externalAppConfig['contactInformation']['socialMedia']['twitter'] as unknown as string, '_blank')
  }

  evacGuidance() {
    window.open(this.appConfigService.getConfig().externalAppConfig['evacGuidanceUrl'] as unknown as string, '_blank')
  }

  localGov() {
    window.open(this.appConfigService.getConfig().externalAppConfig['localGovUrl'] as unknown as string, '_blank')
  }

  emergencyAlerts() {
    window.open(this.appConfigService.getConfig().externalAppConfig['emergencyAlertUrl'] as unknown as string, '_blank')
  }

}
