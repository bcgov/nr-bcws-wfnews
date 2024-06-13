import { Component, Input } from '@angular/core';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'link-button',
  templateUrl: './link-button.component.html',
  styleUrls: ['./link-button.component.scss'],
})
export class LinkButtonComponent {
  @Input() text: string;
  @Input() subtext?: string;
  @Input() link: string;
  @Input() iconColor?: string;

  openLink = async () => {
    await Browser.open({ url: this.link });
  };
}
