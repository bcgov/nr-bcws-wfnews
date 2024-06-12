import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BeforeSlideDetail, InitDetail } from 'lightgallery/lg-events';
import { LightGallery } from 'lightgallery/lightgallery';
import lgFullscreen from 'lightgallery/plugins/fullscreen';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import { MediaGalleryItem } from '../media-gallery-item/media-gallery-item.component';

@Component({
  selector: 'media-gallery-container',
  templateUrl: './media-gallery-container.component.html',
  styleUrls: ['./media-gallery-container.component.scss']
})
export class MediaGalleryContainerComponent implements OnInit {
  @Input() items: MediaGalleryItem[] = [];
  @Output() filterSelected = new EventEmitter<string>();
  @Output() loadMoreClicked = new EventEmitter<void>();

  options = [
    { value: 'all', label: 'Images and videos' },
    { value: 'images', label: 'Images' },
    { value: 'videos', label: 'Videos' },
  ];

  settings = {
    counter: true,
    plugins: [lgZoom, lgFullscreen, lgThumbnail],
    download: true,
    showZoomInOutIcons: true,
    fullScreen: true,
    actualSize: true,
    thumbnail: true,
  };

  private lightGallery!: LightGallery;

  constructor() {}

  ngOnInit(): void {
    
  }

  onInit = (detail: InitDetail): void => {
    this.lightGallery = detail.instance;
  };

  onBeforeSlide = (detail: BeforeSlideDetail): void => {
    // unused
  };

  loadMore() {
    this.loadMoreClicked.emit();
  }

  filterApplied(filter: string) {
    this.filterSelected.emit(filter);
  }
}
