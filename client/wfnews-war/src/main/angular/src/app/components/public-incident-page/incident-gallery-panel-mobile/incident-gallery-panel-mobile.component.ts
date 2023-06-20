import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef, ViewChild } from "@angular/core";
import lgZoom from 'lightgallery/plugins/zoom';
import lgFullscreen from 'lightgallery/plugins/fullscreen';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import { BeforeSlideDetail, InitDetail } from 'lightgallery/lg-events';
import { PublishedIncidentService } from "../../../services/published-incident-service";
import { AppConfigService } from "@wf1/core-ui";
import { convertToYoutubeId } from "../../../utils";
import { LightGallery } from "lightgallery/lightgallery";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { convertToMobileFormat, convertFireNumber, hideOnMobileView, isMobileView } from "../../../utils"
import { FormControl } from "@angular/forms";

@Component({
  selector: 'incident-gallery-panel-mobile',
  templateUrl: './incident-gallery-panel-mobile.component.html',
  styleUrls: ['./incident-gallery-panel-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentGalleryPanelMobileComponent implements OnInit {
  @Input() public incident;
  @Input() public showImageWarning;
  @Input() selectedIndex;
  selected = new FormControl(0)

  isMobileView = isMobileView
  convertToMobileFormat = convertToMobileFormat
  convertFireNumber = convertFireNumber
  hideOnMobileView = hideOnMobileView
  public convertToYoutubeId = convertToYoutubeId
  public constructor(private publishedIncidentService: PublishedIncidentService, private appConfigService: AppConfigService, private cdr: ChangeDetectorRef,
                    private router: ActivatedRoute) { }
                
  currentMediaType: string;
  mediaTypeOptions: string[] = ["All Media","Images","Videos"];
  imagesAndVideosStub: any[];
  allImagesAndVideosStub: any[];
  
  private lightGallery!: LightGallery
  private refreshGallery = false
  public showVideos = true
  public showImages = true
  public showAll = false
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
        this.selectedIndex = 0;
    }
  }

  onInit = (detail: InitDetail): void => {
    this.lightGallery = detail.instance
  }

  get videos () {
    return this.allImagesAndVideosStub.filter(item => item.type === "video")
  }

  get images () {
    return this.allImagesAndVideosStub.filter(item => item.type === "image")
  }

  get allVideosAndImages () {
    return this.allImagesAndVideosStub
  }

  ngOnInit() {
    this.loadPage();
    this.currentMediaType = "All Media";
    this.selectedIndex = 1;

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
              convertedDate: new Date(uri.createdTimestamp),
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
                convertedDate: new Date(attachment.createdTimestamp),
                fileName: attachment.attachmentFileName,
                type: 'image',
                href: `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncidentAttachment/${this.incident.incidentNumberLabel}/attachments/${attachment.attachmentGuid}/bytes`,
                thumbnail: `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncidentAttachment/${this.incident.incidentNumberLabel}/attachments/${attachment.attachmentGuid}/bytes?thumbnail=true`
              })
            }
          }
        }

        this.allImagesAndVideosStub.sort((a, b) => b.convertedDate - a.convertedDate)
        
        this.cdr.detectChanges()
        this.lightGallery.refresh()
        setTimeout(() => {
          this.refreshGallery = true
        }, 5000)
      })
    })
  }

}
