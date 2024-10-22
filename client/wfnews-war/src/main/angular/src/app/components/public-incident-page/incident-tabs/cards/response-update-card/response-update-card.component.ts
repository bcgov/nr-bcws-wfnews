import { AfterContentChecked, ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'response-update-card',
  templateUrl: './response-update-card.component.html',
  styleUrls: ['./response-update-card.component.scss']
})
export class ResponseUpdateCardComponent implements AfterContentChecked {
  @Input() updateDate?: string;

  @ViewChild('responseUpdateContent') contentElementRef: ElementRef;

  useColumns: boolean;

  columnTrigger = 2;
  columnSize = 24;
  heightThreshold = 200;


  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterContentChecked() {
    if (this.useColumns) {
      return;
    }
    const size = this.contentElementRef?.nativeElement?.offsetHeight;
    this.useColumns = size > this.heightThreshold;
    this.cdr.detectChanges();
  }  
}
