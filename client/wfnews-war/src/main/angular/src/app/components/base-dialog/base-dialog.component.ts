import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApplicationStateService } from '../../services/application-state.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'wfnews-base-dialog',
  templateUrl: './base-dialog.component.html',
  styleUrls: ['../base/base.component.scss', './base-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseDialogComponent implements AfterViewInit {
  @Input() title: string;
  @Input() canGoBack = false;
  @Input() showBack = true;
  @Input() showClose = true;
  @Input() showCancel = false;
  @Input() showOK = false;

  @Output() goBack = new EventEmitter<any>();
  @Output() accepted = new EventEmitter<any>();

  mobile: boolean;

  constructor(
    public dialogRef: MatDialogRef<BaseDialogComponent>,
    protected applicationStateService: ApplicationStateService,
    protected sanitizer: DomSanitizer,
    protected changeDetector: ChangeDetectorRef,
  ) {
    dialogRef.disableClose = true;
    this.mobile = this.applicationStateService.getIsMobileResolution();
  }

  ngAfterViewInit(): void {
    // this.mobile = this.applicationStateService.getIsMobileResolution();
  }

  ok() {
    this.accepted.emit();
  }

  cancel() {
    this.dialogRef.close();
  }

  back() {
    this.goBack.emit();
    this.changeDetector.detectChanges();
  }
}
