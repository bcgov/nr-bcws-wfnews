import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';
import { PublishedIncidentService } from '../../../../services/published-incident-service';
import { ActivatedRoute } from '@angular/router';
import { LightGallery } from 'lightgallery/lightgallery';
import { convertToMobileFormat, convertToYoutubeId } from '../../../../utils';
import { InitDetail } from 'lightgallery/lg-events';

@Component({
  selector: 'incident-gallery-panel-mobile',
  templateUrl: './incident-gallery-panel-mobile.component.html',
  styleUrls: ['./incident-gallery-panel-mobile.component.scss'],
})
export class IncidentGalleryPanelMobileComponent implements OnInit {
  @Input() public incident;
  incidentName: string;
  allImagesAndVideosStub: any[];
  displayMediaStub: any[];
  allImagesStub: any[];
  allVideosStub: any[];
  displayImagesStub: any[];
  displayVideosStub: any[];
  displayLoadMore = false;
  displayLoadMoreImages = false;
  displayLoadMoreVideos = false;

  convertToMobileFormat = convertToMobileFormat;
  convertToYoutubeId = convertToYoutubeId;

  private lightGallery!: LightGallery;
  private refreshGallery = false;

  public constructor(
    private publishedIncidentService: PublishedIncidentService,
    private appConfigService: AppConfigService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
  ) {}

  ngAfterViewChecked(): void {
    if (this.refreshGallery && this.lightGallery) {
      this.lightGallery.refresh();
      this.refreshGallery = false;
    }
  }

  onInit = (detail: InitDetail): void => {
    this.lightGallery = detail.instance;
  };

  ngOnInit(): void {
    this.loadPage();
  }

  get allVideosAndImages() {
    return this.allImagesAndVideosStub;
  }

  get displayImages() {
    return this.displayImagesStub;
  }

  get displayVideos() {
    return this.displayVideosStub;
  }

  loadPage() {
    this.incidentName = this.incident.incidentName;
    this.allImagesAndVideosStub = [];
    // fetch the Videos
    this.publishedIncidentService
      .fetchExternalUri(this.incident.incidentNumberLabel)
      .toPromise()
      .then((results) => {
        if (results?.collection && results.collection.length > 0) {
          this.pushUrisToAllImagesAndVideos(results.collection);
        }

        // fetch image attachments
        this.publishedIncidentService
          .fetchPublishedIncidentAttachments(this.incident.incidentNumberLabel)
          .toPromise()
          .then((results) => {
            // Loop through the attachments, for each one, create a ref, and set href to the bytes
            if (results?.collection && results.collection.length > 0) {
              this.pushAttachmentsToAllImagesAndVideos(results.collection);
            }

            this.displayMediaStub = [];

            this.allImagesAndVideosStub.sort(
              (a, b) => b.convertedDate - a.convertedDate,
            );
            this.allImagesAndVideosStub = this.setPrimaryToTop(
              this.allImagesAndVideosStub,
            );

            if (this.allImagesAndVideosStub.length > 9) {
              this.displayLoadMore = true;
              this.displayMediaStub = this.allImagesAndVideosStub.slice(0, 10);
            } else {
              this.displayMediaStub = this.allImagesAndVideosStub;
            }

            this.pushToImages(this.allImagesAndVideosStub);
            this.pushToVideos(this.allImagesAndVideosStub);

            this.cdr.detectChanges();
            setTimeout(() => {
              this.refreshGallery = true;
            }, 5000);
          });
      });
  }

  loadMoreImages(e: HTMLElement) {
    this.displayImagesStub = this.allImagesStub;
    e.remove();
  }

  loadMoreVideos(e: HTMLElement) {
    this.displayVideosStub = this.allVideosStub;
    e.remove();
  }

  handleImageFallback(href: string) {
    const imgComponent = document.getElementById('primary-image-container');
    if (imgComponent) {
      (imgComponent as any).src = href;
    }
  }

  pushUrisToAllImagesAndVideos(collection: any) {
    for (const uri of collection) {
      if (!uri.externalUriCategoryTag.includes('EVAC-ORDER')) {
        this.allImagesAndVideosStub.push({
          title: uri.externalUriDisplayLabel,
          uploadedDate: new Date(uri.createdTimestamp).toLocaleDateString(),
          convertedDate: new Date(uri.createdTimestamp),
          fileName: '',
          primary: uri.primaryInd.toString(),
          type: 'video',
          href: uri.externalUri,
        });
      }
    }
  }

  pushAttachmentsToAllImagesAndVideos(collection: any) {
    for (const attachment of collection) {
      // do a mime type check here
      if (
        attachment.mimeType &&
        [
          'image/jpg',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/bmp',
          'image/tiff',
        ].includes(attachment.mimeType.toLowerCase())
      ) {
        this.allImagesAndVideosStub.push({
          title: attachment.attachmentTitle,
          uploadedDate: new Date(
            attachment.createdTimestamp,
          ).toLocaleDateString(),
          convertedDate: new Date(attachment.createdTimestamp),
          fileName: attachment.attachmentFileName,
          primary: attachment.primary.toString(),
          type: 'image',
          href: `${
            this.appConfigService.getConfig().rest['wfnews']
          }/publicPublishedIncidentAttachment/${
            this.incident.incidentNumberLabel
          }/attachments/${attachment.attachmentGuid}/bytes`,
          thumbnail: `${
            this.appConfigService.getConfig().rest['wfnews']
          }/publicPublishedIncidentAttachment/${
            this.incident.incidentNumberLabel
          }/attachments/${attachment.attachmentGuid}/bytes?thumbnail=true`,
        });
      }
    }
  }

  pushToImages(collection: any) {
    this.displayImagesStub = [];
    this.allImagesStub = [];
    for (const item of collection) {
      if (item?.type === 'image') {
        this.allImagesStub.push(item);
        this.displayImagesStub.push(item);
      }
    }

    if (this.allImagesStub.length > 9) {
      this.displayLoadMoreImages = true;
      this.displayImagesStub = this.allImagesStub.slice(0, 10);
    }
  }

  pushToVideos(collection: any) {
    this.displayVideosStub = [];
    this.allVideosStub = [];
    for (const item of collection) {
      if (item?.type === 'video') {
        this.allVideosStub.push(item);
        this.displayVideosStub.push(item);
      }
    }

    if (this.allImagesStub.length > 9) {
      this.displayLoadMoreVideos = true;
      this.displayVideosStub = this.allVideosStub.slice(0, 10);
    }
  }

  setPrimaryToTop: any = (collection: any) => {
    let itemToBeSpliced = null;
    let index = null;
    for (const item of collection) {
      if (item?.primary === 'true') {
        itemToBeSpliced = item;
        index = collection.indexOf(item);
      }
    }
    if (itemToBeSpliced !== null && index !== null) {
      collection.unshift(itemToBeSpliced);
      delete collection[index + 1];
    }
    return collection;
  };
}
