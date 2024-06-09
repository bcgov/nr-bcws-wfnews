import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'download-item',
  templateUrl: './download-item.component.html',
  styleUrls: ['./download-item.component.scss']
})
export class DownloadItemComponent {

  @Input() iconPath: string;
  @Input() fileName: string;
  @Input() date: string;
  @Input() linkUrl: string;
  @Output() downloadClicked = new EventEmitter<void>(); 
}
