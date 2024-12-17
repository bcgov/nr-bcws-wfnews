import { Component, Input } from '@angular/core';
import { ProcessedPost } from '../../highlights-widget/highlights-widget.component';
import { snowPlowHelper } from '@app/utils';
import { Router } from '@angular/router';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'highlights-card',
  templateUrl: './highlights-card.component.html',
  styleUrls: ['./highlights-card.component.scss']
})
export class HighlightsCardComponent {
  @Input() post: ProcessedPost;
  public snowPlowHelper = snowPlowHelper;

  constructor(
    private appConfigService: AppConfigService,
    private currentRouter: Router
  ){
    
  }

  openLink(link: string){
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.currentRouter.url.slice(1);

    this.snowPlowHelper(url, {
      action: 'highlights_card_click',
      text: 'Navigate to Highlight Link'
    });

    if (link) {
      window.open(link, '_blank');
    } 
  }

}
