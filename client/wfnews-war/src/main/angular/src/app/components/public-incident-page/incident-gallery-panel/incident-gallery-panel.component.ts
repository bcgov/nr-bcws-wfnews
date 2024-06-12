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

  public constructor(
    private publishedIncidentService: PublishedIncidentService,
    private appConfigService: AppConfigService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
  ) { }

  get videos() {
    return this.media.filter((item) => item.type === 'video');
  }

  get images() {
    return this.media.filter((item) => item.type === 'image');
  }

  async ngOnInit() {
    try {
      this.media = [];
      await this.loadVideos();
      await this.loadImages();
      this.currentMediaType = 'All';
      this.displayedMedia = [...this.media];
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

  applyFilter(filter: string) {
    switch (filter) {
      case 'all':
        this.displayedMedia = [...this.media];
        break;
      case 'images':
        this.displayedMedia = this.images;
        break;
      case 'videos':
        this.displayedMedia = this.videos;
        break;
    }
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
    const results = await this.publishedIncidentService.fetchExternalUri(this.incident.incidentNumberLabel).toPromise();
    for (const uri of results?.collection) {
      if (!uri.externalUriCategoryTag.includes('EVAC-ORDER')) {
        this.media.push({
          title: uri.externalUriDisplayLabel,
          uploadedDate: new Date(
            uri.createdTimestamp,
          ).toLocaleDateString(),
          fileName: '',
          type: 'video',
          href: uri.externalUri,
        });
      }
    }
  }

  async loadImages() {
    // fetch image attachments
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
          ).toLocaleDateString(),
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
  }

}
