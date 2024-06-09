import { Component, Input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
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
}

export interface DownloadItem {
  fileName: string;
  date: string;
  linkUrl: string;
}
