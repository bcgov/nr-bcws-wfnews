import { Component } from '@angular/core';
import { defaultSlimIconButtonStyle } from '@app/components/common/icon-button/icon-button.component';
import { defaultSlimButtonStyle } from '@app/components/common/wfnews-button/wfnews-button.component';
import { AppConfigService } from '@wf1/core-ui';


@Component({
  selector: 'get-prepared-card',
  templateUrl: './get-prepared-card.component.html',
  styleUrls: ['./get-prepared-card.component.scss']
})
export class GetPreparedCardComponent {

  defaultSlimButtonStyle = defaultSlimButtonStyle;
  defaultSlimIconButtonStyle = defaultSlimIconButtonStyle;

  constructor(private appConfigService: AppConfigService) {}

  directToBuildKit() {
    // eslint-disable-next-line max-len
    window.open(this.appConfigService.getConfig().externalAppConfig['emergencyKitUrl'].toString(), '_blank');
  }

  directToDownloadPdf() {
    window.open(this.appConfigService.getConfig().externalAppConfig['downloadPdfUrl'].toString(), '_blank');
  }
}
