import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() selectedTabIndex = 0;
  
  @Output() tabChange = new EventEmitter<MatTabChangeEvent>();

  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index;
    this.tabChange.emit(event);
  }

  handleTabChange(tabIndex) {
    this.selectedTabIndex = tabIndex;
  } 
}
