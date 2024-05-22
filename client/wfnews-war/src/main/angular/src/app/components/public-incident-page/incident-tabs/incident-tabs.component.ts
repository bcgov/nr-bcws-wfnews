import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-incident-tabs',
  templateUrl: './incident-tabs.component.html',
  styleUrls: ['./incident-tabs.component.scss']
})
export class IncidentTabsComponent {
  @Input() incident: any;
  @Input() evacOrders: any[];
  @Input() areaRestrictions: any[];
  @Input() showImageWarning: boolean;
  @Input() showMapsWarning: boolean;
  
  @Output() tabChange = new EventEmitter<MatTabChangeEvent>();

  onTabChange(event: MatTabChangeEvent) {
    this.tabChange.emit(event);
  }
}