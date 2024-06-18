import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { YouTubeService } from '@app/services/youtube-service';
import { InitDetail } from 'lightgallery/lg-events';
import { LightGallery } from 'lightgallery/lightgallery';
import lgFullscreen from 'lightgallery/plugins/fullscreen';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

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

  index = 0;

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

  handleImageError = () => {
    this.imageError.emit(this.item.href);
  };

  openAllPhotos = () => {
    this.openAllPhotosClicked.emit();
  };

  bypassUrlSecurity(url: string): SafeResourceUrl {
    return this.youTubeService.sanitizeYoutubeUrl(url);
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
