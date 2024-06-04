import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CircleIconButtonStyle } from '@app/components/common/circle-icon-button/circle-icon-button.component';
import { IconInfoChipStyle } from '@app/components/common/icon-info-chip/icon-info-chip.component';
import { STAGE_OF_CONTROL_CODES } from '@app/constants';
import { SimpleIncident } from '@app/services/published-incident-service';
import { convertToDateYear, getStageOfControlLabel } from '@app/utils';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'associated-wildfire-card',
  templateUrl: './associated-wildfire-card.component.html',
  styleUrls: ['./associated-wildfire-card.component.scss']
})
export class AssociatedWildfireCardComponent {

  @Input() incident: SimpleIncident;
  @Input() isBookmarked: boolean;

  @Output() bookmarkClicked = new EventEmitter<boolean>();
  @Output() viewDetailsClicked = new EventEmitter<void>();

  getStageOfControlLabel = getStageOfControlLabel;
  convertToDateYear = convertToDateYear;

  wildfireOfNoteChipStyle: IconInfoChipStyle = {
    backgroundColor: '#FFFFFF',
    labelColor: '#98273B',
    border: '1px solid #AA1D3E',
    slim: true,
    overrideIconMask: true
  };

  circleButtonStyle: CircleIconButtonStyle = {
    backgroundColor: '#EEE',
    iconColor: '#666666',
    border: 'none'
  };

  getBookmarkIconPath = () => this.isBookmarked ? 'assets/images/svg-icons/bookmark-blue.svg' : 'assets/images/svg-icons/bookmark.svg';

  getStageOfControlLabelText = () => getStageOfControlLabel(this.incident?.stageOfControlCode);

  getStageOfControlIconPath = () => {
    const directory = 'assets/images/svg-icons/';
    switch (this.incident?.stageOfControlCode?.toUpperCase()?.trim()) {
      case STAGE_OF_CONTROL_CODES.OUT:
        return directory + 'out-fire.svg';
      case STAGE_OF_CONTROL_CODES.OUT_OF_CONTROL:
        return directory + 'out-of-control.svg';
      case STAGE_OF_CONTROL_CODES.BEING_HELD:
        return directory + 'being-held.svg';
      case STAGE_OF_CONTROL_CODES.UNDER_CONTROL:
        return directory + 'under-control.svg';
      default:
        return directory + 'question.svg';
    };
  };

  getDiscoveryDate = () => 'Discovered on ' + convertToDateYear(this.incident?.discoveryDate);

  getIncidentName = () => this.incident?.incidentName?.replace('Fire', '').trim() + ' Wildfire';

  getFireCenter = () => this.incident?.fireCentreName || 'Unknown';

  toggleBookmark = () => {
    this.isBookmarked = !this.isBookmarked;
    this.bookmarkClicked.emit(this.isBookmarked);
  };

  viewDetails = () => this.viewDetailsClicked.emit();

}
