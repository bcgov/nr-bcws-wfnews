import { Component, Input } from '@angular/core';
import { convertToMobileFormat, convertToYoutubeId } from '../../../../utils';

@Component({
  selector: 'video-panel',
  templateUrl: './video-panel.component.html',
  styleUrls: ['./video-panel.component.scss'],
})
export class VideoPanelComponent {
  @Input() public item;
  convertToMobileFormat = convertToMobileFormat;
  convertToYoutubeId = convertToYoutubeId;
}
