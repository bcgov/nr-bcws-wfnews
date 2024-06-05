import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconButtonArgs } from '@app/components/common/icon-button/icon-button.component';
import { SimpleIncident } from '@app/services/published-incident-service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'evac-alert-details',
  templateUrl: './evac-alert-details.component.html',
  styleUrls: ['./evac-alert-details.component.scss']
})
export class EvacAlertDetailsComponent {
  @Input() incident: SimpleIncident;
  @Input() isBookmarked: boolean;

  @Output() bookmarkClicked = new EventEmitter<boolean>();
  @Output() viewDetailsClicked = new EventEmitter<void>();

  advisorySectionComponentStyle = {
    backgroundColor: '#FFFAEB',
    dividerColor: '#EEE8D3',
    iconCircleColor: '#FEEFBE',
    outerBorderColor: '#F5E8BA'
  };
  advisorySectionButtonArgs: IconButtonArgs = {
    label: 'Evacuation Information',
    iconPath: '/assets/images/svg-icons/link.svg',
    componentStyle: {
      backgroundColor: '#8F7100',
      labelColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      border: 'none'
    },
    clickHandler: () => {
      window.open('https://www.emergencyinfobc.gov.bc.ca/', '_blank');
    }
  };

  handleBookmarkClicked = ($event) => {
    this.bookmarkClicked.emit($event);
  };

  handleViewDetailsClicked = () => {
    this.viewDetailsClicked.emit();
  };
}
