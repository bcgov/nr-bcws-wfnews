import { AfterViewInit, Component, Input } from '@angular/core';
import { getResponseTypeDescription } from '@app/utils';

@Component({
  selector: 'response-type-card',
  templateUrl: './response-type-card.component.html',
  styleUrls: ['./response-type-card.component.scss']
})
export class ResponseTypeCardComponent implements AfterViewInit {
  @Input() responseTypeCode: string;

  responseText= '';

  responseTypes = {
    full: 'FULL',
    modified: 'MODIFIED',
    monitored: 'MONITOR',
  };

  ngAfterViewInit(): void {
    this.responseText = getResponseTypeDescription(this.responseTypeCode);
  }

}
