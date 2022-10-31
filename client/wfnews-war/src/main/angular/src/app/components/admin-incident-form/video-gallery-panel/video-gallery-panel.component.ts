import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DefaultService as ExternalUriService, DefaultService as  IncidentAttachmentService, DefaultService as  AttachmentResource, ExternalUriResource } from '@wf1/incidents-rest-api';
import { BaseComponent } from "../../base/base.component";
import { Overlay } from '@angular/cdk/overlay';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TokenService, AppConfigService } from '@wf1/core-ui';
import { ApplicationStateService } from '../../../services/application-state.service';
import { RootState } from '../../../store';
import { UploadVideoDialogComponent } from './upload-video-dialog/upload-video-dialog.component';
import { DocumentManagementService } from '../../../services/document-management.service';
import { WatchlistService } from '../../../services/watchlist-service';
import { PagedCollection } from '../../../conversion/models';

@Component({
  selector: 'video-gallery-panel',
  templateUrl: './video-gallery-panel.component.html',
  styleUrls: ['./video-gallery-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoGalleryPanel extends BaseComponent implements OnInit, OnChanges {
  @Input() public incident

  public searchState = {
    sortParam: 'attachmentTitle',
    sortDirection: 'DESC'
  };
  private loaded = false
  public uploadProgress = 0
  public uploadStatus = ''
  public statusBar;
  public pageNumber = 1;
  public pageRowCount = 20;

  public attachments: AttachmentResource[] = [];
  public externalUriList: PagedCollection = {
    pageNumber: 1,
    pageRowCount: 20,
    totalRowCount: null,
    totalPageCount: null,
    collection: []
  };

  testVideoLinks = [
    {
    videoUrl: 'https://www.youtube.com/watch?v=xt4HXvrdU4g',
    videoId: 'xt4HXvrdU4g',
    videoTitle: "B.C. wildfires prompt evacuation alerts for some communities"
    },
    {
      videoUrl: 'https://www.youtube.com/watch?v=WO2b03Zdu4Q',
      videoId: 'WO2b03Zdu4Q',
      videoTitle: "demo video"
      },
  ]

  constructor(protected router: Router,
              protected route: ActivatedRoute,
              protected sanitizer: DomSanitizer,
              protected store: Store<RootState>,
              protected fb: FormBuilder,
              protected dialog: MatDialog,
              protected applicationStateService: ApplicationStateService,
              protected tokenService: TokenService,
              protected snackbarService: MatSnackBar,
              protected overlay: Overlay,
              protected cdr: ChangeDetectorRef,
              protected appConfigService: AppConfigService,
              protected http: HttpClient,
              protected externalUriService: ExternalUriService,
              protected incidentAttachmentService: IncidentAttachmentService,
              private documentManagementService: DocumentManagementService,
              private watchListServce: WatchlistService,
              //private ExternalUriListService: upcoming
              ) {
    super(router, route, sanitizer, store, fb, dialog, applicationStateService, tokenService, snackbarService, overlay, cdr, appConfigService, http, watchListServce);
  }

  ngOnInit() {
    if (this.incident) {
      this.loadPage();
    }
  }

  loadPage() {
    this.externalUriService.getExternalUriList(
      undefined,//'' + this.incident.incidentNumberSequence,
      '' + this.pageNumber,
      '' + this.pageRowCount,
      'response',
      undefined,
      undefined
    ).toPromise().then( (response) => {
      this.externalUriList = response.body;
      this.cdr.detectChanges();
    }).catch(err => {
      this.snackbarService.open('Failed to load videos links: ' + err, 'OK', { duration: 0, panelClass: 'snackbar-error' });
    })
  }


  ngOnchanges(changes: SimpleChanges) {
    this.updateTable();
  }

  ngDoCheck() {
    this.updateTable();
  }

  updateTable () {
    if (!this.loaded && this.incident) {
      this.loadPage();
      this.loaded = true
    }
  }

  sortData(event) {
    this.loaded = false
    this.searchState.sortParam = event.active
    this.searchState.sortDirection = event.direction
    this.loadPage();
  }

  upload () {
    const self = this;
    let dialogRef = this.dialog.open(UploadVideoDialogComponent, {
      width: '600px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.title && result.url) {
        self.uploadVideoLink (result.title, result.url).then(() => {
          this.snackbarService.open('Video Added Successfully', 'OK', { duration: 10000, panelClass: 'snackbar-success' });
        }).catch(err => {
          this.snackbarService.open('Failed to Added Video: ' + JSON.stringify(err.message), 'OK', { duration: 10000, panelClass: 'snackbar-error' });
        }).finally(() => {
          self.loaded = false;
          this.cdr.detectChanges();
        })
      }

    });
  }
  // links?: Array<RelLink>;
  // externalUriGuid?: string;
  // sourceObjectNameCode?: string;
  // sourceObjectUniqueId?: string;
  // externalUriCategoryTag?: string;
  // externalUriDisplayLabel?: string;
  // externalUri?: string;
  // publishedInd?: string;
  // revisionCount?: number;
  // createdTimestamp?: string;
  // privateInd?: string;
  // archivedInd?: string;
  // primaryInd?: string;
  // createDate?: string;
  // createUser?: string;
  // updateDate?: string;
  // updateUser?: string;
  // etag?: string;
  // type: string;
  uploadVideoLink( title: string, url: string) {
    console.log(this.incident.incidentNumberSequence);

    const resource = {
      externalUriDisplayLabel: title,
      externalUri: url,
      publishedInd:'N',
      privateInd:"N",
      archivedInd:'N',
      primaryInd: 'N',
      externalUriCategoryTag: 'information',
      sourceObjectNameCode: 'INCIDENT',
      sourceObjectUniqueId: ''+this.incident.wildfireIncidentGuid,
      '@type': 'http://wfim.nrs.gov.bc.ca/v1/externalUri',
      type: 'http://wfim.nrs.gov.bc.ca/v1/externalUri'
    } as ExternalUriResource ;

    return this.externalUriService.createExternalUri( 
      resource,
      'response'
     ).toPromise()
  }
}