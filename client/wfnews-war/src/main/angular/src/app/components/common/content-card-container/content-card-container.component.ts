import { Component, Input } from '@angular/core';

@Component({
  selector: 'content-card-container',
  templateUrl: './content-card-container.component.html',
  styleUrls: ['./content-card-container.component.scss']
})
export class ContentCardContainerComponent {
  @Input() backgroundColor?: string;
}
