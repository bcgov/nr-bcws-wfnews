import { Component } from '@angular/core';
import { RelatedTopicsLink } from '@app/components/full-details/cards/related-topics-card/related-topics-card.component';
import { EXTERNAL_LINKS } from '@app/constants';  

@Component({
  selector: 'fire-danger-details',
  templateUrl: './fire-danger-details.component.html',
  styleUrls: ['./fire-danger-details.component.scss']
})
export class FireDangerDetailsComponent {

  relatedTopicLinks: RelatedTopicsLink[] = [
    {
      text: 'Fire Danger Rating',
      url: EXTERNAL_LINKS.FIRE_DANGER
    },
    {
      text: 'Current Fire Bans and Restrictions',
      url: EXTERNAL_LINKS.BANS_RESTRICTIONS
    },
    {
      text: 'Fire Danger Class',
      url: 'https://wfapps.nrs.gov.bc.ca/pub/wfwx-danger-summary-war/dangerSummary'
    },
    {
      text: 'High Risk Activities',
      url: EXTERNAL_LINKS.HIGH_RISK_ACTVITIES
    },
  ];
}
