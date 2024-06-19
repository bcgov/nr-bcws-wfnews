import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AreaRestrictionsOption } from '@app/conversion/models';
import { convertToDateYear } from '@app/utils';
import { eventInfoAreaRestrictionStyle } from '../../../../common/event-info/event-info.component';

@Component({
  selector: 'area-restrictions-card',
  templateUrl: './area-restrictions-card.component.html',
  styleUrls: ['./area-restrictions-card.component.scss']
})
export class AreaRestrictionsCardComponent {
  @Input() areaRestrictions: AreaRestrictionsOption[] = [];
  @Input() showPreviewWarning: boolean;
  @Output() viewDetailsClicked = new EventEmitter<any>();

  eventInfoAreaRestrictionStyle = eventInfoAreaRestrictionStyle;
  convertToDateYear = convertToDateYear;

  handleButtonClick = (evacuation) => {
    this.viewDetailsClicked.emit(evacuation);
  };
}
