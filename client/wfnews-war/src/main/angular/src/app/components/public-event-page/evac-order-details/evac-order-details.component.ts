import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconButtonArgs } from '@app/components/common/icon-button/icon-button.component';
import { SimpleIncident } from '@app/services/published-incident-service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'evac-order-details',
  templateUrl: './evac-order-details.component.html',
  styleUrls: ['./evac-order-details.component.scss']
})
export class EvacOrderDetailsComponent {
  @Input() incident: SimpleIncident;
  @Input() isBookmarked: boolean;

  @Output() bookmarkClicked = new EventEmitter<boolean>();
  @Output() viewDetailsClicked = new EventEmitter<void>();

  advisorySectionComponentStyle = {
    backgroundColor: '#FFF5F6',
    dividerColor: '#E7DADA',
    iconCircleColor: '#FDCECE',
    outerBorderColor: '#F2D3D3'
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
    clickHandler: () => {
      window.open('https://www.emergencyinfobc.gov.bc.ca/');
    }
  };

  handleBookmarkClicked = ($event) => {
    this.bookmarkClicked.emit($event);
  };

  handleViewDetailsClicked = () => {
    this.viewDetailsClicked.emit();
  };
}
