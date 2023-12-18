import { Component, Input } from '@angular/core';

@Component({
  selector: 'incident-gallery-images-mobile',
  templateUrl: './incident-gallery-images-mobile.component.html',
  styleUrls: ['./incident-gallery-images-mobile.component.scss'],
})
export class IncidentGalleryImagesMobileComponent {
  @Input() public incident;
  @Input() public displayImagesStub;
  @Input() public displayLoadMoreImages;
  @Input() public allImagesStub;

  get displayImages() {
    return this.displayImagesStub;
  }

  loadMoreImages(e: HTMLElement) {
    this.displayImagesStub = this.allImagesStub;
    e.remove();
  }
}
