import { Component, Input } from '@angular/core';
import { YouTubeService } from '@app/services/youtube-service';
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

  constructor(private youtubeService: YouTubeService) { }

  getSafeUrl(url: string) {
    return this.youtubeService.sanitizeYoutubeUrl(url);
  }
}
