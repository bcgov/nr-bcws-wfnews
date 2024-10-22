import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AdvisorySectionStyle } from '@app/components/common/advisory-section/advisory-section.component';
import { IconButtonArgs } from '@app/components/common/icon-button/icon-button.component';
import { SimpleIncident } from '@app/services/published-incident-service';

@Component({
  selector: 'evac-order-details',
  templateUrl: './evac-order-details.component.html',
  styleUrls: ['./evac-order-details.component.scss']
})
export class EvacOrderDetailsComponent {
  @Input() incident: SimpleIncident;
  @Input() isBookmarked: boolean;
  @Input() evacuation;

  @Output() bookmarkClicked = new EventEmitter<boolean>();
  @Output() viewDetailsClicked = new EventEmitter<void>();

  advisorySectionComponentStyle: AdvisorySectionStyle = {
    backgroundColor: '#FFF5F6',
    dividerColor: '#E7DADA',
    outerBorderColor: '#F2D3D3',
    logo: {
      logoPath: '/assets/images/logo/emergency-info-bc.png',
      width: 174,
      height: 34
    },
    icon: {
      iconPath: '/assets/images/svg-icons/evacuation-order.svg',
      iconCircleColor: '#FDCECE',
    }
  };
  advisorySectionButtonArgs: IconButtonArgs = {
    label: 'Evacuation Information',
    iconPath: '/assets/images/svg-icons/link.svg',
    componentStyle: {
      backgroundColor: '#B91D38',
      labelColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      border: 'none'
    },
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
