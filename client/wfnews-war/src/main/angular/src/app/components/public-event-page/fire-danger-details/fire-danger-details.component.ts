import { Component } from '@angular/core';
import { RelatedTopicsLink, dangerRatingRelatedTopics } from '@app/components/full-details/cards/related-topics-card/related-topics-card.component';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'fire-danger-details',
  templateUrl: './fire-danger-details.component.html',
  styleUrls: ['./fire-danger-details.component.scss']
})
export class FireDangerDetailsComponent {

  relatedTopicLinks: RelatedTopicsLink[] = dangerRatingRelatedTopics(this.appConfigService);

  constructor(private appConfigService: AppConfigService) {}
}
