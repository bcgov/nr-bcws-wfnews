import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DownloadItem } from '../download-item/download-item.component';

@Component({
  selector: 'download-items-container',
  templateUrl: './download-items-container.component.html',
  styleUrls: ['./download-items-container.component.scss']
})
export class DownloadItemsContainerComponent {
  @Input() headerText: string;
  @Input() emptyStateText: string;
  @Input() warningText: string;
  @Input() files: DownloadItem[];
  @Input() iconPath: string;
  @Input() showWarning: boolean;
  @Output() downloadClicked = new EventEmitter<DownloadItem>();

  forwardDownloadClick = ($event) => {
    this.downloadClicked.emit($event);
  };
}
