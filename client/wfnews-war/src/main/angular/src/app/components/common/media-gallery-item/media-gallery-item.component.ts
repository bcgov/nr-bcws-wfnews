import { Component, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { YouTubeService } from '../../../services/youtube-service';

@Component({
  selector: 'media-gallery-item',
  templateUrl: './media-gallery-item.component.html',
  styleUrls: ['./media-gallery-item.component.scss']
})
export class MediaGalleryItemComponent {
  @Input() item: MediaGalleryItem;
  @Input() index: number;
  @Input() errorFunction: (item: MediaGalleryItem, index: number) => void;

  constructor(private YouTubeService: YouTubeService) {}

  handleError = () => {
    this.errorFunction(this.item, this.index);
  };

  bypassUrlSecurity(url: string): SafeResourceUrl {
    return this.YouTubeService.sanitizeYoutubeUrl(url);
  }
}

export interface MediaGalleryItem {
  title: string;
  uploadedDate: string;
  fileName?: string;
  type: string;
  href: string | SafeResourceUrl;
  thumbnail?: string;
  loaded?: boolean;
};
