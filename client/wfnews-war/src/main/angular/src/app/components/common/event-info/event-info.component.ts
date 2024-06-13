import { Component, EventEmitter, Output } from '@angular/core';
import { convertToDateYear, getStageOfControlLabel } from '@app/utils';
import { CircleIconButtonStyle } from '../circle-icon-button/circle-icon-button.component';

@Component({
  selector: 'event-info',
  templateUrl: './event-info.component.html',
  styleUrls: ['./event-info.component.scss']
})
export class EventInfoComponent {

  @Output() viewDetailsClicked = new EventEmitter<void>();

  circleButtonStyle: CircleIconButtonStyle = {
    backgroundColor: '#EEE',
    iconColor: '#666666',
    border: 'none'
  };

  getStageOfControlLabel = getStageOfControlLabel;
  convertToDateYear = convertToDateYear;

  viewDetails = () => this.viewDetailsClicked.emit();
}
