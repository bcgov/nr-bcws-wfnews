import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AppConfigService } from "@wf1/core-ui";
import { PublishedIncidentService } from "../../../../services/published-incident-service";
import { ActivatedRoute } from "@angular/router";
import { LightGallery } from "lightgallery/lightgallery";
import { convertToMobileFormat } from "../../../../utils"
import { InitDetail } from 'lightgallery/lg-events';

@Component({
  selector: 'incident-gallery-images-mobile',
  templateUrl: './incident-gallery-images-mobile.component.html',
  styleUrls: ['./incident-gallery-images-mobile.component.scss']
})
export class IncidentGalleryImagesMobileComponent implements OnInit {

  @Input() public incident;
  incidentName: string  
  allImagesStub: any[];
  public constructor(private publishedIncidentService: PublishedIncidentService, private appConfigService: AppConfigService, private cdr: ChangeDetectorRef,
    private router: ActivatedRoute) { }

  displayImagesStub: any[];
  displayLoadMore = false;
  private lightGallery!: LightGallery
  private refreshGallery = false
  convertToMobileFormat = convertToMobileFormat

  ngOnInit(): void {
    this.loadPage();
  }

  onInit = (detail: InitDetail): void => {
    this.lightGallery = detail.instance
  }

  get images () {
    return this.displayImagesStub
  }

  loadPage() {
    this.incidentName = this.incident.incidentName
    this.allImagesStub = []
      // fetch image attachments
      this.publishedIncidentService.fetchPublishedIncidentAttachments(this.incident.incidentNumberLabel).toPromise().then(results => {
        // Loop through the attachments, for each one, create a ref, and set href to the bytes
        if (results?.collection && results.collection.length > 0) {
          this.pushAttachmentsToImagesStub(results.collection)
        }
        
        this.allImagesStub.sort((a, b) => b.convertedDate - a.convertedDate)

        if (this.allImagesStub.length > 9) {
          this.displayLoadMore = true
          this.displayImagesStub = this.allImagesStub.slice(0, 9);
         } else this.displayImagesStub = this.allImagesStub;

        this.cdr.detectChanges()
        setTimeout(() => {
          this.refreshGallery = true
        }, 5000)
      })
    }

    loadMore(e: HTMLElement) {
      this.displayImagesStub = this.allImagesStub;
      e.remove();
   }

   handleImageFallback (href: string) {
    const imgComponent = document.getElementById('primary-image-container')
    if (imgComponent) {
      (imgComponent as any).src = href
    }
  }

  pushAttachmentsToImagesStub(collection: any){
    for (const attachment of collection) {
      // do a mime type check here
      if (attachment.mimeType && ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'].includes(attachment.mimeType.toLowerCase())) {
        this.allImagesStub.push({
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

  }

