import { Component, Input } from '@angular/core';

@Component({
  selector: 'icon-list-item',
  templateUrl: './icon-list-item.component.html',
  styleUrls: ['./icon-list-item.component.scss']
})
export class IconListItemComponent {

  @Input() iconPath: string;
  @Input() text: string;
  @Input() link?: string;
  @Input() gapSize?: number;
  @Input() iconSize?: number;

  directToLink() {
    if (this.link) {
      window.open(this.link, '_blank');
    }
  }
}
