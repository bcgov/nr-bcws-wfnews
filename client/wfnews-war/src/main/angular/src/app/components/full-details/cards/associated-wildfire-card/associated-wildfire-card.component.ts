import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CircleIconButtonStyle } from '@app/components/common/circle-icon-button/circle-icon-button.component';
import { IconInfoChipStyle } from '@app/components/common/icon-info-chip/icon-info-chip.component';
import { SimpleIncident } from '@app/services/published-incident-service';
import { convertToDateYear, getStageOfControlIconPath, getStageOfControlLabel } from '@app/utils';
import { getStageOfControlIcon } from '../../../../utils/index';

@Component({
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
  getStageOfControlIcon = getStageOfControlIcon;
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
  getStageOfControlIconPath = () => getStageOfControlIconPath(this.incident?.stageOfControlCode);

  getDiscoveryDate = () => 'Discovered on ' + convertToDateYear(this.incident?.discoveryDate);

  getIncidentName = () => this.incident?.incidentName;

  getFireCenter = () => this.incident?.fireCentreName || 'Unknown';

  toggleBookmark = () => {
    this.isBookmarked = !this.isBookmarked;
    this.bookmarkClicked.emit(this.isBookmarked);
  };

  viewDetails = () => this.viewDetailsClicked.emit();

}
