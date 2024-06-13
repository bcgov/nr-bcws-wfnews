import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MediaGalleryItem } from '@app/components/common/media-gallery-item/media-gallery-item.component';
import { AppConfigService } from '@wf1/core-ui';
import { PublishedIncidentService } from '../../../services/published-incident-service';

@Component({
  selector: 'incident-gallery-panel',
  templateUrl: './incident-gallery-panel.component.html',
  styleUrls: ['./incident-gallery-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentGalleryPanel implements OnInit {
  @Input() public incident;
  @Input() public showImageWarning;

  currentMediaType: string;
  media: MediaGalleryItem[];
  displayedMedia: MediaGalleryItem[];
  isPreview: boolean;

  defaultItemNumber = 9;
  defaultItemLoadMoreNumber = 3;
  displayedItemNumber = this.defaultItemNumber;
  isLoadMoreVisible = false;

  public constructor(
    private publishedIncidentService: PublishedIncidentService,
    private appConfigService: AppConfigService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
  ) { }

  getAll(displayedItemNumber: number) {
    return this.media.sort(
      (a, b) => new Date(b.uploadedDate).getDate() - new Date(a.uploadedDate).getDate()
    ).slice(0, displayedItemNumber);
  }

  getAllCount() {
    return this.media.length;
  }

  getVideos(displayedItemNumber: number) {
    return this.media.filter((item) => item.type === 'video').sort(
      (a, b) => new Date(b.uploadedDate).getDate() - new Date(a.uploadedDate).getDate()
    ).slice(0, displayedItemNumber);
  }

  getVideosCount() {
    return this.media.filter((item) => item.type === 'video').length;
  }

  getImages(displayedItemNumber: number) {
    return this.media.filter((item) => item.type === 'image').sort(
      (a, b) => new Date(b.uploadedDate).getDate() - new Date(a.uploadedDate).getDate()
    ).slice(0, displayedItemNumber);
  }

  getImagesCount() {
    return this.media.filter((item) => item.type === 'image').length;
  }

  async ngOnInit() {
    try {
      this.media = [];
      await this.loadVideos();
      await this.loadImages();
      this.currentMediaType = 'all';
      this.applyFilter(this.currentMediaType, this.defaultItemNumber);
    } catch (error) {
      console.error('Error loading media', error);
    }

    this.cdr.detectChanges();

    this.router.queryParams.subscribe((params: ParamMap) => {
      if (params && params['preview']) {
        this.isPreview = true;
      }
    });
  }

  handleFilterSelect(filter: string) {
    this.displayedItemNumber = this.defaultItemNumber;
    this.applyFilter(filter, this.defaultItemNumber);
  }

  applyFilter(filter: string, displayedItemNumber?: number) {
    this.currentMediaType = filter;
    switch (filter) {
      case 'all':
        this.displayedMedia = this.getAll(displayedItemNumber);
        this.isLoadMoreVisible = this.displayedMedia.length < this.getAllCount();
        break;
      case 'images':
        this.displayedMedia = this.getImages(displayedItemNumber);
        this.isLoadMoreVisible = this.displayedMedia.length < this.getImagesCount();
        break;
      case 'videos':
        this.displayedMedia = this.getVideos(displayedItemNumber);
        this.isLoadMoreVisible = this.displayedMedia.length < this.getVideosCount();
        break;
    }
  }

  loadMore() {
    this.displayedItemNumber += this.defaultItemLoadMoreNumber;
    this.applyFilter(this.currentMediaType, this.displayedItemNumber);
  }

  handleImageFallback(item: any, index: number) {
    if (!item.loaded) {
      const imgComponent = document.getElementById(index + '-img-thumb');
      if (imgComponent) {
        (imgComponent as any).src = item.href;
      }
      item.loaded = true;
    }
  }

  async loadVideos() {
    // fetch the Videos
    try {
      const results = await this.publishedIncidentService.fetchExternalUri(this.incident.incidentNumberLabel).toPromise();
      for (const uri of results?.collection) {
        if (!uri.externalUriCategoryTag.includes('EVAC-ORDER')) {
          this.media.push({
            title: uri.externalUriDisplayLabel,
            uploadedDate: new Date(
              uri.createdTimestamp,
            ).valueOf(),
            fileName: '',
            type: 'video',
            href: uri.externalUri,
          });
        }
      }
    } catch (error) {
      console.error('Error loading videos', error);
    }
  }

  async loadImages() {
    // fetch image attachments
    try {
      const results = await this.publishedIncidentService
        .fetchPublishedIncidentAttachments(this.incident.incidentNumberLabel)
        .toPromise();

      // Loop through the attachments, for each one, create a ref, and set href to the bytes
      for (const attachment of results?.collection) {
        // do a mime type check here
        // Light gallery does not really support direct download on mimetype : image/bmp && image/tiff, which will returns 500 error.
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
          this.media.push({
            title: attachment.attachmentTitle,
            uploadedDate: new Date(
              attachment.createdTimestamp,
            ).valueOf(),
            fileName: attachment.attachmentFileName,
            type: 'image',
            href: `${this.appConfigService.getConfig().rest['wfnews']
              }/publicPublishedIncidentAttachment/${this.incident.incidentNumberLabel
              }/attachments/${attachment.attachmentGuid}/bytes`,
            thumbnail: `${this.appConfigService.getConfig().rest['wfnews']
              }/publicPublishedIncidentAttachment/${this.incident.incidentNumberLabel
              }/attachments/${attachment.attachmentGuid
              }/bytes?thumbnail=true`,
            loaded: false,
          });
        }
      }
    } catch (error) {
      console.error('Error loading images', error);
    }
  }

}
