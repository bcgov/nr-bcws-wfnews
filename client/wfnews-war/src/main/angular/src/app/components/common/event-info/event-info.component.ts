import { Component, EventEmitter, Input, Output } from '@angular/core';
import { convertToDateYear, getStageOfControlLabel } from '@app/utils';
import { CircleIconButtonStyle } from '../circle-icon-button/circle-icon-button.component';

@Component({
  selector: 'event-info',
  templateUrl: './event-info.component.html',
  styleUrls: ['./event-info.component.scss']
})
export class EventInfoComponent {
  @Input() headerIconPath: string;
  @Input() headerText: string;

  @Input() fireCentreText?: string;
  @Input() issueDateText?: string;
  @Input() issueAuthorityText?: string;

  @Input() componentStyle: EventInfoComponentStyle;

  @Output() viewDetailsClicked = new EventEmitter<void>();

  getStageOfControlLabel = getStageOfControlLabel;
  convertToDateYear = convertToDateYear;

  viewDetails = () => this.viewDetailsClicked.emit();
}

export interface EventInfoComponentStyle {
  backgroundColor: string;
  dividerColor: string;
  border: string;
  circleButtonStyle: CircleIconButtonStyle;
};
