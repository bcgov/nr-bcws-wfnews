import { Component, Input } from '@angular/core';
import { EXTERNAL_LINKS } from '@app/constants';

@Component({
  selector: 'related-topics-card',
  templateUrl: './related-topics-card.component.html',
  styleUrls: ['./related-topics-card.component.scss']
})
export class RelatedTopicsCardComponent {
  @Input() links?: RelatedTopicsLink[];
  evacueeGuidanceUrl = EXTERNAL_LINKS.EVACUEE_GUIDANCE;
  localGovSystemsurl = EXTERNAL_LINKS.LOCAL_GOVERNMENT_SYSTEMS;
  emargencyAlertsUrl = EXTERNAL_LINKS.EMERGENCY_ALERTS;
}

export interface RelatedTopicsLink {
  text: string;
  url: string;
}
