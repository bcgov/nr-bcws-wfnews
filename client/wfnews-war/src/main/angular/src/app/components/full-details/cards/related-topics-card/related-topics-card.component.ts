import { Component, Input } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'related-topics-card',
  templateUrl: './related-topics-card.component.html',
  styleUrls: ['./related-topics-card.component.scss']
})
export class RelatedTopicsCardComponent {
  @Input() links?: RelatedTopicsLink[];
  evacueeGuidanceUrl = this.appConfigService.getConfig().externalAppConfig['evacueeGuidanceUrl'].toString();
  localGovSystemsurl = this.appConfigService.getConfig().externalAppConfig['localGovernmentSystemsUrl'].toString();
  emargencyAlertsUrl = this.appConfigService.getConfig().externalAppConfig['emergencyAlertsUrl'].toString();

  constructor(private appConfigService: AppConfigService) {}
}

export interface RelatedTopicsLink {
  text: string;
  url: string;
}
