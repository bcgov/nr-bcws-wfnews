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

export const eventInfoAlertStyle: EventInfoComponentStyle = {
  backgroundColor: '#FCF3D4',
  dividerColor: '#FBE3E3',
  border: '2px solid #F3D999',
  circleButtonStyle: {
    backgroundColor: '#F2E8C4',
    border: 'none',
    iconColor: '#906E1B',
  }
};

export const eventInfoOrderStyle: EventInfoComponentStyle = {
  backgroundColor: '#FEF1F2',
  border: '2px solid #F4CFCF',
  dividerColor: '#EEE5C6',
  circleButtonStyle: {
    backgroundColor: '#FBE3E3',
    border: 'none',
    iconColor: '#852A2D',
  }
};

export const eventInfoAreaRestrictionStyle: EventInfoComponentStyle = {
  backgroundColor: '#F5F5F5',
  border: '2px solid #C4C4C4',
  dividerColor: '#DDD',
  circleButtonStyle: {
    backgroundColor: '#EEEEEE',
    border: 'none',
  }
};
