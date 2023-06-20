import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AppConfigService } from "@wf1/core-ui";
import { PublishedIncidentService } from "../../../services/published-incident-service";
import { ActivatedRoute } from "@angular/router";
import { LightGallery } from "lightgallery/lightgallery";
import { convertToMobileFormat, convertToYoutubeId } from "../../../utils"
import { InitDetail } from 'lightgallery/lg-events';
 

@Component({
  selector: 'incident-gallery-all-media-mobile',
  templateUrl: './incident-gallery-all-media-mobile.component.html',
  styleUrls: ['./incident-gallery-all-media-mobile.component.scss']
})
export class IncidentGalleryAllMediaMobileComponent implements OnInit {
  @Input() public incident;
  incidentName: string  
  allImagesAndVideosStub: any[];
  displayMediaStub: any[];
  public constructor(private publishedIncidentService: PublishedIncidentService, private appConfigService: AppConfigService, private cdr: ChangeDetectorRef,
    private router: ActivatedRoute) { }

  displayLoadMore = false;
  private lightGallery!: LightGallery
  private refreshGallery = false
  convertToMobileFormat = convertToMobileFormat
  convertToYoutubeId = convertToYoutubeId

  ngAfterViewChecked(): void {
    if (this.refreshGallery && this.lightGallery) {
        this.lightGallery.refresh()
        this.refreshGallery = false
    }
  }

  onInit = (detail: InitDetail): void => {
    this.lightGallery = detail.instance
  }

  ngOnInit(): void {
    this.loadPage();
  }

  get allVideosAndImages () {
    return this.allImagesAndVideosStub
  }

  get displayVideosAndImages() {
    return this.displayMediaStub;
  }

  loadPage() {
    this.incidentName = this.incident.incidentName
    this.allImagesAndVideosStub = []
    // fetch the Videos
    this.publishedIncidentService.fetchExternalUri(this.incident.incidentNumberLabel).toPromise().then(results => {
      if (results?.collection && results.collection.length > 0) {
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
        if (results?.collection && results.collection.length > 0) {
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

        this.displayMediaStub = [];

        this.allImagesAndVideosStub.sort((a, b) => b.convertedDate - a.convertedDate)

         if (this.allImagesAndVideosStub.length > 9) {
          this.displayLoadMore = true
          this.displayMediaStub = this.allImagesAndVideosStub.slice(0, 9);
         } 

        this.cdr.detectChanges()
        setTimeout(() => {
          this.refreshGallery = true
        }, 5000)
      })
    })
  }


  loadMore(e: HTMLElement) {
     this.displayMediaStub = this.allImagesAndVideosStub;
     e.remove();
  }


  handleImageFallback (href: string) {
    const imgComponent = document.getElementById('primary-image-container')
    if (imgComponent) {
      (imgComponent as any).src = href
    }
  }

}

