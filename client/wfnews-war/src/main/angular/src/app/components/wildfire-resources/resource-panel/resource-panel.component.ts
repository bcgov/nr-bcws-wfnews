import { Component, Input } from '@angular/core';
import { ResourcePanel } from '../../../models/ResourcePanel';

@Component({
  selector: 'resource-panel',
  templateUrl: './resource-panel.component.html',
  styleUrls: [ './resource-panel.component.scss' ]
})
export class ResourcePanelComponent {
  @Input() panelInfo: ResourcePanel;
}
