import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class MediaGalleryItemComponent implements OnChanges {
  @Input() item: MediaGalleryItem;
  @Input() index: number;
  @Input() errorFunction: (item: MediaGalleryItem, index: number) => void;

  safeUrl: SafeResourceUrl;

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

  constructor(private youTubeService: YouTubeService) { }

  ngOnInit(): void {
    this.sanitize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.item) {
      this.sanitize();
    }
  }

  sanitize() {
    if (this.item && this.item.type === 'video') {
      if (typeof this.item.href === 'string') {
        this.safeUrl = this.youTubeService.sanitizeYoutubeUrl(this.item.href);
      } else {
        this.safeUrl = this.item.href;
      }
    }
  }

  onInit = (detail: InitDetail): void => {
    this.lightGallery = detail.instance;
  };

  handleError = () => {
    this.errorFunction(this.item, this.index);
  };
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
