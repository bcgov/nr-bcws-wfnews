import { Component, Input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'related-topics-card',
  templateUrl: './related-topics-card.component.html',
  styleUrls: ['./related-topics-card.component.scss']
})
export class RelatedTopicsCardComponent {
  @Input() links?: RelatedTopicsLink[];
}

export interface RelatedTopicsLink {
  text: string;
  url: string;
}
