import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'download-item',
  templateUrl: './download-item.component.html',
  styleUrls: ['./download-item.component.scss']
})
export class DownloadItemComponent {

  @Input() iconPath: string;
  @Input() fileName: string;
  @Input() date: string;
  @Input() linkUrl: string;
  @Output() downloadClicked = new EventEmitter<DownloadItem>(); 

  clickHandler = () => {
    this.downloadClicked.emit({
      fileName: this.fileName, 
      date: this.date,
      linkUrl: this.linkUrl
    });
  };
}

export interface DownloadItem {
  fileName: string;
  date: string;
  linkUrl: string;
};
