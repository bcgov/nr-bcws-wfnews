import { Component } from '@angular/core';
import { RelatedTopicsLink } from '@app/components/full-details/cards/related-topics-card/related-topics-card.component';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'fire-danger-details',
  templateUrl: './fire-danger-details.component.html',
  styleUrls: ['./fire-danger-details.component.scss']
})
export class FireDangerDetailsComponent {

  relatedTopicLinks: RelatedTopicsLink[] = [
    {
      text: 'Fire Danger Rating',
      url: this.appConfigService.getConfig().externalAppConfig['fireDangerUrl'].toString()
    },
    {
      text: 'Current Fire Bans and Restrictions',
      url: this.appConfigService.getConfig().externalAppConfig['bansRestrictionsUrl'].toString()
    },
    {
      text: 'Fire Danger Class',
      url: 'https://wfapps.nrs.gov.bc.ca/pub/wfwx-danger-summary-war/dangerSummary'
    },
    {
      text: 'High Risk Activities',
      url: this.appConfigService.getConfig().externalAppConfig['highRiskActvitiesUrl'].toString()
    },
  ];

  constructor(private appConfigService: AppConfigService) {}
}
