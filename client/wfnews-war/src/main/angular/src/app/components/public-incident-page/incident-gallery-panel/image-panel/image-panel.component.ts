import { Component, Input } from '@angular/core';
import { convertToMobileFormat } from '../../../../utils';

@Component({
  selector: 'image-panel',
  templateUrl: './image-panel.component.html',
  styleUrls: ['./image-panel.component.scss'],
})
export class ImagePanelComponent {
  @Input() public item;
  @Input() public settings;
  @Input() public onBeforeSlide;
  @Input() public onInit;
  @Input() public i;
  convertToMobileFormat = convertToMobileFormat;
}
