import { Component, Input } from '@angular/core';

@Component({
  selector: 'incident-gallery-all-media-mobile',
  templateUrl: './incident-gallery-all-media-mobile.component.html',
  styleUrls: ['./incident-gallery-all-media-mobile.component.scss'],
})
export class IncidentGalleryAllMediaMobileComponent {
  @Input() public incident;
  @Input() public displayMediaStub;
  @Input() public allImagesAndVideosStub;
  @Input() public displayLoadMore;

  get displayVideosAndImages() {
    return this.displayMediaStub;
  }

  loadMoreMedia(e: HTMLElement) {
    this.displayMediaStub = this.allImagesAndVideosStub;
    e.remove();
  }
}
