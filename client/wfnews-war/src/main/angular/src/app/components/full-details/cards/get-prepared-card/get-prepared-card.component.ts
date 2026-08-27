import { Component } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'get-prepared-card',
  templateUrl: './get-prepared-card.component.html',
  styleUrls: ['./get-prepared-card.component.scss']
})
export class GetPreparedCardComponent {

  constructor(private appConfigService: AppConfigService) {}

  directToBuildKit() {
    window.open(this.appConfigService.getConfig().externalAppConfig['emergencyKitUrl'].toString(), '_blank');
  }

  directToDownloadPdf() {
    window.open(this.appConfigService.getConfig().externalAppConfig['downloadPdfUrl'].toString(), '_blank');
  }
}
