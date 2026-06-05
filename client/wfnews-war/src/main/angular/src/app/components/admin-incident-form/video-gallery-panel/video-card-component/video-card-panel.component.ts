import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { YouTubeService } from '@app/services/youtube-service';
import { WfimExternalUriService as ExternalUriService } from '@app/services/wfim-external-uri.service';
import * as moment from 'moment';
import { convertToYoutubeId } from '../../../../utils';
import { EditVideoDialogComponent } from '../edit-video-dialog/edit-video-dialog.component';

@Component({
  selector: 'video-card-panel',
  templateUrl: './video-card-panel.component.html',
  styleUrls: ['./video-card-panel.component.scss'],
})
export class VideoCardPanel {
  @Input() public incident;
  @Input() public video: any;
  @Output() loadPage: EventEmitter<any> = new EventEmitter();
  @Output() removePrimaryFlags: EventEmitter<any> =
    new EventEmitter();

  public convertToYoutubeId = convertToYoutubeId;

  public includeInPublicGallery = false;

  public imageSrc = null;
  public loaded = false;

  constructor(
    protected externalUriService: ExternalUriService,
    protected snackbarService: MatSnackBar,
    protected dialog: MatDialog,
    protected cdr: ChangeDetectorRef,
    private youtubeService: YouTubeService
  ) {
    /* Empty */
  }

  getSafeUrl(url: string) {
    return this.youtubeService.sanitizeYoutubeUrl(url);
  }

  changePrimary() {
    this.video.primaryInd = !this.video.primaryInd;
    if (this.video.primaryInd) {
      this.removePrimaryFlags.emit({ event: this.video.externalUriGuid });
      // safety catch
      this.video.primaryInd = true;
    }
    this.updateExternalUri(
      this.video.externalUri,
      this.video.externalUriDisplayLabel,
    );
  }

  get isPrimary() {
    if (!Object.hasOwn(this.video, 'primaryInd')) {
      this.video.primaryInd = false;
    }

    return this.video.primaryInd;
  }

  set isPrimary(primary) {
    (this.video as any).primaryInd = primary;
  }

  edit() {
    const dialogRef = this.dialog.open(EditVideoDialogComponent, {
      width: '600px',
      data: {
        video: this.video,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateExternalUri(
          result.externalUri,
          result.externalUriDisplayLabel,
        );
      }
      this.cdr.detectChanges();
    });
  }

  remove() {
    const guid = this.video.externalUriGuid;
    const etag = this.video.etag || this.video['@etag'];
    this.externalUriService.deleteExternalUri(guid, etag)
      .then(() => {
        this.snackbarService.open('Video Deleted Successfully', 'OK', {
          duration: 0,
          panelClass: 'snackbar-success',
        });
        this.loaded = false;
        this.loadPage.emit();
      })
      .catch((err) => {
        this.snackbarService.open(
          'Failed to Delete Video: ' + JSON.stringify(err.message),
          'OK',
          { duration: 0, panelClass: 'snackbar-error' },
        );
        this.loaded = false;
      });
  }

  updateExternalUri(externalUri: string, externalUriDisplayLabel: string) {
    this.video.externalUri = externalUri;
    this.video.externalUriDisplayLabel = externalUriDisplayLabel;

    this.externalUriService
      .updateExternalUri(this.video.externalUriGuid, this.video)
      .catch((err) => {
        this.snackbarService.open(
          'Failed to Update Video: ' + JSON.stringify(err.message),
          'OK',
          { duration: 0, panelClass: 'snackbar-error' },
        );
        this.loaded = false;
        throw err;
      })
      .then(() => {
        this.snackbarService.open('Video Updated Successfully', 'OK', {
          duration: 0,
          panelClass: 'snackbar-success',
        });
        this.loaded = false;
        this.loadPage.emit();
      });
  }

  convertToDate(value: string | number | Date): string {
    if (value) {
      return moment(value).format('YYYY-MM-DD HH:mm:ss');
    }
  }

  navigateToYoutube(attachment: any) {
    window.open(attachment.videoUrl, '_blank');
  }
}
