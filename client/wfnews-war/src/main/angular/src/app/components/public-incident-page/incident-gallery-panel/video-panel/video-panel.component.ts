import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { YouTubeService } from '@app/services/youtube-service';
import { convertToMobileFormat, convertToYoutubeId } from '../../../../utils';

@Component({
  selector: 'video-panel',
  templateUrl: './video-panel.component.html',
  styleUrls: ['./video-panel.component.scss'],
})
export class VideoPanelComponent implements OnInit, OnChanges {
  @Input() public item;
  convertToMobileFormat = convertToMobileFormat;
  convertToYoutubeId = convertToYoutubeId;
  safeUrl: SafeResourceUrl;

  constructor(private youtubeService: YouTubeService) { }

  ngOnInit(): void {
    this.sanitize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.item) {
      this.sanitize();
    }
  }

  sanitize() {
    if (this.item && this.item.href) {
      this.safeUrl = this.youtubeService.sanitizeYoutubeUrl(this.item.href);
    }
  }
}
