import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { YouTubeService } from '@app/services/youtube-service';

@Component({
  selector: 'primary-media-card',
  templateUrl: './primary-media-card.component.html',
  styleUrls: ['./primary-media-card.component.scss']
})
export class PrimaryMediaCardComponent {
  @Input() item: PrimaryMediaItem;
  @Input() showPreviewWarning: boolean;
  @Output() openAllPhotosClicked = new EventEmitter<void>();
  @Output() imageError = new EventEmitter<string>();

  constructor(private youTubeService: YouTubeService) {}

  handleImageError = () => {
    this.imageError.emit(this.item.href);
  };

  openAllPhotos = () => {
    this.openAllPhotosClicked.emit();
  };

  bypassUrlSecurity(url): SafeResourceUrl {
    if (typeof url === 'string') {
      return this.youTubeService.sanitizeYoutubeUrl(url);
    }
    return url;
  }
}

export interface PrimaryMediaItem {
  title: string;
  uploadedDate: string;
  fileName: string;
  type: string;
  href: string;
  thumbnailUrl?: string;
};
