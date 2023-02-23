import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from "@angular/core";
import lgZoom from 'lightgallery/plugins/zoom';
import lgFullscreen from 'lightgallery/plugins/fullscreen';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import { BeforeSlideDetail, InitDetail } from 'lightgallery/lg-events';
import { PublishedIncidentService } from "../../../services/published-incident-service";
import { AppConfigService } from "@wf1/core-ui";
import { convertToYoutubeId } from "../../../utils";
import { LightGallery } from "lightgallery/lightgallery";
import { ActivatedRoute, ParamMap } from "@angular/router";

@Component({
  selector: 'incident-gallery-panel',
  templateUrl: './incident-gallery-panel.component.html',
  styleUrls: ['./incident-gallery-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentGalleryPanel implements OnInit {
  @Input() public incident;
  @Input() public showImageWarning;
  
  public convertToYoutubeId = convertToYoutubeId
  public constructor(private publishedIncidentService: PublishedIncidentService, private appConfigService: AppConfigService, private cdr: ChangeDetectorRef,
                    private router: ActivatedRoute) { }

  currentMediaType: string;
  mediaTypeOptions: string[] = ["All","Images","Videos"];
  imagesAndVideosStub: any[];
  allImagesAndVideosStub: any[];
  
  private lightGallery!: LightGallery
  private refreshGallery = false
  public showVideos = true
  public showImages = true
  isPreview: boolean;

  settings = {
    counter: true,
    plugins: [lgZoom, lgFullscreen, lgThumbnail],
    download: true,
    showZoomInOutIcons: true,
    fullScreen: true,
    actualSize: true,
    thumbnail: true
  };

  ngAfterViewChecked(): void {
    if (this.refreshGallery && this.lightGallery) {
        this.lightGallery.refresh()
        this.refreshGallery = false
    }
  }

  onInit = (detail: InitDetail): void => {
    this.lightGallery = detail.instance
  }

  onBeforeSlide = (detail: BeforeSlideDetail): void => {
    // unused
  };

  onMediaTypeFilterChanged(event) {
    if(event === "Images") {
      this.showImages = true
      this.showVideos = false
    } else if(event === "Videos") {
      this.showImages = false
      this.showVideos = true
    } else {
      this.showImages = true
      this.showVideos = true
    }
  }

  get videos () {
    return this.allImagesAndVideosStub.filter(item => item.type === "video")
  }

  get images () {
    return this.allImagesAndVideosStub.filter(item => item.type === "image")
  }

  ngOnInit() {
    this.loadPage();
    this.currentMediaType = "All";
    this.onMediaTypeFilterChanged("All");

    this.router.queryParams.subscribe((params: ParamMap) => {
      if(params && params['preview']) {
        this.isPreview = true;
      }
    });
  }

  handleImageFallback (item: any, index: number) {
    const imgComponent = document.getElementById(index + '-img-thumb')
    if (imgComponent) {
      (imgComponent as any).src = item.href
    }
  }

  loadPage() {
    this.imagesAndVideosStub = []
    this.allImagesAndVideosStub = []
    // fetch the Videos
    this.publishedIncidentService.fetchExternalUri(this.incident.incidentNumberLabel).toPromise().then(results => {
      if (results && results.collection && results.collection.length > 0) {
        for (const uri of results.collection) {
          if (!uri.externalUriCategoryTag.includes('EVAC-ORDER')) {
            this.allImagesAndVideosStub.push({
              title: uri.externalUriDisplayLabel,
              uploadedDate: new Date(uri.createdTimestamp).toLocaleDateString(),
              fileName: '',
              type: 'video',
              href: uri.externalUri
            })
          }
          this.cdr.detectChanges()
        }
      }

      // fetch image attachments
      this.publishedIncidentService.fetchPublishedIncidentAttachments(this.incident.incidentNumberLabel).toPromise().then(results => {
        // Loop through the attachments, for each one, create a ref, and set href to the bytes
        if (results && results.collection && results.collection.length > 0) {
          for (const attachment of results.collection) {
            // do a mime type check here
            if (attachment.mimeType && ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'].includes(attachment.mimeType.toLowerCase())) {
              this.allImagesAndVideosStub.push({
                title: attachment.attachmentTitle,
                uploadedDate: new Date(attachment.createdTimestamp).toLocaleDateString(),
                fileName: attachment.attachmentFileName,
                type: 'image',
                href: `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncidentAttachment/${this.incident.incidentNumberLabel}/attachments/${attachment.attachmentGuid}/bytes`,
                thumbnail: `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncidentAttachment/${this.incident.incidentNumberLabel}/attachments/${attachment.attachmentGuid}/bytes?thumbnail=true`
              })
            }
          }
        }
        this.cdr.detectChanges()
        this.lightGallery.refresh()
        setTimeout(() => {
          this.refreshGallery = true
        }, 5000)
      })
    })
  }
}
