import { Component, Input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'icon-list-item',
  templateUrl: './icon-list-item.component.html',
  styleUrls: ['./icon-list-item.component.scss']
})
export class IconListItemComponent {

  @Input() iconPath: string;
  @Input() text: string;
  @Input() link?: string;
  @Input() slim?: boolean;

  directToLink() {
    if (this.link) {
      window.open(this.link);
    }
  }
}
