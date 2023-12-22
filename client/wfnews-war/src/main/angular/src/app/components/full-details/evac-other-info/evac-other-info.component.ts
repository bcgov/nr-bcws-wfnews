import { Component } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';
import { openLink } from '@app/utils';

@Component({
  selector: 'wfnews-evac-other-info',
  templateUrl: './evac-other-info.component.html',
  styleUrls: ['./evac-other-info.component.scss'],
})
export class EvacOtherInfoComponent {
  openLink = openLink;

  constructor(private appConfigService: AppConfigService) {}

  bcwsFacebook() {
    window.open(
      this.appConfigService.getConfig().externalAppConfig['contactInformation'][
        'socialMedia'
      ]['facebook'] as unknown as string,
      '_blank',
    );
  }

  bcwsTwitter() {
    window.open(
      this.appConfigService.getConfig().externalAppConfig['contactInformation'][
        'socialMedia'
      ]['twitter'] as unknown as string,
      '_blank',
    );
  }
}
