import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AdvisorySectionStyle } from '@app/components/common/advisory-section/advisory-section.component';
import { IconButtonArgs } from '@app/components/common/icon-button/icon-button.component';
import { SimpleIncident } from '@app/services/published-incident-service';

@Component({
  selector: 'evac-alert-details',
  templateUrl: './evac-alert-details.component.html',
  styleUrls: ['./evac-alert-details.component.scss']
})
export class EvacAlertDetailsComponent {
  @Input() incident: SimpleIncident;
  @Input() isBookmarked: boolean;
  @Input() evacuation;

  @Output() bookmarkClicked = new EventEmitter<boolean>();
  @Output() viewDetailsClicked = new EventEmitter<void>();

  advisorySectionComponentStyle: AdvisorySectionStyle = {
    backgroundColor: '#FFFAEB',
    dividerColor: '#EEE8D3',
    outerBorderColor: '#F5E8BA',
    logo: {
      logoPath: '/assets/images/logo/emergency-info-bc.png',
      width: 174,
      height: 34
    },
    icon: {
      iconPath: '/assets/images/svg-icons/evacuation-alert.svg',
      iconCircleColor: '#FEEFBE',
    }
  };
  advisorySectionButtonArgs: IconButtonArgs = {
    label: 'Evacuation Information',
    iconPath: '/assets/images/svg-icons/link.svg',
    componentStyle: {
      backgroundColor: '#8F7100',
      labelColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      border: 'none'
    }
  };

  handleBookmarkClicked = ($event) => {
    this.bookmarkClicked.emit($event);
  };

  handleViewDetailsClicked = () => {
    this.viewDetailsClicked.emit();
  };

  handleAdvisoryClick = () => {
    window.open('https://www.emergencyinfobc.gov.bc.ca/', '_blank');
  };
}
