import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MediaGalleryItem } from '../media-gallery-item/media-gallery-item.component';

@Component({
  selector: 'media-gallery-container',
  templateUrl: './media-gallery-container.component.html',
  styleUrls: ['./media-gallery-container.component.scss']
})
export class MediaGalleryContainerComponent {
  @Input() items: MediaGalleryItem[] = [];
  @Input() isLoadMoreVisible: boolean;
  @Output() filterSelected = new EventEmitter<string>();
  @Output() loadMoreClicked = new EventEmitter<void>();

  options = [
    { value: 'all', label: 'Images and videos' },
    { value: 'images', label: 'Images' },
    { value: 'videos', label: 'Videos' },
  ];

  constructor() {}

  loadMore() {
    this.loadMoreClicked.emit();
  }

  filterApplied(filter: string) {
    this.filterSelected.emit(filter);
  }
}
