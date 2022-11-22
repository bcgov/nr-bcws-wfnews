import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from "@angular/core";
import lgZoom from 'lightgallery/plugins/zoom';
import lgFullscreen from 'lightgallery/plugins/fullscreen';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import { BeforeSlideDetail } from 'lightgallery/lg-events';
import InfoPlugin from "./info-plugin/info-plugin.component";
import { PublishedIncidentService } from "../../../services/published-incident-service";
import { AppConfigService } from "@wf1/core-ui";

@Component({
  selector: 'incident-gallery-panel',
  templateUrl: './incident-gallery-panel.component.html',
  styleUrls: ['./incident-gallery-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentGalleryPanel implements OnInit {
  @Input() public incident;

  public constructor(private publishedIncidentService: PublishedIncidentService, private appConfigService: AppConfigService, private cdr: ChangeDetectorRef) { }

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

  convertToYoutubeId (externalUri: string) {
    if (externalUri) {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      let match = externalUri.match(regExp);
      if( match && match[7].length == 11) {
        return match[7]
      }
    }
  }

  loadPage() {
    this.allImagesAndVideosStub = []
    // fetch the Videos
    this.publishedIncidentService.fetchExternalUri(this.incident.incidentNumberLabel).toPromise().then(results => {
      if (results && results.collection && results.collection.length > 0) {
        for (const uri of results.collection) {
          this.allImagesAndVideosStub.push({
            title: uri.externalUriDisplayLabel,
            uploadedDate: new Date(uri.createdTimestamp).toLocaleDateString(),
            fileName: '',
            type: 'video',
            href: uri.externalUri
          })
          this.cdr.detectChanges()
        }
      }

      // fetch image attachments
      this.publishedIncidentService.fetchPublishedIncidentAttachments(this.incident.incidentName).toPromise().then(results => {
        console.log(results)
        // Loop through the attachments, for each one, create a ref, and set href to the bytes
        if (results && results.collection && results.collection.length > 0) {
          for (const attachment of results.collection) {
            // do a mime type check here
            if (!attachment.imageURL.toLowerCase().endsWith('.pdf')) {
              this.allImagesAndVideosStub.push({
                title: attachment.attachmentTitle,
                uploadedDate: new Date(attachment.createdTimestamp).toLocaleDateString(),
                fileName: attachment.attachmentFileName,
                type: 'image',
                href: `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncidentAttachment/${this.incident.incidentNumberLabel}/attachments/${attachment.attachmentGuid}/bytes`
              })
            }
          }
        }
      })
    })
  }
}
