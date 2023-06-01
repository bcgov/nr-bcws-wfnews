import { Component, OnInit } from '@angular/core';
import { IncidentInfoPanel } from '../incident-info-panel/incident-info-panel.component';

@Component({
  selector: 'incident-info-panel-mobile',
  templateUrl: './incident-info-panel-mobile.component.html',
  styleUrls: ['./incident-info-panel-mobile.component.scss']
})
export class IncidentInfoPanelMobileComponent extends IncidentInfoPanel implements OnInit {

  ngOnInit(): void {
  }

}
