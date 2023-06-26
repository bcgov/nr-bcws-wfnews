import { Component, ChangeDetectionStrategy, Input } from "@angular/core";


@Component({
  selector: 'incident-gallery-panel-mobile',
  templateUrl: './incident-gallery-panel-mobile.component.html',
  styleUrls: ['./incident-gallery-panel-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentGalleryPanelMobileComponent  {
  @Input() public incident;
  
}
