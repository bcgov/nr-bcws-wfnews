import { Component, Input } from '@angular/core';
import { ProcessedPost } from '../../highlights-widget/highlights-widget.component';

@Component({
  selector: 'highlights-card',
  templateUrl: './highlights-card.component.html',
  styleUrls: ['./highlights-card.component.scss']
})
export class HighlightsCardComponent {
  @Input() posts: ProcessedPost[]

  openLink(link: string){
    if (link) {
      window.open(link, '_blank');
    } 
  }

}
