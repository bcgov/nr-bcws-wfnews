import { Component, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { InitDetail } from 'lightgallery/lg-events';
import { LightGallery } from 'lightgallery/lightgallery';
import lgFullscreen from 'lightgallery/plugins/fullscreen';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
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

  settings = {
    counter: true,
    plugins: [lgZoom, lgFullscreen, lgThumbnail],
    download: true,
    fullScreen: true,
    actualSize: true,
    thumbnail: true,
    showZoomInOutIcons: true,
  };

  private lightGallery!: LightGallery;

  constructor(private youTubeService: YouTubeService) {}

  onInit = (detail: InitDetail): void => {
    this.lightGallery = detail.instance;
  };

  handleError = () => {
    this.errorFunction(this.item, this.index);
  };

  bypassUrlSecurity(url): SafeResourceUrl {
    if (typeof url === 'string') {
      return this.youTubeService.sanitizeYoutubeUrl(url);
    }
    return url;
  }
}

export interface MediaGalleryItem {
  title: string;
  uploadedDate: number;
  fileName?: string;
  type: string;
  href: string | SafeResourceUrl;
  thumbnail?: string;
  loaded?: boolean;
};
