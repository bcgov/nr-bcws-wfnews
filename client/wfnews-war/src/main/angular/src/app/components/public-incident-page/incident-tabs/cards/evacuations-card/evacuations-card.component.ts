import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { EvacOrderOption } from '@app/conversion/models';
import { eventInfoAlertStyle, eventInfoOrderStyle } from '../../../../common/event-info/event-info.component';

@Component({
  selector: 'evacuations-card',
  templateUrl: './evacuations-card.component.html',
  styleUrls: ['./evacuations-card.component.scss']
})
export class EvacuationsCardComponent implements AfterViewInit {
  @Input() evacuations: EvacOrderOption[] = [];
  @Input() incident;
  @Output() viewDetailsClicked = new EventEmitter<any>();

  orders = [];
  alerts = [];

  eventInfoAlertStyle = eventInfoAlertStyle;
  eventInfoOrderStyle = eventInfoOrderStyle;

  ngAfterViewInit() {
    this.orders = this.evacuations.filter(evacuation => evacuation.orderAlertStatus.toLowerCase() === 'order');
    this.alerts = this.evacuations.filter(evacuation => evacuation.orderAlertStatus.toLowerCase() === 'alert');
  }

  handleButtonClick = (evacuation) => {
    this.viewDetailsClicked.emit(evacuation);
  };
}
