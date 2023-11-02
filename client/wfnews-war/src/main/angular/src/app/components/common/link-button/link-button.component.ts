import { Component, Input } from '@angular/core';

@Component({
  selector: 'link-button',
  templateUrl: './link-button.component.html',
  styleUrls: ['./link-button.component.scss']
})
export class LinkButtonComponent {
  @Input() text: string;
  @Input() subtext: string;
  @Input() link: string;
}
