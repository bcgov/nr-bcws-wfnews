import { Component, ChangeDetectionStrategy, Input, OnInit } from "@angular/core";
import lgZoom from 'lightgallery/plugins/zoom';
import lgFullscreen from 'lightgallery/plugins/fullscreen';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import { BeforeSlideDetail } from 'lightgallery/lg-events';
import InfoPlugin from "./info-plugin/info-plugin.component";

@Component({
  selector: 'incident-gallery-panel',
  templateUrl: './incident-gallery-panel.component.html',
  styleUrls: ['./incident-gallery-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentGalleryPanel implements OnInit {
  @Input() public incident;

  currentMediaType: string;
  mediaTypeOptions: string[] = ["All","Images","Videos"];
  imagesAndVideosStub: any[];
  allImagesAndVideosStub: any[];

  settings = {
    counter: false,
    plugins: [lgZoom, lgFullscreen, InfoPlugin, lgThumbnail],
    download: true,
    showZoomInOutIcons: true,
    fullScreen: true,
    actualSize: false,
    info: true,
    infoData: {testdata: "This is info test data"}
  };

  onBeforeSlide = (detail: BeforeSlideDetail): void => {
    const { index, prevIndex } = detail;
    console.log(index, prevIndex);
  };

  onMediaTypeFilterChanged(event) {
    if(event === "Images")
      this.imagesAndVideosStub = this.allImagesAndVideosStub.filter(item => item.type === "image");
    if(event === "Videos")
      this.imagesAndVideosStub = this.allImagesAndVideosStub.filter(item => item.type === "video");
    if(event === "All")
      this.imagesAndVideosStub = this.allImagesAndVideosStub;
  }

  ngOnInit() {
    this.loadPage();
    this.currentMediaType = "All";
    this.onMediaTypeFilterChanged("All");
  }

  loadPage() {
    this.allImagesAndVideosStub = [
      {title:"Lorem Ipsum dolor sit amet", uploadedDate:"June 23, 2022", fileName: "Incident-V25425-image.jpg", type:"image", href: "https://media.wired.com/photos/5bf44a635fec3834b559a814/master/pass/Helicopter-WoolseyFire-1059708308.jpg" },
      {title:"Lorem Ipsum dolor sit amet", uploadedDate:"June 23, 2022", fileName: "Incident-V25425-image.jpg", type:"image", href: "https://cdn.vox-cdn.com/thumbor/0poIh4mTz5vqbUXhGxN6Ztbv5KU=/0x0:3500x2333/1200x800/filters:focal(181x1154:741x1714)/cdn.vox-cdn.com/uploads/chorus_image/image/65540814/1059691902.jpg.0.jpg" },
      {title:"Lorem Ipsum dolor sit amet", uploadedDate:"June 23, 2022", fileName: "Incident-V25425-image.jpg", type:"image", href: "https://media.npr.org/assets/img/2021/08/13/gettyimages-1234590544_custom-cec76fd7bb93998520b94ee4c5ee417ac220eb97-s1100-c50.jpg" },
      {title:"Lorem Ipsum dolor sit amet", uploadedDate:"June 23, 2022", fileName: "Incident-V25425-image.jpg", type:"video", href: "http://www.youtube.com/embed/M7lc1UVf-VE?enablejsapi=1&origin=http://example.com" },
    ];
  }
}
