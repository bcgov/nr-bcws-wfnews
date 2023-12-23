import { Component, Input } from '@angular/core';

@Component({
  selector: 'incident-gallery-videos-mobile',
  templateUrl: './incident-gallery-videos-mobile.component.html',
  styleUrls: ['./incident-gallery-videos-mobile.component.scss'],
})
export class IncidentGalleryVideosMobileComponent {
  @Input() public incident;
  @Input() public displayVideosStub;
  @Input() public displayLoadMoreVideos;
  @Input() public allVideosStub;

  get displayVideos() {
    return this.displayVideosStub;
  }

  loadMoreVideos(e: HTMLElement) {
    this.displayVideosStub = this.allVideosStub;
    e.remove();
  }
}
