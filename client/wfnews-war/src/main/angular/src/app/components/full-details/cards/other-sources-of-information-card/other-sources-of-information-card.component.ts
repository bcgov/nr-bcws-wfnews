import { Component } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'other-sources-of-information-card',
  templateUrl: './other-sources-of-information-card.component.html',
  styleUrls: ['./other-sources-of-information-card.component.scss']
})
export class OtherSourcesWhenYouLeaveCardComponent {
  downloadPdfUrl = this.appConfigService.getConfig().externalAppConfig['downloadPdfUrl'].toString();
  preparedBCUrl = this.appConfigService.getConfig().externalAppConfig['preparedBcGuidanceUrl'].toString();

  constructor(private appConfigService: AppConfigService) {}
}
